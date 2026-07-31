//! Facade for the planned native preflight phase.

mod block_scoping;
mod classes;
mod destructuring;
mod for_of;
pub mod helpers;
mod logical_assignment;
mod object_spread;
mod optimize;
pub mod options;
mod parameters;
mod regexp;
pub mod transform;

pub use options::NativePreflightOptions;
pub use transform::NativePreflightResult;
