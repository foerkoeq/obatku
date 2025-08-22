import React from 'react'
import { Metadata } from 'next'
import { LoginForm } from '@/components/auth'

export const metadata: Metadata = {
  title: 'Login - ObatKu',
  description: 'Sign in to your ObatKu account to access the pharmacy management system.',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ObatKu</h1>
          <p className="text-gray-600">Pharmacy Management System</p>
        </div>
        
        {/* Login Form */}
        <LoginForm />
        
        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>&copy; 2024 ObatKu. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
