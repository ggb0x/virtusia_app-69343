import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '../../contexts/AuthContext'
import logoImage from '../../assets/logo_druxnuti.png'

const RegisterScreen = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    date_of_birth: '',
    gender: '',
    height: '',
    activity_level: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register } = useAuth()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpar erro quando usuário começar a digitar
    if (error) setError('')
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const validateForm = () => {
    if (!formData.first_name || !formData.last_name) {
      return 'Por favor, preencha seu nome completo'
    }
    if (!formData.email || !formData.email.includes('@')) {
      return 'Por favor, insira um email válido'
    }
    if (!formData.password || formData.password.length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres'
    }
    if (formData.password !== formData.confirmPassword) {
      return 'As senhas não coincidem'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    // Preparar dados para envio
    const userData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password,
      date_of_birth: formData.date_of_birth || null,
      gender: formData.gender || null,
      height: formData.height ? parseFloat(formData.height) : null,
      activity_level: formData.activity_level || null
    }

    const result = await register(userData)
    
    if (!result.success) {
      setError(result.message)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-8 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="animate-fade-in">
        {/* Logo e título */}
        <div className="text-center mb-6">
          <div className="mx-auto w-20 h-20 mb-4 rounded-full bg-white shadow-soft flex items-center justify-center">
            <img 
              src={logoImage} 
              alt="DruxNuti Logo" 
              className="w-12 h-12 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Criar Conta
          </h1>
          <p className="text-gray-600 text-sm">
            Comece sua jornada saudável hoje
          </p>
        </div>

        {/* Formulário de registro */}
        <div className="glass-effect rounded-2xl p-6 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">
                  Nome
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="João"
                    className="pl-9 h-10 text-sm border-gray-200 focus:border-primary focus:ring-primary"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">
                  Sobrenome
                </Label>
                <Input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Silva"
                  className="h-10 text-sm border-gray-200 focus:border-primary focus:ring-primary"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className="pl-9 h-10 text-sm border-gray-200 focus:border-primary focus:ring-primary"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Senhas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Mín. 6 caracteres"
                    className="pl-9 pr-8 h-10 text-sm border-gray-200 focus:border-primary focus:ring-primary"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirmar
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Repetir senha"
                    className="pl-9 pr-8 h-10 text-sm border-gray-200 focus:border-primary focus:ring-primary"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Informações opcionais */}
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Informações opcionais (para personalizar suas recomendações)
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="date_of_birth" className="text-xs font-medium text-gray-600">
                    Data de Nascimento
                  </Label>
                  <Input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    className="h-9 text-sm border-gray-200 focus:border-primary focus:ring-primary"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-600">
                    Gênero
                  </Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value) => handleSelectChange('gender', value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="h-9 text-sm border-gray-200 focus:border-primary focus:ring-primary">
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="height" className="text-xs font-medium text-gray-600">
                    Altura (cm)
                  </Label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    value={formData.height}
                    onChange={handleInputChange}
                    placeholder="170"
                    className="h-9 text-sm border-gray-200 focus:border-primary focus:ring-primary"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-600">
                    Nível de Atividade
                  </Label>
                  <Select 
                    value={formData.activity_level} 
                    onValueChange={(value) => handleSelectChange('activity_level', value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="h-9 text-sm border-gray-200 focus:border-primary focus:ring-primary">
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
                </div>
              </div>
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-slide-up">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Botão de registro */}
            <Button
              type="submit"
              className="w-full h-11 gradient-primary text-white font-semibold rounded-xl shadow-soft hover:shadow-lg transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Criando conta...
                </div>
              ) : (
                'Criar Conta'
              )}
            </Button>
          </form>
        </div>

        {/* Link para login */}
        <div className="text-center mt-4">
          <p className="text-gray-600 text-sm">
            Já tem uma conta?{' '}
            <Link 
              to="/login" 
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterScreen

