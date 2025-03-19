import axios from "axios";
import { useEffect, useState } from "react";

const SCoursesModal = () => {
    const [stages, setStages] = useState([]);
    const [unitsTaken, setUnitsTaken] = useState(0); // Initialize unitsTaken to track selected checkboxes
    const [selectedStage, setSelectedStage] = useState('');
    const [availableUnits, setAvailableUnits] = useState([]);
    const [selectedUnits, setSelectedUnits] = useState([]);
    const [sDate, setSDate] = useState('');
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        const getStages = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3001/stages', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (Array.isArray(response.data)) {
                    setStages(response.data);
                } else {
                    console.error('Unexpected response format:', response.data);
                }
            } catch (error) {
                console.error('Error fetching stages:', error);
            }
        };
        getStages();
    }, []);

    // Update available units when a new stage is selected
    useEffect(() => {
        const stage = stages.find(s => s.stage === selectedStage);
        setAvailableUnits(stage ? stage.units : []);
        setSelectedUnits([]);
        setUnitsTaken(0); // Reset unitsTaken when a new stage is selected
    }, [selectedStage, stages]);

    const handleUnitToggle = (unit) => {
        const updatedUnits = selectedUnits.includes(unit)
            ? selectedUnits.filter(u => u !== unit)
            : [...selectedUnits, unit];

        if (updatedUnits.length <= 8) {
            setSelectedUnits(updatedUnits);
            setUnitsTaken(updatedUnits.length); // Update unitsTaken based on selected units count
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrors([]);
        try {
            await axios.post('http://localhost:3001/sRegistrations', {
                stage: selectedStage,
                sDate,
                unitsTaken,
                units: selectedUnits,
            });
            alert('Registration successful!');
        } catch (err) {
            const errorMessages = err.response?.data?.errors || [{ msg: 'Something went wrong. Please try again later.' }];
            setErrors(errorMessages);
            console.error('Error:', err);
        }
    };

    return (
        <div>
            <style>
                {`
                body {
                    background-color: #080710;
                }
                .background-1 {
                    position: relative;
                }
                form { 
                    height: auto;
                    max-width: 400px;
                    background-color: rgba(255, 255, 255, 0.13);
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    border-radius: 10px;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    padding: 5px 10px;
                    display: flex;
                    flex-direction: column;
                }
                .select {
                    background-color: rgba(255, 255, 255, 0.13);
                    color: #000;
                    padding: 10px;
                    font-size: 16px;
                    border-radius: 4px;
                    margin-bottom: 20px;
                    width: 100%;
                }
                .units-container {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                }
                .unit-item input[type="checkbox"] {
                    transform: scale(0.8);
                    margin-right: 8px;
                }
                `}
            </style>
            <div className="background-1">
                <div className="shape"></div>
                <div className="shape"></div>
            </div>
            <form onSubmit={handleRegister}>
                <label>Select Stage</label>
                <select className="select" value={selectedStage} onChange={(e) => setSelectedStage(e.target.value)}>
                    <option value="">Select a stage</option>
                    {stages.map((stage, index) => (
                        <option key={index} value={stage.stage}>{stage.stage}</option>
                    ))}
                </select>

                <label>Registration Date</label>
                <input type="date" value={sDate} onChange={(e) => setSDate(e.target.value)} />

                <label> Units Taken</label>
                <input type="text" value={unitsTaken} readOnly /> {/* Display unitsTaken, no manual input */}

                <div>
                    <h4>Units:</h4>
                    <div className="units-container">
                        {availableUnits.map((unit, index) => (
                            <div key={index} className="unit-item">
                                <input
                                    type="checkbox"
                                    checked={selectedUnits.includes(unit)}
                                    onChange={() => handleUnitToggle(unit)}
                                />
                                {unit}
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit">Register</button>
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
}

export default SCoursesModal;
