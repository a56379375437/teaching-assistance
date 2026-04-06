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
import Hongbao from './pages/Hongbao.tsx'
import Lln from './pages/Lln.tsx'
import { evaluationkey, experimentkey } from './types/index.ts'
import QuestionManagement from './pages/QuestionManagement.tsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: experimentkey,
        children: [
          {
            path: "buffon-needle",
            element: <Buffon />,
          },
          {
            path:"lln",
            element:<Lln />,
          },
          {
            path: "test",
            element: <Test />,
          },
          {
            path: "coin",
            element: <Coin />,
          },
          {
            path: "hongbao",
            element: <Hongbao />,
          },
        ],
      },
      {
        path: "404",
        element: <NotFound />,
      },
      {
        path: evaluationkey,
        children: [
          {
            path: "question",
            element: <QuestionManagement />,
          },
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