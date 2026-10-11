import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import VideoTitle from './VideoTitle';
import Videobackground from './Videobackground';

function BannerCarousel({ movies, onSelect, suspended }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(
    () =>
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  );
  const [focused, setFocused] = useState(false);
  const slides = movies.slice(0, 5);
  const currentIndex = index % slides.length;
  const movie = slides[currentIndex];
  useEffect(() => {
    if (paused || focused || suspended || slides.length < 2) return;
    const timer = setInterval(
      () => setIndex((value) => (value + 1) % slides.length),
      30000,
    );
    return () => clearInterval(timer);
  }, [paused, focused, suspended, slides.length]);
  function selectSlide(nextIndex) {
    setIndex(nextIndex);
  }
  return (
    <section
      className="featured"
      aria-label="Featured movie trailers"
      aria-roledescription="carousel"
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <Videobackground
        key={movie.id}
        movie={movie}
        playing={!paused && !suspended}
      />
      <div
        className="banner-slide"
        role="group"
        aria-roledescription="slide"
        aria-label={`${currentIndex + 1} of ${slides.length}: ${movie.title || movie.original_title}`}
      >
        <VideoTitle
          title={movie.title || movie.original_title}
          description={movie.overview}
          onSelect={() => onSelect(movie)}
        />
      </div>
      <div className="banner-controls">
        <button
          className="banner-control"
          onClick={() => setPaused((value) => !value)}
          aria-label={paused ? 'Play banner videos' : 'Pause banner videos'}
        >
          {paused ? '▶ Play' : 'Ⅱ Pause'}
        </button>
        <span className="banner-counter">
          {currentIndex + 1} / {slides.length}
        </span>
        <div className="banner-dots" aria-label="Choose a featured movie">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              className="banner-dot"
              aria-label={`Show ${slide.title || slide.original_title}`}
              aria-pressed={slideIndex === currentIndex}
              onClick={() => selectSlide(slideIndex)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
export default function MainContainer({ onSelect, suspended = false }) {
  const { nowPlayingMovies: movies, nowPlayingError } = useSelector(
    (state) => state.movies,
  );
  if (nowPlayingError)
    return (
      <p role="alert" className="status">
        {nowPlayingError}
      </p>
    );
  if (movies === null)
    return (
      <p role="status" className="status">
        Loading movies…
      </p>
    );
  if (!movies.length)
    return (
      <p role="status" className="status">
        No movies are available right now.
      </p>
    );
  return (
    <BannerCarousel movies={movies} onSelect={onSelect} suspended={suspended} />
  );
}
