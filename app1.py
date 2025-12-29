from flask import Flask, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os
import json

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///fara3.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'fara3-fashion-2024-secret-key'

# Initialize Database
db = SQLAlchemy(app)

# =============== DATABASE MODELS ===============
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)  # In production, hash passwords!
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    orders = db.relationship('Order', backref='user', lazy=True, cascade='all, delete-orphan')
    cart_items = db.relationship('CartItem', backref='user', lazy=True, cascade='all, delete-orphan')

class Collection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    display_name = db.Column(db.String(100))
    description = db.Column(db.Text)
    image_url = db.Column(db.String(300))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship with products
    products = db.relationship('Product', backref='collection', lazy=True)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    details = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(300))
    collection_id = db.Column(db.Integer, db.ForeignKey('collection.id'))
    category = db.Column(db.String(100))
    stock = db.Column(db.Integer, default=10)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_featured = db.Column(db.Boolean, default=False)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    order_number = db.Column(db.String(20), unique=True, nullable=False)
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    total_amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50))
    status = db.Column(db.String(20), default='pending')  # pending, processing, shipped, delivered, cancelled
    shipping_address = db.Column(db.Text)
    
    # Relationship
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    product_name = db.Column(db.String(200))
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(300))

class CartItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    product = db.relationship('Product', backref='cart_items')

class ContactMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)

# =============== CREATE DATABASE & SAMPLE DATA ===============
def initialize_database():
    with app.app_context():
        # Create all tables
        db.create_all()
        
        print("✅ Database created successfully!")
        
        # Check if collections already exist
        if Collection.query.count() == 0:
            print("📦 Creating sample collections and products...")
            
            # Create collections
            collections_data = [
                {
                    "name": "minimalist",
                    "display_name": "HOODIES",
                    "description": "Clean lines & neutral tones",
                    "image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80"
                },
                {
                    "name": "streetwear",
                    "display_name": "Streetwear",
                    "description": "Bold prints & urban style",
                    "image_url": "a1111.png"
                },
                {
                    "name": "Pants",
                    "display_name": "PANTS",
                    "description": "Classic and modern pants",
                    "image_url": "abde.jpg"
                },
                {
                    "name": "new arrivals",
                    "display_name": "Sports Wear",
                    "description": "Latest 𝐹𝒶𝓇𝒶`𝟥 designs",
                    "image_url": "sport.jpg"
                },
                {
                    "name": "oversized fit",
                    "display_name": "Oversized Collection",
                    "description": "Loose, trending silhouettes",
                    "image_url": "oversize3.jpg"
                },
                {
                    "name": "summer drop",
                    "display_name": "SHIRTS",
                    "description": "Striped & Smooth",
                    "image_url": "shirt.jpg"
                },
                {
                    "name": "everyday basics",
                    "display_name": "COATS",
                    "description": "MAXI FUR COAT",
                    "image_url": "coat.jpg"
                },
                {
                    "name": "Hats",
                    "display_name": "HATS",
                    "description": "Bold prints & urban style",
                    "image_url": "hats.jpg"
                }
            ]
            
            collections_dict = {}
            for col_data in collections_data:
                collection = Collection(
                    name=col_data['name'],
                    display_name=col_data['display_name'],
                    description=col_data['description'],
                    image_url=col_data['image_url']
                )
                db.session.add(collection)
                db.session.flush()  # Get the ID
                collections_dict[col_data['name']] = collection.id
            
            # Create products based on your JavaScript data
            products_data = [
                # Minimalist Collection (Hoodies)
                {"name": "Black Hoodie", "description": "Clean minimalist design", 
                 "details": "100% premium cotton, available in black, white, and grey.", 
                 "price": 35.00, "image_url": "aaa.jpg", "collection_name": "minimalist", "stock": 25},
                {"name": "White Hoodie", "description": "Basic comfort hoodie", 
                 "details": "Soft fleece interior, ribbed cuffs and hem.", 
                 "price": 45.00, "image_url": "aaaa.jpg", "collection_name": "minimalist", "stock": 20},
                
                # Streetwear Collection
                {"name": "RED Street wear", "description": "Urban street style", 
                 "details": "Bold graphics, relaxed fit.", 
                 "price": 55.00, "image_url": "aaaaa.jpg", "collection_name": "streetwear", "stock": 15},
                {"name": "Black Street Wear", "description": "Streetwear essential", 
                 "details": "Water-resistant material, multiple pockets.", 
                 "price": 50.00, "image_url": "aaaaaa.jpg", "collection_name": "streetwear", "stock": 18},
                
                # Pants Collection
                {"name": "MEN pant", "description": "Cool pants outwear", 
                 "details": "Classic oversized MEN pants", 
                 "price": 60.00, "image_url": "a.pant.jpg", "collection_name": "Pants", "stock": 30},
                {"name": "WOMEN PANTS", "description": "Classic WOMEN PANTS", 
                 "details": "Classic WOMEN PANTS", 
                 "price": 65.00, "image_url": "b.pant.jpg", "collection_name": "Pants", "stock": 28},
                
                # New Arrivals (Sports Wear)
                {"name": "Liverpool T-Shirt", "description": "Latest collection", 
                 "details": "Limited edition design", 
                 "price": 70.00, "image_url": "liver.jpg", "collection_name": "new arrivals", "stock": 12},
                {"name": "Barcelona T-Shirt", "description": "Latest collection", 
                 "details": "Limited edition design", 
                 "price": 70.00, "image_url": "barca.jpg", "collection_name": "new arrivals", "stock": 15},
                
                # Featured Products (Best Sales)
                {"name": "𝐹𝒶𝓇𝒶`𝟥 Classic T-Shirt", "description": "Soft cotton, black or white", 
                 "details": "Premium quality cotton t-shirt", 
                 "price": 55.00, "image_url": "main.png", "is_featured": True, "stock": 50},
                {"name": "𝐹𝒶𝓇𝒶`𝟥 Original Pant", "description": "Bold logo, streetwear fit", 
                 "details": "Original design pants", 
                 "price": 65.00, "image_url": "main2.png", "is_featured": True, "stock": 40}
            ]
            
            for prod_data in products_data:
                product = Product(
                    name=prod_data['name'],
                    description=prod_data['description'],
                    details=prod_data['details'],
                    price=prod_data['price'],
                    image_url=prod_data['image_url'],
                    stock=prod_data.get('stock', 10),
                    is_featured=prod_data.get('is_featured', False)
                )
                
                # Assign to collection if specified
                if 'collection_name' in prod_data and prod_data['collection_name'] in collections_dict:
                    product.collection_id = collections_dict[prod_data['collection_name']]
                
                db.session.add(product)
            
            db.session.commit()
            print(f"✅ Created {Collection.query.count()} collections and {Product.query.count()} products!")
        else:
            print(f"📊 Database already has {Collection.query.count()} collections and {Product.query.count()} products.")

# =============== API ROUTES ===============

@app.route('/')
def home():
    """Home endpoint - API status"""
    return jsonify({
        'app': '𝐹𝒶𝓇𝒶`𝟥 Fashion API',
        'version': '1.0.0',
        'status': 'running',
        'database': 'SQLite',
        'endpoints': {
            'collections': '/api/collections',
            'products': '/api/products',
            'featured': '/api/products/featured',
            'users': '/api/users',
            'auth': '/api/auth/login, /api/auth/register',
            'cart': '/api/cart',
            'orders': '/api/orders',
            'contact': '/api/contact'
        }
    })

# =============== COLLECTIONS API ===============
@app.route('/api/collections', methods=['GET'])
def get_collections():
    """Get all collections"""
    collections = Collection.query.all()
    return jsonify({
        'collections': [{
            'id': col.id,
            'name': col.name,
            'display_name': col.display_name,
            'description': col.description,
            'image_url': col.image_url,
            'product_count': len(col.products)
        } for col in collections]
    })

@app.route('/api/collections/<string:collection_name>', methods=['GET'])
def get_collection_products(collection_name):
    """Get products by collection name"""
    collection = Collection.query.filter_by(name=collection_name).first()
    
    if not collection:
        return jsonify({'error': 'Collection not found'}), 404
    
    products = Product.query.filter_by(collection_id=collection.id).all()
    
    return jsonify({
        'collection': {
            'id': collection.id,
            'name': collection.name,
            'display_name': collection.display_name
        },
        'products': [{
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'details': p.details,
            'price': p.price,
            'image_url': p.image_url,
            'stock': p.stock
        } for p in products]
    })

# =============== PRODUCTS API ===============
@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products with optional filtering"""
    category = request.args.get('category')
    collection = request.args.get('collection')
    featured = request.args.get('featured')
    
    query = Product.query
    
    if category:
        query = query.filter_by(category=category)
    if collection:
        query = query.join(Collection).filter(Collection.name == collection)
    if featured and featured.lower() == 'true':
        query = query.filter_by(is_featured=True)
    
    products = query.all()
    
    return jsonify({
        'products': [{
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'details': p.details,
            'price': p.price,
            'image_url': p.image_url,
            'collection': p.collection.name if p.collection else None,
            'stock': p.stock,
            'is_featured': p.is_featured,
            'created_at': p.created_at.isoformat()
        } for p in products]
    })

@app.route('/api/products/featured', methods=['GET'])
def get_featured_products():
    """Get featured products"""
    products = Product.query.filter_by(is_featured=True).all()
    
    return jsonify({
        'products': [{
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'price': p.price,
            'image_url': p.image_url,
            'stock': p.stock
        } for p in products]
    })

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get single product by ID"""
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    return jsonify({
        'product': {
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'details': product.details,
            'price': product.price,
            'image_url': product.image_url,
            'collection': product.collection.name if product.collection else None,
            'stock': product.stock,
            'is_featured': product.is_featured
        }
    })

# =============== AUTHENTICATION API ===============
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('name') or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Name, email, and password are required'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Create new user
        new_user = User(
            name=data['name'],
            email=data['email'],
            password=data['password']  # In production: hash this password!
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'id': new_user.id,
                'name': new_user.name,
                'email': new_user.email,
                'created_at': new_user.created_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.json
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or user.password != data['password']:  # In production: use password hashing
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Check if user is active
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 403
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'created_at': user.created_at.isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =============== CART API ===============
@app.route('/api/cart', methods=['GET'])
def get_cart():
    """Get user's cart items"""
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    
    return jsonify({
        'cart_items': [{
            'id': item.id,
            'product_id': item.product_id,
            'product_name': item.product.name,
            'product_price': item.product.price,
            'product_image': item.product.image_url,
            'quantity': item.quantity,
            'subtotal': item.quantity * item.product.price
        } for item in cart_items],
        'total': sum(item.quantity * item.product.price for item in cart_items)
    })

@app.route('/api/cart', methods=['POST'])
def add_to_cart():
    """Add item to cart"""
    try:
        data = request.json
        
        if not data.get('user_id') or not data.get('product_id'):
            return jsonify({'error': 'User ID and Product ID are required'}), 400
        
        # Check if product exists
        product = Product.query.get(data['product_id'])
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        # Check if item already in cart
        existing_item = CartItem.query.filter_by(
            user_id=data['user_id'],
            product_id=data['product_id']
        ).first()
        
        if existing_item:
            # Update quantity
            existing_item.quantity += data.get('quantity', 1)
        else:
            # Create new cart item
            new_item = CartItem(
                user_id=data['user_id'],
                product_id=data['product_id'],
                quantity=data.get('quantity', 1)
            )
            db.session.add(new_item)
        
        db.session.commit()
        
        return jsonify({'message': 'Item added to cart successfully'}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/cart/<int:item_id>', methods=['DELETE'])
def remove_from_cart(item_id):
    """Remove item from cart"""
    try:
        cart_item = CartItem.query.get(item_id)
        
        if not cart_item:
            return jsonify({'error': 'Cart item not found'}), 404
        
        db.session.delete(cart_item)
        db.session.commit()
        
        return jsonify({'message': 'Item removed from cart'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/cart/clear/<int:user_id>', methods=['DELETE'])
def clear_cart(user_id):
    """Clear user's cart"""
    try:
        CartItem.query.filter_by(user_id=user_id).delete()
        db.session.commit()
        
        return jsonify({'message': 'Cart cleared successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# =============== ORDERS API ===============
@app.route('/api/orders', methods=['POST'])
def create_order():
    """Create a new order"""
    try:
        data = request.json
        
        if not data.get('user_id') or not data.get('items'):
            return jsonify({'error': 'User ID and items are required'}), 400
        
        # Calculate total
        total_amount = 0
        order_items = []
        
        for item in data['items']:
            product = Product.query.get(item['product_id'])
            if not product:
                return jsonify({'error': f"Product {item['product_id']} not found"}), 404
            
            if product.stock < item.get('quantity', 1):
                return jsonify({'error': f"Insufficient stock for {product.name}"}), 400
            
            total_amount += product.price * item.get('quantity', 1)
            order_items.append({
                'product': product,
                'quantity': item.get('quantity', 1)
            })
        
        # Generate order number
        order_number = f"FA{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Create order
        new_order = Order(
            user_id=data['user_id'],
            order_number=order_number,
            total_amount=total_amount,
            payment_method=data.get('payment_method', 'cod'),
            status='pending',
            shipping_address=data.get('shipping_address', '')
        )
        
        db.session.add(new_order)
        db.session.flush()  # Get the order ID
        
        # Create order items
        for item_data in order_items:
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=item_data['product'].id,
                product_name=item_data['product'].name,
                quantity=item_data['quantity'],
                price=item_data['product'].price,
                image_url=item_data['product'].image_url
            )
            db.session.add(order_item)
            
            # Update product stock
            item_data['product'].stock -= item_data['quantity']
        
        # Clear user's cart
        CartItem.query.filter_by(user_id=data['user_id']).delete()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Order created successfully',
            'order': {
                'id': new_order.id,
                'order_number': new_order.order_number,
                'total_amount': new_order.total_amount,
                'status': new_order.status,
                'order_date': new_order.order_date.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders/user/<int:user_id>', methods=['GET'])
def get_user_orders(user_id):
    """Get all orders for a user"""
    orders = Order.query.filter_by(user_id=user_id).order_by(Order.order_date.desc()).all()
    
    return jsonify({
        'orders': [{
            'id': order.id,
            'order_number': order.order_number,
            'order_date': order.order_date.isoformat(),
            'total_amount': order.total_amount,
            'payment_method': order.payment_method,
            'status': order.status,
            'items': [{
                'product_name': item.product_name,
                'quantity': item.quantity,
                'price': item.price,
                'image_url': item.image_url
            } for item in order.items]
        } for order in orders]
    })

# =============== CONTACT API ===============
@app.route('/api/contact', methods=['POST'])
def submit_contact():
    """Submit contact form"""
    try:
        data = request.json
        
        if not data.get('name') or not data.get('email') or not data.get('message'):
            return jsonify({'error': 'Name, email, and message are required'}), 400
        
        new_message = ContactMessage(
            name=data['name'],
            email=data['email'],
            message=data['message']
        )
        
        db.session.add(new_message)
        db.session.commit()
        
        return jsonify({'message': 'Message sent successfully'}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# =============== ERROR HANDLERS ===============
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# =============== APPLICATION STARTUP ===============
if __name__ == '__main__':
    print("=" * 60)
    print("🚀 𝐹𝒶𝓇𝒶`𝟥 Fashion E-commerce Backend")
    print("=" * 60)
    
    # Initialize database with sample data
    initialize_database()
    
    print("\n📋 Available API Endpoints:")
    print("   GET  /                            - API Status")
    print("   GET  /api/collections             - All collections")
    print("   GET  /api/products                - All products")
    print("   GET  /api/products/featured       - Featured products")
    print("   POST /api/auth/register           - Register user")
    print("   POST /api/auth/login              - Login user")
    print("   GET  /api/cart?user_id=X          - Get cart")
    print("   POST /api/cart                    - Add to cart")
    print("   POST /api/orders                  - Create order")
    print("   POST /api/contact                 - Submit contact")
    print("\n🌐 Server running at: http://127.0.0.1:5000")
    print("=" * 60)
    
    app.run(debug=True, host='127.0.0.1', port=5000)