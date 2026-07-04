export function ConfirmDialog({ title, description, confirmLabel = 'מחיקה', onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-title">{title}</div>
        {description && <div className="confirm-desc">{description}</div>}
        <div className="confirm-actions">
          <button className="confirm-cancel" onClick={onCancel}>
            ביטול
          </button>
          <button className="confirm-ok" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
