# MyTune

A modern, full-stack music streaming application built with React and Node.js, offering seamless audio playback with an intuitive user interface.

## Overview

MyTune is a web-based music streaming platform that integrates with YouTube's API to provide users with access to a vast library of music content. The application features a responsive design, persistent playback state, and comprehensive user authentication.

## Features

### Core Functionality
- **Music Streaming**: High-quality audio playback powered by YouTube API integration
- **Search & Discovery**: Advanced search capabilities with real-time results
- **Playlist Management**: Create, edit, and organize custom playlists
- **Library System**: Personal music library with history tracking
- **Persistent Playback**: Resume playback across sessions with saved state

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: GSAP-powered transitions and interactions
- **Custom Scrolling**: Locomotive Scroll integration for enhanced navigation
- **Media Controls**: Full keyboard and media key support
- **Quality Selection**: Adjustable streaming quality options

### Authentication & Security
- **User Authentication**: Secure login and registration system
- **OAuth Integration**: Google OAuth support for streamlined access
- **Email Verification**: Account verification via email
- **Session Management**: Persistent user sessions with JWT tokens

## Technology Stack

### Frontend
- **React 19.2**: Modern UI framework with hooks and context API
- **React Router**: Client-side routing and navigation
- **Vite**: Fast build tool and development server
- **GSAP**: Professional-grade animation library
- **Locomotive Scroll**: Smooth scrolling implementation
- **Lucide React**: Icon library for consistent UI elements

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express**: Web application framework
- **PostgreSQL**: Relational database for data persistence
- **JWT**: JSON Web Tokens for authentication
- **Nodemailer**: Email service integration

### Development Tools
- **ESLint**: Code quality and consistency
- **Concurrently**: Parallel script execution
- **Nodemon**: Automatic server restart during development

## Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- YouTube Data API key
- SMTP server credentials (for email functionality)

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/Munim94s/MyTune.git
   cd MyTune
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the `src` directory with the following variables:
   ```
   VITE_YOUTUBE_API_KEY=your_youtube_api_key
   VITE_API_URL=http://localhost:5000
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_jwt_secret
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_USER=your_smtp_username
   SMTP_PASS=your_smtp_password
   ```

4. Initialize the database:
   ```bash
   # Run database migrations (if applicable)
   npm run migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173` (frontend) and `http://localhost:5000` (backend).

## Project Structure

```
MyTune/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── context/           # Context providers
│   ├── pages/             # Page components
│   ├── services/          # API and utility services
│   └── utils/             # Helper functions
├── server/                # Backend source code
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── index.js           # Server entry point
├── public/                # Static assets
└── package.json           # Project dependencies
```

## Available Scripts

- `npm run dev` - Start both frontend and backend development servers
- `npm run dev:client` - Start only the frontend development server
- `npm run dev:server` - Start only the backend development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint for code quality checks

## Deployment

### Frontend Deployment (Vercel)
The frontend is configured for deployment on Vercel with automatic SPA routing:
```bash
vercel --prod
```

### Backend Deployment
The backend can be deployed to any Node.js hosting platform. Ensure environment variables are properly configured in the production environment.

## API Integration

MyTune integrates with the YouTube Data API v3 for music content. Ensure your API key has the following scopes enabled:
- YouTube Data API v3
- Search capabilities
- Video details access

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome. Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Commit your changes with descriptive messages
4. Submit a pull request

## License

This project is private and proprietary.

## Contact

For questions or support, please contact the repository owner.

## Acknowledgments

- YouTube API for content delivery
- React community for excellent documentation
- All open-source contributors whose libraries power this application
