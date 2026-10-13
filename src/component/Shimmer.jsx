/** Decorative placeholders share one accessible loading announcement. */
export default function Shimmer({
  variant = 'row',
  label = 'Loading movies…',
}) {
  return (
    <div
      className={`shimmer-placeholder shimmer-${variant}`}
      role="status"
      aria-label={label}
    >
      <span className="visually-hidden">{label}</span>
      <div aria-hidden="true" className="shimmer-shapes">
        {variant === 'row' ? (
          <div className="movie-row">
            {Array.from({ length: 7 }, (_, index) => (
              <div className="shimmer-card" key={index}>
                <div className="shimmer-block shimmer-poster" />
                <div className="shimmer-block shimmer-line" />
                <div className="shimmer-block shimmer-line short" />
              </div>
            ))}
          </div>
        ) : variant === 'video' ? (
          <div className="shimmer-block shimmer-player" />
        ) : variant === 'banner' ? (
          <div className="featured shimmer-hero">
            <div className="featured-content">
              <div className="shimmer-block shimmer-line short" />
              <div className="shimmer-block shimmer-title" />
              <div className="shimmer-block shimmer-line" />
              <div className="shimmer-block shimmer-line" />
              <div className="shimmer-block shimmer-button" />
            </div>
          </div>
        ) : (
          <div className="shimmer-facts">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index}>
                <div className="shimmer-block shimmer-line short" />
                <div className="shimmer-block shimmer-line" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function MovieRowShimmer({
  title,
  label = `Loading ${title.toLowerCase()}…`,
}) {
  return (
    <section className="movie-section" aria-label={title}>
      <h2>{title}</h2>
      <Shimmer label={label} />
    </section>
  );
}
