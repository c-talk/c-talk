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
