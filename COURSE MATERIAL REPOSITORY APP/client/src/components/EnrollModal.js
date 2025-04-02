import axios from 'axios';
import './EnrollModal.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EnrollModal = () => {
  const navigate = useNavigate();
  const handleNavigate = (path) => {
    navigate(path);
  };

  const [students, setStudents] = useState([]); 
  const [filteredStudents, setFilteredStudents] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [registrationNumber, setRegistrationNumber] = useState(''); 
  const [course, setCourse] = useState(''); 
  const [school, setSchool] = useState(''); // ✅ Added state for School
  const [selectedStudent, setSelectedStudent] = useState(null); 
  const [isSearchActive, setIsSearchActive] = useState(false); 

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No token found. User might not be authenticated.");
          return;
        }

        const response = await axios.get('http://192.168.101.100:3001/getStudents', {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Response from server:", response.data);

        if (Array.isArray(response.data)) {
          setStudents(response.data);
          setFilteredStudents(response.data);
        } else {
          console.error("Unexpected response format:", response.data);
        }
      } catch (error) {
        console.error('Error fetching students:', error.response ? error.response.data : error.message);
      }
    };

    fetchStudents();
  }, []);

  const handleSearchChange = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);

    if (searchValue === '') {
      setIsSearchActive(false);
      setFilteredStudents(students);
    } else {
      setIsSearchActive(true);
      setFilteredStudents(
        students.filter(
          (student) =>
            student.name.toLowerCase().includes(searchValue) ||
            student.email.toLowerCase().includes(searchValue)
        )
      );
    }
  };

  const handleEnrollSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudent || !registrationNumber || !course || !school) {  
      alert('Please fill in all the fields');
      return;
    }

    const data = {
      email: selectedStudent.email, 
      registrationNumber,
      course,
      school,  
    };

    axios
      .post('http://192.168.101.100:3001/enrollStudent', data) 
      .then((response) => {
        alert('Student enrolled successfully');
        setRegistrationNumber('');
        setCourse('');
        setSchool(''); 
        setSelectedStudent(null);
      })
      .catch((error) => {
        console.error('Error enrolling student:', error);
        alert('Failed to enroll student');
      });
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
           .btn-e{
           cursor:pointer;
    border: #f1f1f1;
background: #f05462;
color: white;
padding: 5px 10px;
width:100px;
height:30px;
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
     
      <h2>Enroll Student</h2>
      <ul>
        <li className ='btn-e' onClick={() =>handleNavigate('/enroll')} >View Page</li>
      </ul>
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
              <th>Name</th>
              <th>Email</th>
              <th>Profile</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 && !isSearchActive ? (
              students.map((student) => (
                <tr key={student.email}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                 <td>
                   {student.profilePicture ? (
                      <img
                        src={`http://192.168.101.100:3001/uploads/${student.profilePicture}?${new Date().getTime()}`}
                        alt="profile"
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      'No image'
                    )}
                  </td>
                  <td>
                    <button
                      className="btn"
                      onClick={() => setSelectedStudent(student)}
                      style={{ cursor: 'pointer' }}
                    >
                      Select for enrollment
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.email}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>
                    {student.profilePicture ? (
                      <img
                        src={`http://192.168.101.100:3001/${student.profilePicture}`}
                        alt=""
                        width={50}
                      />
                    ) : (
                      'No image'
                    )}
                  </td>
                  <td>
                    <button
                      className="btn"
                      onClick={() => setSelectedStudent(student)}
                      style={{ cursor: 'pointer' }}
                    >
                      Select for enrollment
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedStudent ? (
        <div className="enroll-form">
          <h3>Enroll {selectedStudent.name}</h3>
          
          <form onSubmit={handleEnrollSubmit}>
            <div>
              <label>Registration Number</label>
              <input
                type="text"
                id='registrationNumber'
                name='registrationNumber'
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Course</label>
              <input
                type="text"
                id='course'
                name='course'
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
              />
            </div>
            <div> 
              <label>School</label> 
              <input
                type="text"
                id='school'
                name='school'
                value={school}
                onChange={(e) => setSchool(e.target.value)} 
                required
              />
            </div>
            <button type="submit">Enroll Student</button>
          </form>
        </div>
      ) : (
        <p>Please select a student to enroll.</p>
      )}
    </div>
  );
};

export default EnrollModal;
