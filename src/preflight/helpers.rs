//! Compatibility contract between Oxc 0.141 helper requests and Babel runtime.

use oxc_transformer::Helper;

/// The newest minimum below intentionally determines the default Expo runtime
/// requirement. Older helpers retain their real lower bound so custom pipelines can
/// make an informed compatibility decision rather than inheriting one global guess.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct HelperCompatibility {
    pub oxc_name: &'static str,
    pub babel_path: &'static str,
    pub minimum_version: (u32, u32, u32),
    pub export_shape: &'static str,
    pub semantic_note: &'static str,
}

pub const fn compatibility(helper: Helper) -> Option<HelperCompatibility> {
    let (minimum_version, semantic_note) = match helper {
        Helper::AwaitAsyncGenerator
        | Helper::AsyncGeneratorDelegate
        | Helper::AsyncIterator
        | Helper::AsyncToGenerator
        | Helper::WrapAsyncGenerator => ((7, 0, 0), "Babel async helper ABI"),
        Helper::Extends
        | Helper::ObjectDestructuringEmpty
        | Helper::ObjectWithoutProperties
        | Helper::DefineProperty
        | Helper::ReadOnlyError
        | Helper::WriteOnlyError
        | Helper::TaggedTemplateLiteral => ((7, 0, 0), "Babel helper ABI"),
        Helper::ObjectSpread2 => ((7, 5, 0), "Babel object spread evaluation order"),
        Helper::ClassPrivateFieldInitSpec
        | Helper::ClassPrivateMethodInitSpec
        | Helper::ClassPrivateFieldLooseKey
        | Helper::ClassPrivateFieldLooseBase => ((7, 10, 0), "Babel private-field ABI"),
        Helper::ToPropertyKey | Helper::CheckInRHS => ((7, 22, 0), "Babel property-key ABI"),
        Helper::ClassPrivateFieldGet2
        | Helper::ClassPrivateFieldSet2
        | Helper::AssertClassBrand
        | Helper::ToSetter
        | Helper::SuperPropGet
        | Helper::SuperPropSet => ((7, 24, 0), "Babel 7.24 class-feature ABI"),
        Helper::UsingCtx => ((7, 28, 0), "Babel explicit-resource-management ABI"),
        // Decorators are rejected before transformation, so these helpers must never
        // be reachable from a supported preflight transform set.
        Helper::Decorate | Helper::DecorateParam | Helper::DecorateMetadata => return None,
    };
    Some(HelperCompatibility {
        oxc_name: helper.name(),
        babel_path: helper.name(),
        minimum_version,
        export_shape: "default",
        semantic_note,
    })
}

pub fn validate_runtime_helpers(
    helpers: impl IntoIterator<Item = Helper>,
    module_name: &str,
    version: Option<&str>,
) -> Result<(), String> {
    let helpers: Vec<Helper> = helpers.into_iter().collect();
    if helpers.is_empty() {
        return Ok(());
    }
    let version = version
        .and_then(parse_version)
        .ok_or_else(|| "helper-runtime-version-required".to_string())?;
    for helper in helpers {
        let contract = compatibility(helper)
            .ok_or_else(|| format!("helper-not-compatible:{}", helper.name()))?;
        if version < contract.minimum_version {
            return Err(format!(
                "helper-runtime-too-old:{}:{} requires {}.{}.{}",
                module_name,
                helper.name(),
                contract.minimum_version.0,
                contract.minimum_version.1,
                contract.minimum_version.2,
            ));
        }
    }
    Ok(())
}

pub fn inline_helpers(
    helpers: impl IntoIterator<Item = Helper>,
    source: &str,
) -> Result<Option<InlineHelpers>, String> {
    let helpers: Vec<Helper> = helpers.into_iter().collect();
    if helpers.is_empty() {
        return Ok(None);
    }
    let has_using_ctx = helpers.contains(&Helper::UsingCtx);
    let has_object_helpers = helpers.iter().any(|helper| {
        matches!(
            helper,
            Helper::DefineProperty
                | Helper::Extends
                | Helper::ObjectDestructuringEmpty
                | Helper::ObjectSpread2
                | Helper::ObjectWithoutProperties
                | Helper::ToPropertyKey
        )
    });
    let has_async = helpers.iter().any(|helper| {
        matches!(
            helper,
            Helper::AwaitAsyncGenerator
                | Helper::AsyncGeneratorDelegate
                | Helper::AsyncIterator
                | Helper::WrapAsyncGenerator
                | Helper::AsyncToGenerator
        )
    });
    let async_to_generator_only = has_async
        && helpers.iter().all(|helper| {
            !matches!(
                helper,
                Helper::AwaitAsyncGenerator
                    | Helper::AsyncGeneratorDelegate
                    | Helper::AsyncIterator
                    | Helper::WrapAsyncGenerator
            )
        });
    for helper in &helpers {
        if *helper != Helper::UsingCtx
            && !matches!(
                helper,
                Helper::DefineProperty
                    | Helper::Extends
                    | Helper::ObjectDestructuringEmpty
                    | Helper::ObjectSpread2
                    | Helper::ObjectWithoutProperties
                    | Helper::ToPropertyKey
            )
            && !matches!(
                helper,
                Helper::AwaitAsyncGenerator
                    | Helper::AsyncGeneratorDelegate
                    | Helper::AsyncIterator
                    | Helper::WrapAsyncGenerator
                    | Helper::AsyncToGenerator
            )
        {
            return Err(format!("inline-helper-not-compatible:{}", helper.name()));
        }
    }
    let mut binding = "_noxHelpers".to_string();
    let mut suffix = 2;
    while source.contains(&binding) {
        binding = format!("_noxHelpers{suffix}");
        suffix += 1;
    }
    Ok(Some(InlineHelpers {
        binding,
        // Kept on one generated line so native source-map adjustment is a single
        // line offset. These implementations follow Babel's helper behavior but
        // are locally scoped and introduce no runtime dependency or global.
        prefix: {
            let prefixes = [
                has_async.then_some(if async_to_generator_only {
                    INLINE_ASYNC_TO_GENERATOR
                } else {
                    INLINE_ASYNC_HELPERS
                }),
                has_using_ctx.then_some(INLINE_USING_CTX),
                has_object_helpers.then_some(INLINE_OBJECT_HELPERS),
            ]
            .into_iter()
            .flatten()
            .collect::<Vec<_>>();
            if prefixes.len() == 1 {
                prefixes[0].into()
            } else {
                format!("Object.assign({})", prefixes.join(","))
            }
        },
    }))
}

pub struct InlineHelpers {
    pub binding: String,
    pub prefix: String,
}

const INLINE_ASYNC_HELPERS: &str = r#"(()=>{function O(v,k){this.v=v,this.k=k}function awaitAsyncGenerator(v){return new O(v,0)}function asyncGeneratorDelegate(i){let waiting=false,out={};function pump(k,v){waiting=true;return{done:false,value:new O(new Promise(r=>r(i[k](v))),1)}}let iterator=typeof Symbol!="undefined"&&Symbol.iterator||"@@iterator";out[iterator]=function(){return this};out.next=v=>waiting?(waiting=false,v):pump("next",v);if(typeof i.throw=="function")out.throw=v=>{if(waiting)throw waiting=false,v;return pump("throw",v)};if(typeof i.return=="function")out.return=v=>waiting?(waiting=false,v):pump("return",v);return out}function asyncIterator(value){let method,asyncKey,iteratorKey,tries=2;for(typeof Symbol!="undefined"&&(asyncKey=Symbol.asyncIterator,iteratorKey=Symbol.iterator);tries--;){if(asyncKey&&(method=value[asyncKey])!=null)return method.call(value);if(iteratorKey&&(method=value[iteratorKey])!=null)return new FromSync(method.call(value));asyncKey="@@asyncIterator",iteratorKey="@@iterator"}throw new TypeError("Object is not async iterable")}function FromSync(iterator){function cont(result){if(Object(result)!==result)return Promise.reject(new TypeError(result+" is not an object."));let done=result.done;return Promise.resolve(result.value).then(value=>({value,done}))}this.s=iterator;this.n=iterator.next;this.next=function(){return cont(this.n.apply(this.s,arguments))};this.return=function(value){let method=this.s.return;return method===void 0?Promise.resolve({value,done:true}):cont(method.apply(this.s,arguments))};this.throw=function(value){let method=this.s.throw;return method===void 0?Promise.reject(value):cont(method.apply(this.s,arguments))}}function wrapAsyncGenerator(generator){return function(){return new AsyncGenerator(generator.apply(this,arguments))}}function AsyncGenerator(iterator){let front,back;function resume(key,arg){try{let result=iterator[key](arg),value=result.value,overload=value instanceof O;Promise.resolve(overload?value.v:value).then(value=>{if(overload){let next=key==="return"&&result.value.k?key:"next";if(!result.value.k||value.done)return resume(next,value);value=iterator[next](value).value}settle(!!result.done,value)},error=>resume("throw",error))}catch(error){settle(2,error)}}function settle(done,value){done===2?front.reject(value):front.resolve({value,done});front=front.next;if(front)resume(front.key,front.arg);else back=null}this._invoke=function(key,arg){return new Promise((resolve,reject)=>{let request={key,arg,resolve,reject,next:null};back?back=back.next=request:(front=back=request,resume(key,arg))})};if(typeof iterator.return!="function")this.return=void 0}let asyncKey=typeof Symbol=="function"&&Symbol.asyncIterator||"@@asyncIterator";AsyncGenerator.prototype[asyncKey]=function(){return this};AsyncGenerator.prototype.next=function(value){return this._invoke("next",value)};AsyncGenerator.prototype.throw=function(value){return this._invoke("throw",value)};AsyncGenerator.prototype.return=function(value){return this._invoke("return",value)};function step(iterator,resolve,reject,next,fail,key,arg){let result;try{result=iterator[key](arg)}catch(error){reject(error);return}result.done?resolve(result.value):Promise.resolve(result.value).then(next,fail)}function asyncToGenerator(fn){return function(){let self=this,args=arguments;return new Promise((resolve,reject)=>{let iterator=fn.apply(self,args);function next(value){step(iterator,resolve,reject,next,fail,"next",value)}function fail(value){step(iterator,resolve,reject,next,fail,"throw",value)}next(void 0)})}}return{awaitAsyncGenerator,asyncGeneratorDelegate,asyncIterator,wrapAsyncGenerator,asyncToGenerator}})()"#;

const INLINE_ASYNC_TO_GENERATOR: &str = r#"(()=>{function step(iterator,resolve,reject,next,fail,key,arg){let result;try{result=iterator[key](arg)}catch(error){reject(error);return}result.done?resolve(result.value):Promise.resolve(result.value).then(next,fail)}function asyncToGenerator(fn){return function(){let self=this,args=arguments;return new Promise((resolve,reject)=>{let iterator=fn.apply(self,args);function next(value){step(iterator,resolve,reject,next,fail,"next",value)}function fail(value){step(iterator,resolve,reject,next,fail,"throw",value)}next(void 0)})}}return{asyncToGenerator}})()"#;

const INLINE_USING_CTX: &str = r#"(()=>{function usingCtx(){let Suppressed="function"==typeof SuppressedError?SuppressedError:function(error,suppressed){let value=Error();return value.name="SuppressedError",value.error=error,value.suppressed=suppressed,value},empty={},stack=[];function using(isAwait,value){if(value!=null){if(Object(value)!==value)throw new TypeError("using declarations can only be used with objects, functions, null, or undefined.");let dispose;if(isAwait)dispose=value[Symbol.asyncDispose||Symbol.for("Symbol.asyncDispose")];let sync;if(dispose===void 0&&(dispose=value[Symbol.dispose||Symbol.for("Symbol.dispose")],isAwait))sync=dispose;if(typeof dispose!="function")throw new TypeError("Object is not disposable.");if(sync)dispose=function(){try{return sync.call(value)}catch(error){return Promise.reject(error)}};stack.push({v:value,d:dispose,a:isAwait})}else if(isAwait)stack.push({d:value,a:isAwait});return value}return{e:empty,u:using.bind(null,false),a:using.bind(null,true),d:function(){let record,error=this.e,state=0;function next(){while(record=stack.pop())try{if(!record.a&&state===1)return state=0,stack.push(record),Promise.resolve().then(next);if(record.d){let result=record.d.call(record.v);if(record.a)return state|=2,Promise.resolve(result).then(next,fail)}else state|=1}catch(value){return fail(value)}if(state===1)return error!==empty?Promise.reject(error):Promise.resolve();if(error!==empty)throw error}function fail(value){return error=error!==empty?new Suppressed(value,error):value,next()}return next()}}}return{usingCtx}})()"#;

const INLINE_OBJECT_HELPERS: &str = r#"(()=>{function toPrimitive(value,hint){if(typeof value!="object"||value===null)return value;let primitive=value[Symbol.toPrimitive];if(primitive!==void 0){let result=primitive.call(value,hint||"default");if(typeof result!="object")return result;throw new TypeError("@@toPrimitive must return a primitive value.")}return(hint==="string"?String:Number)(value)}function toPropertyKey(value){let key=toPrimitive(value,"string");return typeof key==="symbol"?key:key+""}function defineProperty(object,key,value){return(key=toPropertyKey(key))in object?Object.defineProperty(object,key,{value,enumerable:true,configurable:true,writable:true}):object[key]=value,object}function objectWithoutPropertiesLoose(source,excluded){if(source==null)return{};let target={};for(let key in source)if({}.hasOwnProperty.call(source,key)&&excluded.indexOf(key)<0)target[key]=source[key];return target}function objectWithoutProperties(source,excluded){if(source==null)return{};let target=objectWithoutPropertiesLoose(source,excluded);if(Object.getOwnPropertySymbols){let symbols=Object.getOwnPropertySymbols(source);for(let index=0;index<symbols.length;index++){let key=symbols[index];if(excluded.indexOf(key)<0&&{}.propertyIsEnumerable.call(source,key))target[key]=source[key]}}return target}function ownKeys(value,enumerableOnly){let keys=Object.keys(value);if(Object.getOwnPropertySymbols){let symbols=Object.getOwnPropertySymbols(value);if(enumerableOnly)symbols=symbols.filter(key=>Object.getOwnPropertyDescriptor(value,key).enumerable);keys.push.apply(keys,symbols)}return keys}function objectSpread2(target){for(let index=1;index<arguments.length;index++){let source=arguments[index]!=null?arguments[index]:{};index%2?ownKeys(Object(source),true).forEach(key=>defineProperty(target,key,source[key])):Object.getOwnPropertyDescriptors?Object.defineProperties(target,Object.getOwnPropertyDescriptors(source)):ownKeys(Object(source)).forEach(key=>Object.defineProperty(target,key,Object.getOwnPropertyDescriptor(source,key)))}return target}function objectDestructuringEmpty(value){if(value==null)throw new TypeError("Cannot destructure "+value)}function _extends(){return _extends=Object.assign?Object.assign.bind():function(target){for(let index=1;index<arguments.length;index++){let source=arguments[index];for(let key in source)if({}.hasOwnProperty.call(source,key))target[key]=source[key]}return target},_extends.apply(null,arguments)}return{defineProperty,extends:_extends,objectDestructuringEmpty,objectSpread2,objectWithoutProperties,toPropertyKey}})()"#;

fn parse_version(value: &str) -> Option<(u32, u32, u32)> {
    let value = value.strip_prefix('v').unwrap_or(value);
    let core = value.split_once('-').map_or(value, |(core, _)| core);
    let mut parts = core.split('.');
    let major = parts.next()?.parse().ok()?;
    let minor = parts.next().unwrap_or("0").parse().ok()?;
    let patch = parts.next().unwrap_or("0").parse().ok()?;
    Some((major, minor, patch))
}

#[cfg(test)]
mod tests {
    use super::*;

    const REACHABLE: [Helper; 26] = [
        Helper::AwaitAsyncGenerator,
        Helper::AsyncGeneratorDelegate,
        Helper::AsyncIterator,
        Helper::AsyncToGenerator,
        Helper::ObjectSpread2,
        Helper::WrapAsyncGenerator,
        Helper::Extends,
        Helper::ObjectDestructuringEmpty,
        Helper::ObjectWithoutProperties,
        Helper::ToPropertyKey,
        Helper::DefineProperty,
        Helper::ClassPrivateFieldInitSpec,
        Helper::ClassPrivateMethodInitSpec,
        Helper::ClassPrivateFieldGet2,
        Helper::ClassPrivateFieldSet2,
        Helper::AssertClassBrand,
        Helper::ToSetter,
        Helper::ClassPrivateFieldLooseKey,
        Helper::ClassPrivateFieldLooseBase,
        Helper::SuperPropGet,
        Helper::SuperPropSet,
        Helper::ReadOnlyError,
        Helper::WriteOnlyError,
        Helper::CheckInRHS,
        Helper::UsingCtx,
        Helper::TaggedTemplateLiteral,
    ];

    #[test]
    fn every_reachable_helper_has_a_babel_contract() {
        for helper in REACHABLE {
            let contract = compatibility(helper).unwrap();
            assert_eq!(contract.oxc_name, helper.name());
            assert_eq!(contract.babel_path, helper.name());
            assert_eq!(contract.export_shape, "default");
        }
    }

    #[test]
    fn ordinary_async_inline_helper_excludes_async_generator_runtime() {
        let helpers = inline_helpers([Helper::AsyncToGenerator], "")
            .unwrap()
            .unwrap();
        assert!(helpers.prefix.contains("asyncToGenerator"));
        assert!(!helpers.prefix.contains("wrapAsyncGenerator"));
        assert!(helpers.prefix.len() < INLINE_ASYNC_HELPERS.len() / 2);
    }

    #[test]
    fn runtime_versions_are_checked_per_helper() {
        assert!(
            validate_runtime_helpers([Helper::UsingCtx], "@babel/runtime", Some("7.29.2")).is_ok()
        );
        assert_eq!(
            validate_runtime_helpers([Helper::UsingCtx], "@babel/runtime", Some("7.27.0")),
            Err("helper-runtime-too-old:@babel/runtime:usingCtx requires 7.28.0".into())
        );
        assert_eq!(
            validate_runtime_helpers([Helper::AsyncToGenerator], "@babel/runtime", None),
            Err("helper-runtime-version-required".into())
        );
    }

    #[test]
    fn inline_materializer_composes_helper_families_without_dependencies() {
        let inline = inline_helpers(
            [
                Helper::AsyncToGenerator,
                Helper::DefineProperty,
                Helper::UsingCtx,
            ],
            "var _noxHelpers = 1;",
        )
        .unwrap()
        .unwrap();
        assert_eq!(inline.binding, "_noxHelpers2");
        assert!(inline.prefix.starts_with("Object.assign("));
        assert!(inline.prefix.contains("asyncToGenerator"));
        assert!(inline.prefix.contains("defineProperty"));
        assert!(inline.prefix.contains("usingCtx"));
        assert!(!inline.prefix.contains("require("));
    }
}
