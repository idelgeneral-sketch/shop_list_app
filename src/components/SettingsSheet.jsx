import { useSettings } from '../context/SettingsContext'
import { IconClose } from './Icons'

export function SettingsSheet({ onClose }) {
  const { settings, setSettings } = useSettings()

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="sheet-title" style={{ margin: 0 }}>
            הגדרות
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="סגירה">
            <IconClose />
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="sheet-row">
            <div>
              <div className="sheet-row-label">חיפוש חכם</div>
              <div className="sheet-row-desc">הצעות אוטומטיות בזמן הקלדת שם מוצר</div>
            </div>
            <button
              className={`toggle ${settings.smartSearch ? 'is-on' : ''}`}
              onClick={() => setSettings({ smartSearch: !settings.smartSearch })}
              aria-label="חיפוש חכם"
            >
              <div className="toggle-knob" />
            </button>
          </div>

          <div className="sheet-row">
            <div>
              <div className="sheet-row-label">אישור לפני מחיקה</div>
              <div className="sheet-row-desc">בקשת אישור למחיקת חנות או מוצר</div>
            </div>
            <button
              className={`toggle ${settings.confirmBeforeDelete ? 'is-on' : ''}`}
              onClick={() => setSettings({ confirmBeforeDelete: !settings.confirmBeforeDelete })}
              aria-label="אישור לפני מחיקה"
            >
              <div className="toggle-knob" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
