import { useState, useEffect } from 'react'
import { User, Edit, Settings, LogOut, Camera, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '../../contexts/AuthContext'
import logoImage from '../../assets/logo_druxnuti.png'

const ProfileScreen = () => {
  const { user, logout, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    date_of_birth: '',
    gender: '',
    height: '',
    activity_level: '',
    current_weight: '',
    target_weight: '',
    daily_calorie_goal: '',
    dietary_restrictions: [],
    fitness_goals: []
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || '',
        height: user.height || '',
        activity_level: user.activity_level || '',
        current_weight: user.profile?.current_weight || '',
        target_weight: user.profile?.target_weight || '',
        daily_calorie_goal: user.profile?.daily_calorie_goal || '',
        dietary_restrictions: user.profile?.dietary_restrictions ? JSON.parse(user.profile.dietary_restrictions) : [],
        fitness_goals: user.profile?.fitness_goals ? JSON.parse(user.profile.fitness_goals) : []
      })
    }
  }, [user])

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    
    const updateData = {
      ...profileData,
      height: profileData.height ? parseFloat(profileData.height) : null,
      current_weight: profileData.current_weight ? parseFloat(profileData.current_weight) : null,
      target_weight: profileData.target_weight ? parseFloat(profileData.target_weight) : null,
      daily_calorie_goal: profileData.daily_calorie_goal ? parseInt(profileData.daily_calorie_goal) : null,
      dietary_restrictions: profileData.dietary_restrictions,
      fitness_goals: profileData.fitness_goals
    }

    const result = await updateProfile(updateData)
    
    if (result.success) {
      setEditing(false)
    } else {
      alert('Erro ao atualizar perfil: ' + result.message)
    }
    
    setLoading(false)
  }

  const handleCancel = () => {
    // Restaurar dados originais
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || '',
        height: user.height || '',
        activity_level: user.activity_level || '',
        current_weight: user.profile?.current_weight || '',
        target_weight: user.profile?.target_weight || '',
        daily_calorie_goal: user.profile?.daily_calorie_goal || '',
        dietary_restrictions: user.profile?.dietary_restrictions ? JSON.parse(user.profile.dietary_restrictions) : [],
        fitness_goals: user.profile?.fitness_goals ? JSON.parse(user.profile.fitness_goals) : []
      })
    }
    setEditing(false)
  }

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair?')) {
      logout()
    }
  }

  const calculateAge = (birthDate) => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const calculateBMI = () => {
    if (!profileData.current_weight || !profileData.height) return null
    const heightInMeters = profileData.height / 100
    const bmi = profileData.current_weight / (heightInMeters * heightInMeters)
    return bmi.toFixed(1)
  }

  const getBMICategory = (bmi) => {
    if (!bmi) return null
    const bmiValue = parseFloat(bmi)
    if (bmiValue < 18.5) return { label: 'Abaixo do peso', color: 'text-blue-600' }
    if (bmiValue < 25) return { label: 'Peso normal', color: 'text-green-600' }
    if (bmiValue < 30) return { label: 'Sobrepeso', color: 'text-yellow-600' }
    return { label: 'Obesidade', color: 'text-red-600' }
  }

  const getGenderLabel = (gender) => {
    switch (gender) {
      case 'male': return 'Masculino'
      case 'female': return 'Feminino'
      case 'other': return 'Outro'
      default: return 'Não informado'
    }
  }

  const getActivityLevelLabel = (level) => {
    switch (level) {
      case 'sedentary': return 'Sedentário'
      case 'lightly_active': return 'Pouco Ativo'
      case 'moderately_active': return 'Moderadamente Ativo'
      case 'very_active': return 'Muito Ativo'
      case 'extremely_active': return 'Extremamente Ativo'
      default: return 'Não informado'
    }
  }

  const bmi = calculateBMI()
  const bmiCategory = getBMICategory(bmi)
  const age = calculateAge(profileData.date_of_birth)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Perfil</h1>
            <p className="text-sm text-gray-600">Gerencie suas informações pessoais</p>
          </div>
          <div className="flex space-x-2">
            {!editing ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditing(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  size="sm"
                  className="gradient-primary text-white"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Foto e informações básicas */}
        <Card className="glass-effect shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <img 
                    src={logoImage} 
                    alt="Avatar" 
                    className="w-12 h-12 object-contain opacity-60"
                  />
                </div>
                {editing && (
                  <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {profileData.first_name} {profileData.last_name}
                </h2>
                <p className="text-gray-600">{profileData.email}</p>
                {age && (
                  <p className="text-sm text-gray-500">{age} anos</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações pessoais */}
        <Card className="glass-effect shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nome</Label>
                {editing ? (
                  <Input
                    value={profileData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="Nome"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.first_name || 'Não informado'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Sobrenome</Label>
                {editing ? (
                  <Input
                    value={profileData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Sobrenome"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.last_name || 'Não informado'}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              {editing ? (
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="seu@email.com"
                />
              ) : (
                <p className="text-gray-900">{profileData.email}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Data de Nascimento</Label>
                {editing ? (
                  <Input
                    type="date"
                    value={profileData.date_of_birth}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900">
                    {profileData.date_of_birth 
                      ? new Date(profileData.date_of_birth).toLocaleDateString('pt-BR')
                      : 'Não informado'
                    }
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Gênero</Label>
                {editing ? (
                  <Select value={profileData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-gray-900">{getGenderLabel(profileData.gender)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações físicas */}
        <Card className="glass-effect shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Informações Físicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Altura (cm)</Label>
                {editing ? (
                  <Input
                    type="number"
                    value={profileData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder="170"
                  />
                ) : (
                  <p className="text-gray-900">
                    {profileData.height ? `${profileData.height} cm` : 'Não informado'}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Peso Atual (kg)</Label>
                {editing ? (
                  <Input
                    type="number"
                    step="0.1"
                    value={profileData.current_weight}
                    onChange={(e) => handleInputChange('current_weight', e.target.value)}
                    placeholder="70.0"
                  />
                ) : (
                  <p className="text-gray-900">
                    {profileData.current_weight ? `${profileData.current_weight} kg` : 'Não informado'}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Peso Meta (kg)</Label>
                {editing ? (
                  <Input
                    type="number"
                    step="0.1"
                    value={profileData.target_weight}
                    onChange={(e) => handleInputChange('target_weight', e.target.value)}
                    placeholder="65.0"
                  />
                ) : (
                  <p className="text-gray-900">
                    {profileData.target_weight ? `${profileData.target_weight} kg` : 'Não informado'}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Nível de Atividade</Label>
                {editing ? (
                  <Select value={profileData.activity_level} onValueChange={(value) => handleInputChange('activity_level', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentário</SelectItem>
                      <SelectItem value="lightly_active">Pouco Ativo</SelectItem>
                      <SelectItem value="moderately_active">Moderadamente Ativo</SelectItem>
                      <SelectItem value="very_active">Muito Ativo</SelectItem>
                      <SelectItem value="extremely_active">Extremamente Ativo</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-gray-900">{getActivityLevelLabel(profileData.activity_level)}</p>
                )}
              </div>
            </div>

            {/* IMC */}
            {bmi && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">IMC</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">{bmi}</span>
                    {bmiCategory && (
                      <p className={`text-sm ${bmiCategory.color}`}>{bmiCategory.label}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metas nutricionais */}
        <Card className="glass-effect shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Metas Nutricionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Meta Calórica Diária</Label>
              {editing ? (
                <Input
                  type="number"
                  value={profileData.daily_calorie_goal}
                  onChange={(e) => handleInputChange('daily_calorie_goal', e.target.value)}
                  placeholder="2000"
                />
              ) : (
                <p className="text-gray-900">
                  {profileData.daily_calorie_goal ? `${profileData.daily_calorie_goal} kcal` : 'Não informado'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <Card className="glass-effect shadow-soft">
          <CardContent className="p-4 space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => alert('Configurações em desenvolvimento')}
            >
              <Settings className="w-4 h-4 mr-3" />
              Configurações
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sair da Conta
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProfileScreen

