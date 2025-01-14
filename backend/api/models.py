from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.core.exceptions import ValidationError

class User(AbstractUser):
    # profile_picture = models.URLField(null=True, blank=True)
    pass

    def __str__(self):
        return self.username

class Movie(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    director = models.CharField(max_length=255)
    year = models.IntegerField()
    rating = models.FloatField()
    synopsis = models.TextField()
    poster_url = models.URLField(null=True, blank=True)

    def __str__(self):
        return self.title

class WatchLater(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watchlater')
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    added_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'movie')

    def is_in_watchlater(self, user):
        return self.watchlater_set.filter(user=user).exists()


def validate_rating(value):
    if value < 0 or value > 10:
        raise ValidationError('Rating must be between 0 and 10.')

class Rate(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='Rate')
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    added_date = models.DateTimeField(auto_now_add=True)
    rating = models.FloatField(validators=[validate_rating])


    class Meta:
        unique_together = ('user', 'movie')

