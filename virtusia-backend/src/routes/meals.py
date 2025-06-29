from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone, date
import json
import base64
import io
from PIL import Image

from src.models.user import db, User
from src.models.meal import Meal, Food, MealFood, MealType

meals_bp = Blueprint('meals', __name__)

def analyze_meal_image(image_data):
    """
    Simula análise de imagem de refeição por IA
    Em uma implementação real, aqui seria integrado com modelos de ML
    """
    # Simulação de análise de IA
    mock_analysis = {
        'detected_foods': [
            {
                'name': 'Frango Grelhado',
                'confidence': 0.92,
                'quantity': 150,
                'unit': 'g',
                'calories_per_100g': 165,
                'protein_per_100g': 31,
                'carbs_per_100g': 0,
                'fat_per_100g': 3.6
            },
            {
                'name': 'Arroz Branco',
                'confidence': 0.88,
                'quantity': 100,
                'unit': 'g',
                'calories_per_100g': 130,
                'protein_per_100g': 2.7,
                'carbs_per_100g': 28,
                'fat_per_100g': 0.3
            },
            {
                'name': 'Brócolis',
                'confidence': 0.85,
                'quantity': 80,
                'unit': 'g',
                'calories_per_100g': 34,
                'protein_per_100g': 2.8,
                'carbs_per_100g': 7,
                'fat_per_100g': 0.4
            }
        ],
        'total_calories': 295,
        'total_protein': 52.5,
        'total_carbs': 33.6,
        'total_fat': 5.7,
        'health_score': 85,
        'recommendations': [
            'Excelente fonte de proteína magra!',
            'Adicione mais vegetais coloridos para aumentar a variedade de nutrientes',
            'Considere trocar o arroz branco por integral para mais fibras'
        ]
    }
    
    return mock_analysis

@meals_bp.route('/analyze', methods=['POST'])
@jwt_required()
def analyze_meal():
    """Analisa uma refeição através de imagem"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data.get('image'):
            return jsonify({'message': 'Imagem é obrigatória'}), 400
        
        meal_type = data.get('meal_type', 'snack')
        
        # Validar tipo de refeição
        try:
            meal_type_enum = MealType(meal_type)
        except ValueError:
            return jsonify({'message': 'Tipo de refeição inválido'}), 400
        
        # Processar imagem (simulado)
        try:
            # Em uma implementação real, aqui processaríamos a imagem
            image_data = data['image']
            analysis_result = analyze_meal_image(image_data)
            
            return jsonify({
                'message': 'Análise concluída com sucesso',
                'analysis': analysis_result
            }), 200
            
        except Exception as e:
            return jsonify({'message': f'Erro ao processar imagem: {str(e)}'}), 400
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@meals_bp.route('/', methods=['POST'])
@jwt_required()
def save_meal():
    """Salva uma refeição analisada"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validar dados obrigatórios
        if not data.get('meal_type'):
            return jsonify({'message': 'Tipo de refeição é obrigatório'}), 400
        
        # Validar tipo de refeição
        try:
            meal_type_enum = MealType(data['meal_type'])
        except ValueError:
            return jsonify({'message': 'Tipo de refeição inválido'}), 400
        
        # Criar refeição
        meal = Meal(
            user_id=current_user_id,
            meal_type=meal_type_enum,
            image_url=data.get('image_url'),
            total_calories=data.get('total_calories'),
            total_protein=data.get('total_protein'),
            total_carbs=data.get('total_carbs'),
            total_fat=data.get('total_fat'),
            total_fiber=data.get('total_fiber'),
            ai_analysis_result=json.dumps(data.get('ai_analysis_result', {})),
            health_score=data.get('health_score')
        )
        
        db.session.add(meal)
        db.session.flush()  # Para obter o ID da refeição
        
        # Adicionar alimentos da refeição
        foods_data = data.get('foods', [])
        for food_data in foods_data:
            # Buscar ou criar alimento
            food = Food.query.filter_by(name=food_data['name']).first()
            if not food:
                food = Food(
                    name=food_data['name'],
                    calories_per_100g=food_data.get('calories_per_100g', 0),
                    protein_per_100g=food_data.get('protein_per_100g', 0),
                    carbs_per_100g=food_data.get('carbs_per_100g', 0),
                    fat_per_100g=food_data.get('fat_per_100g', 0),
                    fiber_per_100g=food_data.get('fiber_per_100g', 0),
                    source_api='manual'
                )
                db.session.add(food)
                db.session.flush()
            
            # Criar relação refeição-alimento
            meal_food = MealFood(
                meal_id=meal.id,
                food_id=food.id,
                quantity=food_data.get('quantity', 0),
                unit=food_data.get('unit', 'g')
            )
            db.session.add(meal_food)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Refeição salva com sucesso',
            'meal': meal.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@meals_bp.route('/', methods=['GET'])
@jwt_required()
def get_meals():
    """Lista refeições do usuário"""
    try:
        current_user_id = get_jwt_identity()
        
        # Parâmetros de consulta
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        meal_type = request.args.get('meal_type')
        limit = int(request.args.get('limit', 20))
        offset = int(request.args.get('offset', 0))
        
        # Construir query
        query = Meal.query.filter_by(user_id=current_user_id)
        
        # Filtros opcionais
        if date_from:
            try:
                date_from_obj = datetime.strptime(date_from, '%Y-%m-%d').date()
                query = query.filter(Meal.created_at >= date_from_obj)
            except ValueError:
                return jsonify({'message': 'Data inicial inválida. Use formato YYYY-MM-DD'}), 400
        
        if date_to:
            try:
                date_to_obj = datetime.strptime(date_to, '%Y-%m-%d').date()
                query = query.filter(Meal.created_at <= date_to_obj)
            except ValueError:
                return jsonify({'message': 'Data final inválida. Use formato YYYY-MM-DD'}), 400
        
        if meal_type:
            try:
                meal_type_enum = MealType(meal_type)
                query = query.filter_by(meal_type=meal_type_enum)
            except ValueError:
                return jsonify({'message': 'Tipo de refeição inválido'}), 400
        
        # Ordenar por data (mais recente primeiro)
        query = query.order_by(Meal.created_at.desc())
        
        # Paginação
        meals = query.offset(offset).limit(limit).all()
        total = query.count()
        
        return jsonify({
            'meals': [meal.to_dict() for meal in meals],
            'total': total,
            'limit': limit,
            'offset': offset
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@meals_bp.route('/<int:meal_id>', methods=['GET'])
@jwt_required()
def get_meal(meal_id):
    """Obtém detalhes de uma refeição específica"""
    try:
        current_user_id = get_jwt_identity()
        
        meal = Meal.query.filter_by(id=meal_id, user_id=current_user_id).first()
        if not meal:
            return jsonify({'message': 'Refeição não encontrada'}), 404
        
        return jsonify({'meal': meal.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@meals_bp.route('/<int:meal_id>', methods=['DELETE'])
@jwt_required()
def delete_meal(meal_id):
    """Exclui uma refeição"""
    try:
        current_user_id = get_jwt_identity()
        
        meal = Meal.query.filter_by(id=meal_id, user_id=current_user_id).first()
        if not meal:
            return jsonify({'message': 'Refeição não encontrada'}), 404
        
        db.session.delete(meal)
        db.session.commit()
        
        return jsonify({'message': 'Refeição excluída com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@meals_bp.route('/nutrition-summary', methods=['GET'])
@jwt_required()
def get_nutrition_summary():
    """Obtém resumo nutricional do usuário"""
    try:
        current_user_id = get_jwt_identity()
        
        # Parâmetros de consulta
        date_param = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
        
        try:
            target_date = datetime.strptime(date_param, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'message': 'Data inválida. Use formato YYYY-MM-DD'}), 400
        
        # Buscar refeições do dia
        meals = Meal.query.filter(
            Meal.user_id == current_user_id,
            db.func.date(Meal.created_at) == target_date
        ).all()
        
        # Calcular totais
        total_calories = sum(meal.total_calories or 0 for meal in meals)
        total_protein = sum(meal.total_protein or 0 for meal in meals)
        total_carbs = sum(meal.total_carbs or 0 for meal in meals)
        total_fat = sum(meal.total_fat or 0 for meal in meals)
        total_fiber = sum(meal.total_fiber or 0 for meal in meals)
        
        # Buscar meta calórica do usuário
        user = User.query.get(current_user_id)
        daily_goal = user.profile.daily_calorie_goal if user.profile else 2000
        
        return jsonify({
            'date': target_date.isoformat(),
            'summary': {
                'total_calories': total_calories,
                'total_protein': total_protein,
                'total_carbs': total_carbs,
                'total_fat': total_fat,
                'total_fiber': total_fiber,
                'daily_calorie_goal': daily_goal,
                'calorie_progress': (total_calories / daily_goal * 100) if daily_goal > 0 else 0,
                'meals_count': len(meals)
            },
            'meals_by_type': {
                meal_type.value: len([m for m in meals if m.meal_type == meal_type])
                for meal_type in MealType
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@meals_bp.route('/foods/search', methods=['GET'])
@jwt_required()
def search_foods():
    """Busca alimentos no banco de dados"""
    try:
        query = request.args.get('q', '').strip()
        limit = int(request.args.get('limit', 20))
        
        if not query:
            return jsonify({'message': 'Termo de busca é obrigatório'}), 400
        
        # Buscar alimentos
        foods = Food.query.filter(
            Food.name.ilike(f'%{query}%')
        ).limit(limit).all()
        
        return jsonify({
            'foods': [food.to_dict() for food in foods],
            'total': len(foods)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

