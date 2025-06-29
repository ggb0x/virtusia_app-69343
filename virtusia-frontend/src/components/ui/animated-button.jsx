import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const AnimatedButton = ({ 
  children, 
  className,
  variant = 'default',
  size = 'default',
  animation = 'scale',
  disabled = false,
  loading = false,
  ...props 
}) => {
  const animations = {
    scale: {
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.95 }
    },
    lift: {
      whileHover: { y: -2 },
      whileTap: { y: 0 }
    },
    glow: {
      whileHover: { 
        boxShadow: '0 8px 25px rgba(115, 155, 82, 0.3)',
        y: -2
      },
      whileTap: { scale: 0.98 }
    },
    pulse: {
      whileHover: { scale: 1.02 },
      whileTap: { scale: 0.98 },
      animate: {
        scale: [1, 1.02, 1],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      }
    },
    bounce: {
      whileHover: { 
        y: [-2, -4, -2],
        transition: {
          duration: 0.3,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      },
      whileTap: { scale: 0.95 }
    }
  }

  const selectedAnimation = animations[animation] || animations.scale

  return (
    <motion.div
      {...selectedAnimation}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 17 
      }}
    >
      <Button
        className={cn(
          'relative overflow-hidden transition-all duration-300',
          variant === 'primary' && 'btn-primary',
          variant === 'secondary' && 'btn-secondary',
          className
        )}
        variant={variant}
        size={size}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-inherit"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            />
          </motion.div>
        )}
        
        <motion.span
          initial={{ opacity: 1 }}
          animate={{ opacity: loading ? 0 : 1 }}
          className="flex items-center justify-center"
        >
          {children}
        </motion.span>
      </Button>
    </motion.div>
  )
}

// Botão com efeito de ondulação
export const RippleButton = ({ 
  children, 
  className,
  onClick,
  ...props 
}) => {
  const [ripples, setRipples] = useState([])

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const newRipple = {
      id: Date.now(),
      x,
      y
    }
    
    setRipples(prev => [...prev, newRipple])
    
    // Remove ripple após animação
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 600)
    
    if (onClick) onClick(e)
  }

  return (
    <Button
      className={cn('relative overflow-hidden', className)}
      onClick={handleClick}
      {...props}
    >
      {children}
      
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </Button>
  )
}

// Botão com efeito de gradiente animado
export const GradientButton = ({ 
  children, 
  className,
  ...props 
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative group"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-moss via-blue-light to-moss rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
      <Button
        className={cn(
          'relative bg-white text-gray-900 hover:bg-gray-50',
          className
        )}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  )
}

// Botão com ícone animado
export const IconButton = ({ 
  icon: Icon, 
  children, 
  className,
  iconAnimation = 'rotate',
  ...props 
}) => {
  const iconAnimations = {
    rotate: {
      whileHover: { rotate: 360 },
      transition: { duration: 0.3 }
    },
    bounce: {
      whileHover: { 
        y: [-2, -4, -2],
        transition: {
          duration: 0.3,
          repeat: Infinity
        }
      }
    },
    scale: {
      whileHover: { scale: 1.2 },
      transition: { duration: 0.2 }
    },
    shake: {
      whileHover: {
        x: [-2, 2, -2, 2, 0],
        transition: { duration: 0.4 }
      }
    }
  }

  return (
    <AnimatedButton className={className} {...props}>
      <div className="flex items-center space-x-2">
        <motion.div {...iconAnimations[iconAnimation]}>
          <Icon className="w-4 h-4" />
        </motion.div>
        {children && <span>{children}</span>}
      </div>
    </AnimatedButton>
  )
}

// Botão flutuante com animação
export const FloatingButton = ({ 
  children, 
  className,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      whileHover={{ 
        scale: 1.1,
        y: -2,
        boxShadow: '0 8px 25px rgba(115, 155, 82, 0.3)'
      }}
      whileTap={{ scale: 0.9 }}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 17 
      }}
    >
      <Button
        className={cn(
          'rounded-full shadow-strong btn-primary',
          className
        )}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  )
}

export default AnimatedButton

