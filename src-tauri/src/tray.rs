use tauri::{App, Manager};
use tauri::tray::{TrayIconBuilder, TrayIconEvent, MouseButton, MouseButtonState};
use tauri_plugin_positioner::{Position, WindowExt};

pub fn setup_tray(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let handle = app.handle().clone();
    let _tray = TrayIconBuilder::with_id("main")
        .icon(app.default_window_icon().unwrap().clone())
        .icon_as_template(true)
        .on_tray_icon_event(move |_tray, event| {
            if let TrayIconEvent::Click { button, button_state, .. } = event {
                if button == MouseButton::Left && button_state == MouseButtonState::Up {
                    toggle_popover(&handle);
                }
            }
        })
        .build(app)?;
    Ok(())
}

pub fn toggle_popover(app: &tauri::AppHandle) {
    if let Some(win) = app.get_webview_window("popover") {
        let visible = win.is_visible().unwrap_or(false);
        if visible {
            let _ = win.hide();
        } else {
            let _ = win.move_window(Position::TopRight);
            let _ = win.show();
            let _ = win.set_focus();
        }
    }
}

pub fn set_badge(app: &tauri::AppHandle, count: u32) -> Result<(), Box<dyn std::error::Error>> {
    let tray = app.tray_by_id("main").ok_or("tray not found")?;
    let label = if count == 0 { None } else { Some(count.to_string()) };
    tray.set_title(label.as_deref())?;
    Ok(())
}
