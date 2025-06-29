import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const LoadingSpinner = ({ 
  size = 'md', 
  className,
  text,
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const variants = {
    default: 'text-moss',
    secondary: 'text-blue-light',
    white: 'text-white',
    muted: 'text-gray-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn('flex flex-col items-center justify-center space-y-2', className)}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      >
        <Loader2 className={cn(sizeClasses[size], variants[variant])} />
      </motion.div>
      
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-gray-600"
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  )
}

// Componente de loading para tela inteira
export const FullScreenLoader = ({ text = 'Carregando...' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-soft flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            <Loader2 className="w-8 h-8 text-white" />
          </motion.div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Virtusia
        </h3>
        <p className="text-sm text-gray-600">{text}</p>
      </motion.div>
    </motion.div>
  )
}

// Componente de loading para cards
export const CardLoader = ({ className }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('glass-card shadow-soft p-6', className)}
    >
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    </motion.div>
  )
}

// Componente de loading para listas
export const ListLoader = ({ items = 3, className }) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card shadow-soft p-4"
        >
          <div className="animate-pulse flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="w-16 h-8 bg-gray-200 rounded"></div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default LoadingSpinner

