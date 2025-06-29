import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Componentes
import LoginScreen from './components/auth/LoginScreen'
import RegisterScreen from './components/auth/RegisterScreen'
import DashboardScreen from './components/dashboard/DashboardScreen'
import MealAnalysisScreen from './components/meals/MealAnalysisScreen'
import ExercisesScreen from './components/exercises/ExercisesScreen'
import GoalsScreen from './components/goals/GoalsScreen'
import ProfileScreen from './components/profile/ProfileScreen'
import BottomNavigation from './components/navigation/BottomNavigation'

// Context para gerenciamento de estado
import { AuthProvider, useAuth } from './contexts/AuthContext'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="mobile-container flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Carregando DruxNuti...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mobile-container mobile-safe-area">
      <Routes>
        {/* Rotas de autenticação */}
        <Route 
          path="/login" 
          element={!user ? <LoginScreen /> : <Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/register" 
          element={!user ? <RegisterScreen /> : <Navigate to="/dashboard" replace />} 
        />
        
        {/* Rotas protegidas */}
        <Route 
          path="/dashboard" 
          element={user ? <DashboardScreen /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/meals" 
          element={user ? <MealAnalysisScreen /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/exercises" 
          element={user ? <ExercisesScreen /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/goals" 
          element={user ? <GoalsScreen /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/profile" 
          element={user ? <ProfileScreen /> : <Navigate to="/login" replace />} 
        />
        
        {/* Rota padrão */}
        <Route 
          path="/" 
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
      
      {/* Navegação inferior - apenas para usuários autenticados */}
      {user && <BottomNavigation />}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App

