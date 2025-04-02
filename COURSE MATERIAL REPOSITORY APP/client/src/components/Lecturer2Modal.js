import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Lecturer2Modal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

const handleSubmit = async () => {
    if (!email.trim()) {
        alert("Please enter a valid email.");
        return;
    }

    try {
        const response = await fetch(`http://10.1.33.99:3001/find?email=${encodeURIComponent(email)}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorMessage = response.status === 404 ? "Lecturer not found." : "Error fetching lecturer data.";
            alert(errorMessage);
            return;
        }

        const data = await response.json();        

        if (!data.role) {
            console.error("Role missing in API response.");
            alert("Invalid lecturer data received.");
            return;
        }
        
        localStorage.setItem("email", data.email);
        localStorage.setItem("role", data.role); 

        console.log(" Stored in localStorage:", {
            email: localStorage.getItem("email"),
            role: localStorage.getItem("role"),
        });

        navigate(`/lecturer/${encodeURIComponent(data.email)}`);
        onClose();
    } catch (error) {
        console.error(" Server error:", error);
        alert("Server error. Try again later.");
    }
};


    return (
        <div className="background-1">
            <style>
                {`
                h2 {
                color:#f1f1f1;
                }
                input {
                background-color: #f1f1f1;
                font-size:20px;
                }
                `}
            </style>
            
                <h2>Enter Lecturer Email</h2>
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <div className="modal-buttons">
                    <button className="btn" onClick={handleSubmit}>Submit</button>
                    <button className="btn close-btn" onClick={onClose}>Close</button>
                </div>
            
        </div>
    );
};

export default Lecturer2Modal;
