from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timezone
import re

from src.models.user import db, User, UserProfile, Gender, ActivityLevel

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    """Valida formato do email"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Valida força da senha"""
    if len(password) < 8:
        return False, "Senha deve ter pelo menos 8 caracteres"
    if not re.search(r'[A-Z]', password):
        return False, "Senha deve conter pelo menos uma letra maiúscula"
    if not re.search(r'[a-z]', password):
        return False, "Senha deve conter pelo menos uma letra minúscula"
    if not re.search(r'\d', password):
        return False, "Senha deve conter pelo menos um número"
    return True, "Senha válida"

@auth_bp.route('/register', methods=['POST'])
def register():
    """Registra um novo usuário"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        required_fields = ['email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'Campo {field} é obrigatório'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        first_name = data['first_name'].strip()
        last_name = data['last_name'].strip()
        
        # Validar email
        if not validate_email(email):
            return jsonify({'message': 'Email inválido'}), 400
        
        # Validar senha
        is_valid, message = validate_password(password)
        if not is_valid:
            return jsonify({'message': message}), 400
        
        # Verificar se usuário já existe
        if User.query.filter_by(email=email).first():
            return jsonify({'message': 'Email já cadastrado'}), 409
        
        # Criar novo usuário
        user = User(
            email=email,
            first_name=first_name,
            last_name=last_name
        )
        user.set_password(password)
        
        # Dados opcionais
        if data.get('date_of_birth'):
            try:
                user.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'message': 'Data de nascimento inválida. Use formato YYYY-MM-DD'}), 400
        
        if data.get('gender'):
            try:
                user.gender = Gender(data['gender'])
            except ValueError:
                return jsonify({'message': 'Gênero inválido'}), 400
        
        if data.get('height'):
            user.height = float(data['height'])
        
        if data.get('activity_level'):
            try:
                user.activity_level = ActivityLevel(data['activity_level'])
            except ValueError:
                return jsonify({'message': 'Nível de atividade inválido'}), 400
        
        db.session.add(user)
        db.session.flush()  # Para obter o ID do usuário
        
        # Criar perfil do usuário
        profile = UserProfile(user_id=user.id)
        if data.get('current_weight'):
            profile.current_weight = float(data['current_weight'])
        if data.get('target_weight'):
            profile.target_weight = float(data['target_weight'])
        if data.get('daily_calorie_goal'):
            profile.daily_calorie_goal = int(data['daily_calorie_goal'])
        
        db.session.add(profile)
        db.session.commit()
        
        # Criar tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'message': 'Usuário criado com sucesso',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Autentica um usuário"""
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Email e senha são obrigatórios'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Buscar usuário
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({'message': 'Email ou senha incorretos'}), 401
        
        # Criar tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'message': 'Login realizado com sucesso',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Renova o token de acesso"""
    try:
        current_user_id = get_jwt_identity()
        
        # Verificar se usuário ainda existe
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'message': 'Usuário não encontrado'}), 404
        
        # Criar novo token de acesso
        access_token = create_access_token(identity=current_user_id)
        
        return jsonify({
            'access_token': access_token
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout do usuário (invalidação do token seria implementada com Redis)"""
    try:
        # Em uma implementação completa, adicionaríamos o token a uma blacklist no Redis
        # Por enquanto, apenas retornamos sucesso
        return jsonify({'message': 'Logout realizado com sucesso'}), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Retorna informações do usuário autenticado"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'message': 'Usuário não encontrado'}), 404
        
        user_data = user.to_dict()
        
        # Incluir dados do perfil se existir
        if user.profile:
            user_data['profile'] = user.profile.to_dict()
        
        return jsonify({'user': user_data}), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Altera a senha do usuário"""
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'message': 'Senha atual e nova senha são obrigatórias'}), 400
        
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'message': 'Usuário não encontrado'}), 404
        
        # Verificar senha atual
        if not user.check_password(data['current_password']):
            return jsonify({'message': 'Senha atual incorreta'}), 401
        
        # Validar nova senha
        is_valid, message = validate_password(data['new_password'])
        if not is_valid:
            return jsonify({'message': message}), 400
        
        # Atualizar senha
        user.set_password(data['new_password'])
        user.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        
        return jsonify({'message': 'Senha alterada com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

