import { createRoot } from 'react-dom/client'
// import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router'
import Home from './pages/Home.tsx'
import NotFound from './pages/NotFound.tsx'
import Guide from './pages/Guide.tsx'
import Buffon from './pages/Buffon.tsx'
import Test from './pages/Test.tsx'
import Coin from './pages/Coin.tsx'

const router = createBrowserRouter([
  {
    path: "/teaching-assistance",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "experiment",
        children: [
          {
            path: "buffon-needle",
            element: <Buffon />,
          },
          {
            path:"test",
            element:<Test/>
          },
          {
            path:"coin",
            element:<Coin/>
          }
        ],
      },
      {
        path: "guide",
        element: <Guide />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);