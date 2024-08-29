from rest_framework import serializers
from .models import Book, User, Cart, Like, Review

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'id']

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'user', 'username', 'content']

    def get_username(self, obj):
        return obj.user.username

class BookSerializer(serializers.ModelSerializer):
    liked_by_user = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    cart_exist = serializers.SerializerMethodField()
    reviews_book = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'price', 
            'category', 'image_url', 'book_content',
            'liked_by_user', 'likes_count', 'cart_exist', 'reviews_book'
        ]

    def get_liked_by_user(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user = request.user 
            liked_books = Like.objects.filter(user=user).values_list('book_id', flat=True)
            if obj.id in liked_books:
                return True
            else:
                return False
        return False

    def get_likes_count(self, obj):
        return Like.objects.filter(book=obj).count()

    def get_cart_exist(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user = request.user
            cart, created = Cart.objects.get_or_create(user=user)
            return cart.books.filter(id=obj.id).exists()
        return False

    def get_reviews_book(self, obj):
        reviews = Review.objects.filter(book=obj)
        return ReviewSerializer(reviews, many=True).data


