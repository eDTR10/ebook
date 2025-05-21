import React from 'react'
import ReactDOM from 'react-dom/client'
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";

import './index.css'
import { Suspense, lazy } from "react";

import NotFound from "./screens/notFound";
import Loader from './components/loader/loader.tsx';
import Loaderx from './components/loader/screenLoader.tsx';






const Login = lazy(() =>
  wait(1300).then(() => import("./screens/Authentication/Login/Login.tsx"))
);





const Admin = lazy(() =>
  wait(1300).then(() => import("./screens/Admin/Admin.tsx"))
);

const HomeMainContainer = lazy(() =>
  wait(1300).then(() => import("./screens/Admin/Home/HomeMainContainer.tsx"))
);

const EventsMainContainer = lazy(() =>
  wait(1300).then(() => import("./screens/Admin/Events/EventsMainContainer.tsx"))
);


const router = createBrowserRouter([
  {
    path: "/ebook",
    element:
      <Suspense fallback={<Loaderx />}>
        <Login />
      </Suspense>
    ,
  },
  // {
  //   path: "/ebook/display",
  //   element:
  //     <Suspense fallback={<Loaderx />}>
  //       <AttendanceMainContainer3 />
  //     </Suspense>
  //   ,
  // },
  {
    path: "/ebook/admin",
    element: <Admin />,

    children: [
      {
        path: "/ebook/admin",
        element: <Navigate to="/ebook/admin/home/" />,
      },
      {
        path: "/ebook/admin/home/",
        element: <>
          <Suspense fallback={<Loader />}>
            <HomeMainContainer />
          </Suspense>
        </>,
      },
      {
        path: "/ebook/admin/home/",
        element: <>
          <Suspense fallback={<Loader />}>
            <HomeMainContainer />
          </Suspense>
        </>,
      },
      {
        path: "/ebook/admin/events/",
        element: <>
          <Suspense fallback={<Loader />}>
            <EventsMainContainer />
          </Suspense>
        </>,
      },

      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

function wait(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(

  <RouterProvider router={router} />

)
