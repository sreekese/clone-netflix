import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { auth } from '../utlis/firebase';
import { addUser, removeUser } from '../utlis/userSlice';
import Browse from './Browse';
import Initialloading from './Intialloading';
import Login from './Login';
import MoviePage from './MoviePage';
import Profile from './Profile';

export function AppRoutes() {
  const user = useSelector((state) => state.user);
  const creatingAccount = useSelector((state) => state.session.creatingAccount);
  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/browse" replace /> : <Initialloading />}
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
  if (!ready)
    return (
      <p role="status" className="status">
        Loading your session…
      </p>
    );
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
