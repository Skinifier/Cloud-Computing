# Cloud Computing

## Users
### Register User
URL: /register
Method: POST
Description: Register a new user.
Request Body:
{
  "username": "string",
  "password": "string",
  "email": "string"
}

### Login User
URL: /login
Method: POST
Description: Login a user.
Request Body:
{
  "email": "string",
  "password": "string"
}

### Get User Profile
URL: /users
Method: GET
Description: Get the authenticated user's profile.
Headers:
Authorization: Bearer <token>

### Update User Profile
URL: /users
Method: PUT
Description: Update the authenticated user's profile.
Headers:
Authorization: Bearer <token>
Request Body (Form Data):
foto: File
Other profile fields as needed.

## Barang
### Get All Barang
URL: /barang
Method: GET
Description: Get all barang.
Headers:
Authorization: Bearer <token>

### Get Barang By User
URL: /barang/users
Method: GET
Description: Get all barang added by the authenticated user.
Headers:
Authorization: Bearer <token>

### Get Barang By ID
URL: /barang/:id
Method: GET
Description: Get barang by ID.
Headers:
Authorization: Bearer <token>

### Add Barang
URL: /barang
Method: POST
Description: Add new barang.
Headers:
Authorization: Bearer <token>
Request Body (Form Data):
foto: File[] (up to 2 files)
Other barang fields as needed.

### Update Barang
URL: /barang/:id
Method: PUT
Description: Update barang by ID.
Headers:
Authorization: Bearer <token>
Request Body (Form Data):
foto: File[] (up to 2 files)
Other barang fields as needed.

### Delete Barang
URL: /barang/:id
Method: DELETE
Description: Delete barang by ID.
Headers:
Authorization: Bearer <token>

## Wishlist
### Add Wishlist
URL: /wishlist
Method: POST
Description: Add new wishlist item.
Headers:
Authorization: Bearer <token>
Request Body:
{
  "barangId": "string"
}

### Get Wishlist
URL: /wishlist
Method: GET
Description: Get all wishlist items for the authenticated user.
Headers:
Authorization: Bearer <token>

### Delete Wishlist Item
URL: /wishlist/:id
Method: DELETE
Description: Delete a wishlist item by ID.
Headers:
Authorization: Bearer <token>

## Articles
### Add Article
URL: /articles
Method: POST
Description: Add new article.
Request Body (Form Data):
foto: File
Other article fields as needed.

### Get All Articles
URL: /articles
Method: GET
Description: Get all articles.
Headers:
Authorization: Bearer <token>

### Get Article By ID
URL: /articles/:id
Method: GET
Description: Get article by ID.
Headers:
Authorization: Bearer <token>

### Update Article
URL: /articles/:id
Method: PUT
Description: Update article by ID.
Request Body (Form Data):
foto: File
Other article fields as needed.

### Delete Article
URL: /articles/:id
Method: DELETE
Description: Delete article by ID.
