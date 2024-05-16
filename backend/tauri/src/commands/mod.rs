use crate::macros::wrap_error;
use serde::{Deserialize, Serialize};
use shared::types::Port;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

///
/// This command is used to get the port number from the backend.
///
#[tauri::command]
pub fn get_port(port: tauri::State<Port>) -> u16 {
    port.0
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct NotificationParams {
    pub title: String,
    pub body: String,
    pub icon: Option<String>,
}

#[tauri::command]
pub async fn send_notification(params: NotificationParams) -> Result<(), String> {
    use anyhow::Context;
    use glob::glob;
    use mime_guess::get_mime_extensions_str;
    use reqwest::get;
    use sha256::digest;
    use std::io::prelude::*;
    use tauri::api::notification;
    use tauri::api::path::cache_dir;
    use url::Url;
    // if the icon is provided, it must be a valid URL, so download it to cache dir with a resource key.
    let icon = match params.icon {
        Some(icon) => {
            wrap_error!(Url::parse(&icon).context("Failed to parse icon URL"))?;
            let key = digest(&icon);
            let dir = wrap_error!(cache_dir().ok_or(anyhow::anyhow!("Failed to get cache dir")))?;
            let images_dir = dir.join("images");
            // if cache hit, return the path
            let pattern = format!("{}.*", key);
            let files =
                wrap_error!(glob(&images_dir.join(pattern).to_string_lossy())
                    .context("Failed to glob images"))?;
            let file = files.filter_map(Result::ok).next();
            match file {
                Some(file) => {
                    // should convert the file path start with file://
                    let path = format!("file://{}", file.to_string_lossy());
                    Some(path)
                }
                None => {
                    // if not exists, create the images dir
                    if !images_dir.exists() {
                        wrap_error!(
                            std::fs::create_dir(&images_dir).context("Failed to create images dir")
                        )?;
                    }
                    // download the icon
                    let resp = wrap_error!(get(icon).await.context("Failed to download icon"))?;
                    let mime = wrap_error!(resp
                        .headers()
                        .get(reqwest::header::CONTENT_TYPE)
                        .ok_or(anyhow::anyhow!("Failed to get content type")))?;
                    let mime = wrap_error!(mime
                        .to_str()
                        .context("Failed to convert content type to string"))?;
                    let ext = wrap_error!(get_mime_extensions_str(mime)
                        .context("Failed to get extensions from content type"))?
                    .first()
                    .unwrap_or(&"png");
                    let file_path = images_dir.join(format!("{}.{}", key, ext));
                    let mut file = wrap_error!(
                        std::fs::File::create(&file_path).context("Failed to create file")
                    )?;
                    let bytes = wrap_error!(resp
                        .bytes()
                        .await
                        .context("Failed to get bytes from response"))?;
                    wrap_error!(file
                        .write_all(&bytes)
                        .context("Failed to write bytes to file"))?;
                    Some(format!("file://{}", file_path.to_string_lossy()))
                }
            }
        }
        None => None,
    };

    let mut instance = notification::Notification::new("c-talk")
        .title(params.title)
        .body(params.body);
    instance = if let Some(icon) = icon {
        instance.icon(icon)
    } else {
        instance
    };
    wrap_error!(instance.show().context(
        "Failed to show notification. If you are on Windows 7, enable the `windows7-compat` feature and use `Notification::notify` instead.",
    ))?;
    Ok(())
}
