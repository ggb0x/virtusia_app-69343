from src.models.user import db
from datetime import datetime, timezone
import enum

class RecommendationType(enum.Enum):
    MEAL = "meal"
    EXERCISE = "exercise"
    GOAL = "goal"
    NUTRITION = "nutrition"
    LIFESTYLE = "lifestyle"

class RecommendationStatus(enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"

class Recommendation(db.Model):
    __tablename__ = 'recommendations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    recommendation_type = db.Column(db.Enum(RecommendationType), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    ai_confidence_score = db.Column(db.Float, nullable=True)  # 0-1
    status = db.Column(db.Enum(RecommendationStatus), default=RecommendationStatus.PENDING, index=True)
    extra_data = db.Column(db.Text, nullable=True)  # JSON string com dados adicionais
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    expires_at = db.Column(db.DateTime, nullable=True)
    user_feedback = db.Column(db.Text, nullable=True)
    user_rating = db.Column(db.Integer, nullable=True)  # 1-5

    def __repr__(self):
        return f'<Recommendation {self.title}>'

    def is_expired(self):
        """Verifica se a recomendação expirou"""
        if not self.expires_at:
            return False
        return datetime.now(timezone.utc) > self.expires_at

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'recommendation_type': self.recommendation_type.value,
            'title': self.title,
            'content': self.content,
            'ai_confidence_score': self.ai_confidence_score,
            'status': self.status.value,
            'extra_data': self.extra_data,
            'created_at': self.created_at.isoformat(),
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'user_feedback': self.user_feedback,
            'user_rating': self.user_rating,
            'is_expired': self.is_expired()
        }

