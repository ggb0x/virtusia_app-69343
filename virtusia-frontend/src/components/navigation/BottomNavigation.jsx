import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Camera, Dumbbell, Target, User } from 'lucide-react'

const BottomNavigation = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    {
      id: 'dashboard',
      label: 'Início',
      icon: Home,
      path: '/dashboard'
    },
    {
      id: 'meals',
      label: 'Refeições',
      icon: Camera,
      path: '/meals'
    },
    {
      id: 'exercises',
      label: 'Exercícios',
      icon: Dumbbell,
      path: '/exercises'
    },
    {
      id: 'goals',
      label: 'Metas',
      icon: Target,
      path: '/goals'
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: User,
      path: '/profile'
    }
  ]

  const handleNavigation = (path) => {
    navigate(path)
  }

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bottom-nav">
      <div className="flex justify-around items-center py-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-gray-500 hover:text-primary hover:bg-primary/5'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default BottomNavigation

