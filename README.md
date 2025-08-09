# 📝 MERN Note Taking Web App

A full-stack note-taking application built with MongoDB, Express.js, React, and Node.js, featuring AI-powered assistance using Cohere API.

## ✨ Features

### Core Functionality

- **Create, Read, Update, Delete Notes** - Full CRUD operations for notes
- **User Authentication** - Secure registration and login system
- **Folder Organization** - Organize notes into custom folders with color coding
- **PDF Upload & Processing** - Extract text from PDFs and generate AI-powered notes
- **PowerPoint Upload & Processing** - Extract text from PPT/PPTX files and generate structured notes
- **File Management** - Support for multiple file formats with intelligent processing
- **Responsive Design** - Mobile-friendly interface with adaptive layouts

### AI-Powered Features (Cohere API)

- **Writing Assistant** - Grammar, style, and clarity improvements with apply suggestions
- **Note Summarizer** - Generate concise summaries of long content
- **Auto-Tagging** - Automatic tag generation for better organization
- **PDF to Notes** - AI-generated structured notes from PDF content
- **PPT to Notes** - AI-generated structured notes from PowerPoint presentations
- **Smart Content Enhancement** - Contextual AI suggestions for better note-taking

### Text Formatting & UI

- **Markdown Support** - Real-time markdown rendering with live preview
- **Rich Text Preview** - Toggle between edit and preview modes
- **Formatting Shortcuts** - Bold, italic, headers, lists, and more
- **Dark Theme Integration** - Consistent dark mode with custom toast notifications
- **Loading States** - Elegant loading animations with typewriter effects
- **Rate Limiting Protection** - Smart rate limiting with user-friendly feedback

## 🛠️ Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **pdf2json** - PDF text extraction
- **officegen** - PowerPoint (.pptx) text extraction
- **Cohere AI** - AI language model integration
- **Upstash Redis** - Rate limiting and caching
- **bcryptjs** - Password hashing and security

### Frontend

- **React** - Frontend framework with hooks and modern patterns
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind
- **Lucide React** - Modern icon library
- **React Hot Toast** - Elegant notification system
- **Custom Hooks** - Reusable AI functionality and state management

## 🏗️ Architecture & Design

### Component Architecture

- **Modular Design** - Highly modular components with single responsibility
- **Custom Hooks** - Shared logic for AI features across components
- **Responsive Layout** - Mobile-first design with adaptive interfaces
- **State Management** - Efficient state handling with React hooks

### User Experience

- **Dark Theme** - Consistent dark mode throughout the application
- **Loading States** - Elegant loading animations with typewriter effects
- **Toast Notifications** - User-friendly feedback for all actions
- **Error Handling** - Graceful error states with helpful messages
- **Rate Limiting** - Smart API protection with user feedback

### File Processing

- **Multi-format Support** - PDF and PowerPoint file processing
- **Progress Feedback** - Real-time processing status with typewriter animations
- **Intelligent Parsing** - AI-powered content extraction and structuring
- **Temporary Storage** - Secure file handling with automatic cleanup

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

- `GET /notes` - Get all user notes (with optional folder filtering)
- `POST /notes` - Create a new note
- `GET /notes/:id` - Get a specific note
- `PUT /notes/:id` - Update a note
- `DELETE /notes/:id` - Delete a note

### Folders

- `GET /folders` - Get all user folders (with optional parent filtering)
- `POST /folders` - Create a new folder
- `GET /folders/:id/path` - Get breadcrumb path for a folder
- `PUT /folders/:id` - Update folder (rename)
- `DELETE /folders/:id` - Delete a folder

### AI Features

- `POST /ai/writing-assistant` - Get writing improvements
- `POST /ai/summarize` - Generate note summary
- `POST /ai/tags` - Generate tags for content

### File Processing

- `POST /pdf/process` - Upload and process PDF file
- `POST /ppt/process` - Upload and process PowerPoint file

## 🗂️ Project Structure

```
mern-note-taking-app/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and external service configs
│   │   │   ├── db.js        # MongoDB connection
│   │   │   └── upstash.js   # Redis configuration
│   │   ├── controllers/     # Route handlers
│   │   │   ├── authController.js    # Authentication logic
│   │   │   └── controller.js        # Notes and AI features
│   │   ├── middleware/      # Authentication and rate limiting
│   │   │   ├── auth.js      # JWT authentication
│   │   │   └── rateLimiter.js       # API rate limiting
│   │   ├── model/          # MongoDB schemas
│   │   │   ├── Note.js      # Note data model
│   │   │   └── User.js      # User data model
│   │   ├── routes/         # API routes
│   │   │   ├── authRoutes.js        # Authentication endpoints
│   │   │   └── notesRoutes.js       # Notes CRUD endpoints
│   │   ├── temp/           # Temporary file uploads
│   │   └── server.js       # Express server setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   │   ├── AIFeatures.jsx       # AI writing assistant & summarizer
│   │   │   ├── Breadcrumb.jsx       # Navigation breadcrumbs
│   │   │   ├── CreateFolderModal.jsx # Folder creation dialog
│   │   │   ├── FolderCard.jsx       # Folder display component
│   │   │   ├── FormattingHelp.jsx   # Markdown help guide
│   │   │   ├── LoadingSpinner.jsx   # Consistent loading component
│   │   │   ├── ManualNoteForm.jsx   # Manual note creation form
│   │   │   ├── ModeSelector.jsx     # Note creation mode picker
│   │   │   ├── Navbar.jsx           # Main navigation bar
│   │   │   ├── NoteActions.jsx      # Note action buttons
│   │   │   ├── NoteCard.jsx         # Note display component
│   │   │   ├── NoteEditMode.jsx     # Note editing interface
│   │   │   ├── NoteEditor.jsx       # Rich text editor
│   │   │   ├── NotesNotFound.jsx    # Empty state component
│   │   │   ├── NoteViewMode.jsx     # Note viewing interface
│   │   │   ├── PDFUploadForm.jsx    # PDF upload & processing
│   │   │   ├── PPTUploadForm.jsx    # PowerPoint upload & processing
│   │   │   ├── ProcessingState.jsx  # File processing feedback
│   │   │   └── RateLimitedUI.jsx    # Rate limit notification
│   │   ├── hooks/          # Custom React hooks
│   │   │   └── useAIFeatures.js     # Shared AI functionality
│   │   ├── lib/            # Utilities and configurations
│   │   │   ├── axios.js     # HTTP client setup
│   │   │   ├── PrivateRoute.jsx     # Protected route wrapper
│   │   │   └── utils.js     # Helper functions
│   │   ├── pages/          # Page components
│   │   │   ├── CreatePage.jsx       # Note creation page
│   │   │   ├── HomePage.jsx         # Main dashboard
│   │   │   ├── LoginPage.jsx        # User login
│   │   │   ├── NoteDetailPage.jsx   # Individual note view
│   │   │   └── RegisterPage.jsx     # User registration
│   │   ├── App.jsx         # Main app component
│   │   ├── index.css       # Global styles
│   │   └── main.jsx        # React app entry point
│   ├── eslint.config.js    # ESLint configuration
│   ├── favicon.png         # App favicon
│   ├── index.html          # HTML template
│   ├── package.json        # Frontend dependencies
│   ├── postcss.config.js   # PostCSS configuration
│   ├── tailwind.config.js  # Tailwind CSS setup
│   └── vite.config.js      # Vite build configuration
├── .gitignore              # Git ignore rules
├── LICENSE                 # Project license
├── package.json            # Root package.json
└── README.md               # Project documentation
```

## Made with 🧡 by zeeshan
