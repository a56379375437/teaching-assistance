import { createRoot } from 'react-dom/client'
// import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router'
import Home from './pages/Home.tsx'
import List from './pages/List.tsx'
import About from './pages/About.tsx'
import NotFound from './pages/NotFound.tsx'

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
        path: "list",
        element: <List />,
      },
      {
        path: "about",
        element: <About />,
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