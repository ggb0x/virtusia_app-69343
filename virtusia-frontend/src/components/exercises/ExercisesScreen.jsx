import { useState, useEffect } from 'react'
import { Play, Clock, Flame, Star, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '../../contexts/AuthContext'

const ExercisesScreen = () => {
  const { apiRequest } = useAuth()
  const [exercises, setExercises] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')

  useEffect(() => {
    loadExercises()
    loadRecommendations()
  }, [])

  const loadExercises = async () => {
    setLoading(true)
    const result = await apiRequest('/exercises')
    
    if (result.success) {
      setExercises(result.data.exercises || [])
    } else {
      // Dados simulados para demonstração
      setExercises([
        {
          id: 1,
          name: 'Agachamento',
          description: 'Exercício fundamental para fortalecimento das pernas e glúteos',
          muscle_groups: ['quadríceps', 'glúteos', 'isquiotibiais'],
          difficulty_level: 'beginner',
          calories_per_minute: 8.0,
          duration_minutes: 15,
          instructions: '1. Fique em pé com os pés afastados na largura dos ombros\n2. Desça como se fosse sentar em uma cadeira\n3. Mantenha o peito ereto e os joelhos alinhados\n4. Retorne à posição inicial',
          equipment_needed: null,
          category: 'strength'
        },
        {
          id: 2,
          name: 'Flexão de Braço',
          description: 'Exercício para fortalecimento do peitoral, ombros e tríceps',
          muscle_groups: ['peitoral', 'ombros', 'tríceps'],
          difficulty_level: 'beginner',
          calories_per_minute: 7.0,
          duration_minutes: 10,
          instructions: '1. Posição de prancha com mãos no chão\n2. Desça o corpo mantendo-o reto\n3. Empurre de volta à posição inicial\n4. Mantenha o core contraído',
          equipment_needed: null,
          category: 'strength'
        },
        {
          id: 3,
          name: 'Prancha',
          description: 'Exercício isométrico para fortalecimento do core',
          muscle_groups: ['core', 'ombros', 'glúteos'],
          difficulty_level: 'beginner',
          calories_per_minute: 5.0,
          duration_minutes: 5,
          instructions: '1. Posição de prancha com antebraços no chão\n2. Mantenha o corpo reto da cabeça aos pés\n3. Contraia o abdômen\n4. Respire normalmente',
          equipment_needed: null,
          category: 'core'
        },
        {
          id: 4,
          name: 'Burpee',
          description: 'Exercício completo que trabalha todo o corpo',
          muscle_groups: ['corpo todo'],
          difficulty_level: 'intermediate',
          calories_per_minute: 12.0,
          duration_minutes: 10,
          instructions: '1. Comece em pé\n2. Agache e coloque as mãos no chão\n3. Salte os pés para trás em prancha\n4. Faça uma flexão\n5. Salte os pés de volta\n6. Salte para cima com braços estendidos',
          equipment_needed: null,
          category: 'cardio'
        },
        {
          id: 5,
          name: 'Caminhada Rápida',
          description: 'Exercício cardiovascular de baixo impacto',
          muscle_groups: ['pernas', 'core'],
          difficulty_level: 'beginner',
          calories_per_minute: 6.0,
          duration_minutes: 30,
          instructions: '1. Mantenha postura ereta\n2. Balance os braços naturalmente\n3. Mantenha ritmo constante\n4. Respire profundamente',
          equipment_needed: null,
          category: 'cardio'
        }
      ])
    }
    setLoading(false)
  }

  const loadRecommendations = async () => {
    const result = await apiRequest('/exercises/recommendations')
    
    if (result.success) {
      setRecommendations(result.data.recommendations || [])
    } else {
      // Recomendações simuladas
      setRecommendations([
        {
          id: 1,
          title: 'Treino Iniciante - Força',
          description: 'Perfeito para quem está começando',
          exercises: [1, 2, 3],
          total_duration: 30,
          total_calories: 180,
          difficulty: 'beginner'
        },
        {
          id: 2,
          title: 'Cardio Intenso',
          description: 'Queime calorias rapidamente',
          exercises: [4, 5],
          total_duration: 40,
          total_calories: 320,
          difficulty: 'intermediate'
        }
      ])
    }
  }

  const startExercise = async (exerciseId) => {
    try {
      const result = await apiRequest('/exercises/start', {
        method: 'POST',
        body: JSON.stringify({ exercise_id: exerciseId })
      })

      if (result.success) {
        alert('Exercício iniciado! Boa sorte!')
      } else {
        alert('Exercício iniciado! (Modo demonstração)')
      }
    } catch (error) {
      console.error('Erro ao iniciar exercício:', error)
      alert('Exercício iniciado! (Modo demonstração)')
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'Iniciante'
      case 'intermediate':
        return 'Intermediário'
      case 'advanced':
        return 'Avançado'
      default:
        return difficulty
    }
  }

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'strength':
        return 'Força'
      case 'cardio':
        return 'Cardio'
      case 'core':
        return 'Core'
      case 'flexibility':
        return 'Flexibilidade'
      default:
        return category
    }
  }

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || exercise.difficulty_level === selectedDifficulty
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
            <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Carregando exercícios...</p>
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
            <h1 className="text-xl font-bold text-gray-900">Exercícios</h1>
            <p className="text-sm text-gray-600">Encontre o treino perfeito para você</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Recomendações personalizadas */}
        {recommendations.length > 0 && (
          <Card className="glass-effect shadow-soft border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Star className="w-5 h-5 mr-2 text-primary" />
                Recomendado para Você
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.slice(0, 2).map((rec) => (
                <div key={rec.id} className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                    </div>
                    <Badge className={getDifficultyColor(rec.difficulty)}>
                      {getDifficultyLabel(rec.difficulty)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {rec.total_duration} min
                      </span>
                      <span className="flex items-center">
                        <Flame className="w-4 h-4 mr-1" />
                        {rec.total_calories} kcal
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      className="gradient-primary text-white"
                      onClick={() => alert('Treino personalizado iniciado!')}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Iniciar
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Filtros e busca */}
        <Card className="glass-effect shadow-soft">
          <CardContent className="p-4 space-y-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar exercícios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-primary focus:ring-primary"
              />
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-2 gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-gray-200 focus:border-primary focus:ring-primary">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="strength">Força</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="flexibility">Flexibilidade</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="border-gray-200 focus:border-primary focus:ring-primary">
                  <SelectValue placeholder="Dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="beginner">Iniciante</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de exercícios */}
        <div className="space-y-4">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="glass-effect shadow-soft hover:shadow-lg transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{exercise.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{exercise.description}</p>
                    
                    {/* Grupos musculares */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {JSON.parse(exercise.muscle_groups || '[]').map((muscle, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Badge className={getDifficultyColor(exercise.difficulty_level)}>
                    {getDifficultyLabel(exercise.difficulty_level)}
                  </Badge>
                </div>

                {/* Estatísticas */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {exercise.duration_minutes} min
                    </span>
                    <span className="flex items-center">
                      <Flame className="w-4 h-4 mr-1" />
                      {Math.round(exercise.calories_per_minute * exercise.duration_minutes)} kcal
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {getCategoryLabel(exercise.category)}
                    </Badge>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="gradient-primary text-white"
                    onClick={() => startExercise(exercise.id)}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Iniciar
                  </Button>
                </div>

                {/* Instruções (expandível) */}
                {exercise.instructions && (
                  <details className="mt-3">
                    <summary className="text-sm font-medium text-primary cursor-pointer hover:text-primary/80">
                      Ver instruções
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                        {exercise.instructions}
                      </pre>
                    </div>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mensagem quando não há resultados */}
        {filteredExercises.length === 0 && (
          <Card className="glass-effect shadow-soft">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum exercício encontrado
              </h3>
              <p className="text-gray-600 text-sm">
                Tente ajustar os filtros ou termo de busca
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ExercisesScreen

