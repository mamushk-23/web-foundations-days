# Library API Design

This document outlines the RESTful API endpoints for managing books in a library system.

h
## Endpoints

### 1. List all books
- **Method:** `GET`
- **Path:** `/api/books`
- **Description:** Retrieves a list of all books in the library.
- **Success Status Code:** `200 OK`

### 2. Get a single book
- **Method:** `GET`
- **Path:** `/api/books/{id}`
- **Description:** Retrieves the details of a specific book by its unique ID.
- **Success Status Code:** `200 OK`

### 3. Create a new book
- **Method:** `POST`
- **Path:** `/api/books`
- **Description:** Adds a new book to the library collection.
- **Example Request Body:**
  ```json
  {
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "year": 1925
  }