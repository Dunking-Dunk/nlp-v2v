# Interview Management System API

A RESTful API for managing interviews and candidates built with Express, TypeScript, and Prisma ORM with PostgreSQL.

## Setup

1. Clone the repository
2. Install dependencies
   ```
   npm install
   ```
3. Set up your environment variables by creating a `.env` file in the project root:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/interview_db
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=1d
   CORS_ORIGIN=http://localhost:3000
   ```
4. Run database migrations
   ```
   npx prisma migrate dev
   ```
5. Start the development server
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- **POST /api/auth/register**
  - Register a new user
  - Body: `{ email, password, name }`
  - Returns: User object with token

- **POST /api/auth/login**
  - Log in an existing user
  - Body: `{ email, password }`
  - Returns: User object with token

- **GET /api/auth/verify/:token**
  - Verify user email
  - Returns: Verification success message

- **POST /api/auth/forgot-password**
  - Request password reset
  - Body: `{ email }`
  - Returns: Success message

- **POST /api/auth/reset-password/:token**
  - Reset password
  - Body: `{ password }`
  - Returns: Success message

- **POST /api/auth/resend-verification**
  - Resend verification email
  - Body: `{ email }`
  - Returns: Success message

- **GET /api/auth/current-user**
  - Get current user from session cookie
  - Returns: User object

### Interviews

- **GET /api/interviews**
  - Get all interviews
  - Query params: `status`, `candidateId`
  - Returns: Array of interview objects

- **GET /api/interviews/:id**
  - Get single interview by ID
  - Returns: Interview object with candidate and transcript data

- **POST /api/interviews**
  - Create a new interview
  - Body: `{ candidateId, position, department, level, description }`
  - Returns: Created interview object

- **PUT /api/interviews/:id**
  - Update an interview
  - Body: Various fields including status, scores, and feedback
  - Returns: Updated interview object

- **DELETE /api/interviews/:id**
  - Delete an interview
  - Returns: Success message

- **POST /api/interviews/:id/transcript**
  - Add a transcript entry to an interview
  - Body: `{ speakerType, content }`
  - Returns: Created transcript entry

### Candidates

- **GET /api/candidates**
  - Get all candidates
  - Query params: `name`, `email`
  - Returns: Array of candidate objects with interviews

- **GET /api/candidates/:id**
  - Get single candidate by ID
  - Returns: Candidate object with interviews

- **POST /api/candidates**
  - Create a new candidate
  - Body: `{ email, phone, name, resume, experience, skills, education }`
  - Returns: Created candidate object

- **PUT /api/candidates/:id**
  - Update a candidate
  - Body: Fields to update
  - Returns: Updated candidate object

- **DELETE /api/candidates/:id**
  - Delete a candidate
  - Returns: Success message

## Data Models

### User
- id: string (UUID)
- email: string (unique)
- password: string (hashed)
- name: string (optional)
- isAdmin: boolean
- isVerified: boolean
- resetPasswordToken: string (optional)
- resetPasswordExpires: DateTime (optional)
- verificationTokens: relationship with VerificationToken

### Interview
- id: string (UUID)
- startTime: DateTime
- endTime: DateTime (optional)
- status: enum (ACTIVE, COMPLETED, CANCELLED, PENDING_REVIEW)
- candidate: relationship with Candidate
- position: string
- department: string
- level: string
- description: string
- feedback: text
- Various evaluation scores and notes
- transcriptEntries: relationship with InterviewTranscript

### Candidate
- id: string (UUID)
- email: string (optional, unique)
- phone: string (optional, unique)
- name: string
- resume: text (optional)
- experience: string (optional)
- skills: text (optional)
- education: text (optional)
- interviews: relationship with Interview

### InterviewTranscript
- id: string (UUID)
- interview: relationship with Interview
- timestamp: DateTime
- speakerType: enum (AGENT, CANDIDATE, SYSTEM)
- content: text 