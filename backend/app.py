from flask import Flask, jsonify, request
from flask_cors import CORS
from models import init_models
from config import Config
from extensions import db
from routes.chat import chat_bp
import os
import logging

# Set up proper logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

def create_default_user():
    """
    Creates a default user (ID=1) for the app if it doesn't exist
    This is needed because the whole app is hardcoded to use user_id=1
    """
    try:
        from models.user import User
        
        # Check if default user already exists
        default_user = User.query.filter_by(id=1).first()
        
        if not default_user:
            # Create a default user for the mental health app
            default_user = User(
                email='default@mindmate.app',
                name='MindMate User',
                password='placeholder'  # Not used since no real auth
            )
            # Force the ID to be 1
            default_user.id = 1
            db.session.add(default_user)
            db.session.commit()
            logger.info("✅ Created default user (ID=1) for the app")
        else:
            logger.info("✅ Default user already exists")
            
    except Exception as e:
        logger.error(f"⚠️ Could not create default user: {str(e)}")

def create_app():
    """
    Creates and configures our Flask app - SIMPLIFIED for chat only
    """
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # More permissive CORS for debugging
    CORS(app, 
         resources={r"/*": {"origins": "*"}},  # Allow all origins for now
         supports_credentials=False)
    
    # Hook up our database
    db.init_app(app)
    
    # Get the database ready - create tables if they don't exist
    with app.app_context():
        try:
            init_models()
            db.create_all()
            # Create default user for production
            create_default_user()
            logger.info("🎯 Database setup completed successfully")
        except Exception as e:
            logger.error(f"💥 Database setup failed: {str(e)}")
    
    # Only register chat blueprint - removed all other features
    app.register_blueprint(chat_bp)
    
    @app.route('/health')
    def health_check():
        """Simple health check for monitoring"""
        logger.info("🩺 Health check requested")
        return jsonify({"status": "healthy", "message": "MindMate backend is running!"}), 200
    
    @app.route('/')
    def home():
        """Root endpoint"""
        return jsonify({"message": "MindMate API - Chat only", "status": "online"}), 200
    
    @app.before_request
    def log_request_info():
        """Log all incoming requests for debugging"""
        logger.info(f"🔍 {request.method} {request.url} from {request.remote_addr}")
        if request.method == 'POST' and request.json:
            logger.info(f"📝 Request data: {request.json}")
    
    @app.errorhandler(500)
    def handle_500(error):
        """When things go really wrong on our end"""
        logger.error(f"💥 500 Error: {str(error)}")
        return jsonify({"error": "Internal Server Error"}), 500
    
    @app.errorhandler(404)
    def handle_404(error):
        """When someone asks for something that doesn't exist"""
        logger.warning(f"🔍 404 Error: {request.url}")
        return jsonify({"error": "Not Found"}), 404
    
    return app

if __name__ == '__main__':
    # Only runs when we start this file directly (not through gunicorn)
    app = create_app()
    port = int(os.getenv('PORT', 5002))
    app.run(host='0.0.0.0', port=port, debug=True)
