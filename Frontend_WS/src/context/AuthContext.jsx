import { createContext, useState, useEffect } from 'react'
import api from '../api/client'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Recuperar sesión previa
    const storedUser = localStorage.getItem('user')
    if (storedUser) setUser(JSON.parse(storedUser))
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login/', { email, password })
      const { user, cognito_tokens } = res.data

      // Guardar token y usuario en localStorage
      localStorage.setItem('access_token', cognito_tokens.access_token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)

      return { success: true, user }
    } catch (err) {
      console.error('Error en login:', err.response?.data || err)
      return { success: false, message: err.response?.data?.detail || 'Error de autenticación' }
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value = { user, login, logout, loading }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}