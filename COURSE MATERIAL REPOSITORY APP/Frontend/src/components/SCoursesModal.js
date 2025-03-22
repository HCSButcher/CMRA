import axios from "axios";
import { useEffect, useState } from "react";

const SCoursesModal = () => {
    const [schools] = useState(["SBE", "SSET", "LAW", "PHARM", "EDUC", "SMHS", "SMPA"]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [stages, setStages] = useState([]);
    const [selectedStage, setSelectedStage] = useState('');
    const [availableUnits, setAvailableUnits] = useState([]); // ✅ Units from backend
    const [selectedUnits, setSelectedUnits] = useState([]);
    const [sDate, setSDate] = useState('');
    const [errors, setErrors] = useState([]);
    const [unitsTaken, setUnitsTaken] = useState(0);

    // ✅ Fetch Stages Function
    const fetchStages = async (school) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("❌ No auth token found.");
                return;
            }

            const response = await axios.get("http://localhost:3001/stages", {
                params: { school }, 
                headers: { Authorization: `Bearer ${token}` }
            });

            setStages(response.data);
        } catch (error) {
            console.error("❌ Error fetching stages:", error);
        }
    };

    // ✅ Fetch Units Function
    const fetchUnits = async (school, stage) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("❌ No auth token found.");
                return;
            }

            console.log(`📢 Fetching units for School: ${school}, Stage: ${stage}`);

            const response = await axios.get("http://localhost:3001/units", {
                params: { school, stage },
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log(`✅ Units fetched:`, response.data);
            setAvailableUnits(response.data); // ✅ Update available units
        } catch (error) {
            console.error("❌ Error fetching units:", error);
        }
    };

    // ✅ Fetch Stages When School Changes
    useEffect(() => {
        if (selectedSchool) {
            fetchStages(selectedSchool);
        } else {
            setStages([]);
        }
    }, [selectedSchool]);

    // ✅ Fetch Units When Stage Changes
    useEffect(() => {
        if (selectedSchool && selectedStage) {
            fetchUnits(selectedSchool, selectedStage);
        } else {
            setAvailableUnits([]);
        }
    }, [selectedSchool, selectedStage]);

    // ✅ Handle Unit Selection (Max 8 Units)
    const handleUnitToggle = (unit) => {
        setSelectedUnits((prevUnits) => {
            let updatedUnits;
            if (prevUnits.includes(unit)) {
                updatedUnits = prevUnits.filter((u) => u !== unit);
            } else if (prevUnits.length < 8) {
                updatedUnits = [...prevUnits, unit];
            } else {
                return prevUnits;
            }

            setUnitsTaken(updatedUnits.length);
            return updatedUnits;
        });
    };

    // ✅ Handle Registration Submission
    const handleRegister = async (e) => {
        e.preventDefault();
        setErrors([]);

        if (!selectedSchool || !selectedStage || !sDate || selectedUnits.length === 0) {
            setErrors([{ msg: 'All fields must be filled before submitting.' }]);
            console.log("❌ Validation failed: One or more fields are empty.");
            return;
        }

        console.log("🟢 Debugging Registration Data:");
        console.log("School:", selectedSchool);
        console.log("Stage:", selectedStage);
        console.log("Date:", sDate);
        console.log("Units Taken:", unitsTaken);
        console.log("Selected Units:", selectedUnits);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("❌ No auth token found.");
                return;
            }

            await axios.post("http://localhost:3001/sRegistrations", {
                school: selectedSchool,
                stage: selectedStage,
                sDate,
                unitsTaken,
                units: selectedUnits
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("✅ Registration successful!");
        } catch (err) {
            console.error("❌ Error:", err);
        }
    };

    return (
        <div>
            <style>
                {`
                body {
                    background-color: #080710;
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

            <form className="modal-container" onSubmit={handleRegister}>
                {/* School Dropdown */}
                <label>Select School</label>
                <select className="select" value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}>
                    <option value="">Select a school</option>
                    {schools.map((school, index) => (
                        <option key={index} value={school}>{school}</option>
                    ))}
                </select>

                {/* Stage Dropdown */}
                <label>Select Stage</label>
                <select className="select" value={selectedStage} onChange={(e) => setSelectedStage(e.target.value)} disabled={!selectedSchool}>
                    <option value="">Select a stage</option>
                    {stages.length > 0 ? (
                        stages.map((stage, index) => (
                            <option key={index} value={stage.stage}>{stage.stage}</option>
                        ))
                    ) : (
                        <option value="" disabled>No stages available</option>
                    )}
                </select>

                {/* Registration Date */}
                <label>Registration Date</label>
                <input type="date" value={sDate} onChange={(e) => setSDate(e.target.value)} />

                {/* Units Taken */}
                <label>Units Taken</label>
                <input type="text" value={unitsTaken} readOnly />

                {/* Units Selection */}
                <h4>Units:</h4>
                <div className="units-container">
                    {availableUnits.length > 0 ? (
                        availableUnits.map((unit, index) => (
                            <div key={index} className="unit-item">
                                <input type="checkbox" checked={selectedUnits.includes(unit)} onChange={() => handleUnitToggle(unit)} />
                                {unit}
                            </div>
                        ))
                    ) : (
                        <p style={{ color: "red" }}>No units available.</p>
                    )}
                </div>

                {/* Submit Button */}
                <button className="submit-btn" type="submit" disabled={!selectedSchool || !selectedStage || selectedUnits.length === 0}>
                    Register
                </button>

                {/* Error Messages */}
                {errors.length > 0 && (
                    <ul>
                        {errors.map((error, index) => (
                            <li key={index} className="error-message">{error.msg}</li>
                        ))}
                    </ul>
                )}
            </form>
        </div>
    );
};

export default SCoursesModal;
