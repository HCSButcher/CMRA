import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CoursesModal = ({ refreshTable, studentEmail }) => {
    const [stage, setStage] = useState('');
    const [regDate, setRegDate] = useState('');
    const [schoolUnits, setSchoolUnits] = useState([]);
    const [errors, setErrors] = useState([]);
    const [stages, setStages] = useState([]);
    const [studentSchool, setStudentSchool] = useState('');

    // ✅ Fetch student's school using email
    useEffect(() => {
        if (!studentEmail) {
            console.error("❌ Student email is missing. Cannot fetch school.");
            return;
        }

        const fetchStudentSchool = async () => {
            try {
                console.log("📢 Fetching school for:", studentEmail);
                const response = await axios.get(`http://localhost:3001/students/${studentEmail}`);
                
                const school = response.data?.school;
                
                if (!school || school.trim() === "") {
                    console.error("❌ School is empty or not found.");
                    return;
                }

                console.log("✅ Fetched school:", school);
                setStudentSchool(school);
            } catch (error) {
                console.error("❌ Error fetching student school:", error.response?.data || error.message);
            }
        };

        fetchStudentSchool();
    }, [studentEmail]);

    // ✅ Fetch stages when studentSchool is available
    useEffect(() => {
        if (!studentSchool) return; // Ensure school is available

        const fetchStages = async () => {
            try {
                console.log(`🔍 Fetching stages for school: ${studentSchool}`);
                const response = await axios.get(`http://localhost:3001/stages?school=${encodeURIComponent(studentSchool)}`);
                setStages(response.data);
                console.log("✅ Stages fetched:", response.data);
            } catch (error) {
                console.error("❌ Error fetching stages:", error.response?.data || error.message);
            }
        };

        fetchStages();
    }, [studentSchool]);

    // ✅ Fetch units for the selected stage & school
    useEffect(() => {
        if (!stage || !studentSchool) return;

        const fetchUnits = async () => {
            try {
                console.log(`📢 Fetching units for: School=${studentSchool}, Stage=${stage}`);
                const response = await axios.get(
                    `http://localhost:3001/units?school=${encodeURIComponent(studentSchool)}&stage=${encodeURIComponent(stage)}`
                );
                setSchoolUnits(response.data);
                console.log("✅ Units fetched:", response.data);
            } catch (error) {
                console.error("❌ Error fetching units:", error.response?.data || error.message);
            }
        };

        fetchUnits();
    }, [stage, studentSchool]);

    // ✅ Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stage || !regDate || schoolUnits.length === 0) {
            console.error("❌ Missing required fields.");
            setErrors([{ msg: "All fields must be filled." }]);
            return;
        }

        const data = { stage, regDate, school: studentSchool, units: schoolUnits };

        try {
            console.log("📤 Submitting course registration:", data);
            await axios.post('http://localhost:3001/courses', data, {
                headers: { 'Content-Type': 'application/json' }
            });
            setStage('');
            setRegDate('');
            setSchoolUnits([]);
            setErrors([]);
            refreshTable();
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                console.error("❌ Error adding course registration:", error.response?.data || error.message);
            }
        }
    };

    return (
        <div className="form-container">
            <style>
                {`
                .form-row, .school-unit-row {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 10px;
                }
                select, input[type="text"], input[type="date"] {
                    padding: 8px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    width: 100%;
                }
                button {
                    margin-top: 10px;
                    padding: 8px 15px;
                    background-color: rgba(255, 255, 255, 0.13);
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #0056b3;
                }
                `}
            </style>
            <form onSubmit={handleSubmit}>
                <h2>Register New Course</h2>
                <div className="form-row">
                    <label htmlFor="stage">Stage</label>
                    <select id="stage" value={stage} onChange={(e) => setStage(e.target.value)}>
                        <option value="">Select Stage</option>
                        {stages.map((s, index) => (
                            <option key={index} value={s.stage}>{s.stage}</option>
                        ))}
                    </select>
                </div>
                <div className="form-row">
                    <label htmlFor="regDate">Registration Date</label>
                    <input type="date" id="regDate" value={regDate} onChange={(e) => setRegDate(e.target.value)} />
                </div>
                <h3>Units for Selected Stage</h3>
                {schoolUnits.length > 0 ? (
                    schoolUnits.map((unit, index) => (
                        <div key={index} className="school-unit-row">
                            <input type="text" value={unit.name} readOnly />
                        </div>
                    ))
                ) : (
                    <p>No units found for this stage.</p>
                )}
                <button type="submit">Register</button>
                {errors.length > 0 && (
                    <ul style={{ color: 'red' }}>
                        {errors.map((error, index) => (
                            <li key={index}>{error.msg}</li>
                        ))}
                    </ul>
                )}
            </form>
        </div>
    );
};

export default CoursesModal;
