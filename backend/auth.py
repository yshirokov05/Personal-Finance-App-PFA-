from firebase_admin import auth
from flask import request, jsonify
from functools import wraps

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Handle CORS preflight requests
        if request.method == 'OPTIONS':
            return f(*args, **kwargs)

        id_token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            id_token = auth_header.split('Bearer ')[1]
        
        # If no token, we treat as a guest
        if not id_token:
            request.uid = "guest"
            return f(*args, **kwargs)
        
        try:
            # Verify the ID token
            decoded_token = auth.verify_id_token(id_token)
            request.uid = decoded_token['uid']
        except Exception as e:
            # If token is provided but invalid, we reject it
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401
        
        return f(*args, **kwargs)
    
    return decorated
