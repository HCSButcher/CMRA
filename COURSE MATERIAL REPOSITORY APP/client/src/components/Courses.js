import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseManagement from './CourseManagement';
const Courses = () => {

    const navigate = useNavigate();
    const handleNavigate = (path) => {
        navigate(path);
    };

    const [school, setSchool] = useState('');
    const [courseName, setCourseName] = useState([]);
    const [newCourse, setNewCourse] = useState('');

    const handleAddCourse = () => {
        if (newCourse.trim()) {
            setCourseName([...courseName, newCourse]);
            setNewCourse('');
        }
    };

    const handleRemoveCourses = (index) => {
        setCourseName(courseName.filter((_, i) => i !== index));
    };

  const handleSaveCourses = async () => {
    if (!school || courseName.length === 0) {
        console.warn("School or Course Name is empty. Please provide values.");
        return;
    }

    try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
            'http://10.1.33.99:3001/coursesReg', 
            { school, courseName }, 
            { headers: { Authorization: `Bearer ${token}` } } // Sending token
        );

        console.log("Response from server:", response.data);

        setSchool('');
        setCourseName([]);
        alert('School and Courses saved successfully!');
    } catch (error) {
        console.error('Error saving school and courses:', error.response ? error.response.data : error.message);
    }
};


      //courseManagement modal
  const [showCourseManagement, setShowCourseMAnagement] = useState(false);
  const openCourseManagement = () => setShowCourseMAnagement(true);
  const closeCourseManagement = () => setShowCourseMAnagement(false);

    return (
        <div>
            <style>
                {`
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f9;
                    margin: 0;
                    padding: 0;
                }

                form {
                height: auto;
                    width: 50%;
                    margin: 50px auto;
                    padding: 20px;
                     background-color: rgba(255, 255, 255, 0.13);
                    border-radius: 8px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                }

                label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: bold;
                }
                   

                select, input[type="text"] {
                    width: 100%;
                    padding: 10px;
                    margin-bottom: 20px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    font-size: 14px;
                    color: black;
                }

                select option {
                    color: black; /* Ensures options in the dropdown are visible */
                }

                button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: #ffffff;
                    border: none;
                    border-radius: 4px;
                    font-size: 14px;
                    cursor: pointer;
                    margin-top: 10px;
                }

                button:hover {
                    background-color: #0056b3;
                }

                .courses-container {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr); /* 2 columns */
                    gap: 10px; /* Spacing between grid items */
                    margin-top: 20px;
                }

                .courses-container li {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px;
                    background-color: rgba(255, 255, 255, 0.13);
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    word-break: break-word; /* Ensures long text doesn't overflow */
                }

                .courses-container li button {
                    background-color: #dc3545;
                }

                .courses-container li button:hover {
                    background-color: #a71d2a;
                }
                `}
            </style>

            <div className="background-1">
                <div className="shape"></div>
                <div className="shape"></div>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
                <h2>Course Management</h2>
                <ul>
                <li className="btn" onClick={openCourseManagement}> Course Management</li>
                <li className="btn" onClick={() =>handleNavigate('/stages')}>stage & units</li>
                </ul>
                    <label htmlFor="school">School</label>
                <select
                    name="school"
                    id="school"
                    placeholder="Enter the school"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                >
                    <option value="">Select a School</option>
                    <option value="SBE">SBE</option>
                    <option value="SSET">SSET</option>
                    <option value="SMHS">SMHS</option>
                    <option value="SMPA">SMPA</option>
                    <option value="EDUC">EDUC</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Law">Law</option>
                </select>

                <label htmlFor="Courses">Courses</label>                
                <input
                    type="text"
                    value={newCourse}
                    placeholder="Add a Course"
                    onChange={(e) => setNewCourse(e.target.value)}
                />
                <button type="button" onClick={handleAddCourse}>
                    Add Course
                </button>

                <ul className="courses-container">
                    {courseName.map((unit, index) => (
                        <li key={index}>
                            {unit}
                            <button type="button" onClick={() => handleRemoveCourses(index)}>
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>

                <button type="button" onClick={handleSaveCourses}>
                    Save School & Courses
                </button>
                {showCourseManagement && (
                    <div className="modal">
                        <div className="modal-container">
                            <span className="close" onClick={closeCourseManagement}>&times; </span>
                            <CourseManagement closeModal={closeCourseManagement} />
                        </div>
                    </div>
                )}               
             
            </form>
        </div>
    );
};

export default Courses;
