from django.urls import path
from . import views
from django.views.generic import TemplateView

urlpatterns = [
    path('watchlater', views.watchlater, name="watchlater"),
    path('magic', views.magic, name="magic"),
    path('directors', views.top_directors_view, name="directors"),
    path('watched-movies', views.watched, name="watched-movies"),
    path('movies/<int:movie_id>/add-to-watchlist/', views.toggle_watchlater, name='add-to-watchlist'),
    path('movies/<int:movie_id>/rate/', views.rate, name='rate'),
    path('movies/<int:movie_id>/', views.MovieDetail.as_view(), name='movie-detail'),
    path('similar/<int:id>', views.similar, name='similar'),
    path('search', views.search, name='search'),
    path('movies-top/', views.top_movies, name='top-movies'),
    path('<str:genre>-movies', views.genre_movies_view, name='genre-movies'),
    path('register/', views.UserRegister.as_view(), name='register'),
    path('login/', views.UserLogin.as_view(), name='login'),
    path('logout/', views.UserLogout.as_view(), name='logout'),
    path('user/', views.UserView.as_view(), name='user'),
    path('', TemplateView.as_view(template_name='index.html')),
]
