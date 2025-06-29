from src.models.user import db
from datetime import datetime, timezone
import enum

class DifficultyLevel(enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class Exercise(db.Model):
    __tablename__ = 'exercises'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    muscle_groups = db.Column(db.Text, nullable=True)  # JSON string com grupos musculares
    difficulty_level = db.Column(db.Enum(DifficultyLevel), nullable=False, index=True)
    calories_per_minute = db.Column(db.Float, nullable=True)
    instructions = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relacionamentos
    user_exercises = db.relationship('UserExercise', backref='exercise', lazy='dynamic')

    def __repr__(self):
        return f'<Exercise {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'muscle_groups': self.muscle_groups,
            'difficulty_level': self.difficulty_level.value,
            'calories_per_minute': self.calories_per_minute,
            'instructions': self.instructions,
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat()
        }

class UserExercise(db.Model):
    __tablename__ = 'user_exercises'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercises.id'), nullable=False, index=True)
    duration_minutes = db.Column(db.Float, nullable=True)
    sets = db.Column(db.Integer, nullable=True)
    reps = db.Column(db.Integer, nullable=True)
    calories_burned = db.Column(db.Float, nullable=True)
    completed_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    notes = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f'<UserExercise {self.user_id}-{self.exercise_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'exercise_id': self.exercise_id,
            'exercise': self.exercise.to_dict() if self.exercise else None,
            'duration_minutes': self.duration_minutes,
            'sets': self.sets,
            'reps': self.reps,
            'calories_burned': self.calories_burned,
            'completed_at': self.completed_at.isoformat(),
            'notes': self.notes
        }

