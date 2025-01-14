from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Movie, WatchLater, User, Rate
from django.contrib.auth import authenticate, login, logout, get_user_model
from rest_framework.authentication import SessionAuthentication
from .serializers import UserRegisterSerializer, UserLoginSerializer, UserSerializer, MovieSerializer, WatchLaterSerializer
from rest_framework import permissions, status
from collections import Counter
from .validations import custom_validation, validate_username, validate_password
from django.http import JsonResponse
from .utils import genre_movies, get_similar_movies
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, get_object_or_404
from json import loads
from statistics import mean



WATCHED_MOVIES = [19404, 696374, 255709, 724089, 761053,644479,164558,
                  611291, 553512, 40096, 4935, 12477, 378064, 454983]


class UserLogin(APIView):
    permission_classes = (permissions.AllowAny, )
    authentication_classes = (SessionAuthentication, )

    def post(self, request):
        data = request.data
        assert validate_username(data)
        assert validate_password(data)

        serializer = UserLoginSerializer(data=data)

        if serializer.is_valid(raise_exception=True):
            user = serializer.check_user(data)
            login(request, user)
            return Response(serializer.data, status=status.HTTP_200_OK)


class UserLogout(APIView):
    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_200_OK)


class UserView(APIView):
    authentication_classes = [SessionAuthentication]

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        user = request.user
        data = {
            'username': user.username,
            'email': user.email,
        }
        return Response(data)


class MovieDetail(APIView):
    def get(self, request, movie_id):
        try:
            is_in_watchlater = False
            rating = 0
            if request.user.is_authenticated:
                user = User.objects.get(id=request.user.id)
                movie = Movie.objects.get(id=movie_id)
                is_in_watchlater = WatchLater.objects.filter(user=user, movie=movie).exists()
                rate = Rate.objects.filter(user=user, movie=movie).first()
                if rate:
                    rating = rate.rating

            movie = Movie.objects.get(id=movie_id)
            data = {
                'id': movie.id,
                'title': movie.title,
                'year': movie.year,
                'synopsis': movie.synopsis,
                'director': movie.director,
                'poster_url': movie.poster_url,
                'is_in_watchlater': is_in_watchlater,
                'user_rating': rating
            }

            return Response(data)
        except Movie.DoesNotExist:
            return Response({'error': 'Movie not found'}, status=404)


class UserRegister(APIView):
    permission_classes = (permissions.AllowAny, )

    def post(self, request):
        clean_data = custom_validation(request.data)
        serializer = UserRegisterSerializer(data=clean_data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.create(clean_data)
            if user:
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_400_BAD_REQUEST)


def search(request):
    query = request.GET.get('q')
    if query:
        results = Movie.objects.filter(title__icontains=query)[:15]
        results_data = list(results.values())  # Convert queryset to a list of dictionaries
        return JsonResponse(results_data, safe=False)  # Return as JSON array with safe=False
    return JsonResponse([], safe=False)


def similar(request, id):
    movies = get_similar_movies(id)
    return JsonResponse(movies, safe=False)


@login_required
def toggle_watchlater(request, movie_id):
    movie = get_object_or_404(Movie, id=movie_id)

    if request.user.is_anonymous:
        return JsonResponse({'error': 'User is not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

    user = get_object_or_404(User, id=request.user.id)

    watch_later, created = WatchLater.objects.get_or_create(
        user=user,
        movie=movie,
    )

    if not created:
        watch_later.delete()
        return JsonResponse({'status': 'removed'}, status=status.HTTP_200_OK)

    serializer = WatchLaterSerializer(watch_later)
    return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)


def watchlater(request):
    if request.user.is_authenticated:
        watchlater_movies = WatchLater.objects.filter(user=request.user).values_list('movie', flat=True)
        movies = Movie.objects.filter(id__in=watchlater_movies)
        data = [{'id': movie.id, 'year': movie.year, 'poster_path': f"https://image.tmdb.org/t/p/w500{movie.poster_url}", 'title': movie.title, } for movie in movies]
        return JsonResponse(data, safe=False)
    else:
        return JsonResponse({'error': 'You should log In to see your Watchlater'}, status=401)



@login_required
def rate(request, movie_id):
    movie = get_object_or_404(Movie, id=movie_id)

    if request.user.is_anonymous:
        return JsonResponse({'error': 'User is not authenticated'}, status=401)

    user = request.user
    data = loads(request.body)
    rating = data.get('rating')

    if not (0 <= rating <= 10):
        return JsonResponse({"error": "Invalid rating"}, status=400)

    # Check if a rating already exists
    try:
        rate = Rate.objects.get(user=user, movie=movie)
        rate.rating = rating
        rate.save()
        return JsonResponse({'message': 'Rating updated successfully!'})
    except Rate.DoesNotExist:
        # Create a new rating if it doesn’t exist
        Rate.objects.create(user=user, movie=movie, rating=rating)
        return JsonResponse({'message': 'New rating added successfully'})



def watched(request):
    if request.user.is_authenticated:
        # Filter ratings for the authenticated user and get the related movie and rating
        user_watched_movies = Rate.objects.filter(user=request.user).select_related('movie')

        data = [
            {
                'id': rate.movie.id,
                'year': rate.movie.year,
                'rating': rate.rating,  # User Rating
                'poster_path': f"https://image.tmdb.org/t/p/w500{rate.movie.poster_url}",
                'title': rate.movie.title,
            } for rate in user_watched_movies
        ]

        return JsonResponse(data, safe=False)
    else:
        return JsonResponse({'error': 'You should log in to see your Watched Movies'}, status=401)



def top_movies(request):
    if request.user.is_authenticated:
        user_watched_movies = Rate.objects.filter(user=request.user).values_list('movie', flat=True)
        user_watched_movies_list = list(user_watched_movies)
        WATCHED_MOVIES.extend(user_watched_movies_list)
    movies = Movie.objects.exclude(id__in=WATCHED_MOVIES).order_by('-rating')[:30]
    data = [{'id': movie.id, 'poster_path': f"https://image.tmdb.org/t/p/w500{movie.poster_url}", 'title': movie.title} for movie in movies]
    return JsonResponse(data, safe=False)


def genre_movies_view(request, genre):
    return genre_movies(request, genre)

from collections import Counter

def magic(request):
    # If the user is logged in, retrieve their favorite and watched movies
    if request.user.is_authenticated:
        favorite_movies = list(Rate.objects.filter(user=request.user, rating__gte=9).values_list('movie_id', flat=True))
        WATCHED_MOVIES.extend(list(Rate.objects.filter(user=request.user).values_list('movie', flat=True)))
    else:
        # For non-authenticated users, use the top 30 highest-rated movies as favorites
        favorite_movies = list(Movie.objects.exclude(id__in=WATCHED_MOVIES).order_by('-rating')[:10].values_list('id', flat=True))
    # Convert WATCHED_MOVIES to a set for faster lookups
    watched_movies_ids = set(WATCHED_MOVIES)
    recommended_movies = []

    # Get recommendations based on the user's favorite movies
    for movie_id in favorite_movies:
        recommendations = get_similar_movies(movie_id)
        if recommendations:
            # Filter out already-watched movies from recommendations
            filtered_recommendations = [movie for movie in recommendations if movie['id'] not in watched_movies_ids]
            recommended_movies.extend(filtered_recommendations)

    # Calculating the most recommend movies according to the user taste:
    recommended_movie_ids = [movie['id'] for movie in recommended_movies]
    movie_counts = Counter(recommended_movie_ids)
    top_recommended_movie_ids = [movie_id for movie_id, count in movie_counts.most_common(5)]
    movies = Movie.objects.filter(id__in=top_recommended_movie_ids)

    data = [{'id': movie.id, 'poster_path': f"https://image.tmdb.org/t/p/w500{movie.poster_url}", 'title': movie.title} for movie in movies]
    return JsonResponse(data, safe=False)




def top_directors_view(request):
    if request.user.is_authenticated:
        favorite_movies = Rate.objects.filter(user=request.user, rating__gte=9).values_list('movie_id', flat=True)
        liked_directors = Movie.objects.filter(id__in=favorite_movies).values_list('director', flat=True).distinct()
    else:
        favorite_movies = Movie.objects.exclude(id__in=WATCHED_MOVIES).order_by('-rating')[:30]
        liked_directors = Movie.objects.filter(id__in=favorite_movies).values_list('director', flat=True).distinct()

    directors_and_movies = []
    for director in liked_directors:
        # Only consider directors with more than 4 movies in the database
        if Movie.objects.filter(director=director).count() > 4 and director not in ["Hayao Miyazaki","Park Chan-wook"] :
            # Fetch the movies for this director
            if request.user.is_authenticated:
                movies_qs = Movie.objects.filter(
                    director=director
                ).exclude(
                    id__in=Rate.objects.filter(user=request.user).values_list('movie_id', flat=True)
                ).order_by('-rating')[:5]
            else:
                movies_qs = Movie.objects.filter(director=director
                ).exclude(id__in=WATCHED_MOVIES).order_by('-rating')[:5]

            movies = [
                {
                    'id': movie.id,
                    'title': movie.title,
                    'poster_url': movie.poster_url,
                    'rating': movie.rating
                }
                for movie in movies_qs
            ]

            # Calculate the average rating for these movies if any movies are found
            if movies:
                avg_rating = mean([movie['rating'] for movie in movies])

                # Append director and movie info as JSON-serializable data
                directors_and_movies.append({
                    'director': director,
                    'movies': movies,
                    'avg_rating': avg_rating
                })

    # Sort directors by average rating in descending order and limit to top 5
    directors_and_movies = sorted(directors_and_movies, key=lambda x: x['avg_rating'], reverse=True)[:5]

    return JsonResponse(directors_and_movies, safe=False)
