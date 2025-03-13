import { useState } from 'react';
import axios from 'axios';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [errors, setErrors] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = window.location.pathname.split('/').pop(); // Extract token from URL
    axios
      .post(`http://localhost:3001/resetpassword/${token}`, {
        password,
        password2,
      })
      .then((result) => {
        console.log(result);
        // Redirect or show success message
        window.location.href = '/login'; // Redirect to login or any other page after reset
      })
      .catch((err) => {
        if (err.response) {
          setErrors(err.response.data.errors);
        } else {
          console.log('error:', err);
        }
      });
  };

  return (
    <div>
      <style>
        {`
                body{
  background-color: #080710;
}

h1,h2 ,footer,p {
  color:#ffffff;
}

h1 {
 text-align: center;
 
}

footer{
  color: #ffffff;
  text-align: center;
  margin: 32px auto 20px;
}
.alert{
  color:#ffffff;
  text-align:left;
  font-size: 15px;
  margin-top: -5px;
}
form h1,h2 {
  font-size: 25px;
  font-weight: 500;
  line-height: 42px;
  text-align: center;
  margin-top: -40px;
}
.background{
  width: 430px;
  height: 520px;
  position: absolute;
  transform: translate(-50%,-50%);
  left: 50%;
  top: 50%;
}
.background .shape{
  height: 200px;
  width: 200px;
  position: absolute;
  border-radius: 50%;
}
.shape:first-child{
  background: linear-gradient(
      #1845ad,
      #23a2f6
  );
  left: -130px;
  top: -0px;
}
.shape:last-child{
  background: linear-gradient(
      to right,
      #ff512f,
      #f09819
  );
  right: -80px;
  bottom: -50px;
}
form{
  height: 420px;
  width: 300px;
  background-color: rgba(255,255,255,0.13);
  position: absolute;
  transform: translate(-50%,-50%);
  top: 45%;
  left: 50%;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255,255,255,0.1);
  box-shadow: 0 0 40px rgba(8,7,16,0.6);
  padding: 50px 35px;
}
form *{
  font-family: 'Poppins',sans-serif;
  color: #ffffff;
  letter-spacing: 0.5px;
  outline: none;
  border: none;
}

label{
  display: block;
  margin-top: 20px;
  font-size: 16px;
  font-weight: 500;
}
input{
  display: block;
  height: 50px;
  width: 100%;
  background-color: rgba(255,255,255,0.07);
  border-radius: 3px;
  padding: 0 10px;
  margin-top: 8px;
  font-size: 14px;
  font-weight: 300;
}
::placeholder{
  color: #e5e5e5;
}
button{
  margin-top: 50px;
  width: 100%;
  background-color: #ffffff;
  color: #080710;
  padding: 15px 0;
  font-size: 18px;
  font-weight: 600;
  border-radius: 5px;
  cursor: pointer;
}


  
                `}
      </style>
      <h1>Course Material Repository App</h1>
      <form onSubmit={handleSubmit}>
        <h2>Create your new password</h2>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter Password"
            autoComplete="off"
            name="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password2">Confirm Password</label>
          <input
            type="password"
            id="password2"
            placeholder="Confirm Password"
            autoComplete="off"
            name="password2"
            onChange={(e) => setPassword2(e.target.value)}
          />
        </div>

        <button type="submit">Reset Password</button>
      </form>
      {errors.length > 0 && (
        <ul>
          {errors.map((error, index) => (
            <li key={index} style={{ color: 'red' }}>
              {error.msg}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ResetPassword;
