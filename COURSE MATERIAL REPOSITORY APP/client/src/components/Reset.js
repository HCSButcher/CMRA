import { useState } from 'react';
import axios from 'axios';

const Reset = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage('');

    try {
      const result = await axios.post(
        'https://project-2-1u71.onrender.com/reset',
        { email, password } // No authentication required
      );

      console.log('🔹 Reset Response:', result.data);
      setSuccessMessage(result.data.message);
    } catch (err) {
      const errorMsg = err.response?.data?.errors || [
        { msg: 'Something went wrong. Please try again later.' },
      ];
      setErrors(errorMsg);
      console.error('Error:', err);
    }
  };

  return (
    <div>
      <style>{`
                body { background-color: #080710; }
                h1, h2, p { color: #ffffff; text-align: center; }
                .background { width: 430px; height: 520px; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }
                .shape { height: 200px; width: 200px; border-radius: 50%; position: absolute; }
                .shape:first-child { background: linear-gradient(#1845ad, #23a2f6); left: -130px; top: 0; }
                .shape:last-child { background: linear-gradient(to right, #ff512f, #f09819); right: -80px; bottom: -50px; }
                form { background-color: rgba(255,255,255,0.13); padding: 50px 35px; border-radius: 10px; text-align: center; }
                label, input, button { display: block; width: 100%; }
                input { height: 50px; background-color: rgba(255,255,255,0.07); margin-top: 5px; }
                button { margin-top: 30px; padding: 10px; font-size: 18px; }
            `}</style>

      <div className="background">
        <div className="shape"></div>
        <div className="shape"></div>
      </div>
      <h1>Course Material Repository App</h1>
      <form onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <label>Email</label>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>New Password</label>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Change Password</button>

        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

        {errors.length > 0 && (
          <ul>
            {errors.map((err, idx) => (
              <li key={idx} style={{ color: 'red' }}>
                {err.msg}
              </li>
            ))}
          </ul>
        )}
      </form>
    </div>
  );
};

export default Reset;
