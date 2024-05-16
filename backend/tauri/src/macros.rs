// It should be used to wrap the error into a string and log it.
macro_rules! wrap_error {
    ($e:expr) => {
        match $e {
            Result::Ok(val) => Result::Ok(val),
            Result::Err(e) => {
                tracing::error!("{:?}", e);
                Err(e.to_string())
            }
        }
    };
}

pub(crate) use wrap_error;
