# Agent Dispatcher - Emergency Response System

A comprehensive emergency response system featuring a voice AI agent for dispatching emergency services in Tamil Nadu. This system integrates voice recognition, natural language processing, and real-time response capabilities to handle emergency calls for ambulance (108), police (100), and fire (101) services.

## Project Structure

The project consists of three main components:

### 1. Agent (Voice AI)
- Located in `/agent/`
- Built with Python and LiveKit Agents
- Uses Deepgram for speech-to-text and text-to-speech
- Uses Google Gemini for natural language processing
- Handles real-time voice conversations with callers
- Designed to detect emergencies, extract crucial information, and provide appropriate guidance

### 2. Frontend
- Located in `/frontend/`
- Built with React, TypeScript, and Vite
- Provides a user interface for interacting with the system
- Connected to the backend through API endpoints

### 3. Backend API
- Located in `/backend-express/`
- Built with Express, TypeScript, and Prisma
- Manages data persistence and business logic
- Provides API endpoints for the frontend
- Integrates with the agent for call handling

## Features

- **Multi-service emergency handling**: Supports ambulance, police, and fire emergency responses
- **Real-time voice interaction**: Natural conversation with callers using AI voice technology
- **Automatic dispatch**: Intelligently routes emergency calls to appropriate services
- **Emotion detection**: Adapts tone based on caller distress level
- **Multi-language support**: Handles Tamil, English, and Hindi
- **Background noise analysis**: Detects critical sounds (gunshots, sirens, crashes)
- **Smart call prioritization**: Automatically escalates life-threatening cases

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

- **Voice AI**: LiveKit Agents, Deepgram, Google Gemini
- **Frontend**: React, TypeScript, Vite
- **Backend**: Express, TypeScript, Prisma
- **Database**: SQLite (development), PostgreSQL (production)

## License

This project includes components with various licenses. See individual component directories for license details. 