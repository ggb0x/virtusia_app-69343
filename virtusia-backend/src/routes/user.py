from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone, date, timedelta
import json

from src.models.user import db, User, UserProfile, Gender, ActivityLevel
from src.models.meal import Meal
from src.models.exercise import UserExercise
from src.models.goal import Goal, GoalStatus

user_bp = Blueprint('user', __name__)

@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Obtém perfil completo do usuário"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'message': 'Usuário não encontrado'}), 404
        
        user_data = user.to_dict()
        
        # Incluir dados do perfil
        if user.profile:
            user_data['profile'] = user.profile.to_dict()
        else:
            # Criar perfil se não existir
            profile = UserProfile(user_id=user.id)
            db.session.add(profile)
            db.session.commit()
            user_data['profile'] = profile.to_dict()
        
        return jsonify({'user': user_data}), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@user_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Atualiza perfil do usuário"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'message': 'Usuário não encontrado'}), 404
        
        # Atualizar dados do usuário
        if 'first_name' in data:
            user.first_name = data['first_name'].strip()
        if 'last_name' in data:
            user.last_name = data['last_name'].strip()
        if 'date_of_birth' in data:
            if data['date_of_birth']:
                try:
                    user.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({'message': 'Data de nascimento inválida. Use formato YYYY-MM-DD'}), 400
            else:
                user.date_of_birth = None
        
        if 'gender' in data:
            if data['gender']:
                try:
                    user.gender = Gender(data['gender'])
                except ValueError:
                    return jsonify({'message': 'Gênero inválido'}), 400
            else:
                user.gender = None
        
        if 'height' in data:
            user.height = float(data['height']) if data['height'] else None
        
        if 'activity_level' in data:
            try:
                user.activity_level = ActivityLevel(data['activity_level'])
            except ValueError:
                return jsonify({'message': 'Nível de atividade inválido'}), 400
        
        # Atualizar ou criar perfil
        if not user.profile:
            user.profile = UserProfile(user_id=user.id)
            db.session.add(user.profile)
        
        profile = user.profile
        
        if 'current_weight' in data:
            profile.current_weight = float(data['current_weight']) if data['current_weight'] else None
        if 'target_weight' in data:
            profile.target_weight = float(data['target_weight']) if data['target_weight'] else None
        if 'daily_calorie_goal' in data:
            profile.daily_calorie_goal = int(data['daily_calorie_goal']) if data['daily_calorie_goal'] else None
        if 'dietary_restrictions' in data:
            profile.dietary_restrictions = json.dumps(data['dietary_restrictions']) if data['dietary_restrictions'] else None
        if 'fitness_goals' in data:
            profile.fitness_goals = json.dumps(data['fitness_goals']) if data['fitness_goals'] else None
        
        user.updated_at = datetime.now(timezone.utc)
        profile.updated_at = datetime.now(timezone.utc)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Perfil atualizado com sucesso',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@user_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    """Obtém dados do dashboard principal"""
    try:
        current_user_id = get_jwt_identity()
        today = date.today()
        
        # Buscar usuário
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'message': 'Usuário não encontrado'}), 404
        
        # Progresso calórico do dia
        today_meals = Meal.query.filter(
            Meal.user_id == current_user_id,
            db.func.date(Meal.created_at) == today
        ).all()
        
        total_calories_today = sum(meal.total_calories or 0 for meal in today_meals)
        daily_goal = user.profile.daily_calorie_goal if user.profile else 2000
        calorie_progress = (total_calories_today / daily_goal * 100) if daily_goal > 0 else 0
        
        # Exercícios da semana
        week_start = today - timedelta(days=today.weekday())
        week_exercises = UserExercise.query.filter(
            UserExercise.user_id == current_user_id,
            UserExercise.completed_at >= week_start
        ).count()
        
        # Metas ativas
        active_goals = Goal.query.filter_by(
            user_id=current_user_id,
            status=GoalStatus.ACTIVE
        ).limit(3).all()
        
        # Refeições recentes
        recent_meals = Meal.query.filter_by(
            user_id=current_user_id
        ).order_by(Meal.created_at.desc()).limit(5).all()
        
        # Próximos exercícios (simulado)
        upcoming_exercises = [
            {
                'name': 'Treino de Força',
                'scheduled_time': '18:00',
                'duration': 45,
                'type': 'strength'
            },
            {
                'name': 'Caminhada',
                'scheduled_time': '07:00',
                'duration': 30,
                'type': 'cardio'
            }
        ]
        
        # Estatísticas da semana
        week_stats = {
            'calories_consumed': sum(
                meal.total_calories or 0 
                for meal in Meal.query.filter(
                    Meal.user_id == current_user_id,
                    Meal.created_at >= week_start
                ).all()
            ),
            'exercises_completed': week_exercises,
            'goals_on_track': len([g for g in active_goals if g.calculate_progress_percentage() >= 50])
        }
        
        return jsonify({
            'user': {
                'name': f"{user.first_name} {user.last_name}",
                'id': user.id
            },
            'daily_progress': {
                'calories': {
                    'consumed': total_calories_today,
                    'goal': daily_goal,
                    'percentage': min(100, calorie_progress)
                },
                'meals_logged': len(today_meals),
                'water_intake': 1.5,  # Simulado - em litros
                'steps': 8500  # Simulado
            },
            'recent_meals': [meal.to_dict() for meal in recent_meals],
            'upcoming_exercises': upcoming_exercises,
            'active_goals': [goal.to_dict() for goal in active_goals],
            'week_stats': week_stats,
            'motivational_message': get_motivational_message(calorie_progress, week_exercises)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

def get_motivational_message(calorie_progress, week_exercises):
    """Gera mensagem motivacional baseada no progresso"""
    if calorie_progress >= 90:
        return "Excelente! Você está muito próximo da sua meta calórica diária! 🎯"
    elif calorie_progress >= 70:
        return "Ótimo progresso! Continue assim para atingir sua meta! 💪"
    elif week_exercises >= 3:
        return "Parabéns pelos exercícios desta semana! Que tal focar na alimentação agora? 🥗"
    elif week_exercises >= 1:
        return "Bom trabalho com os exercícios! Vamos manter o ritmo! 🏃‍♀️"
    else:
        return "Um novo dia, uma nova oportunidade! Vamos começar com uma refeição saudável? 🌟"

@user_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    """Obtém estatísticas detalhadas do usuário"""
    try:
        current_user_id = get_jwt_identity()
        
        # Parâmetros de consulta
        period = request.args.get('period', 'month')  # week, month, year
        
        # Calcular período
        today = date.today()
        if period == 'week':
            start_date = today - timedelta(days=today.weekday())
            end_date = today
        elif period == 'month':
            start_date = today.replace(day=1)
            end_date = today
        elif period == 'year':
            start_date = today.replace(month=1, day=1)
            end_date = today
        else:
            return jsonify({'message': 'Período inválido. Use: week, month, year'}), 400
        
        # Estatísticas de refeições
        meals = Meal.query.filter(
            Meal.user_id == current_user_id,
            db.func.date(Meal.created_at) >= start_date,
            db.func.date(Meal.created_at) <= end_date
        ).all()
        
        total_calories = sum(meal.total_calories or 0 for meal in meals)
        avg_health_score = sum(meal.health_score or 0 for meal in meals) / len(meals) if meals else 0
        
        # Estatísticas de exercícios
        exercises = UserExercise.query.filter(
            UserExercise.user_id == current_user_id,
            db.func.date(UserExercise.completed_at) >= start_date,
            db.func.date(UserExercise.completed_at) <= end_date
        ).all()
        
        total_exercise_time = sum(ex.duration_minutes or 0 for ex in exercises)
        total_calories_burned = sum(ex.calories_burned or 0 for ex in exercises)
        
        # Estatísticas de metas
        goals = Goal.query.filter_by(user_id=current_user_id).all()
        completed_goals = len([g for g in goals if g.status == GoalStatus.COMPLETED])
        active_goals = len([g for g in goals if g.status == GoalStatus.ACTIVE])
        
        return jsonify({
            'period': period,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'nutrition': {
                'total_calories_consumed': total_calories,
                'meals_logged': len(meals),
                'average_health_score': round(avg_health_score, 1),
                'calories_per_day': round(total_calories / max((end_date - start_date).days + 1, 1), 1)
            },
            'fitness': {
                'total_exercise_time': total_exercise_time,
                'total_calories_burned': total_calories_burned,
                'exercises_completed': len(exercises),
                'avg_exercise_duration': round(total_exercise_time / len(exercises), 1) if exercises else 0
            },
            'goals': {
                'total_goals': len(goals),
                'completed_goals': completed_goals,
                'active_goals': active_goals,
                'completion_rate': round(completed_goals / len(goals) * 100, 1) if goals else 0
            },
            'overall_score': calculate_overall_score(avg_health_score, len(exercises), completed_goals)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

def calculate_overall_score(health_score, exercise_count, completed_goals):
    """Calcula pontuação geral do usuário"""
    # Fórmula simples para demonstração
    nutrition_score = min(health_score, 100) * 0.4
    fitness_score = min(exercise_count * 10, 100) * 0.4
    goals_score = min(completed_goals * 20, 100) * 0.2
    
    return round(nutrition_score + fitness_score + goals_score, 1)

@user_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_user_recommendations():
    """Obtém recomendações personalizadas para o usuário"""
    try:
        current_user_id = get_jwt_identity()
        
        # Buscar usuário e dados recentes
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'message': 'Usuário não encontrado'}), 404
        
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        
        # Analisar padrões recentes
        recent_meals = Meal.query.filter(
            Meal.user_id == current_user_id,
            Meal.created_at >= week_start
        ).all()
        
        recent_exercises = UserExercise.query.filter(
            UserExercise.user_id == current_user_id,
            UserExercise.completed_at >= week_start
        ).count()
        
        # Gerar recomendações baseadas em padrões
        recommendations = []
        
        # Recomendações nutricionais
        if len(recent_meals) < 14:  # Menos de 2 refeições por dia
            recommendations.append({
                'type': 'nutrition',
                'title': 'Registre mais refeições',
                'description': 'Tente registrar pelo menos 3 refeições por dia para um acompanhamento mais preciso.',
                'priority': 'high',
                'action': 'log_meal'
            })
        
        avg_health_score = sum(meal.health_score or 0 for meal in recent_meals) / len(recent_meals) if recent_meals else 0
        if avg_health_score < 70:
            recommendations.append({
                'type': 'nutrition',
                'title': 'Melhore a qualidade das refeições',
                'description': 'Adicione mais vegetais e reduza alimentos processados para melhorar sua pontuação nutricional.',
                'priority': 'medium',
                'action': 'improve_diet'
            })
        
        # Recomendações de exercícios
        if recent_exercises < 3:
            recommendations.append({
                'type': 'fitness',
                'title': 'Aumente a frequência de exercícios',
                'description': 'Tente se exercitar pelo menos 3 vezes por semana para melhores resultados.',
                'priority': 'high',
                'action': 'start_workout'
            })
        
        # Recomendações de metas
        active_goals = Goal.query.filter_by(
            user_id=current_user_id,
            status=GoalStatus.ACTIVE
        ).count()
        
        if active_goals == 0:
            recommendations.append({
                'type': 'goals',
                'title': 'Defina suas metas',
                'description': 'Estabeleça objetivos claros para manter-se motivado em sua jornada de saúde.',
                'priority': 'medium',
                'action': 'create_goal'
            })
        
        # Recomendações personalizadas baseadas no perfil
        if user.profile and user.profile.target_weight and user.profile.current_weight:
            if user.profile.current_weight > user.profile.target_weight:
                recommendations.append({
                    'type': 'lifestyle',
                    'title': 'Foque na perda de peso',
                    'description': 'Combine exercícios cardiovasculares com uma dieta balanceada para atingir seu peso ideal.',
                    'priority': 'high',
                    'action': 'weight_loss_plan'
                })
        
        return jsonify({
            'recommendations': recommendations,
            'total': len(recommendations),
            'generated_at': datetime.now(timezone.utc).isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

