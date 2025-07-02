import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '../../contexts/AuthContext'
import logoImage from '../../assets/logo_druxnuti.png'

const LoginScreen = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
    useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard') // vai pro dashboard só quando o user estiver carregado!
    }
  }, [loading, user, navigate])
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpar erro quando usuário começar a digitar
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validações básicas
    if (!formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos')
      setLoading(false)
      return
    }

    if (!formData.email.includes('@')) {
      setError('Por favor, insira um email válido')
      setLoading(false)
      return
    }

    const result = await login(formData.email, formData.password)
    
    if (result.success && result.token) {
      setTimeout(() => {
    navigate('/dashboard')
  }, 100) // espera o contexto processar o token
  console.log('Token recebido:', result.token)
  navigate('/dashboard') // ou para onde quiser levar o usuário logado
} else {
  setError(result.message || 'Erro ao fazer login')
}
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="animate-fade-in">
        {/* Logo e título */}
        <div className="text-center mb-8">
          <div className="mx-auto w-24 h-24 mb-6 rounded-full bg-white shadow-soft flex items-center justify-center">
            <img 
              src={logoImage} 
              alt="DruxNuti Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo ao DruxNuti
          </h1>
          <p className="text-gray-600">
            Sua jornada para uma vida mais saudável
          </p>
        </div>

        {/* Formulário de login */}
        <div className="glass-effect rounded-2xl p-6 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className="pl-10 h-12 border-gray-200 focus:border-primary focus:ring-primary"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Campo de senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Sua senha"
                  className="pl-10 pr-10 h-12 border-gray-200 focus:border-primary focus:ring-primary"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-slide-up">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Botão de login */}
            <Button
              type="submit"
              className="w-full h-12 gradient-primary text-white font-semibold rounded-xl shadow-soft hover:shadow-lg transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </Button>

            {/* Link para esqueci a senha */}
            <div className="text-center">
              <button
                type="button"
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                disabled={loading}
              >
                Esqueci minha senha
              </button>
            </div>
          </form>
        </div>

        {/* Link para registro */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Não tem uma conta?{' '}
            <Link 
              to="/register" 
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Criar conta
            </Link>
          </p>
        </div>

        {/* Versão demo */}
        <div className="text-center mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-700 text-sm font-medium mb-2">
            🚀 Versão Demo
          </p>
          <p className="text-blue-600 text-xs">
            Use qualquer email e senha para testar o aplicativo
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen

