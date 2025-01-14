from django.db import migrations
from cs50 import SQL
from api.models import Movie


def populate_movies(apps, schema_editor):
    # Connect to the Flask project's SQLite database
    db = SQL("sqlite:///api/migrations/movie.db")

    # Fetch data from the Flask database
    rows = db.execute("SELECT * FROM movies")

    flask_db_movies = [
        {
            'id': row['id'],
            'title': row['title'],
            'director': row['director'],
            'year': row['year'],
            'rating': row['rating'],
            'synopsis': row['synopsis'],
            'poster_url': row['poster_url'] if row['poster_url'] else 'https://example.com/default-poster.jpg'
        }
        for row in rows
    ]

    Movie = apps.get_model('api', 'Movie')  # Get the Movie model from apps

    # Insert data into the Django model, ensuring no duplicates
    for movie in flask_db_movies:
        # Use get_or_create to avoid duplicates
        obj, created = Movie.objects.get_or_create(
            id=movie['id'],  # Check by unique ID
            defaults={
                'title': movie['title'],
                'director': movie['director'],
                'year': movie['year'],
                'rating': movie['rating'],
                'synopsis': movie['synopsis'],
                'poster_url': movie['poster_url']
            }
        )

        if created:
            print(f"{movie['title']} was added successfully!")
        else:
            print(f"{movie['title']} already exists, skipping.")


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0002_movie"),  # Ensure this matches the migration where the Movie model was created
    ]

    operations = [
        migrations.RunPython(populate_movies),
    ]
