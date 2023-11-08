// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use shared::types::Port;

mod commands;

fn main() {
    let client = sentry_tauri::sentry::init((
        "https://7ff49cd7135abc2325007303e0a39a37@o4505576204992512.ingest.sentry.io/4506191549300736",
        sentry_tauri::sentry::ClientOptions {
            release: sentry_tauri::sentry::release_name!(),
            ..Default::default()
        },
    ));

    // Everything before here runs in both app and crash reporter processes
    let _guard = sentry_tauri::minidump::init(&client);

    let port = portpicker::pick_unused_port().expect("failed to find unused port");
    tauri::async_runtime::spawn(server::start(port));
    // Everything after here runs in only the app process
    tauri::Builder::default()
        .manage(Port(port))
        .invoke_handler(tauri::generate_handler![commands::greet, commands::get_port])
        .plugin(sentry_tauri::plugin())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
