mod tray;
mod hotkey;

#[tauri::command]
fn set_badge(app: tauri::AppHandle, count: u32) -> Result<(), String> {
    tray::set_badge(&app, count).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_positioner::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            tray::setup_tray(app)?;
            hotkey::setup_hotkey(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![set_badge])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
