import json
import os
from flask import render_template, redirect, url_for, request, flash, jsonify, session
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from app import app, db
from models import User, ClosetItem, Product, Favorite, Outfit, OutfitItem
from ai_styler import get_outfit_recommendations, analyze_clothing_item
from weather import get_weather_forecast

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Home page - shows weather and outfit recommendations
@app.route('/')
def index():
    weather_data = get_weather_forecast()
    return render_template('index.html', weather=weather_data)

# Authentication routes
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password):
            login_user(user)
            flash('تم تسجيل الدخول بنجاح!', 'success')
            return redirect(url_for('index'))
        else:
            flash('فشل تسجيل الدخول، يرجى التحقق من البريد الإلكتروني وكلمة المرور.', 'error')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        
        # Check if username or email already exists
        if User.query.filter_by(username=username).first():
            flash('اسم المستخدم موجود بالفعل.', 'error')
            return redirect(url_for('register'))
        
        if User.query.filter_by(email=email).first():
            flash('البريد الإلكتروني مسجل بالفعل.', 'error')
            return redirect(url_for('register'))
        
        # Create new user
        new_user = User(username=username, email=email)
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        flash('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('تم تسجيل الخروج بنجاح!', 'success')
    return redirect(url_for('index'))

# Profile and user settings
@app.route('/profile')
@login_required
def profile():
    return render_template('profile.html')

# Closet management
@app.route('/closet')
@login_required
def closet():
    closet_items = ClosetItem.query.filter_by(user_id=current_user.id).all()
    return render_template('closet.html', closet_items=closet_items)

@app.route('/closet/add', methods=['POST'])
@login_required
def add_closet_item():
    name = request.form.get('name')
    category = request.form.get('category')
    color = request.form.get('color')
    image_url = request.form.get('image_url')
    
    new_item = ClosetItem(
        name=name,
        category=category,
        color=color,
        image_url=image_url,
        user_id=current_user.id
    )
    
    db.session.add(new_item)
    db.session.commit()
    
    # Analyze the item with AI for better recommendations
    analyze_clothing_item(new_item.id)
    
    flash('تمت إضافة القطعة إلى خزانة ملابسك!', 'success')
    return redirect(url_for('closet'))

@app.route('/closet/delete/<int:item_id>', methods=['POST'])
@login_required
def delete_closet_item(item_id):
    item = ClosetItem.query.get_or_404(item_id)
    
    if item.user_id != current_user.id:
        flash('غير مصرح بهذا الإجراء.', 'error')
        return redirect(url_for('closet'))
    
    db.session.delete(item)
    db.session.commit()
    
    flash('تم حذف القطعة من خزانة ملابسك.', 'success')
    return redirect(url_for('closet'))

# Shopping features
@app.route('/shopping')
def shopping():
    products = Product.query.all()
    favorites = []
    
    if current_user.is_authenticated:
        favorite_ids = [f.product_id for f in Favorite.query.filter_by(user_id=current_user.id).all()]
        favorites = favorite_ids
    
    return render_template('shopping.html', products=products, favorites=favorites)

@app.route('/shopping/favorites', methods=['POST'])
@login_required
def toggle_favorite():
    product_id = request.form.get('product_id')
    
    # Check if already favorited
    existing_favorite = Favorite.query.filter_by(
        user_id=current_user.id, 
        product_id=product_id
    ).first()
    
    if existing_favorite:
        db.session.delete(existing_favorite)
        db.session.commit()
        return jsonify({'status': 'removed'})
    else:
        new_favorite = Favorite(user_id=current_user.id, product_id=product_id)
        db.session.add(new_favorite)
        db.session.commit()
        return jsonify({'status': 'added'})

# Outfit recommendations
@app.route('/recommendations')
@login_required
def recommendations():
    weather_data = get_weather_forecast()
    
    # Get AI-powered outfit recommendations
    recommendations = get_outfit_recommendations(
        user_id=current_user.id,
        temperature=weather_data['today']['temp'],
        weather_condition=weather_data['today']['condition']
    )
    
    return jsonify(recommendations)

# API endpoint for product recommendations
@app.route('/api/product_recommendations')
@login_required
def product_recommendations():
    # Simulate product recommendations
    # In a real implementation, this would use AI to suggest products
    sample_products = Product.query.limit(5).all()
    recommendations = []
    
    for product in sample_products:
        recommendations.append({
            'id': product.id,
            'name': product.name,
            'image_url': product.image_url,
            'price': product.price
        })
    
    return jsonify(recommendations)

# Initialize sample product data for demo
@app.route('/initialize_demo_data')
def initialize_demo_data():
    # Only initialize if no products exist
    if Product.query.count() == 0:
        products = [
            {
                'name': 'قميص كلاسيكي أزرق',
                'category': 'tops',
                'price': 299,
                'image_url': 'https://images.unsplash.com/photo-1525383666937-f1090096ca3a',
                'description': 'قميص كلاسيكي أزرق مناسب للمناسبات الرسمية'
            },
            {
                'name': 'بنطال كلاسيكي بيج',
                'category': 'bottoms',
                'price': 349,
                'image_url': 'https://images.unsplash.com/photo-1565191262855-2e6c531f3867',
                'description': 'بنطال كلاسيكي بيج مناسب للمناسبات الرسمية والعمل'
            },
            {
                'name': 'تيشيرت أسود',
                'category': 'tops',
                'price': 150,
                'image_url': 'https://images.unsplash.com/photo-1523194258983-4ef0203f0c47',
                'description': 'تيشيرت أسود بتصميم بسيط مناسب للإطلالة اليومية'
            },
            {
                'name': 'جاكيت جينز',
                'category': 'outerwear',
                'price': 450,
                'image_url': 'https://images.unsplash.com/photo-1581922730118-2c9bcc450def',
                'description': 'جاكيت جينز مناسب للطقس المعتدل'
            },
            {
                'name': 'حذاء رياضي أبيض',
                'category': 'shoes',
                'price': 399,
                'image_url': 'https://images.unsplash.com/photo-1545312981-de7f4d7cb816',
                'description': 'حذاء رياضي أبيض مريح للاستخدام اليومي'
            }
        ]
        
        for product_data in products:
            product = Product(**product_data)
            db.session.add(product)
        
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'تم تهيئة بيانات العرض بنجاح'})
    
    return jsonify({'status': 'skipped', 'message': 'البيانات موجودة بالفعل'})
