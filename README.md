# Technical Interview System

A comprehensive technical interview system featuring a voice AI agent for conducting automated technical interviews. This system integrates voice recognition, natural language processing, and real-time response capabilities to conduct professional technical interviews for software engineering positions.

## Project Structure

The project consists of three main components:

### 1. Agent (Voice AI)
- Located in `/agent/`
- Built with Python and LiveKit Agents
- Uses Deepgram for speech-to-text and Google for text-to-speech
- Integrates with WebSockets for real-time updates
- Handles real-time voice conversations with candidates
- Designed to conduct interviews, ask technical questions, and provide feedback
- Stores interview data including transcripts, feedback, and scoring

### 2. Frontend
- Located in `/frontend/`
- Built with React 19, TypeScript, and Vite
- Uses TailwindCSS and Radix UI components for styling
- Socket.io for real-time communication
- Provides a user interface for managing interviews and viewing results
- Connected to the backend through API endpoints

### 3. Backend API
- Located in `/backend-express/`
- Built with Express, TypeScript, and Prisma ORM
- Manages data persistence and business logic
- Provides API endpoints for the frontend
- Uses Socket.io for real-time updates
- Integrates with the agent for interview handling

## Features

- **Professional technical interviews**: Conducts thorough software engineering interviews
- **Real-time voice interaction**: Natural conversation with candidates using AI voice technology
- **Comprehensive feedback**: Provides detailed evaluation on technical skills, problem-solving, and communication
- **Automatic transcription**: Records and stores the entire interview conversation
- **Detailed scoring**: Evaluates candidates on multiple dimensions including technical skills, problem-solving, communication, and cultural fit
- **WebSocket integration**: Provides real-time updates during the interview process
- **Flexible interview configuration**: Customizable for different positions and departments

## Setup Instructions

### Agent Setup

1. Navigate to the agent directory:
   ```
   cd agent
   ```

2. Create a virtual environment:
   ```
   python -m venv env
   ```

3. Activate the virtual environment:
   - Linux/macOS: `source env/bin/activate`
   - Windows: `env\Scripts\activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Create a `.env.local` file with your API keys:
   ```
   LIVEKIT_URL=your_livekit_url
   LIVEKIT_API_KEY=your_api_key
   LIVEKIT_API_SECRET=your_api_secret
   DEEPGRAM_API_KEY=your_deepgram_key
   GOOGLE_API_KEY=your_google_api_key
   WEBSOCKET_URL=http://localhost:5000
   ```

6. Run the agent:
   ```
   python agent.py dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend-express
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the database:
   ```
   npx prisma migrate dev --name init
   ```

4. Create a `.env` file with:
   ```
   NODE_ENV=development
   PORT=3001
   CORS_ORIGIN=http://localhost:3000
   DATABASE_URL="file:./dev.db"
   ```

5. Start the development server:
   ```
   npm run dev
   ```

## Technologies Used

- **Voice AI**: LiveKit Agents, Deepgram, Google Text-to-Speech
- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, Radix UI
- **Backend**: Express, TypeScript, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production)
- **Real-time Communication**: Socket.io
- **Authentication**: JWT

## License

This project includes components with various licenses. See individual component directories for license details. 