use tauri::App;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

pub fn setup_hotkey(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let handle = app.handle().clone();
    let shortcut = Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyC);
    app.global_shortcut().on_shortcut(shortcut, move |_app, _s, event| {
        if event.state == ShortcutState::Pressed {
            crate::tray::toggle_popover(&handle);
        }
    })?;
    Ok(())
}
