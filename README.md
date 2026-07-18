# 🤖 Virtual Assistant

An AI-powered Full-Stack Virtual Assistant built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) with **Google Gemini AI** integration. Users can create personalized AI assistants, chat in real-time, upload images, and securely manage their accounts.

## 🌐 Live Demo

🚀 **Demo:** https://virtual-assistant-ochre-two.vercel.app

---

## 📌 Features

- 🔐 User Authentication (JWT)
- 🤖 AI-powered conversations using Google Gemini
- 👤 Create and customize virtual assistants
- 💬 Real-time AI chat
- 🖼️ Image upload with Cloudinary
- 📱 Fully Responsive UI
- ☁️ MongoDB Atlas Database
- 🔒 Secure API with Express.js
- ⚡ Fast React Frontend (Vite)

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- React Router DOM
- Axios
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Cloudinary
- Google Gemini API

---

## 📂 Project Structure

```
virtual_Assistant/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   └── package.json
│
├── package.json
├── vercel.json
└── README.md
```

---

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/jayesh722005/virtual_Assistant.git

cd virtual_Assistant
```

---

### Install Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on

```
http://localhost:5173
```

---

### Install Backend

```bash
cd backend
npm install
npm start
```

Runs on

```
http://localhost:8000
```

---

## 🔑 Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=8000
MONGODB_URL=YOUR_MONGODB_URL
JWT_SECRET=YOUR_SECRET
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
Gemini_API_URL=YOUR_GEMINI_API_URL
```

> ⚠️ Never commit your real API keys or secrets to GitHub.

---

## 📸 Screenshots

Add your project screenshots here.

Example:

```
screenshots/
    home.png
    login.png
    chat.png
```

---

## ✨ Future Improvements

- 🎤 Voice Chat
- 🌙 Dark Mode
- 📄 Chat History
- 🔊 Speech-to-Text
- 🌍 Multi-language Support
- 📁 File Upload Support

---

## 👨‍💻 Author

**Jayesh Khatke**

GitHub: https://github.com/jayesh722005

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub.

---

## 📄 License

This project is licensed under the MIT License.
