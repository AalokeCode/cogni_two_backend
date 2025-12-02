# COGNI 2.0 - An AI Based Curriculum Management System

### Description

COGNI 2.0 is an open-source AI based curriculum management system
designed for students/and enthusiasts who wants to manage their learning
systems.

### Basic Idea

The AI Platform, learns your learning style, answers queries. Quizzes
individuals and estimates how it runs. And the users can use their
own API keys to ensure that there is very little pricing

## Tech Stack

### Backend

NodeJS, Express, Prisma, PostgresSQL, Google Generative AI, Zod, JWT, Bcrypt

### Frontend

To be updated soon.

## API Routes

NOTE: @ is src/

### Authentication

1. `/auth/login` - For user login (File path in `@/auth/login.js`)
2. `/auth/register` - For user registration (File path in `@/auth/register.js`)

### User

3. `/api/user/me` - Get current user profile (File path in `@/routes/user.js`)
4. `/api/user/update` - Update user name and geminiApiKey (File path in `@/routes/user.js`)
5. `/api/user/credits` - Get current user credits (File path in `@/routes/user.js`)

### Admin

6. `/api/admin/users/:id/credits` - Update user credits (admin only) (File path in `@/routes/admin.js`)

### Curriculum

7. `/api/curriculum/create` - Create new curriculum with AI (costs 10 credits) (File path in `@/routes/curriculum.js`)
8. `/api/curriculum` - List user's curricula with search, filter, sort (File path in `@/routes/curriculum.js`)
9. `/api/curriculum/:id` - Get curriculum details (File path in `@/routes/curriculum.js`)
10. `/api/curriculum/:id` - Update curriculum metadata (File path in `@/routes/curriculum.js`)
11. `/api/curriculum/:id` - Delete curriculum (File path in `@/routes/curriculum.js`)

### Quiz (Curriculum-Based)

12. `/api/curriculum/:curriculumId/quiz/generate` - Generate quiz for curriculum (costs 20 credits) (File path in `@/routes/quiz.js`)
13. `/api/curriculum/:curriculumId/quiz` - Get existing quiz for curriculum (File path in `@/routes/quiz.js`)
14. `/api/curriculum/:curriculumId/quiz/submit` - Submit quiz answers and get results (File path in `@/routes/quiz.js`)
15. `/api/curriculum/:curriculumId/quiz` - Delete quiz to allow retake (File path in `@/routes/quiz.js`)

### Mentor

16. `/api/mentor/chat` - Chat with AI mentor, maintains conversation history (File path in `@/routes/mentor.js`)
