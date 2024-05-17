use anyhow::{anyhow, Result};
use std::io::IsTerminal;
use tracing::level_filters::LevelFilter;
use tracing_log::log_tracer;
use tracing_subscriber::{fmt, layer::SubscriberExt, EnvFilter};

pub fn init() -> Result<()> {
    #[cfg(debug_assertions)]
    {
        let filter = EnvFilter::builder()
            .with_default_directive(LevelFilter::TRACE.into())
            .from_env_lossy();
        let terminal_layer = fmt::Layer::new()
            .with_ansi(std::io::stdout().is_terminal())
            .compact()
            .with_target(false)
            .with_file(true)
            .with_line_number(true)
            .with_writer(std::io::stdout);
        let subscriber = tracing_subscriber::registry()
            .with(filter)
            .with(terminal_layer);
        log_tracer::LogTracer::init()?;
        tracing::subscriber::set_global_default(subscriber)
            .map_err(|x| anyhow!("setup logging error: {}", x))?;
    }
    Ok(())
}
