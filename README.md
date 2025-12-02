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
