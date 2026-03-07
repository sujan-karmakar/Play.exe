# Play.exe 🎮

A full-stack web development project featuring a web-based gaming platform where users can play multiple browser games in one place. The project focuses on providing a simple, fast, and interactive experience for casual gaming directly in the browser.

## 🚀 Features

- **Multiple Games**: Play Rock Paper Scissors, Simon Game, Guessing Game, and Tic Tac Toe
- **User Authentication**: Secure signup/login with email verification via OTP
- **Profile Management**: Update username, email, and profile pictures
- **Leaderboards**: Global and game-specific leaderboards with rankings
- **Responsive Design**: Dark-themed UI that works on all devices
- **Real-time Scoring**: Track and display user scores across all games
- **Cloud Storage**: Profile pictures uploaded to Cloudinary

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Passport.js** - Authentication middleware
- **bcrypt** - Password hashing
- **Nodemailer** - Email sending
- **Multer** - File upload handling
- **Cloudinary** - Cloud storage for images

### Frontend
- **EJS** - Templating engine
- **Bootstrap** - CSS framework
- **Vanilla JavaScript** - Client-side interactions
- **CSS3** - Custom styling with dark theme

### DevOps & Tools
- **Git** - Version control
- **Nodemon** - Development server auto-restart
- **Connect-Mongo** - Session storage
- **Express-Session** - Session management

## 📁 Project Structure

```
Play.exe/
├── controllers/          # Route handlers
│   ├── authController.js # Authentication logic
│   ├── games.js         # Game routes
│   └── user.js          # User profile management
├── models/              # Database models
│   ├── otp.js          # OTP model
│   └── user.js         # User model
├── routes/              # Express routes
│   ├── games.js        # Game routes
│   └── user.js         # User routes
├── utils/               # Utility functions
│   ├── emailService.js # Email utilities
│   ├── otpService.js   # OTP generation/verification
│   ├── profileService.js# Profile data calculations
│   ├── ExpressError.js # Error handling
│   └── wrapAsync.js    # Async error wrapper
├── views/               # EJS templates
│   ├── layouts/        # Base layouts
│   ├── users/          # User-related pages
│   ├── games/          # Game pages
│   └── includes/       # Partial templates
├── public/              # Static assets
│   ├── css/            # Stylesheets
│   └── js/             # Client-side scripts
├── middleware.js        # Custom middleware
├── cloudConfig.js       # Cloudinary configuration
├── app.js              # Main application file
└── package.json        # Dependencies and scripts
```

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sujan-karmakar/Play.exe.git
   cd Play.exe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with:
   ```env
   ATLASDB_URL=your_mongodb_connection_string
   SECRET=your_session_secret
   CLOUD_NAME=your_cloudinary_cloud_name
   CLOUD_API_KEY=your_cloudinary_api_key
   CLOUD_API_SECRET=your_cloudinary_api_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```

4. **Start the development server**
   ```bash
   npm start
   # or for development with auto-restart
   nodemon app.js
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

## 🎯 Usage

1. **Sign Up**: Create an account with email verification
2. **Play Games**: Choose from multiple browser-based games
3. **Track Scores**: View your performance on leaderboards
4. **Customize Profile**: Update your information and upload a profile picture
5. **Compete**: Climb the global and game-specific leaderboards

## 🎮 Games Included

- **Rock Paper Scissors**: Classic hand game with computer AI
- **Simon Game**: Memory challenge with increasing difficulty
- **Guessing Game**: Number guessing with efficiency scoring
- **Tic Tac Toe**: Strategic 3x3 grid game

## 👨‍💻 Author

**Sujan Karmakar**
- GitHub: [@sujan-karmakar](https://github.com/sujan-karmakar)
- LinkedIn: [@sujan-karmakar](https://www.linkedin.com/in/sujan-karmakar/)

