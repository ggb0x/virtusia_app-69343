from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone, date, timedelta
import json

from src.models.user import db, User
from src.models.goal import Goal, BodyMeasurement, GoalType, GoalStatus

goals_bp = Blueprint('goals', __name__)

@goals_bp.route('/', methods=['GET'])
@jwt_required()
def get_goals():
    """Lista metas do usuário"""
    try:
        current_user_id = get_jwt_identity()
        
        # Parâmetros de consulta
        status = request.args.get('status')
        goal_type = request.args.get('goal_type')
        limit = int(request.args.get('limit', 20))
        offset = int(request.args.get('offset', 0))
        
        # Construir query
        query = Goal.query.filter_by(user_id=current_user_id)
        
        # Filtros opcionais
        if status:
            try:
                status_enum = GoalStatus(status)
                query = query.filter_by(status=status_enum)
            except ValueError:
                return jsonify({'message': 'Status inválido'}), 400
        
        if goal_type:
            try:
                goal_type_enum = GoalType(goal_type)
                query = query.filter_by(goal_type=goal_type_enum)
            except ValueError:
                return jsonify({'message': 'Tipo de meta inválido'}), 400
        
        # Ordenar por data de criação (mais recente primeiro)
        query = query.order_by(Goal.created_at.desc())
        
        # Paginação
        goals = query.offset(offset).limit(limit).all()
        total = query.count()
        
        return jsonify({
            'goals': [goal.to_dict() for goal in goals],
            'total': total,
            'limit': limit,
            'offset': offset
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@goals_bp.route('/', methods=['POST'])
@jwt_required()
def create_goal():
    """Cria uma nova meta"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validar dados obrigatórios
        required_fields = ['goal_type', 'title']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'Campo {field} é obrigatório'}), 400
        
        # Validar tipo de meta
        try:
            goal_type_enum = GoalType(data['goal_type'])
        except ValueError:
            return jsonify({'message': 'Tipo de meta inválido'}), 400
        
        # Validar data alvo se fornecida
        target_date = None
        if data.get('target_date'):
            try:
                target_date = datetime.strptime(data['target_date'], '%Y-%m-%d').date()
                if target_date <= date.today():
                    return jsonify({'message': 'Data alvo deve ser futura'}), 400
            except ValueError:
                return jsonify({'message': 'Data alvo inválida. Use formato YYYY-MM-DD'}), 400
        
        # Criar meta
        goal = Goal(
            user_id=current_user_id,
            goal_type=goal_type_enum,
            title=data['title'],
            description=data.get('description'),
            target_value=data.get('target_value'),
            current_value=data.get('current_value', 0),
            unit=data.get('unit'),
            target_date=target_date
        )
        
        db.session.add(goal)
        db.session.commit()
        
        return jsonify({
            'message': 'Meta criada com sucesso',
            'goal': goal.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@goals_bp.route('/<int:goal_id>', methods=['GET'])
@jwt_required()
def get_goal(goal_id):
    """Obtém detalhes de uma meta específica"""
    try:
        current_user_id = get_jwt_identity()
        
        goal = Goal.query.filter_by(id=goal_id, user_id=current_user_id).first()
        if not goal:
            return jsonify({'message': 'Meta não encontrada'}), 404
        
        return jsonify({'goal': goal.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@goals_bp.route('/<int:goal_id>', methods=['PUT'])
@jwt_required()
def update_goal(goal_id):
    """Atualiza uma meta"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        goal = Goal.query.filter_by(id=goal_id, user_id=current_user_id).first()
        if not goal:
            return jsonify({'message': 'Meta não encontrada'}), 404
        
        # Atualizar campos permitidos
        if 'title' in data:
            goal.title = data['title']
        if 'description' in data:
            goal.description = data['description']
        if 'target_value' in data:
            goal.target_value = data['target_value']
        if 'current_value' in data:
            goal.current_value = data['current_value']
        if 'unit' in data:
            goal.unit = data['unit']
        if 'status' in data:
            try:
                goal.status = GoalStatus(data['status'])
            except ValueError:
                return jsonify({'message': 'Status inválido'}), 400
        
        if 'target_date' in data:
            if data['target_date']:
                try:
                    target_date = datetime.strptime(data['target_date'], '%Y-%m-%d').date()
                    if target_date <= date.today() and goal.status == GoalStatus.ACTIVE:
                        return jsonify({'message': 'Data alvo deve ser futura para metas ativas'}), 400
                    goal.target_date = target_date
                except ValueError:
                    return jsonify({'message': 'Data alvo inválida. Use formato YYYY-MM-DD'}), 400
            else:
                goal.target_date = None
        
        goal.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        
        return jsonify({
            'message': 'Meta atualizada com sucesso',
            'goal': goal.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@goals_bp.route('/<int:goal_id>', methods=['DELETE'])
@jwt_required()
def delete_goal(goal_id):
    """Exclui uma meta"""
    try:
        current_user_id = get_jwt_identity()
        
        goal = Goal.query.filter_by(id=goal_id, user_id=current_user_id).first()
        if not goal:
            return jsonify({'message': 'Meta não encontrada'}), 404
        
        db.session.delete(goal)
        db.session.commit()
        
        return jsonify({'message': 'Meta excluída com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@goals_bp.route('/<int:goal_id>/progress', methods=['GET'])
@jwt_required()
def get_goal_progress(goal_id):
    """Obtém progresso detalhado de uma meta"""
    try:
        current_user_id = get_jwt_identity()
        
        goal = Goal.query.filter_by(id=goal_id, user_id=current_user_id).first()
        if not goal:
            return jsonify({'message': 'Meta não encontrada'}), 404
        
        # Calcular progresso
        progress_percentage = goal.calculate_progress_percentage()
        
        # Calcular dias restantes
        days_remaining = None
        if goal.target_date:
            days_remaining = (goal.target_date - date.today()).days
        
        # Histórico de progresso (simulado - em implementação real seria baseado em medidas corporais)
        progress_history = []
        if goal.goal_type == GoalType.WEIGHT_LOSS and goal.target_value and goal.current_value:
            # Simular progresso semanal
            start_date = goal.created_at.date()
            current_date = date.today()
            weeks_passed = (current_date - start_date).days // 7
            
            initial_weight = goal.target_value + (goal.target_value - goal.current_value)
            weight_loss_per_week = (initial_weight - goal.current_value) / max(weeks_passed, 1)
            
            for week in range(min(weeks_passed + 1, 12)):  # Máximo 12 semanas
                week_date = start_date + timedelta(weeks=week)
                week_weight = initial_weight - (weight_loss_per_week * week)
                progress_history.append({
                    'date': week_date.isoformat(),
                    'value': round(week_weight, 1),
                    'week': week + 1
                })
        
        return jsonify({
            'goal': goal.to_dict(),
            'progress': {
                'percentage': progress_percentage,
                'days_remaining': days_remaining,
                'is_on_track': progress_percentage >= 50 if days_remaining and days_remaining > 0 else None,
                'history': progress_history
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@goals_bp.route('/measurements', methods=['POST'])
@jwt_required()
def add_body_measurement():
    """Adiciona uma nova medida corporal"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Criar medida corporal
        measurement = BodyMeasurement(
            user_id=current_user_id,
            weight=data.get('weight'),
            body_fat_percentage=data.get('body_fat_percentage'),
            muscle_mass=data.get('muscle_mass'),
            waist_circumference=data.get('waist_circumference'),
            chest_circumference=data.get('chest_circumference'),
            arm_circumference=data.get('arm_circumference'),
            hip_circumference=data.get('hip_circumference'),
            notes=data.get('notes')
        )
        
        db.session.add(measurement)
        
        # Atualizar metas relacionadas ao peso
        if measurement.weight:
            weight_goals = Goal.query.filter_by(
                user_id=current_user_id,
                goal_type=GoalType.WEIGHT_LOSS,
                status=GoalStatus.ACTIVE
            ).all()
            
            for goal in weight_goals:
                goal.current_value = measurement.weight
                goal.updated_at = datetime.now(timezone.utc)
                
                # Verificar se meta foi atingida
                if goal.target_value and measurement.weight <= goal.target_value:
                    goal.status = GoalStatus.COMPLETED
        
        db.session.commit()
        
        return jsonify({
            'message': 'Medida corporal adicionada com sucesso',
            'measurement': measurement.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@goals_bp.route('/measurements', methods=['GET'])
@jwt_required()
def get_body_measurements():
    """Obtém histórico de medidas corporais"""
    try:
        current_user_id = get_jwt_identity()
        
        # Parâmetros de consulta
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        measurement_type = request.args.get('measurement_type')
        limit = int(request.args.get('limit', 20))
        offset = int(request.args.get('offset', 0))
        
        # Construir query
        query = BodyMeasurement.query.filter_by(user_id=current_user_id)
        
        # Filtros opcionais
        if date_from:
            try:
                date_from_obj = datetime.strptime(date_from, '%Y-%m-%d').date()
                query = query.filter(BodyMeasurement.measured_at >= date_from_obj)
            except ValueError:
                return jsonify({'message': 'Data inicial inválida. Use formato YYYY-MM-DD'}), 400
        
        if date_to:
            try:
                date_to_obj = datetime.strptime(date_to, '%Y-%m-%d').date()
                query = query.filter(BodyMeasurement.measured_at <= date_to_obj)
            except ValueError:
                return jsonify({'message': 'Data final inválida. Use formato YYYY-MM-DD'}), 400
        
        # Ordenar por data (mais recente primeiro)
        query = query.order_by(BodyMeasurement.measured_at.desc())
        
        # Paginação
        measurements = query.offset(offset).limit(limit).all()
        total = query.count()
        
        return jsonify({
            'measurements': [measurement.to_dict() for measurement in measurements],
            'total': total,
            'limit': limit,
            'offset': offset
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@goals_bp.route('/measurements/trends', methods=['GET'])
@jwt_required()
def get_measurement_trends():
    """Obtém análise de tendências das medidas corporais"""
    try:
        current_user_id = get_jwt_identity()
        
        # Buscar medidas dos últimos 3 meses
        three_months_ago = date.today() - timedelta(days=90)
        measurements = BodyMeasurement.query.filter(
            BodyMeasurement.user_id == current_user_id,
            BodyMeasurement.measured_at >= three_months_ago
        ).order_by(BodyMeasurement.measured_at).all()
        
        if not measurements:
            return jsonify({
                'message': 'Nenhuma medida encontrada nos últimos 3 meses',
                'trends': {}
            }), 200
        
        # Calcular tendências
        trends = {}
        
        # Peso
        weights = [m.weight for m in measurements if m.weight]
        if len(weights) >= 2:
            weight_change = weights[-1] - weights[0]
            trends['weight'] = {
                'current': weights[-1],
                'initial': weights[0],
                'change': weight_change,
                'trend': 'decreasing' if weight_change < 0 else 'increasing' if weight_change > 0 else 'stable',
                'data_points': len(weights)
            }
        
        # Percentual de gordura
        body_fats = [m.body_fat_percentage for m in measurements if m.body_fat_percentage]
        if len(body_fats) >= 2:
            bf_change = body_fats[-1] - body_fats[0]
            trends['body_fat'] = {
                'current': body_fats[-1],
                'initial': body_fats[0],
                'change': bf_change,
                'trend': 'decreasing' if bf_change < 0 else 'increasing' if bf_change > 0 else 'stable',
                'data_points': len(body_fats)
            }
        
        # Massa muscular
        muscle_masses = [m.muscle_mass for m in measurements if m.muscle_mass]
        if len(muscle_masses) >= 2:
            mm_change = muscle_masses[-1] - muscle_masses[0]
            trends['muscle_mass'] = {
                'current': muscle_masses[-1],
                'initial': muscle_masses[0],
                'change': mm_change,
                'trend': 'increasing' if mm_change > 0 else 'decreasing' if mm_change < 0 else 'stable',
                'data_points': len(muscle_masses)
            }
        
        return jsonify({
            'period': '3 months',
            'total_measurements': len(measurements),
            'trends': trends
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

