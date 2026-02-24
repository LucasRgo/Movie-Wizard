from rest_framework import serializers
from .models import WatchLater, Movie
from django.contrib.auth import get_user_model, authenticate
from rest_framework.exceptions import ValidationError


UserModel = get_user_model()


class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ("username", "password")
        extra_kwargs = {
            "password": {"write_only": True},
        }

    def create(self, validated_data):
        user_obj = UserModel.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
        )
        user_obj.save()
        return user_obj

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def check_user(self, clean_data):
        user = authenticate(
            username=clean_data["username"],
            password=clean_data["password"],
        )
        if not user:
            raise ValidationError("User not found")
        return user

class UserSerializer(serializers.Serializer):
    class Meta:
        model = UserModel
        fields = ('username')


class MovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ['id', 'title', 'director', 'year', 'rating','synopsis', 'poster_url']

class WatchLaterSerializer(serializers.ModelSerializer):
    movie = MovieSerializer()

    class Meta:
        model = WatchLater
        fields = ['id', 'user','movie', 'added_date']
