from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission

# Create your models here.
class User(AbstractUser):
    groups = models.ManyToManyField(
        Group,
        related_name='bookstore_user_set',  # Add a custom related_name
        blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='bookstore_user_set',  # Add a custom related_name
        blank=True
    )

class Book(models.Model):
    title = models.CharField(max_length=64, null=True)
    author = models.CharField(max_length=64)
    image_url = models.TextField()
    price = models.TextField()
    category = models.CharField(max_length=64)
    book_content = models.TextField() 
    likes = models.ManyToManyField("Like", related_name="liked_books")
    reviews = models.ManyToManyField("Review", related_name="reviewed_books")

class Like(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="likes")
    book = models.ForeignKey("Book", on_delete=models.CASCADE, related_name="likes_set")

class Review(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="reviews")
    book = models.ForeignKey("Book", on_delete=models.CASCADE, related_name="reviews_set")
    content = models.TextField()

class Cart(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="user_cart")
    books = models.ManyToManyField("Book", related_name="cart_books") 
