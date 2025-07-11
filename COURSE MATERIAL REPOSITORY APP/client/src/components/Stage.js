import { useState } from 'react';
import axios from 'axios';

const Stage = () => {
  const [school, setSchool] = useState('');
  const [stage, setStage] = useState('');
  const [units, setUnits] = useState([]);
  const [newUnit, setNewUnit] = useState('');

  const handleAddUnit = () => {
    if (units.length < 8 && newUnit.trim()) {
      setUnits([...units, newUnit]);
      setNewUnit('');
    }
  };
  const handleRemoveUnit = (index) => {
    setUnits(units.filter((_, i) => i !== index));
  };

  const handleSaveStage = async () => {
    if (!school || !stage || units.length === 0) return;
    try {
      await axios.post('https://project-2-1u71.onrender.com/stages', {
        school,
        stage,
        units,
      });
      setSchool('');
      setStage('');
      setUnits([]);
      alert('Stage and units saved successfully!');
    } catch (error) {
      console.error('Error saving stage and units', error);
    }
  };

  return (
    <div>
      <style>
        {`
            body {
                background-color: #080710;
            }
            textarea{
                background-color: rgba(255, 255, 255, 0.13);
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
               select {
    background-color: black;
    color: white;
    border: 1px solid white;
    padding: 10px;
    border-radius: 5px;
}
            `}
      </style>
      <div className="background-1">
        <form onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="school">School</label>
          <select
            name="school"
            id="school"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
          >
            <option value="">Select a School</option>
            <option value="SBE">SBE</option>
            <option value="SSET">SSET</option>
            <option value="EDUC">EDUC</option>
            <option value="SMHS">SMHS</option>
            <option value="SMPA">SMPA</option>
            <option value="PHARM">PHARM</option>
            <option value="LAW">LAW</option>
            <option value="SMM">SMM</option>
          </select>

          <label htmlFor="stage"> Stage</label>
          <input
            type="text"
            placeholder="e.g., Y1 SEM 1"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
          />

          <label htmlFor="units"> Units</label>
          <input
            type="text"
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            placeholder="Add a unit"
          />
          <button type="button" onClick={handleAddUnit}>
            {' '}
            Add Unit
          </button>
          <ul>
            {units.map((unit, index) => (
              <li key={index}>
                {unit}
                <button type="button" onClick={() => handleRemoveUnit(index)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={handleSaveStage}>
            {' '}
            Save Stage & Units
          </button>
        </form>
      </div>
    </div>
  );
};

export default Stage;
