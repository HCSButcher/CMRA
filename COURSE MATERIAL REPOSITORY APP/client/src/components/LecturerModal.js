import { useState, useEffect } from 'react';
import axios from 'axios';

const LecturerModal = () => {
  const [lecturers, setLecturers] = useState([]);
  const [filteredLecturers, setFilteredLecturers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    const fetchLecturers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('No token found. User might not be authenticated.');
          return;
        }

        const response = await axios.get(
          'https://project-2-1u71.onrender.com/getLecturers',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log('Response from server:', response.data);

        if (Array.isArray(response.data)) {
          setLecturers(response.data);
          setFilteredLecturers(response.data);
        } else {
          console.error('Unexpected response format:', response.data);
        }
      } catch (error) {
        console.error(
          'Error fetching lecturers:',
          error.response ? error.response.data : error.message
        );
      }
    };

    fetchLecturers();
  }, []);

  const handleSearchChange = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);

    if (searchValue === '') {
      setIsSearchActive(false);
      setFilteredLecturers(lecturers);
    } else {
      setIsSearchActive(true);
      setFilteredLecturers(
        lecturers.filter(
          (lecturer) =>
            lecturer.name.toLowerCase().includes(searchValue) ||
            lecturer.email.toLowerCase().includes(searchValue)
        )
      );
    }
  };

  const LecturerDelete = (id) => {
    axios
      .delete(`https://project-2-1u71.onrender.com/deleteLecturer/${id}`)
      .then(() => {
        setLecturers((prevLecturers) =>
          prevLecturers.filter((lecturer) => lecturer._id !== id)
        );
        setFilteredLecturers((prevLecturers) =>
          prevLecturers.filter((lecturer) => lecturer._id !== id)
        );
      })
      .catch((error) => console.error('Error deleting lecturer', error));
  };

  return (
    <div className="enroll-modal">
      <style>
        {`
          body {
            background-color: #080710;
          }
          form {
            background-color: rgba(255, 255, 255, 0.13);
          }
          .btn-e {
            cursor: pointer;
            border: none;
            background: #f05462;
            color: white;
            padding: 5px 10px;
            width: 100px;
            height: 30px;
            text-align: center;
          }
          .btn-e:hover {
            color: #f05462;
            background: white;
            padding: 3px 8px;
            border: 2px solid #f05462;
          }
        `}
      </style>
      <h2>Lecturers</h2>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search by name or email"
        className="search-bar"
      />
      <div className="table-container">
        <table className="student-table">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLecturers.length === 0 && isSearchActive ? (
              <tr>
                <td colSpan="5">No lecturers found</td>
              </tr>
            ) : (
              filteredLecturers.map((lecturer) => (
                <tr key={lecturer.email}>
                  <td>
                    {lecturer.profilePicture ? (
                      <img
                        src={`${
                          lecturer.profilePicture
                        }?${new Date().getTime()}`} // Adding a timestamp to prevent caching
                        alt="profile"
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      'No image'
                    )}
                  </td>

                  <td>{lecturer.name}</td>
                  <td>{lecturer.email}</td>
                  <td>{lecturer.contact}</td>
                  <td>
                    <button
                      className="btn-e"
                      onClick={() => LecturerDelete(lecturer._id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LecturerModal;
