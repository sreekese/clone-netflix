import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { auth } from '../utlis/firebase';
import { addUser, removeUser } from '../utlis/userSlice';

import Shimmer from './Shimmer';

export function AppRoutes() {
  const user = useSelector((state) => state.user);
  const creatingAccount = useSelector((state) => state.session.creatingAccount);
  return (
    <Suspense fallback={<Shimmer variant="banner" label="Loading page…" />}>
      <Routes>
        <Route
          path="/"
          element={
            user ? <Navigate to="/browse" replace /> : <Initialloading />
          }
        />
        <Route
          path="/login"
          element={
            user && !creatingAccount ? (
              <Navigate to="/browse" replace />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/browse"
          element={user ? <Browse /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/movie/:movieId"
          element={user ? <MoviePage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function Body() {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(!auth);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(
      auth,
      (user) => {
        dispatch(
          user
            ? addUser({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
              })
            : removeUser(),
        );
        setReady(true);
      },
      () => {
        setError('Unable to restore your session. Please reload the page.');
        setReady(true);
      },
    );
  }, [dispatch]);
  if (error)
    return (
      <p role="alert" className="status">
        {error}
      </p>
    );
  if (!ready) return <Shimmer variant="banner" label="Loading your session…" />;
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

const Browse = lazy(() => import('./Browse'));

const Initialloading = lazy(() => import('./Intialloading'));

const Login = lazy(() => import('./Login'));

const MoviePage = lazy(() => import('./MoviePage'));

const Profile = lazy(() => import('./Profile'));
