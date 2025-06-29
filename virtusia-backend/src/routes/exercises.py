from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone, date
import json

from src.models.user import db, User
from src.models.exercise import Exercise, UserExercise, DifficultyLevel

exercises_bp = Blueprint('exercises', __name__)

@exercises_bp.route('/', methods=['GET'])
@jwt_required()
def get_exercises():
    """Lista exercícios disponíveis"""
    try:
        # Parâmetros de consulta
        muscle_group = request.args.get('muscle_group')
        difficulty = request.args.get('difficulty')
        search = request.args.get('search', '').strip()
        limit = int(request.args.get('limit', 20))
        offset = int(request.args.get('offset', 0))
        
        # Construir query
        query = Exercise.query
        
        # Filtros opcionais
        if muscle_group:
            query = query.filter(Exercise.muscle_groups.ilike(f'%{muscle_group}%'))
        
        if difficulty:
            try:
                difficulty_enum = DifficultyLevel(difficulty)
                query = query.filter_by(difficulty_level=difficulty_enum)
            except ValueError:
                return jsonify({'message': 'Nível de dificuldade inválido'}), 400
        
        if search:
            query = query.filter(
                db.or_(
                    Exercise.name.ilike(f'%{search}%'),
                    Exercise.description.ilike(f'%{search}%')
                )
            )
        
        # Ordenar por nome
        query = query.order_by(Exercise.name)
        
        # Paginação
        exercises = query.offset(offset).limit(limit).all()
        total = query.count()
        
        return jsonify({
            'exercises': [exercise.to_dict() for exercise in exercises],
            'total': total,
            'limit': limit,
            'offset': offset
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@exercises_bp.route('/<int:exercise_id>', methods=['GET'])
@jwt_required()
def get_exercise(exercise_id):
    """Obtém detalhes de um exercício específico"""
    try:
        exercise = Exercise.query.get(exercise_id)
        if not exercise:
            return jsonify({'message': 'Exercício não encontrado'}), 404
        
        return jsonify({'exercise': exercise.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@exercises_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_exercise_recommendations():
    """Obtém exercícios recomendados pela IA"""
    try:
        current_user_id = get_jwt_identity()
        
        # Buscar usuário e perfil
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'message': 'Usuário não encontrado'}), 404
        
        # Simular recomendações baseadas no perfil do usuário
        # Em uma implementação real, aqui seria usado ML para personalizar
        
        # Determinar nível de dificuldade baseado na atividade do usuário
        user_activity = user.activity_level.value if user.activity_level else 'moderately_active'
        
        if user_activity in ['sedentary', 'lightly_active']:
            recommended_difficulty = DifficultyLevel.BEGINNER
        elif user_activity == 'moderately_active':
            recommended_difficulty = DifficultyLevel.INTERMEDIATE
        else:
            recommended_difficulty = DifficultyLevel.ADVANCED
        
        # Buscar exercícios recomendados
        recommended_exercises = Exercise.query.filter_by(
            difficulty_level=recommended_difficulty
        ).limit(6).all()
        
        # Se não houver exercícios suficientes, buscar de outros níveis
        if len(recommended_exercises) < 4:
            additional_exercises = Exercise.query.filter(
                Exercise.difficulty_level != recommended_difficulty
            ).limit(6 - len(recommended_exercises)).all()
            recommended_exercises.extend(additional_exercises)
        
        # Criar plano de treino personalizado
        workout_plan = {
            'title': 'Treino Personalizado para Você',
            'description': f'Treino adaptado para seu nível: {recommended_difficulty.value}',
            'difficulty': recommended_difficulty.value,
            'estimated_duration': 30,  # minutos
            'estimated_calories': 200,
            'exercises': []
        }
        
        # Adicionar exercícios ao plano
        for exercise in recommended_exercises[:4]:  # Limitar a 4 exercícios
            exercise_data = exercise.to_dict()
            
            # Personalizar séries e repetições baseado no nível
            if recommended_difficulty == DifficultyLevel.BEGINNER:
                exercise_data['recommended_sets'] = 2
                exercise_data['recommended_reps'] = 10
                exercise_data['recommended_duration'] = 20  # segundos para exercícios isométricos
            elif recommended_difficulty == DifficultyLevel.INTERMEDIATE:
                exercise_data['recommended_sets'] = 3
                exercise_data['recommended_reps'] = 12
                exercise_data['recommended_duration'] = 30
            else:
                exercise_data['recommended_sets'] = 4
                exercise_data['recommended_reps'] = 15
                exercise_data['recommended_duration'] = 45
            
            workout_plan['exercises'].append(exercise_data)
        
        return jsonify({
            'workout_plan': workout_plan,
            'user_level': recommended_difficulty.value,
            'personalization_factors': {
                'activity_level': user_activity,
                'fitness_goals': user.profile.fitness_goals if user.profile else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@exercises_bp.route('/log', methods=['POST'])
@jwt_required()
def log_exercise():
    """Registra um exercício realizado"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validar dados obrigatórios
        if not data.get('exercise_id'):
            return jsonify({'message': 'ID do exercício é obrigatório'}), 400
        
        exercise_id = data['exercise_id']
        
        # Verificar se exercício existe
        exercise = Exercise.query.get(exercise_id)
        if not exercise:
            return jsonify({'message': 'Exercício não encontrado'}), 404
        
        # Calcular calorias queimadas
        duration = data.get('duration_minutes', 0)
        calories_burned = 0
        if duration > 0 and exercise.calories_per_minute:
            calories_burned = duration * exercise.calories_per_minute
        
        # Criar registro de exercício
        user_exercise = UserExercise(
            user_id=current_user_id,
            exercise_id=exercise_id,
            duration_minutes=duration,
            sets=data.get('sets'),
            reps=data.get('reps'),
            calories_burned=calories_burned,
            notes=data.get('notes')
        )
        
        db.session.add(user_exercise)
        db.session.commit()
        
        return jsonify({
            'message': 'Exercício registrado com sucesso',
            'user_exercise': user_exercise.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@exercises_bp.route('/history', methods=['GET'])
@jwt_required()
def get_exercise_history():
    """Obtém histórico de exercícios do usuário"""
    try:
        current_user_id = get_jwt_identity()
        
        # Parâmetros de consulta
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        exercise_id = request.args.get('exercise_id')
        limit = int(request.args.get('limit', 20))
        offset = int(request.args.get('offset', 0))
        
        # Construir query
        query = UserExercise.query.filter_by(user_id=current_user_id)
        
        # Filtros opcionais
        if date_from:
            try:
                date_from_obj = datetime.strptime(date_from, '%Y-%m-%d').date()
                query = query.filter(UserExercise.completed_at >= date_from_obj)
            except ValueError:
                return jsonify({'message': 'Data inicial inválida. Use formato YYYY-MM-DD'}), 400
        
        if date_to:
            try:
                date_to_obj = datetime.strptime(date_to, '%Y-%m-%d').date()
                query = query.filter(UserExercise.completed_at <= date_to_obj)
            except ValueError:
                return jsonify({'message': 'Data final inválida. Use formato YYYY-MM-DD'}), 400
        
        if exercise_id:
            query = query.filter_by(exercise_id=exercise_id)
        
        # Ordenar por data (mais recente primeiro)
        query = query.order_by(UserExercise.completed_at.desc())
        
        # Paginação
        user_exercises = query.offset(offset).limit(limit).all()
        total = query.count()
        
        return jsonify({
            'exercises': [user_exercise.to_dict() for user_exercise in user_exercises],
            'total': total,
            'limit': limit,
            'offset': offset
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@exercises_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_exercise_stats():
    """Obtém estatísticas de exercícios do usuário"""
    try:
        current_user_id = get_jwt_identity()
        
        # Parâmetros de consulta
        date_param = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
        period = request.args.get('period', 'week')  # day, week, month
        
        try:
            target_date = datetime.strptime(date_param, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'message': 'Data inválida. Use formato YYYY-MM-DD'}), 400
        
        # Calcular período
        if period == 'day':
            start_date = target_date
            end_date = target_date
        elif period == 'week':
            # Semana atual (segunda a domingo)
            days_since_monday = target_date.weekday()
            start_date = target_date - timedelta(days=days_since_monday)
            end_date = start_date + timedelta(days=6)
        elif period == 'month':
            start_date = target_date.replace(day=1)
            if target_date.month == 12:
                end_date = target_date.replace(year=target_date.year + 1, month=1, day=1) - timedelta(days=1)
            else:
                end_date = target_date.replace(month=target_date.month + 1, day=1) - timedelta(days=1)
        else:
            return jsonify({'message': 'Período inválido. Use: day, week, month'}), 400
        
        # Buscar exercícios do período
        user_exercises = UserExercise.query.filter(
            UserExercise.user_id == current_user_id,
            db.func.date(UserExercise.completed_at) >= start_date,
            db.func.date(UserExercise.completed_at) <= end_date
        ).all()
        
        # Calcular estatísticas
        total_exercises = len(user_exercises)
        total_duration = sum(ex.duration_minutes or 0 for ex in user_exercises)
        total_calories = sum(ex.calories_burned or 0 for ex in user_exercises)
        
        # Exercícios por dia
        exercises_by_day = {}
        for ex in user_exercises:
            day = ex.completed_at.date().isoformat()
            if day not in exercises_by_day:
                exercises_by_day[day] = 0
            exercises_by_day[day] += 1
        
        # Exercícios mais realizados
        exercise_counts = {}
        for ex in user_exercises:
            exercise_name = ex.exercise.name if ex.exercise else 'Desconhecido'
            if exercise_name not in exercise_counts:
                exercise_counts[exercise_name] = 0
            exercise_counts[exercise_name] += 1
        
        most_performed = sorted(exercise_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return jsonify({
            'period': period,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'stats': {
                'total_exercises': total_exercises,
                'total_duration_minutes': total_duration,
                'total_calories_burned': total_calories,
                'average_duration': total_duration / total_exercises if total_exercises > 0 else 0,
                'exercises_by_day': exercises_by_day,
                'most_performed_exercises': [{'name': name, 'count': count} for name, count in most_performed]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

