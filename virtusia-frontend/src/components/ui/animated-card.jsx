import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const AnimatedCard = ({ 
  children, 
  className,
  delay = 0,
  direction = 'up',
  hover = true,
  ...props 
}) => {
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    scale: { scale: 0.95 }
  }

  const hoverEffects = {
    scale: { scale: 1.02 },
    lift: { y: -4 },
    glow: { boxShadow: '0 8px 30px rgba(115, 155, 82, 0.15)' }
  }

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        ...directions[direction] 
      }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        x: 0, 
        scale: 1 
      }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: 'easeOut'
      }}
      whileHover={hover ? hoverEffects.lift : undefined}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={cn(
          'glass-card shadow-soft transition-all duration-300',
          hover && 'hover:shadow-medium cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  )
}

// Variante com animação de entrada em sequência
export const AnimatedCardGrid = ({ 
  children, 
  className,
  stagger = 0.1,
  direction = 'up'
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: stagger
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Card item para usar dentro do AnimatedCardGrid
export const AnimatedCardItem = ({ 
  children, 
  className,
  direction = 'up',
  hover = true,
  ...props 
}) => {
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    scale: { scale: 0.95 }
  }

  return (
    <motion.div
      variants={{
        hidden: { 
          opacity: 0, 
          ...directions[direction] 
        },
        visible: { 
          opacity: 1, 
          y: 0, 
          x: 0, 
          scale: 1,
          transition: {
            duration: 0.5,
            ease: 'easeOut'
          }
        }
      }}
      whileHover={hover ? { y: -4 } : undefined}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={cn(
          'glass-card shadow-soft transition-all duration-300',
          hover && 'hover:shadow-medium cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  )
}

// Card com animação de flip
export const FlipCard = ({ 
  front, 
  back, 
  className,
  trigger = 'hover' // 'hover' ou 'click'
}) => {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleInteraction = () => {
    if (trigger === 'click') {
      setIsFlipped(!isFlipped)
    }
  }

  const hoverProps = trigger === 'hover' ? {
    onMouseEnter: () => setIsFlipped(true),
    onMouseLeave: () => setIsFlipped(false)
  } : {}

  return (
    <div 
      className={cn('relative w-full h-full perspective-1000', className)}
      onClick={handleInteraction}
      {...hoverProps}
    >
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Frente */}
        <div className="absolute inset-0 backface-hidden">
          <Card className="glass-card shadow-soft w-full h-full">
            {front}
          </Card>
        </div>
        
        {/* Verso */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <Card className="glass-card shadow-soft w-full h-full">
            {back}
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

// Card com animação de reveal
export const RevealCard = ({ 
  children, 
  className,
  delay = 0,
  threshold = 0.1 
}) => {
  const [ref, inView] = useInView({
    threshold,
    triggerOnce: true
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={inView ? { 
        opacity: 1, 
        y: 0, 
        scale: 1 
      } : {}}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: 'easeOut'
      }}
    >
      <Card className={cn('glass-card shadow-soft', className)}>
        {children}
      </Card>
    </motion.div>
  )
}

export default AnimatedCard

