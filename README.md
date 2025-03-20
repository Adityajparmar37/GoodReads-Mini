# GoodReads-Mini

## Introduction

GoodReads-Mini is a comprehensive book readers system & social platform that allows users to register, manage books, rate and review books, create social media posts, organize books into shelves, follow users, make friends, join groups, chat, and much more. Have a sematic search over the though of your choices through vector search

## Features

### Authentication Module

- User Registration
- Email Verification
- Login

### Book Module

- CRUD operations on books
- Only verified users with permission can upload books
- Filtering, searching, and sorting books
- Pagination support

### Rating & Review Module

- CRUD operations on book reviews and ratings
- Auto-remove reviews when a book is deleted
- Update book rating based on user reviews

### Social Media Posting Module

- Upload Book post on facebook & Instagram and managemnt post of both social media platform from one place
- Filter posts based on platform
- Sorting options available

### Shelves Module

- CRUD operations on shelves
- CRUD operations on books within a shelf , with book status (currently reading, wants to read or read)
- Filtering, searching, and sorting shelves
- Pagination support

### Follower Module

- Create, Read, and Delete followers
- Sorting and pagination support

### Friend Module

- CRUD operations on friends
- Sorting and pagination on friend lists

### Group Module

- Create, Read, Update, Delete groups
- Invite users to groups
- Join public groups
- Assign roles and permissions to group members
- Get members with searching, sorting, and pagination

### Chat Module

- Group chat using WebSockets

### Review's Comment & Like Module

- CRUD operations on comments and likes
- Sorting options available

### AI-Generated Reviews

- Auto-generate a review based on a user's review
- Directly generate a review based on book details if no user review is provided

### Nested Comments

- Nested comments up to one level
- CRUD operations on nested comments
- Sorting support

### Feature Flag

- Enable or disable features dynamically

### Vector Search

- Enhanced semantic search over genres
- Can be extended to book descriptions for better search experience

## Installation

### Prerequisites

Ensure you have the following installed:

- Node.js 
- KoaJS
- MongoDB
 
### Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/bookhub-api.git
   cd Backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file and configure the necessary environment variables.
   According to `.env.example` file

4. Start the server:
   ```sh
   npm run start
   ```

## API Documentation

For detailed API endpoints and request/response structures, refer to the following API documentation.
https://documenter.getpostman.com/view/27919522/2sAYk7QiZN

Hope you like the project 🤞🏻
