from app import create_app
import os
import logging
from dotenv import load_dotenv

# Set up logging so we can see what's happening in production
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Make sure we load any environment variables from .env file
load_dotenv()

try:
    # This is where we actually create our Flask app
    # If this fails, the whole thing is broken, so we need to know about it
    app = create_app()
    logger.info("🎉 App created successfully! Ready to help people feel better.")
except Exception as e:
    logger.error(f"💥 Uh oh, something went wrong creating the app: {str(e)}")
    raise  # Re-raise the error so we can debug it

# This part only runs if we start this file directly 
# (which we don't in production since gunicorn handles it)
if __name__ == '__main__':
    try:
        port = int(os.environ.get('PORT', 5002))
        logger.info(f"🚀 Starting the server on port {port}")
        app.run(host='0.0.0.0', port=port, debug=False)
    except Exception as e:
        logger.error(f"😵 Failed to start the server: {str(e)}")
        raise 