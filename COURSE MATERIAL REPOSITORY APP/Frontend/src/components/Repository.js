import './Repository.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Repository = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      console.log('Search query is empty, not fetching.');
      return; // Exit if search query is empty
    }

    try {
      const response = await fetch(`http://localhost:3001/materials?search=${searchQuery}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        const filteredResults = data.filter((material) =>
          material.unit.includes(searchQuery) || material.unitName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filteredResults);
      } else {
        throw new Error('Invalid response format. Expected JSON.');
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const handleCourseEnter = (unitId) => {
    navigate(`/unit/${encodeURIComponent(unitId)}`);
  };

  return (
    <div>
      <div className="container-1">
        <div className="header-1">
          <div className="nav-1">
            <div className="search-1">
              <input
                type="text"
                className="input"
                placeholder="Search by unit or unit name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button onClick={handleSearch}>
                <img src="http://localhost:3000/search.png" alt="Search" />
              </button>
            </div>
            <div className="user">
              <img src="http://localhost:3000/notifications.png" alt="" />
              <div className="img-case">
                <img src="http://localhost:3000/user.png" alt="" />
              </div>
            </div>
          </div>
        </div>
              {searchResults.length > 0 && (
                <div className="results-container">
                  <ul className="results-list">
                    {searchResults.map((material) => (
                      <li key={material._id} className="result-item">
                        <span>
                          {material.name} ({material.unit})
                        </span>
                        <ul>
                        <li
                          className="enter-course-button"
                          onClick={() => handleCourseEnter(material.unit)}
                        >
                          Enter Course
                          </li>
                          </ul>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
      </div>
    </div>
  );
};

export default Repository;
