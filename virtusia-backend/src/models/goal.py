from src.models.user import db
from datetime import datetime, timezone
import enum

class GoalType(enum.Enum):
    WEIGHT_LOSS = "weight_loss"
    MUSCLE_GAIN = "muscle_gain"
    MAINTENANCE = "maintenance"
    FITNESS_IMPROVEMENT = "fitness_improvement"
    NUTRITION_IMPROVEMENT = "nutrition_improvement"

class GoalStatus(enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    PAUSED = "paused"
    CANCELLED = "cancelled"

class Goal(db.Model):
    __tablename__ = 'goals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    goal_type = db.Column(db.Enum(GoalType), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    target_value = db.Column(db.Float, nullable=True)  # valor alvo (ex: peso, % gordura)
    current_value = db.Column(db.Float, nullable=True)  # valor atual
    unit = db.Column(db.String(20), nullable=True)  # unidade (kg, %, etc.)
    target_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.Enum(GoalStatus), default=GoalStatus.ACTIVE, index=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<Goal {self.title}>'

    def calculate_progress_percentage(self):
        """Calcula a porcentagem de progresso da meta"""
        if not self.target_value or not self.current_value:
            return 0
        
        if self.goal_type == GoalType.WEIGHT_LOSS:
            # Para perda de peso, progresso é baseado na diferença
            initial_value = self.target_value + (self.target_value - self.current_value)
            progress = (initial_value - self.current_value) / (initial_value - self.target_value)
        else:
            # Para outros tipos, progresso é direto
            progress = self.current_value / self.target_value
        
        return min(100, max(0, progress * 100))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'goal_type': self.goal_type.value,
            'title': self.title,
            'description': self.description,
            'target_value': self.target_value,
            'current_value': self.current_value,
            'unit': self.unit,
            'target_date': self.target_date.isoformat() if self.target_date else None,
            'status': self.status.value,
            'progress_percentage': self.calculate_progress_percentage(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class BodyMeasurement(db.Model):
    __tablename__ = 'body_measurements'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    weight = db.Column(db.Float, nullable=True)  # em kg
    body_fat_percentage = db.Column(db.Float, nullable=True)  # %
    muscle_mass = db.Column(db.Float, nullable=True)  # em kg
    waist_circumference = db.Column(db.Float, nullable=True)  # em cm
    chest_circumference = db.Column(db.Float, nullable=True)  # em cm
    arm_circumference = db.Column(db.Float, nullable=True)  # em cm
    hip_circumference = db.Column(db.Float, nullable=True)  # em cm
    measured_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    notes = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f'<BodyMeasurement {self.user_id} - {self.measured_at}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'weight': self.weight,
            'body_fat_percentage': self.body_fat_percentage,
            'muscle_mass': self.muscle_mass,
            'waist_circumference': self.waist_circumference,
            'chest_circumference': self.chest_circumference,
            'arm_circumference': self.arm_circumference,
            'hip_circumference': self.hip_circumference,
            'measured_at': self.measured_at.isoformat(),
            'notes': self.notes
        }

