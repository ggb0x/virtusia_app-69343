import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('druxnuti_token'))

  // URL base da API - ajuste conforme necessário
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://virtusia-backend.onrender.com/api'

  useEffect(() => {
    // Verificar se há um token salvo e validá-lo
    const savedToken = localStorage.getItem('druxnuti_token')
    if (savedToken) {
      validateToken(savedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const validateToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
        setToken(token)
      } else {
        // Token inválido, remover do localStorage
        localStorage.removeItem('druxnuti_token')
        setToken(null)
      }
    } catch (error) {
      console.error('Erro ao validar token:', error)
      localStorage.removeItem('druxnuti_token')
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        const { access_token, user: userData } = data
        localStorage.setItem('druxnuti_token', access_token)
        setToken(access_token)
        setUser(userData)
        return { success: true }
      } else {
        return { success: false, message: data.message || 'Erro ao fazer login' }
      }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, message: 'Erro de conexão. Tente novamente.' }
    }
  }

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (response.ok) {
        const { access_token, user: newUser } = data
        localStorage.setItem('druxnuti_token', access_token)
        setToken(access_token)
        setUser(newUser)
        return { success: true, token: access_token }
      } else {
        return { success: false, message: data.message || 'Erro ao criar conta' }
      }
    } catch (error) {
      console.error('Erro no registro:', error)
      return { success: false, message: 'Erro de conexão. Tente novamente.' }
    }
  }

  const logout = () => {
    localStorage.removeItem('druxnuti_token')
    setToken(null)
    setUser(null)
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, message: data.message || 'Erro ao atualizar perfil' }
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      return { success: false, message: 'Erro de conexão. Tente novamente.' }
    }
  }

  // Função auxiliar para fazer requisições autenticadas
  const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (response.status === 401) {
        // Token expirado, fazer logout
        logout()
        return { success: false, message: 'Sessão expirada. Faça login novamente.' }
      }

      return {
        success: response.ok,
        data: response.ok ? data : null,
        message: response.ok ? null : data.message || 'Erro na requisição'
      }
    } catch (error) {
      console.error('Erro na requisição:', error)
      return { success: false, message: 'Erro de conexão. Tente novamente.' }
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    apiRequest
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
