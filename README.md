# COGNI 2.0 - Backend

> AI-Powered Curriculum Management System Backend

## Overview

COGNI 2.0 is an open-source AI-based curriculum management system designed for students and enthusiasts who want to personalize and track their learning journey. The platform uses AI to generate custom curricula, quizzes, and provides an AI mentor for learning assistance.

## Features

- 🔐 **Authentication** - JWT-based secure authentication with bcrypt password hashing
- 📚 **AI Curriculum Generation** - Generate personalized learning paths using Google Gemini AI
- 📝 **Quiz System** - AI-generated quizzes with automatic grading and weak topic analysis
- 🤖 **AI Mentor** - Context-aware chat assistant for learning support
- 👨‍💼 **Admin Dashboard** - User management and system statistics
- 💳 **Credit System** - Credit-based usage for AI features

## Tech Stack

| Category   | Technologies                            |
| ---------- | --------------------------------------- |
| Runtime    | Node.js                                 |
| Framework  | Express.js                              |
| Database   | PostgreSQL                              |
| ORM        | Prisma                                  |
| AI         | Google Generative AI (Gemini 2.0 Flash) |
| Validation | Zod                                     |
| Auth       | JWT + Bcrypt                            |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google AI API key (optional - users can provide their own)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/cogni"
JWT_SECRET="your-jwt-secret"
GEMINI_API_KEY="your-gemini-api-key"  # Optional fallback
```

## API Reference

Base URL: `http://localhost:3000`

### Authentication

| Method | Endpoint         | Description             |
| ------ | ---------------- | ----------------------- |
| POST   | `/auth/register` | Register new user       |
| POST   | `/auth/login`    | Login and get JWT token |

### User

| Method | Endpoint            | Description                    |
| ------ | ------------------- | ------------------------------ |
| GET    | `/api/user/me`      | Get current user profile       |
| PUT    | `/api/user/update`  | Update name and Gemini API key |
| GET    | `/api/user/credits` | Get current credit balance     |

### Curriculum

| Method | Endpoint                 | Description                                     |
| ------ | ------------------------ | ----------------------------------------------- |
| POST   | `/api/curriculum/create` | Generate new AI curriculum (10 credits)         |
| GET    | `/api/curriculum`        | List user's curricula with search, filter, sort |
| GET    | `/api/curriculum/:id`    | Get curriculum details with modules             |
| PUT    | `/api/curriculum/:id`    | Update curriculum (title, progress)             |
| DELETE | `/api/curriculum/:id`    | Delete curriculum                               |

**Query Parameters for GET /api/curriculum:**

- `search` - Search by title or topic
- `difficulty` - Filter by beginner/intermediate/advanced
- `sortBy` - Sort by createdAt/updatedAt/title
- `order` - Sort order asc/desc

### Quiz

| Method | Endpoint                                      | Description                    |
| ------ | --------------------------------------------- | ------------------------------ |
| POST   | `/api/curriculum/:curriculumId/quiz/generate` | Generate quiz (5 credits)      |
| GET    | `/api/curriculum/:curriculumId/quiz`          | Get quiz with questions        |
| POST   | `/api/curriculum/:curriculumId/quiz/submit`   | Submit answers and get results |
| DELETE | `/api/curriculum/:curriculumId/quiz`          | Delete quiz for retake         |

### Mentor

| Method | Endpoint           | Description                             |
| ------ | ------------------ | --------------------------------------- |
| POST   | `/api/mentor/chat` | Chat with AI mentor (maintains history) |

### Admin (Admin role required)

| Method | Endpoint                       | Description                    |
| ------ | ------------------------------ | ------------------------------ |
| GET    | `/api/admin/users`             | List all users with pagination |
| GET    | `/api/admin/users/:id`         | Get specific user details      |
| PUT    | `/api/admin/users/:id/role`    | Update user role               |
| PUT    | `/api/admin/users/:id/credits` | Update user credits            |
| DELETE | `/api/admin/users/:id`         | Delete user account            |
| GET    | `/api/admin/curriculum`        | List all curricula             |
| GET    | `/api/admin/curriculum/:id`    | View any curriculum            |
| DELETE | `/api/admin/curriculum/:id`    | Delete any curriculum          |
| GET    | `/api/admin/stats`             | Dashboard statistics           |

## Project Structure

```
src/
├── index.js           # Express app entry point
├── auth/
│   ├── index.js       # Auth router
│   ├── login.js       # Login handler
│   └── register.js    # Registration handler
├── middleware/
│   └── auth.js        # JWT authentication middleware
├── routes/
│   ├── user.js        # User profile routes
│   ├── curriculum.js  # Curriculum CRUD routes
│   ├── quiz.js        # Quiz generation and submission
│   ├── mentor.js      # AI mentor chat
│   └── admin.js       # Admin management routes
└── utils/
    ├── gemini.js      # Google AI integration
    └── responses.js   # Standardized API responses

prisma/
├── schema.prisma      # Database schema
└── migrations/        # Database migrations
```

## Database Schema

### User

- Credits system (starts with 100)
- Optional personal Gemini API key
- Role-based access (user/admin)

### Curriculum

- AI-generated modules with lessons
- Progress tracking (JSON)
- Difficulty levels and depth options

### Quiz

- Multiple choice questions
- Results with score and weak topic analysis
- Linked to curriculum

## Credit Costs

| Action              | Credits |
| ------------------- | ------- |
| Generate Curriculum | 10      |
| Generate Quiz       | 5       |
| AI Mentor Chat      | Free    |

## License

MIT
