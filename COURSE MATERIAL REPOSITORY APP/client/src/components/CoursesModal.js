import { useState } from 'react';
import axios from 'axios';

const CoursesModal = ({ refreshTable }) => {
  const [stage, setStage] = useState('');
  const [regDate, setRegDate] = useState('');
  const [email, setEmail] = useState(''); // Added email field
  const [schoolUnits, setSchoolUnits] = useState([]);
  const [newSchool, setNewSchool] = useState('');
  const [newUnits, setNewUnits] = useState('');

  const handleAddSchool = () => {
    if (newSchool.trim() && newUnits.trim()) {
      setSchoolUnits([...schoolUnits, { school: newSchool, units: newUnits }]);
      setNewSchool('');
      setNewUnits('');
    }
  };

  const handleRemoveSchool = (index) => {
    setSchoolUnits(schoolUnits.filter((_, i) => i !== index));
  };

  const handleSaveCourse = async () => {
    if (!stage || !regDate || !email || schoolUnits.length === 0) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const token = localStorage.getItem('token'); // Retrieve the token

      if (!token) {
        alert('Unauthorized: No token found. Please log in again.');
        return;
      }

      await axios.post(
        'https://project-2-1u71.onrender.com/courses',
        { stage, regDate, email, schoolUnits }, // Include email
        {
          headers: {
            Authorization: `Bearer ${token}`, // Ensure token is sent
          },
        }
      );

      setStage('');
      setRegDate('');
      setEmail('');
      setSchoolUnits([]);
      alert('Course registration saved successfully!');
      refreshTable();
    } catch (error) {
      console.error('Error saving course registration:', error);
      if (error.response && error.response.status === 401) {
        alert(
          'Unauthorized: Your session may have expired. Please log in again.'
        );
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

                form {
                    height: auto;
                    width: auto;
                    min-width: 360px;
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

                select, input {
                    width: 100%;
                    padding: 10px;
                    border-radius: 5px;
                    border: 1px solid white;
                    background-color: black;
                    color: white;
                    margin-bottom: 10px;
                    font-size: 16px;
                }

                input[type="date"] {
                    background-color: black;
                    color: white;
                    cursor: pointer;
                    font-size: 16px;
                }

                button {
                    width: 100%;
                    padding: 10px;
                    background-color: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: 0.3s ease;
                    margin-top: 10px;
                }

                button:hover {
                    background-color: rgba(255, 255, 255, 0.4);
                }

                ul {
                    list-style-type: none;
                    padding: 0;
                }

                ul li {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background-color: rgba(255, 255, 255, 0.2);
                    padding: 5px 10px;
                    margin-top: 5px;
                    border-radius: 5px;
                }

                ul li button {
                    background-color: red;
                    color: white;
                    padding: 5px 10px;
                    border: none;
                    cursor: pointer;
                    border-radius: 5px;
                }

                ul li button:hover {
                    background-color: dark-red;
                }
                `}
      </style>

      <div className="background-1">
        <form onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="email">Lecturer Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter lecturer email"
          />

          <label htmlFor="stage">Stage</label>
          <select
            name="stage"
            id="stage"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
          >
            <option value="">Select a Stage</option>
            <option value="Y1 SEM 1">Y1 SEM 1</option>
            <option value="Y1 SEM 2">Y1 SEM 2</option>
            <option value="Y2 SEM 1">Y2 SEM 1</option>
            <option value="Y2 SEM 2">Y2 SEM 2</option>
            <option value="Y3 SEM 1">Y3 SEM 1</option>
            <option value="Y3 SEM 2">Y3 SEM 2</option>
            <option value="Y4 SEM 1">Y4 SEM 1</option>
            <option value="Y4 SEM 2">Y4 SEM 2</option>
          </select>

          <label htmlFor="regDate">Registration Date</label>
          <input
            type="date"
            id="regDate"
            value={regDate}
            onChange={(e) => setRegDate(e.target.value)}
          />

          <label htmlFor="school">School</label>
          <input
            type="text"
            id="school"
            value={newSchool}
            onChange={(e) => setNewSchool(e.target.value)}
            placeholder="Enter school name"
          />

          <label htmlFor="units">Units Taken</label>
          <input
            type="text"
            id="units"
            value={newUnits}
            onChange={(e) => setNewUnits(e.target.value)}
            placeholder="Enter number of units"
          />
          <button type="button" onClick={handleAddSchool}>
            + Add School
          </button>

          <ul>
            {schoolUnits.map((item, index) => (
              <li key={index}>
                {item.school} - {item.units} units
                <button type="button" onClick={() => handleRemoveSchool(index)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <button type="button" onClick={handleSaveCourse}>
            Save Course Registration
          </button>
        </form>
      </div>
    </div>
  );
};

export default CoursesModal;
