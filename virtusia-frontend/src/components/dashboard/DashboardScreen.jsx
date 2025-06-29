import { useState, useEffect } from 'react'
import { Bell, Plus, TrendingUp, Calendar, Award, Droplets } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '../../contexts/AuthContext'

const DashboardScreen = () => {
  const { user, apiRequest } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    const result = await apiRequest('/users/dashboard')
    
    if (result.success) {
      setDashboardData(result.data)
    } else {
      // Dados simulados para demonstração
      setDashboardData({
        user: { name: user?.first_name || 'Usuário' },
        daily_progress: {
          calories: { consumed: 1450, goal: 2000, percentage: 72.5 },
          meals_logged: 3,
          water_intake: 1.5,
          steps: 8500
        },
        recent_meals: [
          {
            id: 1,
            meal_type: 'breakfast',
            total_calories: 350,
            health_score: 85,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            meal_type: 'lunch',
            total_calories: 650,
            health_score: 78,
            created_at: new Date().toISOString()
          }
        ],
        upcoming_exercises: [
          { name: 'Treino de Força', scheduled_time: '18:00', duration: 45, type: 'strength' },
          { name: 'Caminhada', scheduled_time: '07:00', duration: 30, type: 'cardio' }
        ],
        active_goals: [
          { id: 1, title: 'Perder 5kg', current_value: 2.5, target_value: 5, unit: 'kg' }
        ],
        motivational_message: 'Ótimo progresso! Continue assim para atingir sua meta! 💪'
      })
    }
    
    setLoading(false)
  }

  const formatMealType = (type) => {
    const types = {
      breakfast: 'Café da manhã',
      lunch: 'Almoço',
      dinner: 'Jantar',
      snack: 'Lanche'
    }
    return types[type] || type
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
            <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {getGreeting()}, {dashboardData?.user?.name}!
            </h1>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="p-2">
              <Bell className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Mensagem motivacional */}
        {dashboardData?.motivational_message && (
          <Card className="glass-effect border-primary/20 shadow-soft">
            <CardContent className="p-4">
              <p className="text-center text-primary font-medium">
                {dashboardData.motivational_message}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Progresso diário */}
        <Card className="glass-effect shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Progresso de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Calorias */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Calorias</span>
                <span className="text-sm text-gray-600">
                  {dashboardData?.daily_progress?.calories?.consumed || 0} / {dashboardData?.daily_progress?.calories?.goal || 2000} kcal
                </span>
              </div>
              <Progress 
                value={dashboardData?.daily_progress?.calories?.percentage || 0} 
                className="h-2"
              />
            </div>

            {/* Estatísticas rápidas */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-xs text-gray-600">Água</p>
                <p className="text-sm font-semibold">{dashboardData?.daily_progress?.water_intake || 0}L</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-xs text-gray-600">Refeições</p>
                <p className="text-sm font-semibold">{dashboardData?.daily_progress?.meals_logged || 0}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-orange-100 flex items-center justify-center">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-xs text-gray-600">Passos</p>
                <p className="text-sm font-semibold">{dashboardData?.daily_progress?.steps?.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações rápidas */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            className="h-20 gradient-primary text-white rounded-xl shadow-soft hover:shadow-lg transition-all duration-200"
            onClick={() => window.location.href = '/meals'}
          >
            <div className="text-center">
              <Plus className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm font-medium">Registrar Refeição</span>
            </div>
          </Button>
          <Button 
            variant="outline"
            className="h-20 border-primary text-primary rounded-xl shadow-soft hover:bg-primary/5 transition-all duration-200"
            onClick={() => window.location.href = '/exercises'}
          >
            <div className="text-center">
              <Dumbbell className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm font-medium">Iniciar Treino</span>
            </div>
          </Button>
        </div>

        {/* Refeições recentes */}
        {dashboardData?.recent_meals?.length > 0 && (
          <Card className="glass-effect shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Refeições Recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardData.recent_meals.slice(0, 3).map((meal) => (
                <div key={meal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{formatMealType(meal.meal_type)}</p>
                    <p className="text-sm text-gray-600">{meal.total_calories} kcal</p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      meal.health_score >= 80 
                        ? 'bg-green-100 text-green-800' 
                        : meal.health_score >= 60 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {meal.health_score}/100
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Próximos exercícios */}
        {dashboardData?.upcoming_exercises?.length > 0 && (
          <Card className="glass-effect shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Próximos Exercícios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardData.upcoming_exercises.slice(0, 2).map((exercise, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{exercise.name}</p>
                    <p className="text-sm text-gray-600">{exercise.duration} min</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">{exercise.scheduled_time}</p>
                    <p className="text-xs text-gray-500 capitalize">{exercise.type}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Metas ativas */}
        {dashboardData?.active_goals?.length > 0 && (
          <Card className="glass-effect shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Metas Ativas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardData.active_goals.slice(0, 2).map((goal) => {
                const progress = (goal.current_value / goal.target_value) * 100
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{goal.title}</span>
                      <span className="text-sm text-gray-600">
                        {goal.current_value} / {goal.target_value} {goal.unit}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default DashboardScreen

