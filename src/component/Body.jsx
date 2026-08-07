import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Browse from './Browse';
import Initialloading from './Intialloading';
import Login from './Login';

const Body = () => {
  const apploader = createBrowserRouter([
  {
    path:"/",
    element:<Initialloading />
  },
  {
    path:"/browse",
    element:<Browse />
  },
  {
    path:"/login",
    element:<Login />
  }
]);

  return (
      <RouterProvider router={apploader}/>
  )
}

export default Body;
