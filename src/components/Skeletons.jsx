export function StoreCardSkeleton() {
  return (
    <div className="store-card skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-circle" />
      <div className="skeleton skeleton-line" style={{ width: '60%' }} />
    </div>
  )
}

export function ItemRowSkeleton() {
  return (
    <div className="item-row skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-circle" style={{ width: 22, height: 22 }} />
      <div className="skeleton skeleton-circle" style={{ width: 26, height: 26 }} />
      <div className="skeleton skeleton-line" style={{ flex: 1 }} />
      <div className="skeleton skeleton-line" style={{ width: 40 }} />
    </div>
  )
}
