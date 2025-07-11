import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import React from 'react';

const Student2Modal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email.trim()) {
      alert('Please enter a valid email.');
      return;
    }

    try {
      const response = await fetch(
        `https://project-2-1u71.onrender.com/student/${encodeURIComponent(
          email
        )}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorMessage =
          response.status === 404
            ? 'Student not found.'
            : response.status === 403
            ? 'Access denied. User is not a student.'
            : 'Error fetching student data.';
        alert(errorMessage);
        return;
      }

      const data = await response.json();

      if (data.role !== 'student') {
        console.error('Role mismatch in API response.');
        alert('Access denied. User is not a student.');
        return;
      }

      localStorage.setItem('email', data.email);
      localStorage.setItem('role', data.role);
      localStorage.setItem('name', data.name);
      localStorage.setItem('school', data.school || 'N/A');
      localStorage.setItem('course', data.course || 'N/A');

      console.log('Stored in localStorage:', {
        email: localStorage.getItem('email'),
        role: localStorage.getItem('role'),
        name: localStorage.getItem('name'),
        school: localStorage.getItem('school'),
        course: localStorage.getItem('course'),
      });

      navigate(`/student/${encodeURIComponent(data.email)}`);
      onClose(); // Close the modal after success
    } catch (error) {
      console.error('Server error:', error);
      alert('Server error. Try again later.');
    }
  };

  return isOpen ? (
    <div className="background-1">
      <style>
        {`
                h2 {
                    color:#f1f1f1;
                }
                input {
                    background-color: #f1f1f1;
                    font-size: 20px;
                }
                `}
      </style>
      <h2>Enter Student Email</h2>
      <label htmlFor="email">Email</label>
      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <div className="modal-buttons">
        <button className="btn" onClick={handleSubmit}>
          Submit
        </button>
        <button className="btn close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  ) : null;
};

export default Student2Modal;
