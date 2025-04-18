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

# Outfit management
@app.route('/outfit/add', methods=['POST'])
@login_required
def add_outfit():
    name = request.form.get('name')
    weather_condition = request.form.get('weather_condition')
    weather_temp = float(request.form.get('weather_temp', 25))
    notes = request.form.get('notes', '')
    
    # Get selected items
    items = request.form.getlist('items')
    
    if not items:
        flash('يرجى اختيار قطعة ملابس واحدة على الأقل', 'error')
        return redirect(url_for('index'))
    
    # Create new outfit
    new_outfit = Outfit(
        name=name,
        user_id=current_user.id,
        weather_condition=weather_condition,
        weather_temp=weather_temp,
        notes=notes
    )
    
    db.session.add(new_outfit)
    db.session.commit()
    
    # Add outfit items
    for item_id in items:
        outfit_item = OutfitItem(
            outfit_id=new_outfit.id,
            closet_item_id=item_id
        )
        db.session.add(outfit_item)
    
    db.session.commit()
    
    flash('تمت إضافة الإطلالة بنجاح!', 'success')
    return redirect(url_for('index'))

@app.route('/outfit/<int:outfit_id>')
@login_required
def view_outfit(outfit_id):
    outfit = Outfit.query.get_or_404(outfit_id)
    
    # Check if outfit belongs to current user
    if outfit.user_id != current_user.id:
        flash('غير مصرح بالوصول إلى هذه الإطلالة', 'error')
        return redirect(url_for('index'))
    
    # Create a mapping of closet item IDs to objects for easy lookup in the template
    closet_item_map = {}
    for outfit_item in outfit.items:
        closet_item = ClosetItem.query.get(outfit_item.closet_item_id)
        if closet_item:
            closet_item_map[outfit_item.closet_item_id] = closet_item
    
    return render_template('outfit_details.html', outfit=outfit, closet_item_map=closet_item_map)

@app.route('/outfit/delete/<int:outfit_id>', methods=['POST'])
@login_required
def delete_outfit(outfit_id):
    outfit = Outfit.query.get_or_404(outfit_id)
    
    # Check if outfit belongs to current user
    if outfit.user_id != current_user.id:
        flash('غير مصرح بحذف هذه الإطلالة', 'error')
        return redirect(url_for('index'))
    
    # Delete outfit items first
    OutfitItem.query.filter_by(outfit_id=outfit.id).delete()
    
    # Delete outfit
    db.session.delete(outfit)
    db.session.commit()
    
    flash('تم حذف الإطلالة بنجاح', 'success')
    return redirect(url_for('index'))

@app.route('/outfit/daily')
@login_required
def daily_outfit():
    """Get daily outfit recommendation based on weather"""
    weather_data = get_weather_forecast()
    current_temp = weather_data['today']['temp']
    current_condition = weather_data['today']['condition']
    
    # Try to find matching outfit from user's outfits
    matching_outfits = Outfit.query.filter_by(user_id=current_user.id).all()
    
    # Filter by condition and temperature
    suitable_outfits = []
    for outfit in matching_outfits:
        # Match by condition (if provided)
        condition_match = True
        if outfit.weather_condition and outfit.weather_condition != current_condition:
            # Simple exact match for now
            condition_match = False
        
        # Match by temperature (within 5 degrees)
        temp_match = True
        if outfit.weather_temp:
            temp_diff = abs(outfit.weather_temp - current_temp)
            if temp_diff > 5:  # Within 5 degrees
                temp_match = False
        
        if condition_match and temp_match:
            suitable_outfits.append(outfit)
    
    if suitable_outfits:
        # Return the newest suitable outfit
        outfit = max(suitable_outfits, key=lambda o: o.created_at)
        
        # Format the response
        items = []
        for outfit_item in outfit.items:
            closet_item = ClosetItem.query.get(outfit_item.closet_item_id)
            if closet_item:
                items.append({
                    'id': closet_item.id,
                    'name': closet_item.name,
                    'category': closet_item.category,
                    'image_url': closet_item.image_url,
                })
        
        response = {
            'id': outfit.id,
            'name': outfit.name,
            'weather_condition': outfit.weather_condition,
            'weather_temp': outfit.weather_temp,
            'notes': outfit.notes,
            'items': items
        }
        
        return jsonify({'status': 'success', 'outfit': response})
    
    # If no suitable outfit found, get AI recommendations
    recommendations = get_outfit_recommendations(
        user_id=current_user.id,
        temperature=current_temp,
        weather_condition=current_condition
    )
    
    return jsonify({'status': 'ai_generated', 'outfit': recommendations})

# Suggestions page
@app.route('/suggestions')
def suggestions():
    return render_template('suggestions.html')

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
            # قمصان
            {
                'name': 'قميص كلاسيكي أزرق',
                'category': 'tops',
                'price': 299,
                'image_url': 'https://images.pexels.com/photos/2294342/pexels-photo-2294342.jpeg?auto=compress&cs=tinysrgb&w=600',
                'description': 'قميص كلاسيكي أزرق مناسب للمناسبات الرسمية'
            },
            {
                'name': 'قميص أبيض',
                'category': 'tops',
                'price': 279,
                'image_url': 'https://images.pexels.com/photos/769749/pexels-photo-769749.jpeg?auto=compress&cs=tinysrgb&w=600',
                'description': 'قميص أبيض نقي بتصميم كلاسيكي مناسب لجميع المناسبات'
            },
            {
                'name': 'قميص كاروهات',
                'category': 'tops',
                'price': 249,
                'image_url': 'https://images.pexels.com/photos/6626903/pexels-photo-6626903.jpeg?auto=compress&cs=tinysrgb&w=600',
                'description': 'قميص بنقشة الكاروهات مناسب للإطلالات الكاجوال'
            },
            
            # تيشيرتات 
            {
                'name': 'تيشيرت أسود',
                'category': 'tops',
                'price': 150,
                'image_url': 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=600',
                'description': 'تيشيرت أسود بتصميم بسيط مناسب للإطلالة اليومية'
            },
            {
                'name': 'تيشيرت أبيض',
                'category': 'tops',
                'price': 150,
                'image_url': 'https://images.pexels.com/photos/5384423/pexels-photo-5384423.jpeg?auto=compress&cs=tinysrgb&w=600',
                'description': 'تيشيرت أبيض قطني بقصة مريحة للإطلالات اليومية'
            },
            {
                'name': 'تيشيرت بولو أزرق',
                'category': 'tops',
                'price': 199,
                'image_url': 'https://images.pexels.com/photos/6311387/pexels-photo-6311387.jpeg?auto=compress&cs=tinysrgb&w=600',
                'description': 'تيشيرت بولو بلون أزرق مميز للإطلالات شبه الرسمية'
            },
            
            # بناطيل
            {
                'name': 'بنطال كلاسيكي بيج',
                'category': 'bottoms',
                'price': 349,
                'image_url': 'https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg?auto=compress&cs=tinysrgb&w=600',
                'description': 'بنطال كلاسيكي بيج مناسب للمناسبات الرسمية والعمل'
            },
            {
                'name': 'بنطال جينز أزرق',
                'category': 'bottoms',
                'price': 320,
                'image_url': 'https://images.pexels.com/photos/4252950/pexels-photo-4252950.jpeg?auto=compress&cs=tinysrgb&w=600',
                'description': 'بنطال جينز بلون أزرق كلاسيكي وقصة مريحة'
            },
            {
                'name': 'بنطال رياضي رمادي',
                'category': 'bottoms',
                'price': 180,
                'image_url': 'https://images.pexels.com/photos/6311652/pexels-photo-6311652.jpeg?auto=compress&cs=tinysrgb&w=600',
                'description': 'بنطال رياضي بلون رمادي مناسب للأنشطة الرياضية والراحة'
            },
            {
                'name': 'بنطال كلاسيكي أسود',
                'category': 'bottoms',
                'price': 349,
                'image_url': 'https://images.pexels.com/photos/6764036/pexels-photo-6764036.jpeg?auto=compress&cs=tinysrgb&w=600',
                'description': 'بنطال كلاسيكي أسود أنيق مناسب للمناسبات الرسمية'
            },
            
            # ملابس خارجية
            {
                'name': 'جاكيت جينز',
                'category': 'outerwear',
                'price': 450,
                'image_url': 'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=600',
                'description': 'جاكيت جينز مناسب للطقس المعتدل'
            },
            {
                'name': 'جاكيت جلد أسود',
                'category': 'outerwear',
                'price': 750,
                'image_url': 'https://images.pexels.com/photos/3866555/pexels-photo-3866555.jpeg?auto=compress&cs=tinysrgb&w=600',
                'description': 'جاكيت جلد أنيق باللون الأسود للإطلالة العصرية'
            },
            {
                'name': 'بليزر رمادي',
                'category': 'outerwear',
                'price': 550,
                'image_url': 'https://images.pexels.com/photos/6626878/pexels-photo-6626878.jpeg?auto=compress&cs=tinysrgb&w=600',
                'description': 'بليزر رمادي أنيق مناسب للمناسبات الرسمية والعمل'
            },
            {
                'name': 'معطف طويل',
                'category': 'outerwear',
                'price': 850,
                'image_url': 'https://images.pexels.com/photos/1220757/pexels-photo-1220757.jpeg?auto=compress&cs=tinysrgb&w=600',
                'description': 'معطف طويل أنيق مناسب للطقس البارد والمظهر الرسمي'
            },
            
            # أحذية
            {
                'name': 'حذاء رياضي أبيض',
                'category': 'shoes',
                'price': 399,
                'image_url': 'https://images.pexels.com/photos/19090/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600',
                'description': 'حذاء رياضي أبيض مريح للاستخدام اليومي'
            },
            {
                'name': 'حذاء كلاسيكي أسود',
                'category': 'shoes',
                'price': 499,
                'image_url': 'https://images.pexels.com/photos/267202/pexels-photo-267202.jpeg?auto=compress&cs=tinysrgb&w=600',
                'description': 'حذاء كلاسيكي جلد أنيق مناسب للمناسبات الرسمية'
            },
            {
                'name': 'حذاء كاجوال بني',
                'category': 'shoes',
                'price': 450,
                'image_url': 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=600',
                'description': 'حذاء كاجوال بني بتصميم أنيق يناسب الإطلالات اليومية'
            },
            {
                'name': 'حذاء رياضي أسود',
                'category': 'shoes',
                'price': 420,
                'image_url': 'https://images.pexels.com/photos/2421374/pexels-photo-2421374.jpeg?auto=compress&cs=tinysrgb&w=600',
                'description': 'حذاء رياضي أسود مريح للرياضة والإطلالات العصرية'
            },
            
            # إكسسوارات
            {
                'name': 'ساعة يد كلاسيكية',
                'category': 'accessories',
                'price': 650,
                'image_url': 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=600',
                'description': 'ساعة يد كلاسيكية بحزام جلدي تناسب جميع المناسبات'
            },
            {
                'name': 'نظارة شمسية',
                'category': 'accessories',
                'price': 320,
                'image_url': 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=600',
                'description': 'نظارة شمسية بإطار أسود أنيق للوقاية من الشمس وإكمال إطلالتك'
            },
            {
                'name': 'حزام جلد بني',
                'category': 'accessories',
                'price': 220,
                'image_url': 'https://images.pexels.com/photos/45055/pexels-photo-45055.jpeg?auto=compress&cs=tinysrgb&w=600',
                'description': 'حزام جلد بني أنيق مناسب للإطلالات الرسمية واليومية'
            }
        ]
        
        for product_data in products:
            product = Product(**product_data)
            db.session.add(product)
        
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'تم تهيئة بيانات العرض بنجاح'})
    
    return jsonify({'status': 'skipped', 'message': 'البيانات موجودة بالفعل'})
