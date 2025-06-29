import { useState, useRef } from 'react'
import { Camera, Upload, X, Check, AlertCircle, Zap, Apple, Wheat, MessageCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '../../contexts/AuthContext'

const MealAnalysisScreen = () => {
  const { apiRequest } = useAuth()
  const [selectedImage, setSelectedImage] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const [veganRequest, setVeganRequest] = useState('')
  const [veganSuggestions, setVeganSuggestions] = useState(null)
  const [loadingVeganSuggestions, setLoadingVeganSuggestions] = useState(false)
  const fileInputRef = useRef(null)

  const handleImageSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage({
          file,
          preview: e.target.result
        })
        setAnalysisResult(null)
        setVeganSuggestions(null)
        setVeganRequest('')
      }
      reader.readAsDataURL(file)
    }
  }

  const simulateAnalysis = () => {
    // Simulação da análise de IA
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          meal_type: 'lunch',
          total_calories: 650,
          health_score: 78,
          confidence: 0.92,
          detected_foods: [
            {
              name: 'Arroz integral',
              calories: 180,
              carbs: 35,
              protein: 4,
              fat: 2,
              portion: '1 xícara'
            },
            {
              name: 'Frango grelhado',
              calories: 280,
              carbs: 0,
              protein: 52,
              fat: 6,
              portion: '150g'
            },
            {
              name: 'Brócolis',
              calories: 35,
              carbs: 7,
              protein: 3,
              fat: 0,
              portion: '100g'
            },
            {
              name: 'Feijão preto',
              calories: 155,
              carbs: 28,
              protein: 10,
              fat: 1,
              portion: '1/2 xícara'
            }
          ],
          nutritional_analysis: {
            total_carbs: 70,
            total_protein: 69,
            total_fat: 9,
            fiber: 12,
            sodium: 450
          },
          recommendations: [
            'Excelente fonte de proteína magra!',
            'Boa quantidade de fibras dos vegetais.',
            'Considere adicionar uma fonte de gordura saudável como abacate.',
            'Refeição bem balanceada para o almoço.'
          ],
          health_insights: {
            positive: ['Alto teor de proteína', 'Rica em fibras', 'Baixo em gordura saturada'],
            improvements: ['Adicionar mais vegetais coloridos', 'Incluir gorduras saudáveis']
          }
        })
      }, 3000)
    })
  }

  const simulateVeganSuggestions = (request) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          original_request: request,
          suggestions: [
            {
              food_to_replace: 'Frango grelhado',
              vegan_alternatives: [
                {
                  name: 'Tofu grelhado temperado',
                  calories: 180,
                  protein: 20,
                  description: 'Tofu firme marinado com shoyu, alho e gengibre, grelhado até dourar'
                },
                {
                  name: 'Tempeh refogado',
                  calories: 190,
                  protein: 19,
                  description: 'Tempeh fatiado e refogado com cebola e pimentão'
                },
                {
                  name: 'Seitan ao molho de ervas',
                  calories: 200,
                  protein: 25,
                  description: 'Seitan grelhado com molho de ervas frescas'
                }
              ]
            }
          ],
          nutritional_comparison: {
            original_calories: 650,
            vegan_calories: 570,
            original_protein: 69,
            vegan_protein: 57,
            benefits: [
              'Menor impacto ambiental',
              'Rico em fibras',
              'Livre de colesterol',
              'Fonte de fitoquímicos antioxidantes'
            ]
          },
          preparation_tips: [
            'Marine o tofu por pelo menos 30 minutos para melhor sabor',
            'Use temperos como nutritional yeast para sabor umami',
            'Adicione sementes de girassol para textura crocante'
          ]
        })
      }, 2000)
    })
  }

  const analyzeImage = async () => {
    if (!selectedImage) return

    setAnalyzing(true)
    
    try {
      // Em um aplicativo real, você enviaria a imagem para o backend
      // const formData = new FormData()
      // formData.append('image', selectedImage.file)
      // const result = await apiRequest('/meals/analyze', {
      //   method: 'POST',
      //   body: formData,
      //   headers: {} // Remove Content-Type para FormData
      // })

      // Para demonstração, usamos análise simulada
      const result = await simulateAnalysis()
      setAnalysisResult(result)
    } catch (error) {
      console.error('Erro na análise:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const getVeganSuggestions = async () => {
    if (!veganRequest.trim() || !analysisResult) return

    setLoadingVeganSuggestions(true)
    
    try {
      // Em um aplicativo real, você enviaria para o backend com integração ChatGPT
      // const result = await apiRequest('/meals/vegan-suggestions', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     meal_analysis: analysisResult,
      //     user_request: veganRequest
      //   })
      // })

      // Para demonstração, usamos sugestões simuladas
      const result = await simulateVeganSuggestions(veganRequest)
      setVeganSuggestions(result)
    } catch (error) {
      console.error('Erro ao obter sugestões veganas:', error)
    } finally {
      setLoadingVeganSuggestions(false)
    }
  }

  const saveAnalysis = async () => {
    if (!analysisResult) return

    try {
      const mealData = {
        meal_type: analysisResult.meal_type,
        total_calories: analysisResult.total_calories,
        health_score: analysisResult.health_score,
        detected_foods: analysisResult.detected_foods,
        nutritional_analysis: analysisResult.nutritional_analysis,
        vegan_suggestions: veganSuggestions
      }

      const result = await apiRequest('/meals', {
        method: 'POST',
        body: JSON.stringify(mealData)
      })

      if (result.success) {
        // Resetar estado e mostrar sucesso
        setSelectedImage(null)
        setAnalysisResult(null)
        setVeganSuggestions(null)
        setVeganRequest('')
        alert('Refeição salva com sucesso!')
      } else {
        alert('Erro ao salvar refeição: ' + result.message)
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar refeição')
    }
  }

  const resetAnalysis = () => {
    setSelectedImage(null)
    setAnalysisResult(null)
    setAnalyzing(false)
    setVeganSuggestions(null)
    setVeganRequest('')
  }

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="min-h-screen bg-gradient-soft pb-20">
      {/* Header */}
      <div className="glass-effect border-b border-moss/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Análise de Refeição</h1>
            <p className="text-sm text-gray-600">Tire uma foto e descubra os nutrientes</p>
          </div>
          {(selectedImage || analysisResult) && (
            <Button variant="ghost" size="sm" onClick={resetAnalysis}>
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Captura de imagem */}
        {!selectedImage && !analysisResult && (
          <Card className="glass-card shadow-soft hover-lift">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full gradient-primary flex items-center justify-center">
                  <Camera className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Registrar Refeição
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Tire uma foto da sua refeição para análise nutricional automática
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full btn-primary rounded-xl h-12"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Tirar Foto
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full border-moss text-moss rounded-xl h-12 hover:bg-moss/5"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Escolher da Galeria
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Imagem selecionada */}
        {selectedImage && !analysisResult && (
          <Card className="glass-card shadow-soft">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="relative">
                  <img 
                    src={selectedImage.preview} 
                    alt="Refeição selecionada"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                
                {!analyzing ? (
                  <div className="space-y-3">
                    <Button 
                      onClick={analyzeImage}
                      className="w-full btn-primary rounded-xl h-12"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Analisar com IA
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={resetAnalysis}
                      className="w-full border-gray-300 text-gray-700 rounded-xl h-12"
                    >
                      Escolher Outra Foto
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Analisando sua refeição...
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Nossa IA está identificando os alimentos e calculando os nutrientes
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resultado da análise */}
        {analysisResult && (
          <div className="space-y-6 animate-fade-in">
            {/* Imagem analisada */}
            <Card className="glass-card shadow-soft">
              <CardContent className="p-4">
                <img 
                  src={selectedImage.preview} 
                  alt="Refeição analisada"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </CardContent>
            </Card>

            {/* Resumo nutricional */}
            <Card className="glass-card shadow-soft hover-lift">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Resumo Nutricional</span>
                  <Badge className={`${getHealthScoreColor(analysisResult.health_score)} border-0`}>
                    {analysisResult.health_score}/100
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 gradient-soft rounded-lg">
                    <p className="text-2xl font-bold text-moss">{analysisResult.total_calories}</p>
                    <p className="text-sm text-gray-600">Calorias</p>
                  </div>
                  <div className="text-center p-3 gradient-soft rounded-lg">
                    <p className="text-2xl font-bold text-blue-light">{Math.round(analysisResult.confidence * 100)}%</p>
                    <p className="text-sm text-gray-600">Confiança</p>
                  </div>
                </div>

                {/* Macronutrientes */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Carboidratos</span>
                    <span className="text-sm text-gray-600">{analysisResult.nutritional_analysis.total_carbs}g</span>
                  </div>
                  <Progress value={(analysisResult.nutritional_analysis.total_carbs / 100) * 100} className="h-2 progress-moss" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Proteínas</span>
                    <span className="text-sm text-gray-600">{analysisResult.nutritional_analysis.total_protein}g</span>
                  </div>
                  <Progress value={(analysisResult.nutritional_analysis.total_protein / 100) * 100} className="h-2 progress-blue" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Gorduras</span>
                    <span className="text-sm text-gray-600">{analysisResult.nutritional_analysis.total_fat}g</span>
                  </div>
                  <Progress value={(analysisResult.nutritional_analysis.total_fat / 50) * 100} className="h-2 progress-moss" />
                </div>
              </CardContent>
            </Card>

            {/* Campo para sugestões veganas */}
            <Card className="glass-card shadow-soft border-2 border-moss/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 icon-gradient" />
                  Sugestões Veganas com IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Textarea
                    placeholder="Ex: Quero substituir o frango por uma opção vegana rica em proteína..."
                    value={veganRequest}
                    onChange={(e) => setVeganRequest(e.target.value)}
                    className="input-glass min-h-[80px] resize-none"
                  />
                  <Button 
                    onClick={getVeganSuggestions}
                    disabled={!veganRequest.trim() || loadingVeganSuggestions}
                    className="w-full btn-secondary rounded-xl h-12"
                  >
                    {loadingVeganSuggestions ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Gerando sugestões...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Obter Sugestões Veganas
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sugestões veganas */}
            {veganSuggestions && (
              <Card className="glass-card shadow-medium border-2 border-blue-light/20 animate-slide-up">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-blue-light" />
                    Alternativas Veganas Sugeridas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {veganSuggestions.suggestions.map((suggestion, index) => (
                    <div key={index} className="space-y-3">
                      <div className="p-3 gradient-soft rounded-lg">
                        <h4 className="font-semibold text-moss mb-2">
                          Substituir: {suggestion.food_to_replace}
                        </h4>
                        <div className="space-y-2">
                          {suggestion.vegan_alternatives.map((alt, altIndex) => (
                            <div key={altIndex} className="p-3 bg-white/80 rounded-lg border border-moss/10">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium text-gray-900">{alt.name}</h5>
                                <div className="text-right text-sm">
                                  <span className="text-moss font-semibold">{alt.calories} kcal</span>
                                  <br />
                                  <span className="text-blue-light">{alt.protein}g proteína</span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">{alt.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Comparação nutricional */}
                  <div className="p-4 gradient-hero rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Comparação Nutricional</h4>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Original</p>
                        <p className="text-lg font-bold text-gray-800">{veganSuggestions.nutritional_comparison.original_calories} kcal</p>
                        <p className="text-sm text-gray-600">{veganSuggestions.nutritional_comparison.original_protein}g proteína</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Versão Vegana</p>
                        <p className="text-lg font-bold text-moss">{veganSuggestions.nutritional_comparison.vegan_calories} kcal</p>
                        <p className="text-sm text-moss">{veganSuggestions.nutritional_comparison.vegan_protein}g proteína</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-900">Benefícios:</h5>
                      {veganSuggestions.nutritional_comparison.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dicas de preparo */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3">Dicas de Preparo</h4>
                    <div className="space-y-2">
                      {veganSuggestions.preparation_tips.map((tip, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-blue-800">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Alimentos detectados */}
            <Card className="glass-card shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Apple className="w-5 h-5 mr-2 text-moss" />
                  Alimentos Detectados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysisResult.detected_foods.map((food, index) => (
                  <div key={index} className="flex items-center justify-between p-3 gradient-soft rounded-lg hover-lift">
                    <div>
                      <p className="font-medium text-gray-900">{food.name}</p>
                      <p className="text-sm text-gray-600">{food.portion}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-moss">{food.calories} kcal</p>
                      <p className="text-xs text-gray-500">
                        C: {food.carbs}g | P: {food.protein}g | G: {food.fat}g
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recomendações */}
            <Card className="glass-card shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Wheat className="w-5 h-5 mr-2 text-moss" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysisResult.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">{rec}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Ações */}
            <div className="space-y-3">
              <Button 
                onClick={saveAnalysis}
                className="w-full btn-primary rounded-xl h-12"
              >
                <Check className="w-5 h-5 mr-2" />
                Salvar Refeição
              </Button>
              <Button 
                variant="outline"
                onClick={resetAnalysis}
                className="w-full border-gray-300 text-gray-700 rounded-xl h-12"
              >
                Analisar Nova Refeição
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MealAnalysisScreen

