import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Reset = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    try {
        const result = await axios.post(
            "http://10.1.33.99:3001/reset", 
            { email, password }, 
            { withCredentials: true } 
        );

        if (result.data.success) {
            alert(result.data.message);

            await fetch("http://10.1.33.99:3001/logout", { 
                method: "GET", 
                credentials: "include" 
            });

            localStorage.removeItem("token");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userRole");

            navigate("/login");
        } else {
            setErrors([{ msg: "Something went wrong. Please try again." }]);
        }
    } catch (err) {
        console.error("Error:", err);
        setErrors(err.response?.data?.errors || [{ msg: "Something went wrong. Please try again later." }]);
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
                {errors.length > 0 && (
                    <ul>
                        {errors.map((err, idx) => (
                            <li key={idx} style={{ color: 'red' }}>{err.msg}</li>
                        ))}
                    </ul>
                )}
            </form>
        </div>
    );
};

export default Reset;
