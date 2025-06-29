from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import json
import random
from datetime import datetime

ai_bp = Blueprint('ai', __name__)

def calculate_bmr(weight, height, age, gender):
    """Calcula a Taxa Metabólica Basal usando a fórmula de Harris-Benedict"""
    if gender.lower() == 'male':
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    else:
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
    return bmr

def calculate_tdee(bmr, activity_level):
    """Calcula o Gasto Energético Total Diário"""
    activity_multipliers = {
        'sedentary': 1.2,
        'lightly_active': 1.375,
        'moderately_active': 1.55,
        'very_active': 1.725,
        'extremely_active': 1.9
    }
    return bmr * activity_multipliers.get(activity_level, 1.2)

def generate_diet_plan(calories, goal, dietary_preferences=None):
    """Gera um plano alimentar personalizado"""
    
    # Distribuição de macronutrientes baseada no objetivo
    if goal == 'weight_loss':
        protein_ratio = 0.30
        carb_ratio = 0.35
        fat_ratio = 0.35
    elif goal == 'muscle_gain':
        protein_ratio = 0.25
        carb_ratio = 0.45
        fat_ratio = 0.30
    else:  # maintenance
        protein_ratio = 0.20
        carb_ratio = 0.50
        fat_ratio = 0.30
    
    protein_calories = calories * protein_ratio
    carb_calories = calories * carb_ratio
    fat_calories = calories * fat_ratio
    
    # Converter para gramas
    protein_grams = protein_calories / 4
    carb_grams = carb_calories / 4
    fat_grams = fat_calories / 9
    
    # Planos de refeição baseados nas preferências
    meal_plans = {
        'omnivore': {
            'breakfast': [
                'Ovos mexidos com aveia e frutas vermelhas',
                'Iogurte grego com granola e banana',
                'Panqueca de aveia com mel e nozes',
                'Smoothie de proteína com frutas'
            ],
            'lunch': [
                'Peito de frango grelhado com arroz integral e brócolis',
                'Salmão assado com batata-doce e aspargos',
                'Carne magra com quinoa e salada verde',
                'Peixe grelhado com arroz e legumes'
            ],
            'dinner': [
                'Frango ao curry com arroz integral',
                'Peixe com purê de batata-doce',
                'Carne magra com salada e batata',
                'Omelete com vegetais e queijo'
            ],
            'snacks': [
                'Mix de castanhas',
                'Iogurte com frutas',
                'Sanduíche natural',
                'Shake de proteína'
            ]
        },
        'vegetarian': {
            'breakfast': [
                'Aveia com leite vegetal e frutas',
                'Smoothie verde com espinafre e banana',
                'Torrada integral com abacate',
                'Iogurte vegetal com granola'
            ],
            'lunch': [
                'Quinoa com legumes grelhados',
                'Lentilha com arroz integral',
                'Tofu grelhado com vegetais',
                'Salada de grão-de-bico'
            ],
            'dinner': [
                'Curry de grão-de-bico',
                'Risotto de cogumelos',
                'Macarrão integral com molho de tomate',
                'Omelete de vegetais'
            ],
            'snacks': [
                'Hummus com vegetais',
                'Frutas secas e castanhas',
                'Smoothie de proteína vegetal',
                'Iogurte vegetal'
            ]
        },
        'vegan': {
            'breakfast': [
                'Aveia com leite de amêndoas e frutas',
                'Smoothie de proteína vegetal',
                'Torrada com pasta de amendoim',
                'Chia pudding com frutas'
            ],
            'lunch': [
                'Bowl de quinoa com vegetais',
                'Curry de lentilha vermelha',
                'Salada de grão-de-bico com tahine',
                'Tofu marinado com arroz'
            ],
            'dinner': [
                'Tempeh refogado com vegetais',
                'Sopa de feijão com legumes',
                'Macarrão com molho de castanhas',
                'Curry de vegetais'
            ],
            'snacks': [
                'Mix de sementes',
                'Frutas frescas',
                'Leite vegetal com proteína',
                'Hummus com vegetais'
            ]
        }
    }
    
    preference = dietary_preferences or 'omnivore'
    meals = meal_plans.get(preference, meal_plans['omnivore'])
    
    # Selecionar refeições aleatórias
    selected_meals = {
        'breakfast': random.choice(meals['breakfast']),
        'lunch': random.choice(meals['lunch']),
        'dinner': random.choice(meals['dinner']),
        'snack1': random.choice(meals['snacks']),
        'snack2': random.choice(meals['snacks'])
    }
    
    return {
        'daily_calories': round(calories),
        'macronutrients': {
            'protein': round(protein_grams),
            'carbohydrates': round(carb_grams),
            'fat': round(fat_grams)
        },
        'meals': selected_meals,
        'hydration_goal': round(calories * 0.035),  # 35ml por kcal
        'meal_timing': {
            'breakfast': '07:00-09:00',
            'snack1': '10:00-11:00',
            'lunch': '12:00-14:00',
            'snack2': '15:00-16:00',
            'dinner': '18:00-20:00'
        }
    }

@ai_bp.route('/suggest-diet', methods=['POST'])
@jwt_required()
def suggest_diet():
    """Endpoint para sugerir dieta personalizada usando LLM"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        required_fields = ['weight', 'height', 'age', 'gender']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo obrigatório: {field}'}), 400
        
        weight = float(data['weight'])
        height = float(data['height'])
        age = int(data['age'])
        gender = data['gender']
        
        # Dados opcionais
        activity_level = data.get('activity_level', 'moderately_active')
        goal = data.get('goal', 'maintenance')  # weight_loss, muscle_gain, maintenance
        dietary_preferences = data.get('dietary_preferences', 'omnivore')
        health_conditions = data.get('health_conditions', [])
        
        # Calcular IMC
        height_m = height / 100
        bmi = weight / (height_m ** 2)
        
        # Calcular necessidades calóricas
        bmr = calculate_bmr(weight, height, age, gender)
        tdee = calculate_tdee(bmr, activity_level)
        
        # Ajustar calorias baseado no objetivo
        if goal == 'weight_loss':
            target_calories = tdee - 500  # Déficit de 500 kcal
        elif goal == 'muscle_gain':
            target_calories = tdee + 300  # Superávit de 300 kcal
        else:
            target_calories = tdee
        
        # Gerar plano alimentar
        diet_plan = generate_diet_plan(target_calories, goal, dietary_preferences)
        
        # Recomendações personalizadas baseadas no IMC e objetivo
        recommendations = []
        
        if bmi < 18.5:
            recommendations.append("Seu IMC indica baixo peso. Foque em ganhar massa muscular com exercícios de força.")
            recommendations.append("Inclua mais calorias densas em nutrientes como nozes, abacate e azeite.")
        elif bmi > 25:
            recommendations.append("Seu IMC indica sobrepeso. Combine dieta com exercícios cardiovasculares.")
            recommendations.append("Priorize alimentos com baixa densidade calórica como vegetais e frutas.")
        else:
            recommendations.append("Seu IMC está na faixa ideal. Mantenha uma alimentação equilibrada.")
        
        if goal == 'muscle_gain':
            recommendations.append("Para ganho de massa muscular, consuma proteína a cada 3-4 horas.")
            recommendations.append("Inclua exercícios de resistência 3-4 vezes por semana.")
        elif goal == 'weight_loss':
            recommendations.append("Para perda de peso, mantenha um déficit calórico consistente.")
            recommendations.append("Combine exercícios aeróbicos com treinamento de força.")
        
        # Considerações especiais para condições de saúde
        if 'diabetes' in health_conditions:
            recommendations.append("Para diabetes, monitore o índice glicêmico dos alimentos.")
            recommendations.append("Distribua os carboidratos ao longo do dia.")
        
        if 'hypertension' in health_conditions:
            recommendations.append("Para hipertensão, reduza o consumo de sódio.")
            recommendations.append("Inclua alimentos ricos em potássio como banana e espinafre.")
        
        # Simular resposta de LLM com insights personalizados
        ai_insights = {
            'metabolic_analysis': f"Com base nos seus dados, sua taxa metabólica basal é de {round(bmr)} kcal/dia. "
                                f"Considerando seu nível de atividade, você gasta aproximadamente {round(tdee)} kcal/dia.",
            'goal_strategy': f"Para seu objetivo de {goal}, recomendamos {round(target_calories)} kcal/dia. "
                           f"Isso representa um {'déficit' if goal == 'weight_loss' else 'superávit' if goal == 'muscle_gain' else 'equilíbrio'} "
                           f"calórico adequado para resultados sustentáveis.",
            'timeline_expectation': "Com consistência, você pode esperar resultados visíveis em 4-6 semanas. "
                                  "Lembre-se que mudanças graduais são mais sustentáveis a longo prazo."
        }
        
        response = {
            'user_profile': {
                'bmi': round(bmi, 1),
                'bmi_category': 'Baixo peso' if bmi < 18.5 else 'Sobrepeso' if bmi > 25 else 'Peso normal',
                'bmr': round(bmr),
                'tdee': round(tdee),
                'goal': goal,
                'activity_level': activity_level
            },
            'diet_plan': diet_plan,
            'recommendations': recommendations,
            'ai_insights': ai_insights,
            'generated_at': datetime.now().isoformat(),
            'next_review_date': datetime.now().replace(day=datetime.now().day + 14).isoformat()
        }
        
        return jsonify(response), 200
        
    except ValueError as e:
        return jsonify({'error': 'Dados inválidos fornecidos'}), 400
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

@ai_bp.route('/nutrition-chat', methods=['POST'])
@jwt_required()
def nutrition_chat():
    """Endpoint para chat nutricional com IA"""
    try:
        data = request.get_json()
        
        if 'message' not in data:
            return jsonify({'error': 'Mensagem é obrigatória'}), 400
        
        user_message = data['message'].lower()
        conversation_history = data.get('conversation_history', [])
        
        # Simular resposta de IA baseada em palavras-chave
        responses = {
            'proteína': {
                'response': 'As proteínas são macronutrientes essenciais para a construção e reparação dos tecidos. '
                          'Recomendo consumir cerca de 0,8-1,2g por kg de peso corporal diariamente. '
                          'Boas fontes incluem carnes magras, peixes, ovos, leguminosas, quinoa e tofu.',
                'confidence': 0.95,
                'sources': ['Dietary Reference Intakes', 'WHO Guidelines']
            },
            'carboidrato': {
                'response': 'Os carboidratos são a principal fonte de energia do corpo. '
                          'Prefira carboidratos complexos como aveia, arroz integral, batata-doce e quinoa. '
                          'Eles fornecem energia sustentada e são ricos em fibras.',
                'confidence': 0.92,
                'sources': ['American Dietetic Association']
            },
            'gordura': {
                'response': 'As gorduras saudáveis são importantes para a absorção de vitaminas e produção hormonal. '
                          'Inclua fontes como abacate, azeite, nozes, sementes e peixes gordurosos como salmão.',
                'confidence': 0.90,
                'sources': ['Harvard Health', 'Mediterranean Diet Studies']
            },
            'vitamina': {
                'response': 'As vitaminas são micronutrientes essenciais. Uma dieta variada com frutas, vegetais, '
                          'grãos integrais e proteínas magras geralmente fornece todas as vitaminas necessárias. '
                          'Considere suplementação apenas com orientação profissional.',
                'confidence': 0.88,
                'sources': ['National Institutes of Health']
            },
            'água': {
                'response': 'A hidratação é fundamental! Recomendo cerca de 35ml por kg de peso corporal diariamente. '
                          'A água ajuda na digestão, transporte de nutrientes e regulação da temperatura corporal.',
                'confidence': 0.94,
                'sources': ['Institute of Medicine']
            },
            'dieta': {
                'response': 'Uma dieta equilibrada deve incluir todos os grupos alimentares: frutas, vegetais, '
                          'grãos integrais, proteínas magras e gorduras saudáveis. O importante é a variedade e moderação.',
                'confidence': 0.91,
                'sources': ['Dietary Guidelines for Americans']
            },
            'peso': {
                'response': 'Para perda de peso saudável, crie um déficit calórico moderado (300-500 kcal/dia) '
                          'através de dieta equilibrada e exercícios. Evite dietas restritivas extremas.',
                'confidence': 0.89,
                'sources': ['CDC Guidelines', 'Academy of Nutrition and Dietetics']
            },
            'exercício': {
                'response': 'Combine exercícios aeróbicos com treinamento de força. A nutrição pré-treino deve incluir '
                          'carboidratos para energia, e pós-treino, proteínas para recuperação muscular.',
                'confidence': 0.87,
                'sources': ['ACSM Guidelines']
            }
        }
        
        # Encontrar resposta baseada em palavras-chave
        ai_response = None
        for keyword, response_data in responses.items():
            if keyword in user_message:
                ai_response = response_data
                break
        
        # Resposta padrão se nenhuma palavra-chave for encontrada
        if not ai_response:
            ai_response = {
                'response': 'Essa é uma excelente pergunta sobre nutrição! Para uma resposta mais específica e personalizada, '
                          'recomendo consultar um nutricionista. Posso ajudar com informações gerais sobre alimentação saudável, '
                          'macronutrientes e dicas de bem-estar.',
                'confidence': 0.75,
                'sources': ['General Nutrition Knowledge Base']
            }
        
        # Adicionar contexto personalizado se disponível
        user_id = get_jwt_identity()
        personalized_note = f"Lembre-se de que essas são orientações gerais. Para recomendações específicas, " \
                           f"considere seus objetivos pessoais e histórico de saúde."
        
        response = {
            'message': ai_response['response'],
            'confidence': ai_response['confidence'],
            'sources': ai_response['sources'],
            'personalized_note': personalized_note,
            'timestamp': datetime.now().isoformat(),
            'follow_up_suggestions': [
                'Gostaria de saber mais sobre algum nutriente específico?',
                'Tem alguma restrição alimentar que devo considerar?',
                'Quer dicas sobre como incluir esses alimentos na sua dieta?'
            ]
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

@ai_bp.route('/vegan-suggestions', methods=['POST'])
@jwt_required()
def vegan_suggestions():
    """Endpoint para sugestões veganas baseadas em análise de refeição"""
    try:
        data = request.get_json()
        
        if 'meal_analysis' not in data or 'user_request' not in data:
            return jsonify({'error': 'Análise da refeição e solicitação do usuário são obrigatórias'}), 400
        
        meal_analysis = data['meal_analysis']
        user_request = data['user_request']
        
        # Simular análise de IA para sugestões veganas
        detected_foods = meal_analysis.get('detected_foods', [])
        
        suggestions = []
        
        # Identificar alimentos de origem animal
        animal_products = ['frango', 'carne', 'peixe', 'salmão', 'ovo', 'queijo', 'leite', 'iogurte']
        
        for food in detected_foods:
            food_name = food['name'].lower()
            
            for animal_product in animal_products:
                if animal_product in food_name:
                    vegan_alternatives = get_vegan_alternatives(animal_product, food)
                    if vegan_alternatives:
                        suggestions.append({
                            'food_to_replace': food['name'],
                            'vegan_alternatives': vegan_alternatives
                        })
                    break
        
        # Calcular comparação nutricional
        original_calories = meal_analysis.get('total_calories', 0)
        original_protein = meal_analysis.get('nutritional_analysis', {}).get('total_protein', 0)
        
        # Estimar valores veganos (geralmente 10-15% menos calorias, proteína similar)
        vegan_calories = int(original_calories * 0.85)
        vegan_protein = int(original_protein * 0.9)
        
        response = {
            'original_request': user_request,
            'suggestions': suggestions,
            'nutritional_comparison': {
                'original_calories': original_calories,
                'vegan_calories': vegan_calories,
                'original_protein': original_protein,
                'vegan_protein': vegan_protein,
                'benefits': [
                    'Menor impacto ambiental',
                    'Rico em fibras',
                    'Livre de colesterol',
                    'Fonte de fitoquímicos antioxidantes',
                    'Menor risco de doenças cardiovasculares'
                ]
            },
            'preparation_tips': [
                'Marine o tofu por pelo menos 30 minutos para melhor sabor',
                'Use temperos como nutritional yeast para sabor umami',
                'Adicione sementes de girassol para textura crocante',
                'Combine diferentes proteínas vegetais para perfil completo de aminoácidos'
            ],
            'shopping_list': generate_vegan_shopping_list(suggestions),
            'generated_at': datetime.now().isoformat()
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

def get_vegan_alternatives(animal_product, original_food):
    """Retorna alternativas veganas para um produto de origem animal"""
    alternatives_db = {
        'frango': [
            {
                'name': 'Tofu grelhado temperado',
                'calories': 180,
                'protein': 20,
                'description': 'Tofu firme marinado com shoyu, alho e gengibre, grelhado até dourar'
            },
            {
                'name': 'Tempeh refogado',
                'calories': 190,
                'protein': 19,
                'description': 'Tempeh fatiado e refogado com cebola e pimentão'
            },
            {
                'name': 'Seitan ao molho de ervas',
                'calories': 200,
                'protein': 25,
                'description': 'Seitan grelhado com molho de ervas frescas'
            }
        ],
        'carne': [
            {
                'name': 'Hambúrguer de lentilha',
                'calories': 220,
                'protein': 18,
                'description': 'Hambúrguer caseiro feito com lentilhas, aveia e temperos'
            },
            {
                'name': 'Proteína de soja texturizada',
                'calories': 200,
                'protein': 22,
                'description': 'PTS hidratada e temperada com molho de tomate'
            },
            {
                'name': 'Cogumelos portobello grelhados',
                'calories': 150,
                'protein': 12,
                'description': 'Cogumelos grandes grelhados com azeite e ervas'
            }
        ],
        'peixe': [
            {
                'name': 'Tofu defumado',
                'calories': 170,
                'protein': 18,
                'description': 'Tofu com sabor defumado, rico em proteínas'
            },
            {
                'name': 'Algas marinhas temperadas',
                'calories': 120,
                'protein': 15,
                'description': 'Mix de algas com sabor do mar, ricas em minerais'
            }
        ],
        'ovo': [
            {
                'name': 'Tofu mexido',
                'calories': 160,
                'protein': 16,
                'description': 'Tofu esfarelado temperado com cúrcuma e nutritional yeast'
            },
            {
                'name': 'Chia egg (substituto)',
                'calories': 80,
                'protein': 4,
                'description': 'Mistura de chia com água, ideal para receitas'
            }
        ],
        'queijo': [
            {
                'name': 'Queijo de castanha de caju',
                'calories': 140,
                'protein': 8,
                'description': 'Queijo vegano cremoso feito com castanhas'
            },
            {
                'name': 'Nutritional yeast',
                'calories': 60,
                'protein': 8,
                'description': 'Levedura nutricional com sabor de queijo'
            }
        ],
        'leite': [
            {
                'name': 'Leite de aveia',
                'calories': 80,
                'protein': 3,
                'description': 'Leite vegetal cremoso e naturalmente doce'
            },
            {
                'name': 'Leite de amêndoas',
                'calories': 60,
                'protein': 2,
                'description': 'Leite vegetal leve e nutritivo'
            }
        ]
    }
    
    return alternatives_db.get(animal_product, [])

def generate_vegan_shopping_list(suggestions):
    """Gera lista de compras baseada nas sugestões veganas"""
    shopping_items = set()
    
    for suggestion in suggestions:
        for alternative in suggestion['vegan_alternatives']:
            name = alternative['name'].lower()
            
            if 'tofu' in name:
                shopping_items.add('Tofu firme')
            if 'tempeh' in name:
                shopping_items.add('Tempeh')
            if 'seitan' in name:
                shopping_items.add('Seitan')
            if 'lentilha' in name:
                shopping_items.add('Lentilhas')
            if 'castanha' in name:
                shopping_items.add('Castanha de caju')
            if 'nutritional yeast' in name:
                shopping_items.add('Nutritional yeast')
            if 'cogumelo' in name:
                shopping_items.add('Cogumelos portobello')
    
    # Adicionar itens básicos
    basic_items = ['Shoyu', 'Azeite', 'Alho', 'Gengibre', 'Cebola', 'Temperos variados']
    shopping_items.update(basic_items)
    
    return list(shopping_items)

@ai_bp.route('/notifications/register', methods=['POST'])
@jwt_required()
def register_notification_token():
    """Registra token FCM para notificações push"""
    try:
        data = request.get_json()
        
        if 'fcm_token' not in data:
            return jsonify({'error': 'Token FCM é obrigatório'}), 400
        
        user_id = get_jwt_identity()
        fcm_token = data['fcm_token']
        device_type = data.get('device_type', 'web')
        
        # Em um aplicativo real, você salvaria o token no banco de dados
        # associado ao usuário para enviar notificações personalizadas
        
        response = {
            'message': 'Token FCM registrado com sucesso',
            'user_id': user_id,
            'token_registered': True,
            'notification_preferences': {
                'meal_reminders': True,
                'exercise_reminders': True,
                'goal_updates': True,
                'nutrition_tips': True
            }
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

@ai_bp.route('/notifications/send', methods=['POST'])
@jwt_required()
def send_notification():
    """Envia notificação push personalizada"""
    try:
        data = request.get_json()
        
        required_fields = ['title', 'body', 'type']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo obrigatório: {field}'}), 400
        
        user_id = get_jwt_identity()
        
        # Simular envio de notificação
        notification_data = {
            'title': data['title'],
            'body': data['body'],
            'type': data['type'],
            'data': data.get('data', {}),
            'sent_at': datetime.now().isoformat(),
            'user_id': user_id
        }
        
        # Em um aplicativo real, você usaria Firebase Admin SDK
        # para enviar a notificação para o token FCM do usuário
        
        response = {
            'message': 'Notificação enviada com sucesso',
            'notification_id': f"notif_{datetime.now().timestamp()}",
            'delivery_status': 'sent',
            'notification_data': notification_data
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

