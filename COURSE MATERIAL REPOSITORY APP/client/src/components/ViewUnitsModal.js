import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ViewUnitsModal = () => {
  const [units, setUnits] = useState([]);

  // Fetch registrations
  useEffect(() => {
    axios.get('http://192.168.101.100:3001/sRegistrations')
      .then(response => {
        setUnits(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  useEffect(() => {
    const getUnits = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://192.168.101.100:3001/sRegistrations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(response.data)) {
          setUnits(response.data);
        } else {
          console.error('Unexpected response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching units:', error);
      }
    };
    getUnits();
  }, []);

//registration delete
const dropUnit = (registrationId, unit) => {
  axios.delete(`http://192.168.101.100:3001/sRegistrations/${registrationId}/${unit}`)
    .then(() => {
      setUnits(units.map(u => 
        u._id === registrationId 
          ? { ...u, units: u.units.filter(uName => uName !== unit) } 
          : u
      ));
    })
    .catch(error => console.error('Error deleting unit:', error));
};


  return (
    <div>
      <style>
        {`
          .background-1 {
            position: relative;
          }
          form {
            top: 95%;
            height: auto;
            width: 500px;
            background-color: rgba(255, 255, 255, 0.13);
            padding: 20px;
            border-radius: 10px;
            border: 2px solid rgba(255, 255, 255, 0.1);
            margin: 0 auto;
          }
          h2 {
            text-align: center;
            color: #fff;
          }
          .unit-list {
            list-style-type: none;
            padding: 0;
          }
          .unit-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0px 0px;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
            margin-bottom: 3px;
            color: #fff;
          }
          .btn {
            background-color: #ff4d4d;
            color: #fff;
            border: none;
            height: 60px;
            width: 60px;
            padding: 1px 1px;
            border-radius: 4px;
            cursor: pointer;
          }
          .btn:hover {
            background-color: white;
          }
        `}
      </style>
      <div className="background-1">
        <div className="shape"></div>
        <div className="shape"></div>
        <form action="">
          <h2>Units Registered</h2>
          <ul className="unit-list">
            {units.map((registration) => (
              registration.units.map((individualUnit, index) => (
                <li key={`${registration._id}-${index}`} className="unit-item">
                  <span>{individualUnit}</span>
                  <li className="btn" 
                  onClick={() => dropUnit(registration._id, individualUnit)}>Drop Unit</li>
                </li>
              ))
            ))}
          </ul>
        </form>
      </div>
    </div>
  );
}

export default ViewUnitsModal;
