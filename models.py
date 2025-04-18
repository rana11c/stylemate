from datetime import datetime
from app import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    closet_items = db.relationship('ClosetItem', backref='owner', lazy='dynamic')
    favorites = db.relationship('Favorite', backref='user', lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.username}>'

class ClosetItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)  # top, bottom, outerwear, etc.
    color = db.Column(db.String(50))
    image_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    def __repr__(self):
        return f'<ClosetItem {self.name}>'

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(500))
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Product {self.name}>'

class Favorite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Favorite {self.id}>'

class Outfit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    weather_temp = db.Column(db.Float)  # Temperature the outfit is suitable for
    weather_condition = db.Column(db.String(50))  # Sunny, rainy, etc.
    items = db.relationship('OutfitItem', backref='outfit', lazy='dynamic')
    
    def __repr__(self):
        return f'<Outfit {self.name}>'

class OutfitItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    outfit_id = db.Column(db.Integer, db.ForeignKey('outfit.id'), nullable=False)
    closet_item_id = db.Column(db.Integer, db.ForeignKey('closet_item.id'), nullable=False)
    
    def __repr__(self):
        return f'<OutfitItem {self.id}>'
