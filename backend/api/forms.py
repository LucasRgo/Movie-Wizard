from django.contrib.auth.forms import UserCreationForm
from django import forms

class UserRegisterForm(UserCreationForm):
    email = forms.EmailField()
    class Meta:
        fields = ('username', 'email', 'password1', 'password2')
