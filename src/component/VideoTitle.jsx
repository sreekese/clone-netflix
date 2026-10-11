export default function VideoTitle({ title, description, onSelect }) {
  return (
    <div className="featured-content">
      <p className="eyebrow">NOW PLAYING</p>
      <h2>{title}</h2>
      <p className="synopsis">
        {description || 'Discover this movie and watch its trailer.'}
      </p>
      <button className="button light" onClick={onSelect}>
        Details & trailer
      </button>
    </div>
  );
}
