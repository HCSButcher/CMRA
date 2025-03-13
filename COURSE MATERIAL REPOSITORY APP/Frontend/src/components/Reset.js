import { useState } from "react"
import axios from "axios"


const Reset = () => {
    const [email, setEmail] = useState('');
    const[errors, setErrors] = useState([]);

    const handleSubmit = async (e)=>{
        e.preventDefault();
        setErrors([]);
        try {
          const result = await axios.post('http://localhost:3001/reset', { email });
          console.log(result.data);
          window.location.href = result.data.redirect;
        } catch (err) {
          if (err.response && err.response.data) {
            const errorMessages = err.response.data.errors || [{msg: 'server error.'}];
            setErrors(errorMessages);
          } else {
            setErrors([{msg: 'Something went wrong. Please try again later.'}]);
            console.error('Error:', err)
          }
        }               
    };
  return (

    <div>
        <style>
            {`
            body{
  background-color: #080710;
}

h1,h2 ,p {
  color:#ffffff;
}
  h1 {
 text-align: center;
 
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
  height: 250px;
  width: 300px;
  background-color: rgba(255,255,255,0.13);
  position: absolute;
  transform: translate(-50%,-50%);
  top: 40%;
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
  margin-top: -10px;
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
  margin-top: 0px;
  font-size: 14px;
  font-weight: 300;
}
::placeholder{
  color: #e5e5e5;
}
button{
  margin-top: 30px;
  width: 100%;
  background-color: #ffffff;
  color: #080710;
  padding: 10px 6;
  font-size: 18px;
  font-weight: 600;
  border-radius: 5px;
  cursor: pointer;
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
       <div class='background'>
                <div class='shape'></div>
                <div class='shape'></div>
            </div>
            <h1>Course Material Repository App</h1>
            <form  onSubmit={handleSubmit}>  
                <h2>Reset Password</h2> 

                   <div class='form-group'>  
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Enter email"
                        autoComplete="off"
                        name="email"            
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <button className='btn-1'type="submit">reset</button>
                </form>
                {errors.length > 0 && (
                <ul>
                    {errors.map((error, index) => (
                        <li key={index} style={{ color: 'red' }}>{error.msg}</li>
                    ))}
                </ul>
            )}
    </div>
  )
}

export default Reset
