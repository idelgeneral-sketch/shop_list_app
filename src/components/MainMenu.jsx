import { IconCart, IconClose, IconSettings, IconTasks } from './Icons'
import { APP_VERSION } from '../version'

const SCREENS = [
  { id: 'shopping', label: 'רשימת קניות', icon: IconCart },
  { id: 'tasks', label: 'משימות', icon: IconTasks },
]

export function MainMenu({ activeScreen, onSelectScreen, onOpenSettings, onClose }) {
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="sheet-title" style={{ margin: 0 }}>
            תפריט
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="סגירה">
            <IconClose />
          </button>
        </div>

        <div style={{ marginTop: 8 }}>
          {SCREENS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`menu-row ${activeScreen === id ? 'is-active' : ''}`}
              onClick={() => {
                onSelectScreen(id)
                onClose()
              }}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}

          <div className="menu-divider" />

          <button
            className="menu-row"
            onClick={() => {
              onOpenSettings()
              onClose()
            }}
          >
            <IconSettings />
            <span>הגדרות</span>
          </button>
        </div>

        <div className="menu-version">גרסה {APP_VERSION}</div>
      </div>
    </div>
  )
}
