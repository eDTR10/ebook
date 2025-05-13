import React from 'react'
import ReactDOM from 'react-dom/client'
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";

import './index.css'
import { Suspense, lazy } from "react";

import NotFound from "./screens/notFound";
import Loader from './components/loader/loader.tsx';
import Loaderx from './components/loader/screenLoader.tsx';






// const Login = lazy(() =>
//   wait(1300).then(() => import("./screens/Authentication/Login/Login.tsx"))
// );





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
    path: "/ebes",
    element:
      <Suspense fallback={<Loaderx />}>
        <Admin />
      </Suspense>
    ,
  },
  // {
  //   path: "/ebes/display",
  //   element:
  //     <Suspense fallback={<Loaderx />}>
  //       <AttendanceMainContainer3 />
  //     </Suspense>
  //   ,
  // },
  {
    path: "/ebes/admin",
    element: <Admin />,

    children: [
      {
        path: "/ebes/admin",
        element: <Navigate to="/ebes/admin/dashboard/" />,
      },
      {
        path: "/ebes/admin/home/",
        element: <>
          <Suspense fallback={<Loader />}>
            <HomeMainContainer />
          </Suspense>
        </>,
      },
      {
        path: "/ebes/admin/home/",
        element: <>
          <Suspense fallback={<Loader />}>
            <HomeMainContainer />
          </Suspense>
        </>,
      },
      {
        path: "/ebes/admin/events/",
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
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
