from django.contrib import admin
from .models import Movie, User

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ('title', 'director', 'year', 'rating', "poster_url")



admin.register(User)
