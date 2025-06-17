from flask import Blueprint, request, jsonify
from models.chat import ChatHistory
from datetime import datetime
from extensions import db
from openai import OpenAI
import os
import logging
from dotenv import load_dotenv
from config import Config

# Set up logging
logger = logging.getLogger(__name__)

# Load up our environment variables
load_dotenv()

chat_bp = Blueprint('chat', __name__)

def get_openai_client():
    """
    Sets up our connection to OpenAI
    If we don't have an API key, we're pretty much screwed
    """
    api_key = os.getenv('OPENAI_API_KEY')
    logger.info(f"🔑 OpenAI API key status: {'Present' if api_key else 'MISSING'}")
    if not api_key:
        raise ValueError("Whoops! No OpenAI API key found - check your .env file")
    
    # Clear any proxy environment variables that might interfere
    proxy_vars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy']
    original_values = {}
    for var in proxy_vars:
        if var in os.environ:
            original_values[var] = os.environ[var]
            del os.environ[var]
    
    try:
        # Initialize OpenAI client with minimal parameters
        client = OpenAI(api_key=api_key)
        return client
    finally:
        # Restore original proxy values
        for var, value in original_values.items():
            os.environ[var] = value

# This is the personality we give to our AI - more natural and conversational
SYSTEM_MESSAGE = """You are MindMate, a warm and intelligent mental health companion. You're like talking to a wise, empathetic friend who really gets it.

Core principles:
- Respond naturally to the conversation flow - no rigid greetings every time
- Remember what the person has shared before and build on it
- Be genuinely supportive without being fake or overly cheerful
- Give practical, actionable advice when appropriate
- Use emojis thoughtfully, not excessively
- Vary your response style based on what the person needs

Communication style:
- If someone is continuing a conversation, pick up where you left off
- Match their energy level (don't be overly upbeat if they're having a hard time)
- Ask follow-up questions to show you're engaged
- Share insights that build on previous topics when relevant
- Be concise but thorough - people need substance, not fluff

Remember:
- You're not a therapist, but you are a supportive companion
- Don't diagnose or recommend medications
- Suggest professional help when situations seem serious
- Be authentic - people can tell when responses feel robotic"""

def get_response_with_history(message):
    """
    Enhanced response function that includes conversation history for context
    """
    try:
        logger.info(f"🤖 Getting OpenAI response with history for: {message[:50]}...")
        client = get_openai_client()
        
        # Get recent conversation history for context
        try:
            recent_history = ChatHistory.query.filter_by(user_id=1).order_by(ChatHistory.timestamp.desc()).limit(10).all()
            recent_history = recent_history[::-1]  # Reverse to get chronological order
            logger.info(f"📚 Found {len(recent_history)} recent messages for context")
        except Exception as db_error:
            logger.warning(f"⚠️ Couldn't get chat history: {db_error}")
            recent_history = []
        
        # Build conversation messages for OpenAI
        messages = [{"role": "system", "content": SYSTEM_MESSAGE}]
        
        # Add recent conversation history
        for chat in recent_history:
            messages.append({"role": "user", "content": chat.user_message})
            messages.append({"role": "assistant", "content": chat.bot_response})
        
        # Add the current message
        messages.append({"role": "user", "content": message})
        
        logger.info(f"💬 Sending {len(messages)} messages to OpenAI for context")
        
        # Send to OpenAI with full conversation context
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=500,  # Slightly more tokens for better responses
            temperature=0.8,  # A bit more creative for natural conversation
        )
        
        response = completion.choices[0].message.content
        logger.info(f"✅ Got contextual OpenAI response: {response[:50]}...")
        return response
        
    except ValueError as e:
        logger.error(f"💥 OpenAI setup problem: {str(e)}")
        return "I'm having some technical difficulties right now. Let me know if you'd like to try again."
        
    except Exception as e:
        logger.error(f"💥 OpenAI error: {str(e)}")
        return "Something went wrong on my end. Mind trying that again?"

@chat_bp.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    """
    Main chat endpoint - this is where users send messages and get responses
    """
    logger.info(f"💬 Chat endpoint hit with method: {request.method}")
    
    # Handle CORS preflight requests
    if request.method == 'OPTIONS':
        logger.info("✈️ CORS preflight request")
        return '', 200
    
    try:
        logger.info("📥 Processing chat request")
        
        # Get the JSON data from the request
        data = request.get_json()
        logger.info(f"📊 Request data: {data}")
        
        if not data or 'message' not in data:
            logger.warning("⚠️ No message in request data")
            return jsonify({'error': 'Hey, you need to actually send me a message!'}), 400

        user_message = data['message']
        logger.info(f"💭 User message received: {user_message}")
        
        # Get the AI response with conversation history
        bot_response = get_response_with_history(user_message)
        logger.info(f"🤖 Bot response generated: {bot_response[:50]}...")
        
        # Save this conversation to our database for later
        try:
            chat_history = ChatHistory(
                user_id=1,  # Using default user for this simplified app
                user_message=user_message,
                bot_response=bot_response,
                timestamp=datetime.utcnow()
            )
            db.session.add(chat_history)
            db.session.commit()
            logger.info("💾 Chat saved to database successfully")
        except Exception as db_error:
            logger.error(f"💥 Database save failed: {str(db_error)}")
            # Continue anyway - don't fail the request just because DB save failed

        logger.info("✅ Chat request completed successfully")
        return jsonify({
            'response': bot_response
        })

    except Exception as e:
        # If anything goes wrong, at least give a helpful error
        logger.error(f"💥 Chat broke somehow: {str(e)}")
        return jsonify({
            'error': 'Something went wrong while processing your message. Please try again!'
        }), 500

@chat_bp.route('/chat/history', methods=['GET'])
def get_chat_history():
    """
    Returns the last 50 chat messages - useful for showing conversation history
    """
    try:
        logger.info("📚 Chat history requested")
        # Get the most recent 50 chat entries
        history = ChatHistory.query.order_by(ChatHistory.timestamp.desc()).limit(50).all()
        logger.info(f"📚 Found {len(history)} chat entries")
        return jsonify({
            'history': [entry.to_dict() for entry in history]
        })
    except Exception as e:
        logger.error(f"💥 Couldn't fetch chat history: {str(e)}")
        return jsonify({'error': 'Unable to load chat history right now'}), 500
