import { useState } from 'react';
import axios from 'axios';

const Updates = () => {
  const [unit, setUnit] = useState('');
  const [email, setEmail] = useState('');
  const [unitName, setUnitName] = useState('');
  const [errors, setErrors] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token'); // Ensure token is stored in localStorage

    axios
      .post(
        'https://project-2-1u71.onrender.com/updates',
        { unit, unitName, email }, // Ensure email is sent
        { headers: { Authorization: `Bearer ${token}` } } // Send token
      )
      .then((result) => {
        console.log('Submission successful:', result);

        setUnit('');
        setEmail('');
        setUnitName('');
        setErrors([]);

        if (result.data.redirect) {
          window.location.href = result.data.redirect;
        }
      })
      .catch((err) => {
        if (err.response) {
          setErrors(err.response.data.errors);
          console.error('Validation errors:', err.response.data.errors);
        } else {
          console.error('Error submitting form:', err);
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
                    form {
                        height: auto;
                        width: 320px;
                        background-color: rgba(255, 255, 255, 0.13);
                        position: absolute;
                        transform: translate(-50%, -50%);
                        top: 40%;
                        left: 50%;
                        border-radius: 10px;
                        backdrop-filter: blur(10px);
                        border: 2px solid rgba(255, 255, 255, 0.1);
                        box-shadow: 0 0 40px rgba(8, 7, 16, 0.6);
                        padding: 50px 35px;
                    } 
                `}
      </style>
      <div className="background-1">
        <div className="shape"></div>
        <div className="shape"></div>
      </div>
      <form onSubmit={handleSubmit}>
        <h2>Updates</h2>
        <div className="form-group">
          <label htmlFor="email"></label>
          <input
            type="email"
            id="email"
            placeholder="Enter email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="unit"></label>
          <input
            type="text"
            id="unit"
            placeholder="Enter unit"
            name="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />

          <label htmlFor="unitName"></label>
          <input
            type="text"
            id="unitName"
            placeholder="Enter unit name"
            name="unitName"
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
          />
        </div>
        <button className="btn" type="submit">
          Add
        </button>
      </form>
      {errors.length > 0 && (
        <ul>
          {errors.map((error, index) => (
            <li key={index} style={{ color: 'red' }}>
              {error.msg}{' '}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Updates;
