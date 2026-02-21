# NodeNews

A News Social Media platform

<img width="500" height="235" alt="Screenshot 2026-02-20 200035" src="https://github.com/user-attachments/assets/84a5dad6-b8ff-44f7-b716-6ff8ae318b8a" />

## Developers

- Avijit (Vee) Singh
- Nishant Naravarajula (Nish)

## Class

CS 5610 — Web Development, Northeastern University (Khoury College of Computer Sciences)

## Project Objective

NewsNode is a news discussion platform where users can share, discover, and discuss current events through article links and commentary. The platform uses a voting system and trending algorithms to surface the most important discussions, helping users quickly identify what matters most. NewsNode provides a dedicated space for serious news discussions where journalists can share original research and users can explore diverse perspectives on important issues.

## Website/Demo Link

Link to application : https://nodenews-crjx.onrender.com/
Link to Demo :

## Screenshot

![NewsNode Homepage](./frontend/sourceimages/screenshot-index.png)

## User Personas

1. **Tired Office Worker Ahmed**
   Needs to quickly catch up on important news without reading full articles.
   Wants to see trending topics and community sentiment at a glance with limited time after work.

2. **Independent Journalist Casey**
   Needs to share original research and independent perspectives with an engaged audience interested in serious journalism and meaningful discussion.

## User Stories

- As a user, I need to see the most discussed articles (today/week/month), so I can quickly catch up on important news.
- As a user, I need to post article links with my commentary, so I can share my perspective and start discussions.
- As a user, I need to upvote/downvote posts, so relevant content rises to the top.
- As a user, I need to comment on posts, so I can engage in debates about current events.
- As a user, I need to browse by category (Politics, Tech, Health, World, Science), so I can focus on topics I'm interested in.
- As a user, I need to filter by trending periods, so I can catch up on recent discussions when I've been away.

## Core Features

- User authentication (registration/login with JWT)
- Post article links with commentary and categories
- Upvote/downvote system for posts
- Comment threads on posts
- Trending page with time-based filters (today/week/month)
- Category-based filtering and keyword search
- Homepage feed showing recent posts

## Technical Stack

- **Backend:** Node.js, Express.js, MongoDB native driver (no Mongoose)
- **Frontend:** Vanilla ES6 JavaScript (no frameworks), HTML5, CSS3, Bootstrap 5
- **Authentication:** JWT (jsonwebtoken) with bcrypt password hashing
- **Deployment:** Render, MongoDB Atlas

## Work Split

**Vee (Avijit Singh):**

- Backend: User authentication system (registration, login, JWT middleware), Posts API (CRUD)
- Frontend: Login and Registration pages, Submit post form, Homepage feed, Voting UI for posts

**Nish (Nishant Naravarajula):**

- Backend: Comments API (CRUD), Vote tracking system, Search and filter by category, Trending page data aggregation
- Frontend: Post detail page, Comments section, Trending page with time-based filters, Category filtering UI

**Shared:** Database schema design, Seed script, Deployment to Render and MongoDB Atlas

## Instructions to Build

### Prerequisites

- Node.js (v16 or higher)
- npm
- MongoDB Atlas account

### Setup

1. Clone the repository:

```bash
git clone https://github.com/Quzai24/NodeNews.git
cd NodeNews
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=3000
```

4. Seed the database (1,150 records):

```bash
node scripts/seed.js
```

5. Start the server:

```bash
node backend.js
```

6. Open your browser and go to:

```
http://localhost:3000
```

## License

This project is licensed under the [MIT License](./LICENSE).

