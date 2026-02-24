from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
UserModel = get_user_model()

def custom_validation(data):
    username = data['username'].strip()
    password = data['password'].strip()

    if not password:
        raise ValidationError('Invalid password password')
    
    if not username:
        raise ValidationError('Choose another username')
    return {
        "username": username,
        "password": password,
    }


def validate_email(data):
    email = data['email'].strip()
    if not email:
        raise ValidationError('An email is needed')
    return True

def validate_username(data):
    username = data['username'].strip()
    if not username:
        raise ValidationError('Username is required')
    return True

def validate_password(data):
    password = data['password'].strip()
    if not password:
        raise ValidationError('A password is needed')
    return True
