from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),
    path("logout/", views.logout, name="logout"),
    path("book/<int:book_id>/", views.book, name="book"),
    path("favorites/", views.favorites, name="favorites"),
    path("cart/", views.cart, name="cart"),
    path("search/", views.search, name="search"),
    path("categories/", views.categories, name="categories"),
    path("category/<str:category>", views.category, name="category"),
    path("api/books/", views.BookListCreateView.as_view(), name="api_books"),
    # Like and Dislike endpoints
    path('api/like/', views.LikeViewSet.as_view({'post': 'create', 'delete': 'destroy'}), name='like-create-destroy'),

    # Add to Cart and Remove from Cart endpoints
    path('api/cart/', views.CartViewAdd.as_view({'post': 'create', 'delete': 'destroy'}), name='cart-add-remove'),

    # Favorites endpoints
    path('api/favorites/', views.FavoritesViewSet.as_view({'get': 'list'}), name='favorites-list'),

    # Optional: You might want to include endpoints for cart items and favorite items
    path('api/cart-items/', views.CartViewSet.as_view({'get': 'list'}), name='cart-items'),

    path('api/book/', views.BookAPI.as_view({'get': 'list'}), name="api_book"),

    path('api/category/', views.CategoryViewSet.as_view({'get': 'list'}), name="api_category"),

    path('api/search/', views.SearchViewSet.as_view({'get': 'list'}), name="api_search"),

    path('api/review/', views.ReviewViewSet.as_view({'post': 'create', 'delete': 'destroy', 'put': 'update'}), name="api_review"),
]