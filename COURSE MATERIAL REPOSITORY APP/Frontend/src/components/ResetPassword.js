import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        setSuccessMessage("");

        if (password !== confirmPassword) {
            setErrors([{ msg: "Passwords do not match." }]);
            return;
        }

        try {
            const res = await axios.post("http://localhost:3001/reset", { email, password });
            setSuccessMessage(res.data.message || "Password reset successful!");
            setTimeout(() => navigate("/login"), 2000); // Redirect after success
        } catch (err) {
            setErrors(err.response?.data.errors || [{ msg: "An error occurred. Please try again." }]);
        }
    };

    return (
        <div>
            <style>{`
                body { background-color: #080710; }
                h2 { color: #ffffff; text-align: center; }
                form { background: rgba(255,255,255,0.13); padding: 50px 35px; text-align: center; border-radius: 10px; }
                input, button { display: block; width: 100%; margin-top: 10px; }
                button { padding: 10px; font-size: 18px; cursor: pointer; }
                .success { color: green; text-align: center; }
                .error { color: red; text-align: center; }
            `}</style>

            <h2>Reset Your Password</h2>
            {successMessage && <p className="success">{successMessage}</p>}
            {errors.map((error, index) => (
                <p key={index} className="error">{error.msg}</p>
            ))}

            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    placeholder="Your Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="New Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Confirm Password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                />
                <button type="submit">Reset Password</button>
            </form>
        </div>
    );
};

export default ResetPassword;
