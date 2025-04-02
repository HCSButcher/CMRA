import { useState } from "react";
import axios from "axios";

const AnnouncementModal = () => {
    const [unit, setUnit] = useState("");
    const [email, setEmail] = useState("");
    const [date, setDate] = useState("");
    const [announcements, setAnnouncements] = useState("");
    const [errors, setErrors] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem("token");
        if (!token) {
            console.error(" No token found. User may not be authenticated.");
            return setErrors([{ msg: "Authentication error. Please log in again." }]);
        }

        try {
            const response = await axios.post(
                "http://10.1.33.99:3001/announcements",
                { unit, email, date, announcements },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            
            // Clear form fields
            setUnit("");
            setEmail("");
            setDate("");
            setAnnouncements("");
            setErrors([]); // Clear any previous errors

        } catch (err) {
            console.error(" Error submitting announcement:", err);

            if (err.response && err.response.data.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrors([{ msg: "An unexpected error occurred. Please try again." }]);
            }
        }
    };

    return (
        <div>
            <style>
                {`
                    body { background-color: #080710; }
                    textarea { background-color: rgba(255, 255, 255, 0.13); }
                    form {
                        height: auto;
                        width: 360px;
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
                <h2>Announcements</h2>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Enter email"
                        autoComplete="off"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label htmlFor="unit">Unit</label>
                    <input
                        type="text"
                        id="unit"
                        placeholder="Enter Unit"
                        autoComplete="off"
                        name="unit"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        required
                    />
                    <label htmlFor="date">Date</label>
                    <input
                        type="date"
                        id="date"
                        autoComplete="off"
                        name="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                    <label htmlFor="announcements">Announcement</label>
                    <textarea  
                        rows="4"
                        cols="40"
                        id="announcements"
                        placeholder="Enter announcement"
                        autoComplete="off"
                        name="announcements"
                        value={announcements}
                        onChange={(e) => setAnnouncements(e.target.value)}
                        required
                    />                     
                </div>
                <button className="btn" type="submit">Send</button>
            </form>
            {errors.length > 0 && (
                <ul>
                    {errors.map((error, index) => (
                        <li key={index} style={{color: 'red'}}>{error.msg}</li>
                    ))}
                </ul>
            )}           
        </div>
    );
};

export default AnnouncementModal;
