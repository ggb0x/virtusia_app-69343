from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime, timezone
import enum

db = SQLAlchemy()
bcrypt = Bcrypt()

class ActivityLevel(enum.Enum):
    SEDENTARY = "sedentary"
    LIGHTLY_ACTIVE = "lightly_active"
    MODERATELY_ACTIVE = "moderately_active"
    VERY_ACTIVE = "very_active"
    EXTREMELY_ACTIVE = "extremely_active"

class Gender(enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=True)
    gender = db.Column(db.Enum(Gender), nullable=True)
    height = db.Column(db.Float, nullable=True)  # em centímetros
    activity_level = db.Column(db.Enum(ActivityLevel), default=ActivityLevel.MODERATELY_ACTIVE)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relacionamentos
    profile = db.relationship('UserProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    meals = db.relationship('Meal', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    user_exercises = db.relationship('UserExercise', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    goals = db.relationship('Goal', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    body_measurements = db.relationship('BodyMeasurement', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    recommendations = db.relationship('Recommendation', backref='user', lazy='dynamic', cascade='all, delete-orphan')

    def set_password(self, password):
        """Hash e define a senha do usuário"""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """Verifica se a senha fornecida está correta"""
        return bcrypt.check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.email}>'

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender.value if self.gender else None,
            'height': self.height,
            'activity_level': self.activity_level.value,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class UserProfile(db.Model):
    __tablename__ = 'user_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    current_weight = db.Column(db.Float, nullable=True)  # em kg
    target_weight = db.Column(db.Float, nullable=True)   # em kg
    daily_calorie_goal = db.Column(db.Integer, nullable=True)
    dietary_restrictions = db.Column(db.Text, nullable=True)  # JSON string
    fitness_goals = db.Column(db.Text, nullable=True)  # JSON string
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'current_weight': self.current_weight,
            'target_weight': self.target_weight,
            'daily_calorie_goal': self.daily_calorie_goal,
            'dietary_restrictions': self.dietary_restrictions,
            'fitness_goals': self.fitness_goals,
            'updated_at': self.updated_at.isoformat()
        }

