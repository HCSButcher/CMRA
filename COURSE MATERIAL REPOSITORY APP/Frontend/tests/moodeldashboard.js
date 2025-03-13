{`
                    h1, h2, footer, p {
                        color: #ffffff;
                    }
                    body {
                        background-color: #080710;
                    }
                    h1 {
                        text-align: center;
                        font-weight: 500;
                    }
                    p {
                        color: #ffffff;
                    }
                    .alert{
                        color: #ffffff;
                        text-align:left;
                        font-size: 15px;
                        margin-top: -5px;
                    }
                    h2{
                        font-weight: 500;
                        line-height: 40px;
                        text-align: center;
                        margin-top: -50px;
                    }
                    label{
                        font-weight: 500;
                        line-height: 20px;
                        text-align: left;
                        margin-top: 5px;
                    }
                    .header {
                        color: #ffffff;
                        font-size: 25px;
                        font-weight: 500;
                        line-height: 42px;
                        text-align: right;
                        margin-top: -10px;
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
                        background: linear-gradient(#1845ad, #23a2f6);
                        left: -130px;
                        top: -0px;
                    }
                    .shape:last-child{
                        background: linear-gradient(to right, #ff512f, #f09819);
                        right: -80px;
                        bottom: -50px;
                    }
                    form{
                        height: 700px;
                        width: 320px;
                        background-color: rgba(255,255,255,0.13);
                        position: absolute;
                        transform: translate(-50%,-50%);
                        top: 50%;
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
                        border-color:#e5e5e5;
                    }
                    .close{
                        background-color: #080710;
                        border-radius: 0px;
                    }
                    button{
                        margin-top: 10px;
                        width: 100%;
                        background-color: #ffffff;
                        color: #080710;
                        padding: 15px 0;
                        font-size: 18px;
                        font-weight: 600;
                        border-radius: 5px;
                        cursor: pointer;
                    }

                    /* New floating shapes */
                    .shape:first-child {
                        animation: floatLeft 4s ease-in-out infinite;
                    }

                    .shape:last-child {
                        animation: floatRight 4s ease-in-out infinite;
                    }

                    @keyframes floatLeft {
                        0% { transform: translateX(0); }
                        50% { transform: translateX(-20px); }
                        100% { transform: translateX(0); }
                    }

                    @keyframes floatRight {
                        0% { transform: translateX(0); }
                        50% { transform: translateX(20px); }
                        100% { transform: translateX(0); }
                    }
    
    
    import { useState } from "react";
import axios from 'axios';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [role, setRole] = useState('');
    const [contact, setContact] = useState('');
    const [errors, setErrors] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors([]);

        // Validation check for empty fields
        if (!name || !email || !password || !password2 || !role || !contact) {
            setErrors([{ msg: 'Please fill in all fields' }]);
            return;
        }

        if (password !== password2) {
            setErrors([{ msg: 'Passwords do not match' }]);
            return;
        }

        const formData = {
            name,
            email,
            password,
            password2,
            role,
            contact,
        };

        axios.post('http://localhost:3001/register', formData)
            .then((response) => {
                setSuccessMessage(response.data.message);
            })
            .catch((error) => {
                setErrors([{ msg: 'Registration failed. Please try again.' }]);
                console.error('Error:', error);
            });
    };

    return (
        <div>
            <style>
                {`
                    h1, h2, footer, p {
                        color: #ffffff;
                    }
                    body {
                        background-color: #080710;
                    }
                    h1 {
                        text-align: center;
                        font-weight: 500;
                    }
                    p {
                        color: #ffffff;
                    }
                    .alert{
                        color: #ffffff;
                        text-align:left;
                        font-size: 15px;
                        margin-top: -5px;
                    }
                    h2{
                        font-weight: 500;
                        line-height: 40px;
                        text-align: center;
                        margin-top: -50px;
                    }
                    label{
                        font-weight: 500;
                        line-height: 20px;
                        text-align: left;
                        margin-top: 5px;
                    }
                    .header {
                        color: #ffffff;
                        font-size: 25px;
                        font-weight: 500;
                        line-height: 42px;
                        text-align: right;
                        margin-top: -10px;
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
                        background: linear-gradient(#1845ad, #23a2f6);
                        left: -130px;
                        top: -0px;
                    }
                    .shape:last-child{
                        background: linear-gradient(to right, #ff512f, #f09819);
                        right: -80px;
                        bottom: -50px;
                    }
                    form{
                        height: 700px;
                        width: 320px;
                        background-color: rgba(255,255,255,0.13);
                        position: absolute;
                        transform: translate(-50%,-50%);
                        top: 50%;
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
                        border-color:#e5e5e5;
                    }
                    .close{
                        background-color: #080710;
                        border-radius: 0px;
                    }
                    button{
                        margin-top: 10px;
                        width: 100%;
                        background-color: #ffffff;
                        color: #080710;
                        padding: 15px 0;
                        font-size: 18px;
                        font-weight: 600;
                        border-radius: 5px;
                        cursor: pointer;
                    }

                    /* New floating shapes */
                    .shape:first-child {
                        animation: floatLeft 4s ease-in-out infinite;
                    }

                    .shape:last-child {
                        animation: floatRight 4s ease-in-out infinite;
                    }

                    @keyframes floatLeft {
                        0% { transform: translateX(0); }
                        50% { transform: translateX(-20px); }
                        100% { transform: translateX(0); }
                    }

                    @keyframes floatRight {
                        0% { transform: translateX(0); }
                        50% { transform: translateX(20px); }
                        100% { transform: translateX(0); }
                    }
                `}
            </style>
            <div className='background'>
                <div className='shape'></div>
                <div className='shape'></div>
            </div>            
            <form onSubmit={handleSubmit}>                
                <h2>Create Account</h2>            
                <div className='form-group'> 

                    <label htmlFor="name">Name</label>
                    <input             
                        type="text"
                        id="name"
                        placeholder="Enter full Name"
                        autoComplete="off"
                        name="name"            
                        onChange={(e) => setName(e.target.value)}
                    />

                    <label htmlFor="role">Role</label>
                    <input             
                        type="text"
                        id="role"
                        placeholder="Enter Role"
                        autoComplete="off"
                        name="role"            
                        onChange={(e) => setRole(e.target.value)}
                    />               

                    <label htmlFor="contact">Contact</label>
                    <input             
                        type="text"
                        id="contact"
                        placeholder="Enter Contact"
                        autoComplete="off"
                        name="contact"            
                        onChange={(e) => setContact(e.target.value)}
                    />               

                    <label htmlFor="email">Email</label>
                    <input 
                        type="email"
                        id="email"
                        placeholder="Enter Email"
                        autoComplete="off"
                        name="email"           
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        placeholder="Enter Password"
                        autoComplete="off"
                        name="password"            
                        onChange={(e) => setPassword(e.target.value)}
                    />

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
                
                <button type="submit">Create</button>                
            </form>
            {errors.length > 0 && (
                <ul>
                    {errors.map((error, index) => (
                        <li key={index} style={{color: 'red'}}>{error.msg}</li>
                    ))}
                </ul>
            )}
            {successMessage && <p style={{ color: 'green'}}>{successMessage}</p>}
        </div>
    );
};

export default Signup;
