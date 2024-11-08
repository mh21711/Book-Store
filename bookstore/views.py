from django.shortcuts import render, HttpResponseRedirect, get_object_or_404, HttpResponse
from django.urls import reverse
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.db import IntegrityError
from .models import Book, Like, User, Cart, Review
from django.http import JsonResponse
import json
from rest_framework import status, viewsets, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import BookSerializer
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated

def index(request):
    return render(request, "bookstore/index.html")


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        email = request.POST["email"]
        
        if password != confirmation:
            return render(request, "bookstore/register.html", {
                "message": "Passwords Must Match",
            })

        try:
            user = User.objects.create_user(username=username, password=password, email=email)
            user.save()
        except IntegrityError:
            return render(request, "bookstore/register.html", {
                "message": "Username Already Taken",
            })
        
        auth_login(request, user)
        return HttpResponseRedirect(reverse('index'))
    else:
        return render(request, "bookstore/register.html")

def login(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        if user is not None:
            auth_login(request, user)
            return HttpResponseRedirect(reverse('index'))
        else:
            return render(request, "bookstore/login.html", {
                "message": "Invalid Username And/Or Password",
            })    
    else:        
        return render(request, "bookstore/login.html")

def logout(request):
    auth_logout(request)
    return HttpResponseRedirect(reverse('index'))

def book(request, book_id):
    return render(request, 'bookstore/book.html')

def favorites(request):
    return render(request, "bookstore/favorites.html")  

def cart(request):
    return render(request, "bookstore/cart.html")


def search(request):
    return render(request, "bookstore/search.html")

def categories(request):
    categories = Book.objects.values_list('category', flat=True).distinct()

    return render(request, "bookstore/categories.html", {
        "categories": categories,
    })

def category(request, category):
    return render(request, "bookstore/category.html", {
        "category": category,
    }) 

class BookPagination(PageNumberPagination):
    page_size = 28  # Set the page size to 28
    page_size_query_param = 'page_size'
    max_page_size = 300  # Optional: set a maximum page size limit

class BookListCreateView(generics.ListCreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    pagination_class = BookPagination
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
 
class CartViewAdd(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def create(self, request):
        user = request.user
        book_id = request.data.get("book_id")
        book = get_object_or_404(Book, id=book_id)
        
        # Get or create the cart for the user
        cart, _ = Cart.objects.get_or_create(user=user)
        # Add the book to the cart
        cart.books.add(book)

        # Prepare the response data
        cart_books = cart.books.all()
        return Response({
            'id': book.id,
            'cart_exists': True,
        }, status=status.HTTP_201_CREATED)

    def destroy(self, request):
        user = request.user
        book_id = request.data.get("book_id")
        book = get_object_or_404(Book, id=book_id)
        
        # Get the user's cart
        cart = Cart.objects.get(user=user)
        # Remove the book from the cart
        cart.books.remove(book)

        # Prepare the response data
        cart_books = cart.books.all()
        return Response({
            'id': book.id,
            'cart_exists': False,
        }, status=status.HTTP_200_OK)

class LikeViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def create(self, request):
        user = request.user
        book_id = request.data.get("book_id")
        book = get_object_or_404(Book, id=book_id)
        
        # Create the like relationship if it doesn't exist
        like, created = Like.objects.get_or_create(user=user, book=book)
        
        # Update the book's likes count
        book.likes_count = book.likes_set.count()
        book.save()

        # Return the updated state of the book, including `liked_by_user`
        return Response({
            'id': book.id,
            'likes_count': book.likes_count,
            'liked_by_user': True,  # Since we're in the create method, the user has just liked the book
        }, status=status.HTTP_201_CREATED)

    def destroy(self, request):
        user = request.user
        book_id = request.data.get("book_id")
        book = get_object_or_404(Book, id=book_id)
        
        # Remove the like relationship
        Like.objects.filter(user=user, book=book).delete()
        
        # Update the book's likes count
        book.likes_count = book.likes_set.count()
        book.save()

        # Return the updated state of the book, including `liked_by_user`
        return Response({
            'id': book.id,
            'likes_count': book.likes_count,
            'liked_by_user': False,  # Since we're in the destroy method, the user has just unliked the book
        }, status=status.HTTP_204_NO_CONTENT) 

class ReviewViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def create(self, request):
        user = request.user
        book_id = request.data.get("book_id")
        content = request.data.get("content")
        book = get_object_or_404(Book, id=book_id)
        
        # Create the like relationship if it doesn't exist
        reviews, created = Review.objects.get_or_create(user=user, book=book, content=content)

        # Return the updated state of the book, including `liked_by_user`
        return Response(status=status.HTTP_201_CREATED)

    def destroy(self, request):
        user = request.user
        book_id = request.data.get("book_id")
        content = request.data.get("content")
        book = get_object_or_404(Book, id=book_id)
        
        # Remove the like relationship
        Review.objects.filter(user=user, book=book, content=content).delete()

        # Return the updated state of the book, including `liked_by_user`
        return Response(status=status.HTTP_204_NO_CONTENT)
         
    def update(self, request):
        user = request.user
        book_id = request.data.get("book_id")
        old_content = request.data.get("old_content")
        new_content = request.data.get("new_content")
        book = get_object_or_404(Book, id=book_id)
        
        # Find the review to update
        review = get_object_or_404(Review, user=user, book=book, content=old_content)
        
        # Update the review content
        review.content = new_content
        review.save()

        return Response(status=status.HTTP_200_OK)   


class FavoritesViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = BookSerializer

    def get_queryset(self):
        user = self.request.user
        liked_books_ids = Like.objects.filter(user=user).values_list('book_id', flat=True)
        return Book.objects.filter(id__in=liked_books_ids)

class BookAPI(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = BookSerializer

    def get_queryset(self):
        queryset = Book.objects.all()
        book_id = self.request.query_params.get('book_id')
        if book_id:
            queryset = queryset.filter(id=book_id)
        return queryset


class CartViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = BookSerializer

    def get_queryset(self):
        user = self.request.user
        cart = Cart.objects.get(user=user)
        return cart.books.all()  

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = BookSerializer

    def get_queryset(self):
        category = self.request.query_params.get('category')  # Use self.request to access the request object
        return Book.objects.filter(category=category).all()

class SearchViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = BookSerializer

    def get_queryset(self):
        value = self.request.query_params.get('value', '').strip()  # Use self.request to access the request object
        return Book.objects.filter(title__icontains=value)      




    
             
