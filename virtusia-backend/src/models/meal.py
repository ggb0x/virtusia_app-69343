from src.models.user import db
from datetime import datetime, timezone
import enum

class MealType(enum.Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"

class Meal(db.Model):
    __tablename__ = 'meals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    image_url = db.Column(db.String(255), nullable=True)
    meal_type = db.Column(db.Enum(MealType), nullable=False, index=True)
    total_calories = db.Column(db.Float, nullable=True)
    total_protein = db.Column(db.Float, nullable=True)  # em gramas
    total_carbs = db.Column(db.Float, nullable=True)    # em gramas
    total_fat = db.Column(db.Float, nullable=True)      # em gramas
    total_fiber = db.Column(db.Float, nullable=True)    # em gramas
    ai_analysis_result = db.Column(db.Text, nullable=True)  # JSON string
    health_score = db.Column(db.Float, nullable=True)  # 0-100
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    # Relacionamentos
    meal_foods = db.relationship('MealFood', backref='meal', lazy='dynamic', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Meal {self.id} - {self.meal_type.value}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'image_url': self.image_url,
            'meal_type': self.meal_type.value,
            'total_calories': self.total_calories,
            'total_protein': self.total_protein,
            'total_carbs': self.total_carbs,
            'total_fat': self.total_fat,
            'total_fiber': self.total_fiber,
            'ai_analysis_result': self.ai_analysis_result,
            'health_score': self.health_score,
            'created_at': self.created_at.isoformat(),
            'foods': [meal_food.to_dict() for meal_food in self.meal_foods]
        }

class Food(db.Model):
    __tablename__ = 'foods'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, index=True)
    calories_per_100g = db.Column(db.Float, nullable=False)
    protein_per_100g = db.Column(db.Float, nullable=False)
    carbs_per_100g = db.Column(db.Float, nullable=False)
    fat_per_100g = db.Column(db.Float, nullable=False)
    fiber_per_100g = db.Column(db.Float, nullable=True)
    source_api = db.Column(db.String(50), nullable=True)  # 'fatsecret', 'taco', etc.
    external_id = db.Column(db.String(100), nullable=True)  # ID na API externa
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relacionamentos
    meal_foods = db.relationship('MealFood', backref='food', lazy='dynamic')

    def __repr__(self):
        return f'<Food {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'calories_per_100g': self.calories_per_100g,
            'protein_per_100g': self.protein_per_100g,
            'carbs_per_100g': self.carbs_per_100g,
            'fat_per_100g': self.fat_per_100g,
            'fiber_per_100g': self.fiber_per_100g,
            'source_api': self.source_api,
            'external_id': self.external_id
        }

class MealFood(db.Model):
    __tablename__ = 'meal_foods'
    
    id = db.Column(db.Integer, primary_key=True)
    meal_id = db.Column(db.Integer, db.ForeignKey('meals.id'), nullable=False, index=True)
    food_id = db.Column(db.Integer, db.ForeignKey('foods.id'), nullable=False, index=True)
    quantity = db.Column(db.Float, nullable=False)  # quantidade em gramas
    unit = db.Column(db.String(20), default='g')    # unidade (g, ml, unidade, etc.)

    def __repr__(self):
        return f'<MealFood {self.meal_id}-{self.food_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'meal_id': self.meal_id,
            'food_id': self.food_id,
            'food': self.food.to_dict() if self.food else None,
            'quantity': self.quantity,
            'unit': self.unit,
            'calculated_calories': (self.food.calories_per_100g * self.quantity / 100) if self.food else 0,
            'calculated_protein': (self.food.protein_per_100g * self.quantity / 100) if self.food else 0,
            'calculated_carbs': (self.food.carbs_per_100g * self.quantity / 100) if self.food else 0,
            'calculated_fat': (self.food.fat_per_100g * self.quantity / 100) if self.food else 0
        }

