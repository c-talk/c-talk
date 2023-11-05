use tauri::{AppHandle, PackageInfo};
use serde::{Serialize, Deserialize};

#[derive(Serialize, Debug)]
pub struct AppInfo {
    pub name: String,
    /// App version
    pub version: String,
    /// The crate authors.
    pub authors: &'static str,
    /// The crate description.
    pub description: &'static str,
    pub webview_version: String,
}

impl From<PackageInfo> for AppInfo {
    fn from(package_info: PackageInfo) -> Self {
        AppInfo {
            name: package_info.name,
            version: format!(
                "{}.{}.{}",
                package_info.version.major,
                package_info.version.minor,
                package_info.version.patch
            ),
            authors: package_info.authors,
            description: package_info.description,
            webview_version: tauri::webview_version().unwrap_or("unknown".to_string())
        }
    }
}

#[tauri::command]
pub fn app_info(app_handle: AppHandle) -> AppInfo {
    AppInfo::from(app_handle.package_info().clone())
}
