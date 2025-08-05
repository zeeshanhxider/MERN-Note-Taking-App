# 📝 MERN Note Taking Web App

A full-stack note-taking application built with MongoDB, Express.js, React, and Node.js, featuring AI-powered assistance using Cohere API.

## ✨ Features

### Core Functionality

- **Create, Read, Update, Delete Notes** - Full CRUD operations for notes
- **User Authentication** - Secure registration and login system
- **Folder Organization** - Organize notes into custom folders
- **PDF Upload & Processing** - Extract text from PDFs and generate AI-powered notes

### AI-Powered Features (Cohere API)

- **Writing Assistant** - Grammar, style, and clarity improvements
- **Note Summarizer** - Generate concise summaries of long content
- **Auto-Tagging** - Automatic tag generation for better organization
- **PDF to Notes** - AI-generated structured notes from PDF content

### Text Formatting

- **Markdown Support** - Real-time markdown rendering
- **Rich Text Preview** - Toggle between edit and preview modes
- **Formatting Shortcuts** - Bold, italic, headers, lists, and more

## 🛠️ Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **pdf2json** - PDF text extraction
- **Cohere AI** - AI language model integration

### Frontend

- **React** - Frontend framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind
- **Lucide React** - Icon library

## ⚙️ Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/mern-notes

# JWT Secret for authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Cohere AI API Configuration
COHERE_API_KEY=your-cohere-api-key-here

# Server Configuration
PORT=5001
NODE_ENV=production

# Upstash Redis Configuration (for rate limiting)
UPSTASH_REDIS_REST_URL=your-upstash-redis-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-token
```

## 🧩 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Cohere AI API key ([Get one here](https://cohere.ai/))

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd mern-note-taking-app
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**

   ```bash
   cd ../backend
   cp .env.example .env
   # Edit .env with your actual values
   ```

5. **Start the development servers**

   Backend (from backend directory):

   ```bash
   npm run dev
   ```

   Frontend (from frontend directory):

   ```bash
   npm run dev
   ```

## 📡 API Endpoints

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Notes

- `GET /notes` - Get all user notes
- `POST /notes` - Create a new note
- `GET /notes/:id` - Get a specific note
- `PUT /notes/:id` - Update a note
- `DELETE /notes/:id` - Delete a note

### AI Features

- `POST /ai/writing-assistant` - Get writing improvements
- `POST /ai/summarize` - Generate note summary
- `POST /ai/tags` - Generate tags for content

### PDF Processing

- `POST /pdf/process` - Upload and process PDF file

## 🗂️ Project Structure

```
mern-note-taking-app/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and external service configs
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Authentication and rate limiting
│   │   ├── model/          # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   └── server.js       # Express server setup
│   ├── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── lib/           # Utilities and configurations
│   │   ├── pages/         # Page components
│   │   └── main.jsx       # React app entry point
│   ├── package.json
│   └── vite.config.js
└── README.md
```


## Made with 🧡 by zeeshan
