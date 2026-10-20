use napi::{Error, Result, Status, bindgen_prelude::Buffer};
use napi_derive::napi;

use crate::edit::commit::commit_decoded_buffer;
use crate::event_types::NativeVlqMap;
use crate::preflight::transform::transform_resident as preflight_transform;
use crate::preflight::{NativePreflightOptions, NativePreflightResult};

/// A transform pipeline's resident source, held natively across every phase so
/// the intermediate `phaseSource` and each phase's map layer never cross the
/// N-API boundary. Native phases and visitor commits mutate the held source in
/// place and append their packed decoded map layer; only the final composed map
/// (and, on demand, the source text a visitor phase needs) ever crosses out.
///
/// Every mutation delegates to the same `preflight::transform` / `edit::commit`
/// code paths the standalone entry points use, so output is identical to the
/// per-call path by construction — this changes only *where* the source and map
/// layers live between phases, not how they are produced.
#[napi]
pub struct NativePipelineSession {
    filename: String,
    /// The current phase source. Taken out for the duration of a native phase
    /// (which consumes it) and restored from the result; `None` only transiently
    /// mid-call or after a phase bailed, which ends the pipeline.
    current: Option<String>,
    /// Packed decoded map layers, earliest phase first, composed once at finalize.
    layers: Vec<Vec<u8>>,
    normalized_javascript: bool,
    resident_jsx: Option<bool>,
}

#[napi(object)]
pub struct NativePipelineCommit {
    pub code_changed: bool,
    pub map_changed: bool,
}

/// The full transform's final result, crossing out in one call: the resident
/// source as code and the composed map (`None` when no layer was produced).
#[napi(object)]
pub struct NativePipelineFinish {
    pub code: String,
    pub map: Option<NativeVlqMap>,
}

#[napi]
impl NativePipelineSession {
    #[napi(constructor)]
    pub fn new(filename: String, source: String) -> Self {
        Self {
            filename,
            current: Some(source),
            layers: Vec::new(),
            normalized_javascript: false,
            resident_jsx: None,
        }
    }

    /// Run a run of consecutive native preflight phases against the held source,
    /// in one boundary crossing — native phases hand the source and their map
    /// layers along resident, never bouncing back to JS between themselves. On
    /// success the held source becomes each phase's rendered code and its map
    /// layer is retained; the returned results carry no `code`/`map` buffer (both
    /// stay resident), only status, diagnostics, helpers, counters, and each
    /// layer's segment count. An unsupported or error phase ends the run: its
    /// result is the last returned, and JavaScript converts the typed disposition.
    #[napi]
    pub fn run_native_phases(
        &mut self,
        options_list: Vec<NativePreflightOptions>,
    ) -> Result<Vec<NativePreflightResult>> {
        let mut results = Vec::with_capacity(options_list.len());
        for options in options_list {
            let source = self.take_source()?;
            let mut result = preflight_transform(
                source,
                self.filename.clone(),
                options,
                self.normalized_javascript,
                self.resident_jsx,
            )?;
            let complete = result.status == "complete";
            if complete {
                let code = result
                    .code
                    .take()
                    .ok_or_else(|| incomplete("native transform returned no code"))?;
                self.current = Some(code);
                if result.changed {
                    let layer = result
                        .map
                        .take()
                        .ok_or_else(|| incomplete("native transform returned no map"))?
                        .to_vec();
                    self.layers.push(layer);
                } else {
                    result.map = None;
                }
                self.normalized_javascript = result.normalized_javascript;
                self.resident_jsx = Some(result.jsx);
            }
            results.push(result);
            if !complete {
                break;
            }
        }
        Ok(results)
    }

    /// Apply a packed visitor edit buffer to the held source, keeping the map as
    /// a resident decoded layer. The edits address the held source directly, so
    /// no source copy crosses in and no rendered code crosses out.
    #[napi]
    pub fn commit_decoded(
        &mut self,
        data: Buffer,
        source_map_mode: Option<String>,
    ) -> Result<NativePipelineCommit> {
        // Borrow the held source rather than take it: a commit can fail on an
        // edit conflict, and `commitWithDedupe` retries against the same source,
        // so it must survive a failed attempt intact.
        let source = self
            .current
            .as_deref()
            .ok_or_else(|| incomplete("pipeline source already consumed"))?;
        let commit =
            commit_decoded_buffer(source, &self.filename, &data, source_map_mode.as_deref())?;
        let code_changed = commit.code_changed;
        let map_changed = commit.map_changed;
        let layer = commit.map.to_vec();
        let has_effect = code_changed || map_changed;
        if code_changed {
            self.current = Some(commit.code);
        }
        if has_effect {
            self.layers.push(layer);
        }
        Ok(NativePipelineCommit {
            code_changed,
            map_changed,
        })
    }

    /// The current source text. A visitor phase needs it to open its routing
    /// session and to serve `sourceText`/`generateUid`; this is the one place
    /// the source crosses out mid-pipeline, and only for phases that ask.
    #[napi]
    pub fn source_text(&self) -> Result<String> {
        self.current
            .clone()
            .ok_or_else(|| incomplete("pipeline source already consumed"))
    }

    /// Finish the pipeline in one crossing: return the resident source as the
    /// final code and compose every retained layer into the final encoded map,
    /// folding an optional input/adapter map (`input_mappings`/`input_names`)
    /// into the same pass. This is the single point where the full transform's
    /// large `{code, map}` result crosses out.
    ///
    /// `map` is `None` when no phase produced a layer, so the caller keeps its
    /// existing "no map" handling (the input map, or the empty map) rather than
    /// composing against an empty chain.
    #[napi]
    pub fn finish(
        &self,
        input_mappings: Option<String>,
        input_names: Option<Vec<String>>,
    ) -> Result<NativePipelineFinish> {
        let code = self
            .current
            .clone()
            .ok_or_else(|| incomplete("pipeline source already consumed"))?;
        self.finish_with_code(code, input_mappings, input_names)
    }

    fn finish_with_code(
        &self,
        code: String,
        input_mappings: Option<String>,
        input_names: Option<Vec<String>>,
    ) -> Result<NativePipelineFinish> {
        if self.layers.is_empty() {
            return Ok(NativePipelineFinish { code, map: None });
        }
        let slices: Vec<&[u8]> = self.layers.iter().map(Vec::as_slice).collect();
        let (mappings, names) = crate::sourcemap::compose_layer_chain_with_input(
            &slices,
            input_mappings
                .as_deref()
                .map(|mappings| (mappings, input_names.as_deref().unwrap_or_default())),
        )
        .map_err(super::compose_error)?;
        let map = NativeVlqMap { mappings, names };
        Ok(NativePipelineFinish {
            code,
            map: Some(map),
        })
    }

    fn finish_owned(
        mut self,
        input_mappings: Option<String>,
        input_names: Option<Vec<String>>,
    ) -> Result<NativePipelineFinish> {
        let code = self
            .current
            .take()
            .ok_or_else(|| incomplete("pipeline source already consumed"))?;
        self.finish_with_code(code, input_mappings, input_names)
    }

    fn take_source(&mut self) -> Result<String> {
        self.current
            .take()
            .ok_or_else(|| incomplete("pipeline source already consumed"))
    }
}

/// Run an entire all-native pipeline — no JS visitor phases — in one boundary
/// crossing. A pipeline with no visitor phases never needs the source text in
/// JS, so the whole thing (create resident source, run every native phase,
/// compose and fold the input map) collapses into a single call whose only
/// large payloads out are the final `{code, map}`. `code`/`map` are absent when
/// a phase did not complete, so the caller bails on the offending result.
#[napi]
pub fn run_native_pipeline(
    filename: String,
    source: String,
    options_list: Vec<NativePreflightOptions>,
    input_mappings: Option<String>,
    input_names: Option<Vec<String>>,
) -> Result<NativeNativePipelineResult> {
    let mut session = NativePipelineSession::new(filename, source);
    let results = session.run_native_phases(options_list)?;
    if results.iter().any(|result| result.status != "complete") {
        return Ok(NativeNativePipelineResult {
            results,
            code: None,
            map: None,
        });
    }
    let finish = session.finish_owned(input_mappings, input_names)?;
    Ok(NativeNativePipelineResult {
        results,
        code: Some(finish.code),
        map: finish.map,
    })
}

/// Result of a whole all-native pipeline: the per-phase metadata plus the single
/// final `{code, map}` (absent when a phase bailed).
#[napi(object)]
pub struct NativeNativePipelineResult {
    pub results: Vec<NativePreflightResult>,
    pub code: Option<String>,
    pub map: Option<NativeVlqMap>,
}

fn incomplete(message: &str) -> Error {
    Error::new(Status::GenericFailure, message.to_string())
}

/// Segment count of a packed decoded layer buffer — the header stores the word
/// offset of the segment table at bytes 4..8, and each segment is five u32 words
/// (mirrors the reader in `js/runtime/transform.ts`).
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_native_pipeline_returns_source_unchanged() {
        // No phases: the resident source is returned verbatim with no map layer,
        // matching the JS "no layer → no map" path.
        let result = run_native_pipeline(
            "fixture.js".into(),
            "const x = 1;".into(),
            vec![],
            None,
            None,
        )
        .unwrap();
        assert_eq!(result.code.as_deref(), Some("const x = 1;"));
        assert!(result.map.is_none());
        assert!(result.results.is_empty());
    }

    #[test]
    fn invalid_phase_throws_without_committing_source_or_map() {
        let mut session = NativePipelineSession::new("fixture.js".into(), "const = ;".into());
        let error = session
            .run_native_phases(vec![NativePreflightOptions {
                block_scoping: Some(true),
                ..NativePreflightOptions::default()
            }])
            .err()
            .expect("invalid input must throw");
        assert!(error.reason.starts_with("__NOXCTURNAL_PARSE_FAILURE__:"));
        assert!(session.current.is_none());
        assert!(session.layers.is_empty());
    }

    #[test]
    fn unsupported_phase_stops_without_committing_source_or_map() {
        let mut session = NativePipelineSession::new(
            "fixture.ts".into(),
            "namespace N { export let value = 1; }".into(),
        );
        let results = session
            .run_native_phases(vec![NativePreflightOptions {
                typescript: Some("strip".into()),
                ..NativePreflightOptions::default()
            }])
            .unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].status, "unsupported");
        assert!(results[0].code.is_none());
        assert!(results[0].map.is_none());
        assert!(session.current.is_none());
        assert!(session.layers.is_empty());
    }

    #[test]
    fn error_phase_stops_without_committing_source_or_map() {
        let mut session = NativePipelineSession::new("fixture.jsx".into(), "<div key />;".into());
        let results = session
            .run_native_phases(vec![NativePreflightOptions {
                jsx: Some("automatic".into()),
                ..NativePreflightOptions::default()
            }])
            .unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].status, "error");
        assert_eq!(results[0].reason.as_deref(), Some("transform-error"));
        assert!(results[0].code.is_none());
        assert!(results[0].map.is_none());
        assert!(session.current.is_none());
        assert!(session.layers.is_empty());
    }

    #[test]
    fn identity_phases_retain_no_resident_map_layers() {
        let source = "const value = /(?<=a)b/;".to_owned();
        let mut session = NativePipelineSession::new("fixture.js".into(), source.clone());
        let results = session
            .run_native_phases(vec![
                NativePreflightOptions {
                    regexp_look_behind: Some(true),
                    ..NativePreflightOptions::default()
                },
                NativePreflightOptions {
                    regexp_match_indices: Some(true),
                    ..NativePreflightOptions::default()
                },
            ])
            .unwrap();
        assert!(
            results
                .iter()
                .all(|result| !result.changed && result.map.is_none())
        );
        assert!(session.layers.is_empty());
        assert_eq!(session.current.as_deref(), Some(source.as_str()));
    }

    #[test]
    fn identity_phases_around_a_rewrite_preserve_final_maps() {
        let source = "let value = 1; function read() { return value; }";
        let rewrite = NativePreflightOptions {
            block_scoping: Some(true),
            ..NativePreflightOptions::default()
        };
        let plain = run_native_pipeline(
            "fixture.js".into(),
            source.into(),
            vec![rewrite],
            None,
            None,
        )
        .unwrap();
        let wrapped = run_native_pipeline(
            "fixture.js".into(),
            source.into(),
            vec![
                NativePreflightOptions {
                    regexp_look_behind: Some(true),
                    ..NativePreflightOptions::default()
                },
                NativePreflightOptions {
                    block_scoping: Some(true),
                    ..NativePreflightOptions::default()
                },
                NativePreflightOptions {
                    regexp_match_indices: Some(true),
                    ..NativePreflightOptions::default()
                },
            ],
            None,
            None,
        )
        .unwrap();
        assert_eq!(plain.code, wrapped.code);
        let plain_map = plain.map.unwrap();
        let wrapped_map = wrapped.map.unwrap();
        assert_eq!(plain_map.mappings, wrapped_map.mappings);
        assert_eq!(plain_map.names, wrapped_map.names);
    }

    #[test]
    fn typescript_normalization_is_retained_between_native_phases() {
        let mut session =
            NativePipelineSession::new("fixture.ts".into(), "let value: number = 1;".into());
        let results = session
            .run_native_phases(vec![
                NativePreflightOptions {
                    typescript: Some("strip".into()),
                    ..NativePreflightOptions::default()
                },
                NativePreflightOptions {
                    block_scoping: Some(true),
                    ..NativePreflightOptions::default()
                },
            ])
            .unwrap();
        assert!(results.iter().all(|result| result.status == "complete"));
        assert!(session.normalized_javascript);
        assert_eq!(session.current.as_deref(), Some("var value = 1;\n"));
    }

    #[test]
    fn output_only_phase_does_not_claim_to_erase_typescript() {
        let mut session =
            NativePipelineSession::new("fixture.ts".into(), "let value: number = 1;".into());
        let results = session
            .run_native_phases(vec![
                NativePreflightOptions {
                    compact: Some(true),
                    ..NativePreflightOptions::default()
                },
                NativePreflightOptions {
                    block_scoping: Some(true),
                    ..NativePreflightOptions::default()
                },
            ])
            .unwrap();
        assert_eq!(results.len(), 2);
        assert!(!results[0].normalized_javascript);
        assert!(results[1].normalized_javascript);
        assert!(results.iter().all(|result| result.status == "complete"));
        assert_eq!(session.current.as_deref(), Some("var value = 1;\n"));
    }

    #[test]
    fn tsx_resident_dialect_tracks_typescript_and_jsx_independently() {
        for jsx in [None, Some("preserve".into())] {
            let mut session = NativePipelineSession::new(
            "fixture.tsx".into(),
            "type Props = { value?: number }; const View = ({ value = 1 }: Props) => <div>{value}</div>;"
                .into(),
        );
            let results = session
                .run_native_phases(vec![
                    NativePreflightOptions {
                        typescript: Some("strip".into()),
                        jsx,
                        ..NativePreflightOptions::default()
                    },
                    NativePreflightOptions {
                        parameters: Some(true),
                        ..NativePreflightOptions::default()
                    },
                    NativePreflightOptions {
                        jsx: Some("automatic".into()),
                        ..NativePreflightOptions::default()
                    },
                    NativePreflightOptions {
                        regexp_look_behind: Some(true),
                        ..NativePreflightOptions::default()
                    },
                ])
                .unwrap();
            assert!(results.iter().all(|result| result.status == "complete"));
            assert!(results[0].normalized_javascript && results[0].jsx);
            assert!(results[1].normalized_javascript && results[1].jsx);
            assert!(results[2].normalized_javascript && !results[2].jsx);
            assert!(results[3].normalized_javascript && !results[3].jsx);
            assert!(session.normalized_javascript);
            assert_eq!(session.resident_jsx, Some(false));
            let code = session.current.as_deref().unwrap();
            assert!(!code.contains("type Props"));
            assert!(!code.contains("<div>"));
            assert!(code.contains("react/jsx-runtime"));
        }
    }

    #[test]
    fn split_tsx_phases_match_the_equivalent_fused_phase() {
        let source = "type Props = { value?: number }; const View = ({ value = 1 }: Props) => <div>{value}</div>;";
        let fused = run_native_pipeline(
            "fixture.tsx".into(),
            source.into(),
            vec![NativePreflightOptions {
                typescript: Some("strip".into()),
                parameters: Some(true),
                jsx: Some("automatic".into()),
                ..NativePreflightOptions::default()
            }],
            None,
            None,
        )
        .unwrap();
        let split = run_native_pipeline(
            "fixture.tsx".into(),
            source.into(),
            vec![
                NativePreflightOptions {
                    typescript: Some("strip".into()),
                    ..NativePreflightOptions::default()
                },
                NativePreflightOptions {
                    parameters: Some(true),
                    ..NativePreflightOptions::default()
                },
                NativePreflightOptions {
                    jsx: Some("automatic".into()),
                    ..NativePreflightOptions::default()
                },
            ],
            None,
            None,
        )
        .unwrap();
        assert!(
            fused
                .results
                .iter()
                .all(|result| result.status == "complete")
        );
        assert!(
            split
                .results
                .iter()
                .all(|result| result.status == "complete")
        );
        assert_eq!(fused.code, split.code);
        let fused_map = fused.map.unwrap();
        let split_map = split.map.unwrap();
        assert_eq!(fused_map.names, split_map.names);
        // Separate phases retain additional intermediate anchors, so their VLQ
        // strings need not be byte-identical to a single fused codegen layer.
        // Both must remain populated and refer to the same original names.
        assert!(!fused_map.mappings.is_empty());
        assert!(!split_map.mappings.is_empty());
        assert!(
            fused
                .results
                .iter()
                .chain(&split.results)
                .all(|result| result.reason.is_none() && result.diagnostics.is_empty())
        );
    }
}
