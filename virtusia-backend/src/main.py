import os
import sys
from datetime import timedelta
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

def create_app():
    app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
    
    # Configurações
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'virtusia-secret-key-2024')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-virtusia')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
    
    # Configuração do banco de dados
    database_url = os.environ.get("DATABASE_URL")
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Importar e inicializar extensões
    from src.models.user import db, bcrypt
    db.init_app(app)
    bcrypt.init_app(app)
    jwt = JWTManager(app)
    
    # Configurar 
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)    
    # Importar blueprints
    from src.routes.user import user_bp
    from src.routes.auth import auth_bp
    from src.routes.meals import meals_bp
    from src.routes.exercises import exercises_bp
    from src.routes.goals import goals_bp
    from src.routes.ai import ai_bp
    
    # Registrar blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(meals_bp, url_prefix='/api/meals')
    app.register_blueprint(exercises_bp, url_prefix='/api/exercises')
    app.register_blueprint(goals_bp, url_prefix='/api/goals')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    
    # Criar tabelas do banco de dados
    with app.app_context():
        # Importar todos os modelos para garantir que as tabelas sejam criadas
        from src.models.meal import Meal, Food, MealFood
        from src.models.exercise import Exercise, UserExercise
        from src.models.goal import Goal, BodyMeasurement
        from src.models.recommendation import Recommendation
        
        db.create_all()
        
        # Criar dados iniciais se necessário
        create_initial_data()
    
    # Handler para tokens JWT expirados
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'message': 'Token expirado'}), 401
    
    # Handler para tokens JWT inválidos
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'message': 'Token inválido'}), 401
    
    # Handler para tokens JWT ausentes
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'message': 'Token de autorização necessário'}), 401
    
    # Rota para servir arquivos estáticos
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        static_folder_path = app.static_folder
        if static_folder_path is None:
            return "Static folder not configured", 404

        if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
            return send_from_directory(static_folder_path, path)
        else:
            index_path = os.path.join(static_folder_path, 'index.html')
            if os.path.exists(index_path):
                return send_from_directory(static_folder_path, 'index.html')
            else:
                return jsonify({'message': 'Virtusia API está funcionando!', 'version': '1.0.0'}), 200
    
    # Rota de health check
    @app.route('/api/health')
    def health_check():
        return jsonify({'status': 'healthy', 'message': 'Virtusia API está funcionando!'}), 200
    
    return app

def create_initial_data():
    """Cria dados iniciais no banco de dados"""
    from src.models.exercise import Exercise, DifficultyLevel
    from src.models.user import db
    
    # Verificar se já existem exercícios
    if Exercise.query.count() == 0:
        # Criar exercícios básicos
        exercises = [
            {
                'name': 'Agachamento',
                'description': 'Exercício fundamental para fortalecimento das pernas e glúteos',
                'muscle_groups': '["quadríceps", "glúteos", "isquiotibiais"]',
                'difficulty_level': DifficultyLevel.BEGINNER,
                'calories_per_minute': 8.0,
                'instructions': '1. Fique em pé com os pés afastados na largura dos ombros\n2. Desça como se fosse sentar em uma cadeira\n3. Mantenha o peito ereto e os joelhos alinhados\n4. Retorne à posição inicial'
            },
            {
                'name': 'Flexão de Braço',
                'description': 'Exercício para fortalecimento do peitoral, ombros e tríceps',
                'muscle_groups': '["peitoral", "ombros", "tríceps"]',
                'difficulty_level': DifficultyLevel.BEGINNER,
                'calories_per_minute': 7.0,
                'instructions': '1. Posição de prancha com mãos no chão\n2. Desça o corpo mantendo-o reto\n3. Empurre de volta à posição inicial\n4. Mantenha o core contraído'
            },
            {
                'name': 'Prancha',
                'description': 'Exercício isométrico para fortalecimento do core',
                'muscle_groups': '["core", "ombros", "glúteos"]',
                'difficulty_level': DifficultyLevel.BEGINNER,
                'calories_per_minute': 5.0,
                'instructions': '1. Posição de prancha com antebraços no chão\n2. Mantenha o corpo reto da cabeça aos pés\n3. Contraia o abdômen\n4. Respire normalmente'
            },
            {
                'name': 'Burpee',
                'description': 'Exercício completo que trabalha todo o corpo',
                'muscle_groups': '["corpo todo"]',
                'difficulty_level': DifficultyLevel.INTERMEDIATE,
                'calories_per_minute': 12.0,
                'instructions': '1. Comece em pé\n2. Agache e coloque as mãos no chão\n3. Salte os pés para trás em prancha\n4. Faça uma flexão\n5. Salte os pés de volta\n6. Salte para cima com braços estendidos'
            }
        ]
        
        for exercise_data in exercises:
            exercise = Exercise(
                name=exercise_data['name'],
                description=exercise_data['description'],
                muscle_groups=exercise_data['muscle_groups'],
                difficulty_level=exercise_data['difficulty_level'],
                calories_per_minute=exercise_data['calories_per_minute'],
                instructions=exercise_data['instructions']
            )
            db.session.add(exercise)
        
        db.session.commit()
        print("Exercícios iniciais criados!")

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

