from .models import Rate
from django.http import JsonResponse
import requests

API_KEY = "3d0fea0825fa3f64679db41d773d27eb"

# Function to fetch movies from a specific page
def fetch_movies(page, genre, vote_count):
    base_url = 'https://api.themoviedb.org/3/discover/movie'
    params = {
        'api_key': API_KEY,
        'language': 'en-US',
        'sort_by': 'vote_average.desc',   # Sort by vote average in descending order
        'with_genres': genre,             # Ge by the movie genre
        'vote_count.gte': vote_count,     # Only include movies with at least X votes
        'page': page                      # Page number to retrieve
    }
    response = requests.get(base_url, params=params)
    print(response)
    if response.status_code != 200:
        return None
    return response.json()


# Define genre-based watched movie lists based on your preferences
watched_movies_by_genre = {
    "drama": [724089, 761053, 19404, 696374, 238, 240, 278, 155, 372058, 389, 12477, 346, 378064, 40096, 18491, 901, 101, 11216],
    "comedy": [724089, 19404, 496243, 13, 637, 532067, 42269, 284, 24188, 20334, 1026227, 77338, 508965, 537061, 315162, 20914, 508442, 24382, 439, 239, 992, 400928, 9277, 583083, 449176, 455661, 930094, 7857, 455714, 3083, 804, 438695, 24238, 265195, 11293, 52629, 399174, 293299, 585, 872],
    "action": [278, 238, 424,240, 19404, 389, 496243, 497, 372058, 13, 12477, 11216, 637, 157336, 696374, 311, 255709, 724089, 40096, 761053, 378064, 12493,510,423, 244786, 274, 207, 18491, 599, 3782, 3082, 901, 77338, 527641, 1585, 447362, 637920, 10376, 8587, 630566, 2835, 283566, 490132, 265177, 42269, 572152, 110420, 572154, 284, 50014, 290098, 37257,522924, 24188,406997, 504253, 489, 398818, 37165],
    "romance": [19404, 3082, 290098, 239, 13, 872, 11216, 449176, 10515, 372058, 454983],
    "animation": [19404, 3082, 290098, 239, 13, 872, 11216, 449176, 10515],
    "science": [299534, 299536],
    "horror": [396535],
    "drama": [724089, 761053, 19404, 696374, 238, 240, 278, 155, 372058, 389, 12477, 346, 378064, 40096, 18491, 901, 101, 11216]
}

WATCHED_MOVIES = [19404, 696374, 255709, 724089, 761053, 611291, 553512, 40096, 4935, 12477, 378064, 454983, 644479, 164558]


def genre_movies(request, genre):
    # Extend WATCHED_MOVIES with the genre-specific and user-watched lists
    WATCHED_MOVIES.extend(watched_movies_by_genre[genre])

    if request.user.is_authenticated:
        user_watched_movies = Rate.objects.filter(user=request.user).values_list('movie', flat=True)
        user_watched_movies_list = list(user_watched_movies)
        WATCHED_MOVIES.extend(user_watched_movies_list)

    # Define genre-specific settings
    genre_settings = {
        "comedy": (35, 2000),
        "action": (28, 5000),
        "romance": (10749, 5000),
        "animation": (16, 5000),
        "science": (878, 5000),
        "horror": (27, 5000),
        "drama": (18, 1000),
    }
    genre_id, min_watches = genre_settings.get(genre, (0, 0))

    movies = []
    page = 1

    while len(movies) < 30:
        movie_data = fetch_movies(page, genre_id, min_watches)
        if not movie_data or 'results' not in movie_data:
            break

        for movie in movie_data['results']:
            if len(movies) >= 30:
                break
            if movie['id'] not in WATCHED_MOVIES:
                movies.append({
                    'id': movie['id'],
                    'poster_path': f"https://image.tmdb.org/t/p/w500{movie['poster_path']}" if movie.get('poster_path') else None,
                    'title': movie['title']
                })

        page += 1

    return JsonResponse(movies, safe=False)



def get_similar_movies(movie_id):
    """
    Fetches movie recommendations from TMDb based on a given movie ID.

    Args:
    api_key (str): Your TMDb API key.
    movie_id (int): The ID of the movie to get recommendations for.

    Returns:
    list: A list of recommended movies.
    """
    url = f"https://api.themoviedb.org/3/movie/{movie_id}/recommendations"
    params = {'api_key': API_KEY}

    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        results = data['results']

        # Loop through results and update poster_url
        for movie in results:
            if 'poster_path' in movie and movie['poster_path']:
                movie['poster_url'] = f"https://image.tmdb.org/t/p/w500{movie['poster_path']}"
            else:
                movie['poster_url'] = None
        return results
    else:
        print(f"Error: Unable to fetch recommendations (status code: {response.status_code})")
        return None
