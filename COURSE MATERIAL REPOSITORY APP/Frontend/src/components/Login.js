import { useState } from "react";
import axios from "axios";
import LoginCSS from "./Login.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState([]);

const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);

        try {
            const result = await axios.post("http://localhost:3001/login", { email, password }, { withCredentials: true });

            console.log("🔹 Login Response:", result.data);

            if (result.data.token) {
                await login(result.data.user, result.data.token); // Use login() from context
                console.log("✅ User logged in and set in context");

                setTimeout(() => {
                    navigate(result.data.redirect);
                }, 100);
            } else {
                setErrors([{ msg: "Login failed. Please try again." }]);
            }
        } catch (err) {
            if (err.response && err.response.data) {
                setErrors(err.response.data.errors || [{ msg: "Invalid email or password." }]);
            } else {
                setErrors([{ msg: "Something went wrong. Please try again later." }]);
            }
        }
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
                button {
                    margin-top: 30px;
                    width: 100%;
                    background-color: #ffffff;
                    color: #080710;
                    padding: 15px 0;
                    font-size: 18px;
                    font-weight: 600;
                    border-radius: 5px;
                    cursor: pointer;
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
                `}
            </style>
            <div className={LoginCSS.background}>
                <div className={LoginCSS.shape}></div>
                <div className={LoginCSS.shape}></div>
            </div>

            <h1>Course Material Repository App</h1>
            <form onSubmit={handleSubmit}>
                <div className={LoginCSS.form_group}>
                    <h2>Log in to your account</h2>
                    <label htmlFor="email">Email</label>
                    <input 
                        type="text"
                        id="email"
                        placeholder="Enter Email"
                        autoComplete="off"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className={LoginCSS.form_group}>
                    <label htmlFor="password">Password</label>
                    <input 
                        type="password"
                        id="password"
                        placeholder="Enter Password"
                        autoComplete="off"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <a href="/reset">Forgot Password?</a><br />
                <button type="submit">Login</button>
            </form>
            {errors.length > 0 && (
                <ul>
                    {errors.map((error, index) => (
                        <li key={index} style={{ color: 'red' }}>{error.msg}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Login;
