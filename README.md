# 📚 Course Material Repository App

A full-stack MERN (MongoDB, Express, React, Node.js) application that allows lecturers to upload course materials and students to easily access them.  
The system provides a **repository-like structure** where materials are organized by course, unit, and date.

---

## ✨ Features

- 👨‍🏫 Lecturers can upload multiple notes/files for specific courses
- 🎓 Students can view and search for units they are enrolled in
- 📂 Notes organized by upload date (Lesson 1 → latest)
- 🔍 Search functionality with access control (only enrolled students can view materials)
- 🛡️ Authentication & authorization (configurable)
- ☁️ Database powered by MongoDB (Atlas)

---

## 🛠️ Tech Stack

- **Frontend**: React.js  
- **Backend**: Node.js + Express  
- **Database**: MongoDB Atlas  
- **Hosting**: Render
- **Email/Notifications**: Nodemailer

---

## ⚙️ DevOps & System Design

- **Deployment**: CI/CD pipeline (GitHub → hosting provider)  
- **Monitoring & Observability**:  
  - Logging with Express middleware  
  - Error handling with standardized responses  
  - Monitoring via MongoDB Atlas dashboards & hosting provider metrics  

- **System Design Principles Applied**:  
  - Modular separation of **frontend** (React) and **backend** (Node/Express)  
  - RESTful APIs for communication  
  - Secure handling of MongoDB URI with environment variables  
  - Stateless server design for scalability  

---

## 🗄️ Database (MongoDB Atlas)

This app uses **MongoDB Atlas** as the cloud database.  

### 🔌 Connecting to MongoDB Atlas
1. Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account.  
2. Create a new cluster.  
3. Whitelist your IP address or allow access from anywhere.  
4. Create a database user and password.  
5. Copy your **MongoDB URI string**, which looks like this:
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority

6. Add it to your **.env** file:
MONGODB_URI="mongodb+srv://yourUser:yourPassword@cluster0.xxxxx.mongodb.net/repositoryDB"
PORT=5000

7. Use the URI in your backend `db.js`:

```js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;


## 🧪 Tests

Both unit tests and integration tests were written for reliability.

✅ Unit Tests

React components rendering

Utility functions for data formatting

API controllers



## 🔗 Integration Tests

API endpoints (/api/lecturer/upload, /api/student/units)

MongoDB operations (saving & retrieving notes)

---

## 📊 Test Results
PASS  tests/components/Repository.test.js
PASS  tests/api/lecturer.test.js
PASS  tests/api/student.test.js

Test Suites: 3 passed, 3 total  
Tests:       20 passed, 20 total  
Snapshots:   0 total  
Time:        5.012s

---

## 🚀 Getting Started
Prerequisites

Node.js >= 18

npm or yarn

MongoDB Atlas cluster

Installation
# Clone the repository
git clone https://github.com/your-username/course-repository.git

# Navigate into the project
cd course-repository

1. Backend Setup
cd backend
npm install


Create .env file in backend:

MONGODB_URI="your-mongodb-uri-here"
PORT=5000


Run the backend:

npm run dev

2. Frontend Setup
cd frontend
npm install
npm start


The app will be available at:

Frontend: http://localhost:3000

Backend API: http://localhost:3001

---

## 📬 Feedback

Feel free to contribute or raise issues.
For direct inquiries, use the contact details on my portfolio.

