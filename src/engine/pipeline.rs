use napi::{Error, Result, Status, bindgen_prelude::Buffer};
use napi_derive::napi;

use crate::edit::commit::commit_decoded_buffer;
use crate::event_types::NativeVlqMap;
use crate::preflight::transform::transform as preflight_transform;
use crate::preflight::{NativePreflightOptions, NativePreflightResult};

use super::compose_decoded_chain;

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
}

/// A visitor-phase commit's result. The rendered code stays resident; only the
/// map-layer segment count crosses out, and only so `debugPerformance` can keep
/// counting segments it can no longer see in a buffer.
#[napi(object)]
pub struct NativePipelineCommit {
    pub mapping_segments: u32,
    pub rendered_bytes: u32,
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
        }
    }

    /// Run a run of consecutive native preflight phases against the held source,
    /// in one boundary crossing — native phases hand the source and their map
    /// layers along resident, never bouncing back to JS between themselves. On
    /// success the held source becomes each phase's rendered code and its map
    /// layer is retained; the returned results carry no `code`/`map` buffer (both
    /// stay resident), only status, diagnostics, helpers, counters, and each
    /// layer's segment count. A phase that does not complete ends the run: its
    /// result is the last returned, and the caller bails on it.
    #[napi]
    pub fn run_native_phases(
        &mut self,
        options_list: Vec<NativePreflightOptions>,
    ) -> Result<Vec<NativePreflightResult>> {
        let mut results = Vec::with_capacity(options_list.len());
        for options in options_list {
            let source = self.take_source()?;
            let mut result = preflight_transform(source, self.filename.clone(), options)?;
            let complete = result.status == "complete";
            if complete {
                let code = result
                    .code
                    .take()
                    .ok_or_else(|| incomplete("native transform returned no code"))?;
                let layer = result
                    .map
                    .take()
                    .ok_or_else(|| incomplete("native transform returned no map"))?
                    .to_vec();
                result.mapping_segments = Some(decoded_segment_count(&layer));
                result.rendered_bytes = Some(code.len() as u32);
                self.current = Some(code);
                self.layers.push(layer);
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
        let mapping_segments = if has_effect {
            decoded_segment_count(&layer)
        } else {
            0
        };
        let rendered_bytes = if has_effect {
            commit.code.len() as u32
        } else {
            0
        };
        if code_changed {
            self.current = Some(commit.code);
        }
        if has_effect {
            self.layers.push(layer);
        }
        Ok(NativePipelineCommit {
            mapping_segments,
            rendered_bytes,
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
        if self.layers.is_empty() {
            return Ok(NativePipelineFinish { code, map: None });
        }
        let slices: Vec<&[u8]> = self.layers.iter().map(Vec::as_slice).collect();
        let NativeVlqMap {
            mappings,
            mut names,
        } = compose_decoded_chain(&slices)?;
        let map = if let Some(input_mappings) = input_mappings {
            // Input maps compose as the inner layer: pipeline (generated → phase
            // source) then input (phase source → original), matching the JS
            // `composeMappings(finalMap, inputMap)` boundary this replaces.
            let composed =
                crate::sourcemap::compose(&mappings, &input_mappings, names.len() as u32);
            if let Some(input_names) = input_names {
                names.extend(input_names);
            }
            NativeVlqMap {
                mappings: composed,
                names,
            }
        } else {
            NativeVlqMap { mappings, names }
        };
        Ok(NativePipelineFinish {
            code,
            map: Some(map),
        })
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
    let finish = session.finish(input_mappings, input_names)?;
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
fn decoded_segment_count(layer: &[u8]) -> u32 {
    if layer.len() < 12 {
        return 0;
    }
    let segments_offset = u32::from_le_bytes([layer[4], layer[5], layer[6], layer[7]]);
    ((layer.len() as u32 / 4) - segments_offset) / 5
}

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
}
