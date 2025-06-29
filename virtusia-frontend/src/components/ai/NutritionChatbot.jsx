import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, X, MessageCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '../../contexts/AuthContext'

const NutritionChatbot = ({ isOpen, onClose }) => {
  const { apiRequest } = useAuth()
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Olá! Sou a IA nutricional do Virtusia. Como posso ajudá-lo hoje? Posso responder dúvidas sobre nutrição, dietas, alimentos e muito mais!',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const simulateAIResponse = (userMessage) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const responses = {
          'proteína': 'As proteínas são macronutrientes essenciais para a construção e reparação dos tecidos. Recomendo consumir cerca de 0,8-1,2g por kg de peso corporal diariamente. Boas fontes incluem carnes magras, peixes, ovos, leguminosas, quinoa e tofu.',
          'carboidrato': 'Os carboidratos são a principal fonte de energia do corpo. Prefira carboidratos complexos como aveia, arroz integral, batata-doce e quinoa. Eles fornecem energia sustentada e são ricos em fibras.',
          'gordura': 'As gorduras saudáveis são importantes para a absorção de vitaminas e produção hormonal. Inclua fontes como abacate, azeite, nozes, sementes e peixes gordurosos como salmão.',
          'vitamina': 'As vitaminas são micronutrientes essenciais. Uma dieta variada com frutas, vegetais, grãos integrais e proteínas magras geralmente fornece todas as vitaminas necessárias. Considere suplementação apenas com orientação profissional.',
          'água': 'A hidratação é fundamental! Recomendo cerca de 35ml por kg de peso corporal diariamente. A água ajuda na digestão, transporte de nutrientes e regulação da temperatura corporal.',
          'dieta': 'Uma dieta equilibrada deve incluir todos os grupos alimentares: frutas, vegetais, grãos integrais, proteínas magras e gorduras saudáveis. O importante é a variedade e moderação.',
          'peso': 'Para perda de peso saudável, crie um déficit calórico moderado (300-500 kcal/dia) através de dieta equilibrada e exercícios. Evite dietas restritivas extremas.',
          'exercício': 'Combine exercícios aeróbicos com treinamento de força. A nutrição pré-treino deve incluir carboidratos para energia, e pós-treino, proteínas para recuperação muscular.',
          'default': 'Essa é uma excelente pergunta sobre nutrição! Para uma resposta mais específica e personalizada, recomendo consultar um nutricionista. Posso ajudar com informações gerais sobre alimentação saudável, macronutrientes e dicas de bem-estar.'
        }

        const lowerMessage = userMessage.toLowerCase()
        let response = responses.default

        for (const [key, value] of Object.entries(responses)) {
          if (lowerMessage.includes(key) && key !== 'default') {
            response = value
            break
          }
        }

        resolve(response)
      }, 1500 + Math.random() * 1000) // Simula tempo de resposta variável
    })
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      // Em um aplicativo real, você enviaria para o backend com integração Gemini/Manus IA
      // const result = await apiRequest('/ai/nutrition-chat', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     message: userMessage.content,
      //     conversation_history: messages
      //   })
      // })

      // Para demonstração, usamos resposta simulada
      const aiResponse = await simulateAIResponse(userMessage.content)

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: aiResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const quickQuestions = [
    'Como calcular minha necessidade calórica?',
    'Quais são os melhores alimentos para ganhar massa muscular?',
    'Como fazer uma dieta vegana equilibrada?',
    'Qual a importância da hidratação?'
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-4">
      <Card className="w-full max-w-md h-[80vh] glass-card shadow-strong animate-slide-up">
        <CardHeader className="pb-3 border-b border-moss/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <div className="w-8 h-8 mr-3 rounded-full gradient-secondary flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              IA Nutricional
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Tire suas dúvidas sobre nutrição e alimentação
          </p>
        </CardHeader>

        <CardContent className="p-0 flex flex-col h-full">
          {/* Área de mensagens */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'gradient-primary text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === 'bot' && (
                        <Bot className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      )}
                      {message.type === 'user' && (
                        <User className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.type === 'user' ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Indicador de digitação */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-blue-600" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Perguntas rápidas */}
          {messages.length === 1 && (
            <div className="p-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">Perguntas frequentes:</p>
              <div className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start h-auto p-2 text-xs border-moss/30 text-moss hover:bg-moss/5"
                    onClick={() => setInputMessage(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Campo de entrada */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta sobre nutrição..."
                className="input-glass flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="btn-secondary px-3"
              >
                {isTyping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente do botão flutuante para abrir o chatbot
export const ChatbotFloatingButton = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-24 right-6 w-14 h-14 rounded-full btn-secondary shadow-strong z-40 hover-lift"
    >
      <MessageCircle className="w-6 h-6" />
    </Button>
  )
}

export default NutritionChatbot

