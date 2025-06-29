import { useState, useEffect } from 'react'
import { Plus, Target, TrendingUp, Calendar, Award, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '../../contexts/AuthContext'

const GoalsScreen = () => {
  const { apiRequest } = useAuth()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newGoal, setNewGoal] = useState({
    goal_type: '',
    title: '',
    description: '',
    target_value: '',
    current_value: '',
    unit: '',
    target_date: ''
  })

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    setLoading(true)
    const result = await apiRequest('/goals')
    
    if (result.success) {
      setGoals(result.data.goals || [])
    } else {
      // Dados simulados para demonstração
      setGoals([
        {
          id: 1,
          goal_type: 'weight_loss',
          title: 'Perder 5kg',
          description: 'Atingir meu peso ideal para me sentir mais saudável',
          target_value: 5,
          current_value: 2.5,
          unit: 'kg',
          target_date: '2024-12-31',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          goal_type: 'exercise_frequency',
          title: 'Exercitar 4x por semana',
          description: 'Manter consistência nos treinos',
          target_value: 4,
          current_value: 3,
          unit: 'vezes/semana',
          target_date: null,
          status: 'active',
          created_at: '2024-01-15T00:00:00Z'
        },
        {
          id: 3,
          goal_type: 'muscle_gain',
          title: 'Ganhar 3kg de massa muscular',
          description: 'Aumentar força e definição muscular',
          target_value: 3,
          current_value: 1.2,
          unit: 'kg',
          target_date: '2024-06-30',
          status: 'active',
          created_at: '2024-02-01T00:00:00Z'
        }
      ])
    }
    setLoading(false)
  }

  const createGoal = async () => {
    try {
      const goalData = {
        ...newGoal,
        target_value: parseFloat(newGoal.target_value),
        current_value: parseFloat(newGoal.current_value) || 0
      }

      const result = await apiRequest('/goals', {
        method: 'POST',
        body: JSON.stringify(goalData)
      })

      if (result.success) {
        setGoals([...goals, result.data.goal])
        setShowCreateDialog(false)
        resetNewGoal()
      } else {
        // Simulação para demonstração
        const simulatedGoal = {
          id: Date.now(),
          ...goalData,
          status: 'active',
          created_at: new Date().toISOString()
        }
        setGoals([...goals, simulatedGoal])
        setShowCreateDialog(false)
        resetNewGoal()
      }
    } catch (error) {
      console.error('Erro ao criar meta:', error)
    }
  }

  const resetNewGoal = () => {
    setNewGoal({
      goal_type: '',
      title: '',
      description: '',
      target_value: '',
      current_value: '',
      unit: '',
      target_date: ''
    })
  }

  const calculateProgress = (goal) => {
    if (!goal.target_value || goal.target_value === 0) return 0
    return Math.min((goal.current_value / goal.target_value) * 100, 100)
  }

  const getGoalTypeLabel = (type) => {
    const types = {
      weight_loss: 'Perda de Peso',
      weight_gain: 'Ganho de Peso',
      muscle_gain: 'Ganho de Massa',
      exercise_frequency: 'Frequência de Exercícios',
      calorie_goal: 'Meta Calórica',
      water_intake: 'Consumo de Água',
      sleep_quality: 'Qualidade do Sono'
    }
    return types[type] || type
  }

  const getGoalTypeIcon = (type) => {
    switch (type) {
      case 'weight_loss':
      case 'weight_gain':
        return '⚖️'
      case 'muscle_gain':
        return '💪'
      case 'exercise_frequency':
        return '🏃‍♀️'
      case 'calorie_goal':
        return '🔥'
      case 'water_intake':
        return '💧'
      case 'sleep_quality':
        return '😴'
      default:
        return '🎯'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Ativa'
      case 'completed':
        return 'Concluída'
      case 'paused':
        return 'Pausada'
      case 'cancelled':
        return 'Cancelada'
      default:
        return status
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getDaysRemaining = (targetDate) => {
    if (!targetDate) return null
    const today = new Date()
    const target = new Date(targetDate)
    const diffTime = target - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
            <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Carregando metas...</p>
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
            <h1 className="text-xl font-bold text-gray-900">Metas</h1>
            <p className="text-sm text-gray-600">Acompanhe seu progresso</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Nova Meta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Meta</Label>
                  <Select value={newGoal.goal_type} onValueChange={(value) => setNewGoal({...newGoal, goal_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight_loss">Perda de Peso</SelectItem>
                      <SelectItem value="weight_gain">Ganho de Peso</SelectItem>
                      <SelectItem value="muscle_gain">Ganho de Massa</SelectItem>
                      <SelectItem value="exercise_frequency">Frequência de Exercícios</SelectItem>
                      <SelectItem value="calorie_goal">Meta Calórica</SelectItem>
                      <SelectItem value="water_intake">Consumo de Água</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    placeholder="Ex: Perder 5kg"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    placeholder="Descreva sua meta..."
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Valor Alvo</Label>
                    <Input
                      type="number"
                      placeholder="5"
                      value={newGoal.target_value}
                      onChange={(e) => setNewGoal({...newGoal, target_value: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unidade</Label>
                    <Input
                      placeholder="kg"
                      value={newGoal.unit}
                      onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Data Alvo (opcional)</Label>
                  <Input
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    className="flex-1 gradient-primary text-white"
                    onClick={createGoal}
                    disabled={!newGoal.title || !newGoal.target_value}
                  >
                    Criar Meta
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Resumo das metas */}
        <Card className="glass-effect shadow-soft border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Resumo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">{goals.filter(g => g.status === 'active').length}</p>
                <p className="text-xs text-gray-600">Ativas</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">{goals.filter(g => g.status === 'completed').length}</p>
                <p className="text-xs text-gray-600">Concluídas</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-orange-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(goals.reduce((acc, goal) => acc + calculateProgress(goal), 0) / goals.length) || 0}%
                </p>
                <p className="text-xs text-gray-600">Progresso Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de metas */}
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = calculateProgress(goal)
            const daysRemaining = getDaysRemaining(goal.target_date)
            
            return (
              <Card key={goal.id} className="glass-effect shadow-soft hover:shadow-lg transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="text-2xl">{getGoalTypeIcon(goal.goal_type)}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{goal.title}</h3>
                        {goal.description && (
                          <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {getGoalTypeLabel(goal.goal_type)}
                        </Badge>
                      </div>
                    </div>
                    <Badge className={getStatusColor(goal.status)}>
                      {getStatusLabel(goal.status)}
                    </Badge>
                  </div>

                  {/* Progresso */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Progresso</span>
                      <span className="text-sm text-gray-600">
                        {goal.current_value} / {goal.target_value} {goal.unit}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{Math.round(progress)}% concluído</span>
                      {daysRemaining !== null && (
                        <span>
                          {daysRemaining > 0 
                            ? `${daysRemaining} dias restantes`
                            : daysRemaining === 0 
                            ? 'Hoje é o prazo!'
                            : `${Math.abs(daysRemaining)} dias em atraso`
                          }
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Informações adicionais */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Criada em {formatDate(goal.created_at)}
                      {goal.target_date && (
                        <span> • Meta: {formatDate(goal.target_date)}</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="p-2">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-2">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Mensagem quando não há metas */}
        {goals.length === 0 && (
          <Card className="glass-effect shadow-soft">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma meta criada
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Defina seus objetivos e acompanhe seu progresso
              </p>
              <Button 
                className="gradient-primary text-white"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Meta
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default GoalsScreen

