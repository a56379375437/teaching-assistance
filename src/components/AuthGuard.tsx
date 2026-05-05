// 路由守卫

import React from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuthStore } from '../store/useAuthStore'

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: string[] // 允许访问的角色列表
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore()
  const location = useLocation()

  // 检查是否登录
  if (!isAuthenticated) {
    // 没登录则跳转登录页，并记录当前想去的页面
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 如果已登录，但访问的是 /login
  if (isAuthenticated && location.pathname === '/login') {
    return <Navigate to="/" replace />
  }

  //检查权限
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // 权限不足，跳转到无权限页面或首页
    return <Navigate to="/403" replace />
  }

  return <>{children}</>
}

export default AuthGuard
