# Import the shared db instance from extensions
from extensions import db

# Import only the models we actually use - simplified for chat only
def init_models():
    from .user import User
    from .chat import ChatHistory
    
    # Make models available at module level
    globals().update(locals())
    
    return {
        'User': User,
        'ChatHistory': ChatHistory
    }

__all__ = ['db', 'User', 'ChatHistory', 'init_models']

# Models package 