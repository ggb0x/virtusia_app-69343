import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'

// Hook para buscar dados do dashboard
export const useDashboard = () => {
  const { apiRequest } = useAuth()
  
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const result = await apiRequest('/users/dashboard')
      if (result.success) {
        return result.data
      }
      throw new Error(result.message || 'Erro ao carregar dashboard')
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    retry: 2
  })
}

// Hook para buscar refeições
export const useMeals = (filters = {}) => {
  const { apiRequest } = useAuth()
  
  return useQuery({
    queryKey: ['meals', filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams(filters).toString()
      const url = `/meals${queryParams ? `?${queryParams}` : ''}`
      const result = await apiRequest(url)
      if (result.success) {
        return result.data
      }
      throw new Error(result.message || 'Erro ao carregar refeições')
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    enabled: true
  })
}

// Hook para criar refeição
export const useCreateMeal = () => {
  const { apiRequest } = useAuth()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (mealData) => {
      const result = await apiRequest('/meals', {
        method: 'POST',
        body: JSON.stringify(mealData)
      })
      if (result.success) {
        return result.data
      }
      throw new Error(result.message || 'Erro ao salvar refeição')
    },
    onSuccess: () => {
      // Invalidar cache das refeições e dashboard
      queryClient.invalidateQueries({ queryKey: ['meals'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      console.error('Erro ao criar refeição:', error)
    }
  })
}

// Hook para análise de refeição
export const useAnalyzeMeal = () => {
  const { apiRequest } = useAuth()
  
  return useMutation({
    mutationFn: async (imageFile) => {
      const formData = new FormData()
      formData.append('image', imageFile)
      
      const result = await apiRequest('/meals/analyze', {
        method: 'POST',
        body: formData,
        headers: {} // Remove Content-Type para FormData
      })
      
      if (result.success) {
        return result.data
      }
      throw new Error(result.message || 'Erro na análise da refeição')
    }
  })
}

// Hook para sugestões veganas
export const useVeganSuggestions = () => {
  const { apiRequest } = useAuth()
  
  return useMutation({
    mutationFn: async ({ mealAnalysis, userRequest }) => {
      const result = await apiRequest('/ai/vegan-suggestions', {
        method: 'POST',
        body: JSON.stringify({
          meal_analysis: mealAnalysis,
          user_request: userRequest
        })
      })
      
      if (result.success) {
        return result.data
      }
      throw new Error(result.message || 'Erro ao obter sugestões veganas')
    }
  })
}

// Hook para chat nutricional
export const useNutritionChat = () => {
  const { apiRequest } = useAuth()
  
  return useMutation({
    mutationFn: async ({ message, conversationHistory = [] }) => {
      const result = await apiRequest('/ai/nutrition-chat', {
        method: 'POST',
        body: JSON.stringify({
          message,
          conversation_history: conversationHistory
        })
      })
      
      if (result.success) {
        return result.data
      }
      throw new Error(result.message || 'Erro no chat nutricional')
    }
  })
}

// Hook para sugestão de dieta
export const useSuggestDiet = () => {
  const { apiRequest } = useAuth()
  
  return useMutation({
    mutationFn: async (userData) => {
      const result = await apiRequest('/ai/suggest-diet', {
        method: 'POST',
        body: JSON.stringify(userData)
      })
      
      if (result.success) {
        return result.data
      }
      throw new Error(result.message || 'Erro ao gerar sugestão de dieta')
    }
  })
}

// Hook para buscar exercícios
export const useExercises = (filters = {}) => {
  const { apiRequest } = useAuth()
  
  return useQuery({
    queryKey: ['exercises', filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams(filters).toString()
      const url = `/exercises${queryParams ? `?${queryParams}` : ''}`
      const result = await apiRequest(url)
      if (result.success) {
        return result.data
      }
      throw new Error(result.message || 'Erro ao carregar exercícios')
    },
    staleTime: 10 * 60 * 1000, // 10 minutos (exercícios mudam pouco)
  })
}

// Hook para registrar exercício
export const useCreateExercise = () => {
  const { apiRequest } = useAuth()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (exerciseData) => {
      const result = await apiRequest('/exercises', {
        method: 'POST',
        body: JSON.stringify(exerciseData)
      })
      if (result.success) {
        return result.data
      }
      throw new Error(result.message || 'Erro ao registrar exercício')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

// Hook para buscar metas
export const useGoals = () => {
  const { apiRequest } = useAuth()
  
  return useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const result = await apiRequest('/goals')
      if (result.success) {
        return result.data
      }
      throw new Error(result.message || 'Erro ao carregar metas')
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para criar meta
export const useCreateGoal = () => {
  const { apiRequest } = useAuth()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (goalData) => {
      const result = await apiRequest('/goals', {
        method: 'POST',
        body: JSON.stringify(goalData)
      })
      if (result.success) {
        return result.data
      }
      throw new Error(result.message || 'Erro ao criar meta')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

// Hook para atualizar progresso da meta
export const useUpdateGoalProgress = () => {
  const { apiRequest } = useAuth()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ goalId, progress }) => {
      const result = await apiRequest(`/goals/${goalId}/progress`, {
        method: 'PUT',
        body: JSON.stringify({ progress })
      })
      if (result.success) {
        return result.data
      }
      throw new Error(result.message || 'Erro ao atualizar progresso')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

// Hook para buscar perfil do usuário
export const useUserProfile = () => {
  const { apiRequest } = useAuth()
  
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const result = await apiRequest('/users/profile')
      if (result.success) {
        return result.data
      }
      throw new Error(result.message || 'Erro ao carregar perfil')
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

// Hook para atualizar perfil
export const useUpdateProfile = () => {
  const { apiRequest } = useAuth()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (profileData) => {
      const result = await apiRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      })
      if (result.success) {
        return result.data
      }
      throw new Error(result.message || 'Erro ao atualizar perfil')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

// Hook para registrar token de notificação
export const useRegisterNotificationToken = () => {
  const { apiRequest } = useAuth()
  
  return useMutation({
    mutationFn: async ({ fcmToken, deviceType = 'web' }) => {
      const result = await apiRequest('/ai/notifications/register', {
        method: 'POST',
        body: JSON.stringify({
          fcm_token: fcmToken,
          device_type: deviceType
        })
      })
      
      if (result.success) {
        return result.data
      }
      throw new Error(result.message || 'Erro ao registrar token de notificação')
    }
  })
}

// Hook para enviar notificação
export const useSendNotification = () => {
  const { apiRequest } = useAuth()
  
  return useMutation({
    mutationFn: async ({ title, body, type, data = {} }) => {
      const result = await apiRequest('/ai/notifications/send', {
        method: 'POST',
        body: JSON.stringify({
          title,
          body,
          type,
          data
        })
      })
      
      if (result.success) {
        return result.data
      }
      throw new Error(result.message || 'Erro ao enviar notificação')
    }
  })
}

