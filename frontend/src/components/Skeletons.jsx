const lines = (count) => Array.from({ length: count }, (_, index) => index)

export function DetailPageSkeleton() {
  return (
    <main className="detail-loading premium-detail-skeleton" aria-busy="true" aria-label="Loading destination">
      <section className="skeleton-detail-hero">
        <div className="container">
          <span className="skeleton-block skeleton-kicker" />
          <span className="skeleton-block skeleton-title" />
          <span className="skeleton-block skeleton-copy" />
          <div className="skeleton-actions"><span /><span /></div>
        </div>
      </section>
      <section className="container skeleton-detail-grid">
        <div className="skeleton-detail-story">
          {lines(5).map((line) => <span className="skeleton-block" key={line} />)}
        </div>
        <span className="skeleton-block skeleton-detail-map" />
      </section>
      <span className="sr-only">Loading destination details…</span>
    </main>
  )
}

export function AdminTableSkeleton() {
  return (
    <div className="admin-table-skeleton" aria-busy="true" aria-label="Loading destination library">
      {lines(5).map((row) => (
        <div className="admin-skeleton-row" key={row}>
          <span className="skeleton-block admin-skeleton-media" />
          <span className="skeleton-block" />
          <span className="skeleton-block" />
          <span className="skeleton-block" />
          <span className="skeleton-block admin-skeleton-actions" />
        </div>
      ))}
      <span className="sr-only">Loading the latest published destinations…</span>
    </div>
  )
}
