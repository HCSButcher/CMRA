import React, { useState } from 'react';
import axios from 'axios';

const CoursesModal = ({ refreshTable }) => {
    const [stage, setStage] = useState('');
    const [regDate, setRegDate] = useState('');
    const [schoolUnits, setSchoolUnits] = useState([{ school: '', units: '' }]);
    const [errors, setErrors] = useState([]);

    const handleSchoolUnitsChange = (index, field, value) => {
        const updatedSchoolUnits = schoolUnits.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        setSchoolUnits(updatedSchoolUnits);
    };

    const addSchoolUnitField = () => {
        setSchoolUnits([...schoolUnits, { school: '', units: '' }]);
    };

    const removeSchoolUnitField = (index) => {
        setSchoolUnits(schoolUnits.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            stage,
            regDate,
            schoolUnits,
        };

        try {
            await axios.post('http://localhost:3001/courses', data);
            setStage('');
            setRegDate('');
            setSchoolUnits([{ school: '', units: '' }]);
            setErrors([]);
            refreshTable(); // Refresh the table to show the new entry
        } catch (error) {
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                console.error('Error adding course registration:', error);
            }
        }
    };

    return (
        <div className='form-container'>
        <style>
            {`

            .form-row, .school-unit-row {
                        display: flex;
                        align-items: center;
                        gap: 15px;
                        margin-bottom: 10px;
            }
                        .school-unit-item {
                        display: flex;
                        flex-direction: column;
                    }
             

            input[type="text"], input[type="date"], input[type="number"] {
                        padding: 8px;
                        margin-top: 5px;
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
             
              body {
                        background-color: #080710;
                    }
                        textarea{
                        background-color: rgba(255, 255, 255, 0.13);

                        }
                    form {
                        min-height: 700px;
                        width: 400px;
                        background-color: rgba(255, 255, 255, 0.13);
                        position: absolute;
                        transform: translate(-50%, -50%);
                        top: 50%;
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
                <h2>Register New Course</h2>
                <div className="form-row">
                    <label htmlFor="stage">Stage</label>
                    <input
                        type="text"
                        id="stage"
                        value={stage}
                        onChange={(e) => setStage(e.target.value)}
                        placeholder="e.g., Y1S1"
                    />
                </div>
                <div className="form-row">
                    <label htmlFor="regDate">Registration Date</label>
                    <input
                        type="date"
                        id="regDate"
                        value={regDate}
                        onChange={(e) => setRegDate(e.target.value)}
                    />
                </div>

                {schoolUnits.map((item, index) => (
                    <div key={index} className="school-unit-row">
                        <div className="school-unit-item">
                            <label>School</label>
                            <input
                                type="text"
                                value={item.school}
                                onChange={(e) => handleSchoolUnitsChange(index, 'school', e.target.value)}
                                placeholder="School name"
                            />
                        </div>
                        <div className="school-unit-item">
                            <label>Units Taken</label>
                            <input
                                type="number"
                                value={item.units}
                                onChange={(e) => handleSchoolUnitsChange(index, 'units', e.target.value)}
                                placeholder="Units taken"
                            />
                        </div>
                        {schoolUnits.length > 1 && (
                            <button type="button" onClick={() => removeSchoolUnitField(index)}>Remove</button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={addSchoolUnitField}>Add School</button>
                <button type="submit">Add Registration</button>

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
