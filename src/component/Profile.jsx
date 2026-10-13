import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Header from './Header';
import ProfileIcon from './ProfileIcon';

export default function Profile() {
  const user = useSelector((state) => state.user);
  return (
    <>
      <Header overlay />
      <main className="profile-page">
        <Link className="text-button" to="/browse">
          Back to browse
        </Link>
        <div className="profile-card">
          <span className="profile-avatar large-avatar" aria-hidden="true">
            <ProfileIcon />
          </span>
          <h1>My profile</h1>
          <p className="muted">Your account information</p>
          <dl className="movie-facts">
            <div>
              <dt>Name</dt>
              <dd>{user?.displayName || 'Not set'}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user?.email || 'Not available'}</dd>
            </div>
          </dl>
          <Link className="button" to="/browse">
            Discover movies
          </Link>
        </div>
      </main>
    </>
  );
}
