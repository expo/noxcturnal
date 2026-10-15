//! Facade for the planned native preflight phase.

mod block_scoping;
mod classes;
mod destructuring;
#[cfg(test)]
mod failure_inventory;
mod for_of;
pub mod helpers;
mod object_spread;
mod optimize;
pub mod options;
mod parameters;
mod regexp;
pub mod transform;

pub use options::NativePreflightOptions;
pub use transform::NativePreflightResult;
