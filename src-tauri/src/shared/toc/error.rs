use thiserror::Error;

#[derive(Error, Debug)]
pub enum TocError {
    #[error("the parent id: `{0}` is not exist in container")]
    NodeParentNotFound(usize),

    #[error(transparent)]
    Other(#[from] anyhow::Error),
}
