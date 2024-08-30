
// CSRF token function (necessary for Django)
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function addToReview(bookId) {
    content = document.getElementById("text").value;
    if (content) {
        fetch('/api/review/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({
                book_id: bookId,
                content: content,
            }),
        }).then(response => {
            if (response.status === 201) {
                location.reload();
            }
        })
    }
}

function deleteReview(bookId, Content) {
    fetch('/api/review/', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({
            book_id: bookId,
            content: Content,
        }),
    }).then(response => {
        if (response.status === 204) {
            location.reload();
        }
    })
}

function UnEditFunction(Id, Username, Content, BookId) {
    const review = document.getElementById(`review-${Id}`)
    review.innerHTML = `
        <h4>${Username}</h4>
        <p>${Content}</p>
        <div class="edit">
            <button class="btn btn-primary" onclick="editFunction(${Id}, '${Username}', '${Content}')">Edit</button>
            <button class="btn btn-danger" 
                    onclick="deleteReview(${BookId}, 
                                        '${Content}')">Delete</button>

        </div>
    `
}

function saveReview(oldContent, bookId) {
    const content = document.getElementById('text-1').value;
    if (content) {
        fetch('/api/review/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({
                book_id: bookId,
                old_content: oldContent,
                new_content: content,
            }),
        }).then(response => {
            if (response.status === 200) {
                location.reload();
            }
        })
    }
}

function editFunction(Id, Username, Content, bookId) {
    const review = document.getElementById(`review-${Id}`)
    review.innerHTML = `
        <h4>${Username}</h4>
        <textarea id="text-1" placeholder="Type Your Content Here"></textarea>
        <div class="edit">
            <button class="btn btn-secondary" onclick="saveReview('${Content.replace(/'/g, "\\'").replace(/\n/g, "\\n")}', ${bookId})">Save</button>
            <button class="btn btn-primary" 
                    onclick="UnEditFunction(${Id}, 
                                            '${Username.replace(/'/g, "\\'")}', 
                                            '${Content.replace(/'/g, "\\'").replace(/\n/g, "\\n")}', 
                                            ${bookId})">UnEdit</button>        
        </div>
    `
}

function fetchBook(bookId) {
    fetch(`/api/book/?book_id=${bookId}`)
        .then(response => response.json())
        .then(data => {
            const books = document.getElementById("anbook")
            const book = data[0]
            console.log(data)
            // Render cart items
            let bookHTML = `
                <h1>${book.title.slice(0, 25)}</h1>
                <h2>${book.author.slice(0, 25)}</h2>
                <img src="${book.image_url}" alt="Book Image">
                <h3>Category: ${book.category}</h3>
            `;

            if (book.book_content) {
                bookHTML += `
                    <h3>Description</h3>
                    <p>${book.book_content}</p>
                `
            }

            if (book.price === "Free") {
                bookHTML += `<h5>${book.price}</h5>`
            } else {
                const priceStr = book.price.replace(/'/g, '"');
                const priceObj = JSON.parse(priceStr);

                // Access the amount and currencyCode
                const amount = priceObj.amount;
                const currencyCode = priceObj.currencyCode;
                bookHTML += `<h5>${amount} ${currencyCode}</h5>`
            }

            bookHTML += `
                <div id="buttons">
                    <div id="like-${book.id}" class="like">
                        <button id=${book.liked_by_user ? "DisLike" : "Like"} class="btn ${book.liked_by_user ? "btn-danger" : "btn-primary"}" onclick=${book.liked_by_user ? `dislikeBook(${book.id})` : `likeBook(${book.id})`}>
                            ${book.liked_by_user ? "DisLike" : "Like"}
                        </button>
                        <span>${book.likes_count} <i class="fa-solid fa-heart"></i></span>
                    </div>
                    <div id="cart-${book.id}" class="cart">
                        <button type="submit" class="btn ${book.cart_exist ? "btn-danger" : "btn-secondary"}" id= ${book.cart_exist ? "UnCart" : "Cart"} onclick=${book.cart_exist ? `removeFromCart(${book.id})` : `addToCart(${book.id})`}>
                            ${book.cart_exist ? "Remove From Cart" : "Add To Cart"}
                        </button>
                    </div> 
                </div>
                <h3>Reviews</h3>
                <div>
                    <input type="hidden" name="book_id" value="{{ book.id }}">
                    <textarea id="text" placeholder="Type Your Content Here"></textarea>
                    <button class="btn btn-primary" id="addreview" onclick="addToReview(${book.id})">Add a Review</button>
                </div>
            `

            user = document.getElementById('user').value;

            if (book.reviews_book) {
                for (let i = 0; i < book.reviews_book.length; i++) {
                    bookHTML += `
                        <div id="review-${book.reviews_book[i].id}" class="review">
                            <h4>${book.reviews_book[i].username}</h4>
                            <p>${book.reviews_book[i].content}</p>
                    `
                    if (user === book.reviews_book[i].username) {
                        bookHTML += `
                                <div class="edit">
                                    <button class="btn btn-primary" 
                                            onclick="editFunction(${book.reviews_book[i].id}, 
                                                                '${book.reviews_book[i].username}', 
                                                                '${book.reviews_book[i].content.replace(/'/g, "\\'").replace(/\n/g, "\\n")}', 
                                                                ${book.id})">Edit</button>
                                    <button class="btn btn-danger" 
                                            onclick="deleteReview(${book.id}, 
                                                                '${book.reviews_book[i].content.replace(/'/g, "\\'").replace(/\n/g, "\\n")}')">Delete</button>
                                </div>
                            </div>
                        `
                    } else {
                        bookHTML += `</div>`
                    }
                }
            }

            books.innerHTML = bookHTML;
        })
        .catch(error => console.error('Error fetching cart:', error));
}

function fetchFavorites() {
    fetch('/api/favorites/')
        .then(response => response.json())
        .then(data => {
            // Render favorites
            const booksContainer = document.getElementById("books-container-favorites")
            // Render cart items
            if (Array.isArray(data)) {
                data.forEach(book => {
                    if (book.image_url) {
                        const bookElement = document.createElement("div");
    
                        let bookHTML = `
                            <img src="${book.image_url}" alt="Book Image">
                            <a href="/book/${book.id}">${book.title.slice(0, 25)}</a>
                            <p>${book.author.slice(0, 25)}</p>
                            <div id="buttons">
                                <div id="like-${book.id}" class="like">
                                    <button id=${book.liked_by_user ? "DisLike" : "Like"} class="btn ${book.liked_by_user ? "btn-danger" : "btn-primary"}" onclick=${book.liked_by_user ? `dislikeBook(${book.id})` : `likeBook(${book.id})`}>
                                        ${book.liked_by_user ? "DisLike" : "Like"}
                                    </button>
                                    <span>${book.likes_count} <i class="fa-solid fa-heart"></i></span>
                                </div>
                                <div id="cart-${book.id}" class="cart">
                                    <button type="submit" class="btn ${book.cart_exist ? "btn-danger" : "btn-secondary"}" id= ${book.cart_exist ? "UnCart" : "Cart"} onclick=${book.cart_exist ? `removeFromCart(${book.id})` : `addToCart(${book.id})`}>
                                        ${book.cart_exist ? "Remove From Cart" : "Add To Cart"}
                                    </button>
                                </div> 
                            </div>`;
    
                        bookElement.id = "book";
                        bookElement.innerHTML = bookHTML;
                        booksContainer.appendChild(bookElement); 
                    }
                });
            }
        })
        .catch(error => console.error('Error fetching favorites:', error));
}

function fetchCart() {
    fetch('/api/cart-items/')
        .then(response => response.json())
        .then(data => {
            const booksContainer = document.getElementById("books-container-cart")
            // Render cart items
            if (Array.isArray(data)) {
                data.forEach(book => {
                    if (book.image_url) {
                        const bookElement = document.createElement("div");
    
                        let bookHTML = `
                            <img src="${book.image_url}" alt="Book Image">
                            <a href="/book/${book.id}">${book.title.slice(0, 25)}</a>
                            <p>${book.author.slice(0, 25)}</p>
                            <div id="buttons">
                                <div id="like-${book.id}" class="like">
                                    <button id=${book.liked_by_user ? "DisLike" : "Like"} class="btn ${book.liked_by_user ? "btn-danger" : "btn-primary"}" onclick=${book.liked_by_user ? `dislikeBook(${book.id})` : `likeBook(${book.id})`}>
                                        ${book.liked_by_user ? "DisLike" : "Like"}
                                    </button>
                                    <span>${book.likes_count} <i class="fa-solid fa-heart"></i></span>
                                </div>
                                <div id="cart-${book.id}" class="cart">
                                    <button type="submit" class="btn ${book.cart_exist ? "btn-danger" : "btn-secondary"}" id= ${book.cart_exist ? "UnCart" : "Cart"} onclick=${book.cart_exist ? `removeFromCart(${book.id})` : `addToCart(${book.id})`}>
                                        ${book.cart_exist ? "Remove From Cart" : "Add To Cart"}
                                    </button>
                                </div> 
                            </div>`;
    
                        bookElement.id = "book";
                        bookElement.innerHTML = bookHTML;
                        booksContainer.appendChild(bookElement); 
                    }
                });
            }
        })
        .catch(error => console.error('Error fetching cart:', error));
}

function fetchCategory(category) {
    fetch(`/api/category/?category=${category}`)
        .then(response => response.json())
        .then(data => {
            const booksContainer = document.getElementById("books-container-category")
            // Render cart items
            if (Array.isArray(data)) {
                data.forEach(book => {
                    if (book.image_url) {
                        const bookElement = document.createElement("div");
    
                        let bookHTML = `
                            <img src="${book.image_url}" alt="Book Image">
                            <a href="/book/${book.id}">${book.title.slice(0, 25)}</a>
                            <p>${book.author.slice(0, 25)}</p>
                            <div id="buttons">
                                <div id="like-${book.id}" class="like">
                                    <button id=${book.liked_by_user ? "DisLike" : "Like"} class="btn ${book.liked_by_user ? "btn-danger" : "btn-primary"}" onclick=${book.liked_by_user ? `dislikeBook(${book.id})` : `likeBook(${book.id})`}>
                                        ${book.liked_by_user ? "DisLike" : "Like"}
                                    </button>
                                    <span>${book.likes_count} <i class="fa-solid fa-heart"></i></span>
                                </div>
                                <div id="cart-${book.id}" class="cart">
                                    <button type="submit" class="btn ${book.cart_exist ? "btn-danger" : "btn-secondary"}" id= ${book.cart_exist ? "UnCart" : "Cart"} onclick=${book.cart_exist ? `removeFromCart(${book.id})` : `addToCart(${book.id})`}>
                                        ${book.cart_exist ? "Remove From Cart" : "Add To Cart"}
                                    </button>
                                </div> 
                            </div>`;
    
                        bookElement.id = "book";
                        bookElement.innerHTML = bookHTML;
                        booksContainer.appendChild(bookElement); 
                    }
                });
            }
        })
        .catch(error => console.error('Error fetching cart:', error));
}

function fetchSearch(value) {
    fetch(`/api/search/?value=${value}`)
        .then(response => response.json())
        .then(data => {
            const booksContainer = document.getElementById("books-container-search")
            // Render Search items
            if (Array.isArray(data)) {
                data.forEach(book => {
                    if (book.image_url) {
                        const bookElement = document.createElement("div");
    
                        let bookHTML = `
                            <img src="${book.image_url}" alt="Book Image">
                            <a href="/book/${book.id}">${book.title.slice(0, 25)}</a>
                            <p>${book.author.slice(0, 25)}</p>
                            <div id="buttons">
                                <div id="like-${book.id}" class="like">
                                    <button id=${book.liked_by_user ? "DisLike" : "Like"} class="btn ${book.liked_by_user ? "btn-danger" : "btn-primary"}" onclick=${book.liked_by_user ? `dislikeBook(${book.id})` : `likeBook(${book.id})`}>
                                        ${book.liked_by_user ? "DisLike" : "Like"}
                                    </button>
                                    <span>${book.likes_count} <i class="fa-solid fa-heart"></i></span>
                                </div>
                                <div id="cart-${book.id}" class="cart">
                                    <button type="submit" class="btn ${book.cart_exist ? "btn-danger" : "btn-secondary"}" id= ${book.cart_exist ? "UnCart" : "Cart"} onclick=${book.cart_exist ? `removeFromCart(${book.id})` : `addToCart(${book.id})`}>
                                        ${book.cart_exist ? "Remove From Cart" : "Add To Cart"}
                                    </button>
                                </div> 
                            </div>`;
    
                        bookElement.id = "book";
                        bookElement.innerHTML = bookHTML;
                        booksContainer.appendChild(bookElement); 
                    }
                });
            }
        })
        .catch(error => console.error('Error fetching cart:', error));
}

function updateCart(bookId, CartExist) {
    console.log(CartExist)
    document.getElementById(`cart-${bookId}`).innerHTML = `
        <button type="submit" class="btn ${CartExist ? "btn-danger" : "btn-secondary"}" id= ${CartExist ? "UnCart" : "Cart"} onclick=${CartExist ? `removeFromCart(${bookId})` : `addToCart(${bookId})`}>
            ${CartExist ? "Remove From Cart" : "Add To Cart"}
        </button>
    `
}

function addToCart(bookId) {
    fetch(`/api/cart/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({ book_id: bookId }),
    }).then(response => {
        if (response.status === 201) {
            return response.json()
        }
    })
    .then(data => {
         if (data) {
            // Update the DOM using the returned data
            updateCart(bookId, data.cart_exists);
        }
    }).catch(error => {
            console.error('Failed To Add To Cart', error);
    });    
}

function removeFromCart(bookId) {
    fetch(`/api/cart/`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({ book_id: bookId }),
    }).then(response => {
        if (response.status === 200) {
            return response.json()
        } else {
            return updateCart(bookId, false)
        }
    })
    .then(data => {
         if (data) {
            // Update the DOM using the returned data
            updateCart(bookId, data.cart_exists);
        }
    }).catch(error => {
            console.error('Failed To Remove From Cart', error);
    });    
}

function updateLikeButton(bookId, likedByUser, likesCount) {
    console.log(likedByUser)
    document.getElementById(`like-${bookId}`).innerHTML = `
        <button id=${likedByUser ? "DisLike" : "Like"} class="btn ${likedByUser ? "btn-danger" : "btn-primary"}" onclick=${likedByUser ? `dislikeBook(${bookId})` : `likeBook(${bookId})`}>
            ${likedByUser ? "DisLike" : "Like"}
        </button>
        <span>${likesCount} <i class="fa-solid fa-heart"></i></span>
    `;
}

function likeBook(bookId) {
    fetch('/api/like/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({ book_id: bookId }),
    })
    .then(response => response.json())
    .then(data => {
        if (data) {
            // Update the DOM using the returned data
            updateLikeButton(bookId, data.liked_by_user, data.likes_count);
        }
    }).catch(error => {
        console.error('Failed to like book', error);
    });
}

function dislikeBook(bookId) {
    fetch('/api/like/', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({ book_id: bookId }),
    })
    .then(response => {
        if (response.status === 200) {
            return response.json()
        } else if (response.status === 204) {
            const currentLikesCount = parseInt(document.querySelector(`#like-${bookId} span`).innerText) - 1;
            updateLikeButton(bookId, false, currentLikesCount)
        }
    })
    .then(data => {
        if (data) {
            // Update the DOM using the returned data if not 204
            updateLikeButton(bookId, data.liked_by_user, data.likes_count);
        }
    }).catch(error => {
        console.error('Failed to dislike book', error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".navbar-toggler").onclick = () => {
        const nav = document.getElementById("navbarSupportedContent");
        nav.style.display = nav.style.display === "block" ? "none" : "block"; 
    }

    const booksContainer = document.getElementById("books_container");
    if (booksContainer) {
        let currentPage = 1; // Track the current page
        let loading = false; // Flag to prevent duplicate requests
        
        function loadBooks() {
            if (loading) return; // If already loading, do not proceed
            loading = true; // Set the loading flag
        
            const pageSize = 28; 
            const pageUrl = `/api/books/?page=${currentPage}&page_size=${pageSize}`;
        
            fetch(pageUrl)
                .then(response => response.json())
                .then(data => {
                    data.results.forEach(book => {
                        if (book.image_url) {
                            const bookElement = document.createElement("div");
        
                            let bookHTML = `
                                <img src="${book.image_url}" alt="Book Image">
                                <a href="/book/${book.id}">${book.title.slice(0, 25)}</a>
                                <p>${book.author.slice(0, 25)}</p>
                                <div id="buttons">
                                    <div id="like-${book.id}" class="like">
                                        <button id=${book.liked_by_user ? "DisLike" : "Like"} class="btn ${book.liked_by_user ? "btn-danger" : "btn-primary"}" onclick=${book.liked_by_user ? `dislikeBook(${book.id})` : `likeBook(${book.id})`}>
                                            ${book.liked_by_user ? "DisLike" : "Like"}
                                        </button>
                                        <span>${book.likes_count} <i class="fa-solid fa-heart"></i></span>
                                    </div>
                                    <div id="cart-${book.id}" class="cart">
                                        <button type="submit" class="btn ${book.cart_exist ? "btn-danger" : "btn-secondary"}" id= ${book.cart_exist ? "UnCart" : "Cart"} onclick=${book.cart_exist ? `removeFromCart(${book.id})` : `addToCart(${book.id})`}>
                                            ${book.cart_exist ? "Remove From Cart" : "Add To Cart"}
                                        </button>
                                    </div> 
                                </div>`;
        
                            bookElement.id = "book";
                            bookElement.innerHTML = bookHTML;
                            booksContainer.appendChild(bookElement); 
                        }
                    });
        
                    // Check if more pages are available
                    if (data.next) {
                        currentPage++;
                        loading = false;
                    } else {
                        // No more books to load
                        window.removeEventListener('scroll', handleScroll);
                    }
                })
                .catch(error => {
                    console.error("Error loading books:", error);
                    loading = false; // Reset the loading flag in case of an error
                });
        }
        
        window.addEventListener('scroll', handleScroll);
            
        function handleScroll() {
            const documentHeight = document.documentElement.scrollHeight;
            const currentScroll = window.scrollY + window.innerHeight;
        
            if (documentHeight - currentScroll <= 100 && !loading) {
                loadBooks(); 
            }
        }
    
        // Intial Loading
        loadBooks()
    }
    search = document.getElementById("search")

    search.addEventListener('click', function() {
        // Get the value from the input field
        const searchValue = document.getElementById('value').value;
    
        if (searchValue) {
            // Redirect to the search page with the query
            window.location.href = `/search?query=${encodeURIComponent(searchValue)}`;
        } else {
            // Handle the case where the input is empty
            alert("Please enter a search term.");
        }
    });

    const booksContainerCart = document.getElementById("books-container-cart") 
    const booksContainerFavorites = document.getElementById("books-container-favorites")
    const booksContainerCategory = document.getElementById("books-container-category")

    if (booksContainerCart) {
        fetchCart();
    
        booksContainerCart.addEventListener("click", function(event) {
            target = event.target;

            if (target.id === "UnCart") {
                console.log("It Is Working")
                location.reload();
            }
        })
    } else if (booksContainerFavorites) {
        fetchFavorites()

        booksContainerFavorites.addEventListener("click", function(event) {
            target = event.target;

            if (target.id === "DisLike") {
                console.log("It Is Working")
                location.reload();
            }
        })
    } else if (booksContainerCategory) {
        const category = document.querySelector("h1").innerHTML
        fetchCategory(category)
    }

    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');

    if (query) {
        // Perform search with the query
        fetchSearch(query);
    }

    book = document.getElementById("anbook")
    if (book) {
        function getIdFromCurrentUrl() {
            const path = window.location.pathname; // e.g., '/book/2'
            const regex = /\/book\/(\d+)/; // Regular expression to match '/book/ID'
            const match = path.match(regex);
            return match ? parseInt(match[1], 10) : null;
        }
        
        // Example usage
        const id = getIdFromCurrentUrl();
        fetchBook(id)        
    }
});


