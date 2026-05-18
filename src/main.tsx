import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router'
import App from './App.tsx'
import Home from './pages/Home.tsx'
import NotFound from './pages/NotFound.tsx'
import Guide from './pages/Guide.tsx'
import Lln from './pages/Lln.tsx'
import QuestionManagement from './pages/QuestionManagement.tsx'
import Login from './pages/Login.tsx'
import AuthGuard from './components/AuthGuard.tsx'
import { evaluationkey, experimentkey } from './types/index.ts'
import StudentManagement from './pages/StudentManagement.tsx'
import UserManagement from './pages/UserManagement.tsx'
import Clt from './pages/Clt.tsx'
import Ci from './pages/Ci.tsx'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        {' '}
        {/* 全局基础守卫：必须登录才能进入主应用 */}
        <App />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: experimentkey,
        children: [
          {
            path: 'lln',
            element: <Lln />,
          },
          {
            path: 'clt',
            element: <Clt />
          },
          {
            path: 'ci',
            element: <Ci />
          }
        ],
      },
      {
        path: evaluationkey,
        children: [
          {
            path: 'question',
            // 权限控制：只有教师和管理员可以管理题目
            element: (
              <AuthGuard allowedRoles={['TEACHER', 'ADMIN']}>
                <QuestionManagement />
              </AuthGuard>
            ),
          },
          //学生路由
          {
            path: 'students',
            element: (
              <AuthGuard allowedRoles={['TEACHER','ADMIN']}>
                <StudentManagement />
              </AuthGuard>
            ),
          },
          //管理员可见的用户管理
          {
            path: 'users',
            element: (
              <AuthGuard allowedRoles={['ADMIN']}>
                <UserManagement />
              </AuthGuard>
            ),
          }
        ],
      },
      {
        path: 'guide',
        element: <Guide />,
      },
    ],
  },
  {
    path: '/403',
    element: (
      <div className="p-10 text-center">
        <h1>403</h1>
        <p>权限不足，请联系管理员</p>
      </div>
    ),
  },
  {
    path: '/404',
    element: <NotFound />,
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
])

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
)
