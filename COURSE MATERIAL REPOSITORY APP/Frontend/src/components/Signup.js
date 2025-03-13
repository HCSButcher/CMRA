import { useState } from 'react';
import axios from 'axios';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [file, setFile] = useState(null);
  const [contact, setContact] = useState('');
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors([]);
    if (!file) {
      setErrors([{ msg: 'Please select a file to upload' }]);
      return;
    }
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('role', role);
    formData.append('password', password);
    formData.append('file', file);
    formData.append('contact', contact);

    axios.post('http://localhost:3001/register', formData)
      .then(result => {
        console.log(result);
        setSuccessMessage('User registered successfully!');
        setName('');
        setEmail('');
        setContact('');
        setPassword('');
        setFile(null);
        setErrors([]);
      })
      .catch(err => {
        if (err.response && err.response.data) {
          const errorMessage = err.response.data.errors || [{ msg: 'Upload failed' }];
          setErrors(errorMessage);
        } else {
          setErrors([{ msg: 'Upload failed' }]);
          console.error('Error', err);
        }
      });
  };

  return (
    <div>
      <style>
        {`
          body {
            background-color: #080710;
          }
          h1, h2, footer, p {
            color: #ffffff;
          }
          h1 {
            text-align: center;
            font-weight: 500;
          }
          .error-container {
            position: absolute;
            top: 20px;
            left: 20px;
            background-color: rgba(255, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
          }
          .error-container ul {
            margin: 0;
            padding: 0;
            list-style: none;
          }
          .error-container li {
            margin-bottom: 5px;
            font-size: 14px;
          }
          .success-message {
           font-size: 20px;
            color: green;
            text-align: left;
            margin-top: 10px;
            position: absolute;
            top: 20px;
            left: 20px;
          }
          .background {
            width: 430px;
            height: 520px;
            position: absolute;
            transform: translate(-50%, -50%);
            left: 50%;
            top: 50%;
          }
          .background .shape {
            height: 200px;
            width: 200px;
            position: absolute;
            border-radius: 50%;
          }
          .shape:first-child {
            background: linear-gradient(#1845ad, #23a2f6);
            left: -130px;
            top: 0;
          }
          .shape:last-child {
            background: linear-gradient(to right, #ff512f, #f09819);
            right: -80px;
            bottom: -50px;
          }
          form {
            height: 630px;
            width: 320px;
            background-color: rgba(255, 255, 255, 0.13);
            position: absolute;
            transform: translate(-50%, -50%);
            top: 50%;
            left: 50%;
            border-radius: 10px;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 0 40px rgba(8, 7, 16, 0.6);
            padding: 50px 35px;
          }
          form * {
            font-family: 'Poppins', sans-serif;
            color: #ffffff;
            letter-spacing: 0.5px;
            outline: none;
            border: none;
          }
          label {
            display: block;
            font-size: 16px;
            font-weight: 500;
            margin-top: 5px;
          }
          input {
            display: block;
            height: 50px;
            width: 100%;
            background-color: rgba(255, 255, 255, 0.07);
            border-radius: 3px;
            padding: 0 10px;
            margin-top: 8px;
            font-size: 14px;
            font-weight: 300;
          }
          ::placeholder {
            color: #e5e5e5;
          }
          button {
            margin-top: 20px; /* Adjusted position of the button */
            width: 100%;
            background-color: #ffffff;
            color: #080710;
            padding: 15px 0;
            font-size: 18px;
            font-weight: 600;
            border-radius: 5px;
            cursor: pointer;
          }
          select {
            display: block;
            height: 50px;
            width: 100%;
            background-color: rgba(255, 255, 255, 0.07);
            border-radius: 3px;
            padding: 0 10px;
            margin-top: 8px;
            font-size: 14px;
            font-weight: 300;
            color: white;
          }
          select option {
            background-color: black; /* Make options black */
            color: white; /* Ensure text in options is visible */
          }
          .shape:first-child {
            animation: floatLeft 4s ease-in-out infinite;
          }
          .shape:last-child {
            animation: floatRight 4s ease-in-out infinite;
          }
          @keyframes floatLeft {
            0% {
              transform: translateX(0);
            }
            50% {
              transform: translateX(-20px);
            }
            100% {
              transform: translateX(0);
            }
          }
          @keyframes floatRight {
            0% {
              transform: translateX(0);
            }
            50% {
              transform: translateX(20px);
            }
            100% {
              transform: translateX(0);
            }
          }
        `}
      </style>

      <div className="background">
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      {errors.length > 0 && (
        <div className="error-container">
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error.msg}</li>
            ))}
          </ul>
        </div>
      )}

      {successMessage && <p className="success-message">{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <label htmlFor="file">Profile Picture</label>
        <input 
          type="file"
          id='file'
          accept='.pdf, .png, .jpg, .mp4'
          name='file'
          onChange={(e) => setFile(e.target.files[0])}
        />

        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          placeholder="Enter full name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          placeholder="Enter email address"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <label htmlFor="contact">Contact</label>
        <input
          type="text"
          id="contact"
          placeholder="Enter contact number"
          name="contact"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          placeholder="Enter password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label htmlFor="role">Role</label>
        <select
          name="role"
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="Super-admin">Super Admin</option>
          <option value="student">Student</option>
          <option value="lecturer">Lecturer</option>
        </select>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Signup;
