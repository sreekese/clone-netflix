import { Link } from 'react-router-dom';
import Header from './Header';

export default function Initialloading() {
  return (
    <div className="welcome-page">
      <Header />
      <main className="welcome-content">
        <p className="eyebrow">YOUR NEXT GREAT WATCH</p>
        <h1>
          Great stories.
          <br />
          Endless discovery.
        </h1>
        <p>
          Explore movies, discover your next favorite, and watch the trailers.
        </p>
        <Link className="button large" to="/login?mode=signup">
          Get started <span aria-hidden="true">→</span>
        </Link>
        <p className="muted">
          A movie discovery demo. No subscription required.
        </p>
      </main>
      <footer>Independent demo project. Not affiliated with Netflix.</footer>
    </div>
  );
}
