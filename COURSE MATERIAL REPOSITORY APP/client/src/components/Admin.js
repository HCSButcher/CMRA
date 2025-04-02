import './Admin.css'
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarContext } from '../context/SidebarContext';
import Signup from './Signup';
import EnrollModal from './EnrollModal';
import LogoutButton from './LogoutButton';
import Student2Modal from './Student2Modal';
import Courses from './Courses';
import Lecturer2Modal from './Lecturer2Modal';
import axios from 'axios';

const Admin = () => {
  const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);

  //navigate paths
  const navigate = useNavigate();
  const handleNavigate = (path) => {
    navigate(path);
  };

  const [lecturers, setLecturers] = useState([]);
  const [students, setStudents] = useState([]);

   //enroll Modal
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const openEnrollModal = () => setShowEnrollModal(true);
  const closeEnrollModal = () => setShowEnrollModal(false);

  //student2Modal 
  const [showStudent2Modal,setShowStudent2Modal] = useState(false);
  const openStudent2Modal = () => setShowStudent2Modal(true);
  const CloseStudent2Modal = () => setShowStudent2Modal(false);

//lecturer modal
  const [showLecturer2Modal, setShowLecturer2Modal] = useState(false);
  const openLecturer2Modal = () => setShowLecturer2Modal(true);
  const CloseLecturer2Modal = () => setShowLecturer2Modal(false);

  //courses modal
  const [showCourses, setShowCourses] = useState(false);
  const openCourses = () => setShowCourses(true);
  const CloseCourses = () => setShowCourses(false);

  //signup modal
const [ showSignupModal, setShowSignupModal ] = useState(false)
const openSignupModal = () => setShowSignupModal(true);
  const closeSignupModal = () => setShowSignupModal(false);
  
  //fetch lecturers
  useEffect(() => {
    const fetchLecturers = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const response = await axios.get('http://10.1.33.99:3001/getLecturers', {
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (Array.isArray(response.data)) {
          setLecturers(response.data);
        } else {
          console.error('Unexpected response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching lecturers:', error);
      }
    };
    
    fetchLecturers();
}, []);


  //fetch students
 useEffect(() => {
    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem("token"); // Retrieve the token
            const response = await axios.get('http://10.1.33.99:3001/getStudents', {
                headers: { Authorization: `Bearer ${token}` } // Send token in headers
            });

            if (Array.isArray(response.data)) {
                setStudents(response.data);
            } else {
                console.error('Unexpected response format:', response.data);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    fetchStudents();
}, []);


 // Lecturer delete
const LecturerDelete = (id) => {
  axios
    .delete(`http://10.1.33.99:3001/getLecturers/${id}`) 
    .then(() => {
      setLecturers(lecturers.filter((lecturer) => lecturer._id !== id));
    })
    .catch((error) => console.error('Error deleting lecturer', error));
};

// Student delete
const StudentDelete = (id) => {
  axios
    .delete(`http://10.1.33.99:3001/getStudents/${id}`) 
    .then(() => {
      setStudents(students.filter((student) => student._id !== id));
    })
    .catch((error) => console.error('Error deleting student', error));
};

  //student count
 const [studentCount, setStudentCount] = useState(0);

useEffect(() => {
  const token = localStorage.getItem("token"); // Get token from localStorage

  axios
    .get("http://10.1.33.99:3001/countStudents", {
      headers: {
        Authorization: `Bearer ${token}`, // Add Authorization header
      },
    })
    .then((response) => {
      setStudentCount(response.data.count);
    })
    .catch((error) => {
      console.error("Error fetching student count", error);
    });
}, []);

  //lecturer count
const [lecturerCount, setLecturerCount] = useState(0);

useEffect(() => {
  const token = localStorage.getItem("token"); // Get token from localStorage

  axios
    .get("http://10.1.33.99:3001/countLecturers", {
      headers: {
        Authorization: `Bearer ${token}`, // Attach the Authorization token
      },
    })
    .then((response) => {
      setLecturerCount(response.data.count);
    })
    .catch((error) => {
      console.error("Error fetching lecturer count:", error);
    });
}, []);
  
  //school count
 const [schoolCount, setSchoolCount] = useState(0);
useEffect(() => {
  const token = localStorage.getItem("token"); // Get token from localStorage

  axios
    .get("http://10.1.33.99:3001/countSchool", {
      headers: {
        Authorization: `Bearer ${token}`, // Attach the Authorization token
      },
    })
    .then((response) => {
      setSchoolCount(response.data.count);
    })
    .catch((error) => {
      console.error("Error fetching school count:", error);
    });
}, []);

  //courses count
const [courseCount, setCourseCount] = useState(0);

useEffect(() => {
  const token = localStorage.getItem("token"); // Get stored token

  axios
    .get("http://10.1.33.99:3001/countCourses", {
      headers: {
        Authorization: `Bearer ${token}`, // Attach auth token
      },
    })
    .then((response) => {
      setCourseCount(response.data.count);
    })
    .catch((error) => {
      console.error("Error fetching courses count:", error);
    });
}, []);


  return (
    <div>  
      <style>
        {` 
        body {
        min-height : 100vh
        font-family: var(--font-family-bai);
        }
        h1, h2 {
    color: #444

    }
    
       
        `}
      </style>
      <div className={`side-menu ${isSidebarOpen ?'open':'closed' }`}>
        <div className='brand-name'>
        <h1>Admin</h1>
        </div>     
      <ul>       
       
        <li onClick={openStudent2Modal} > <img src ='http://10.1.33.99:3000/students.png' alt =''/> &nbsp; <span> Student</span></li>  
        <li  onClick={openLecturer2Modal} > <img src ='http://10.1.33.99:3000/teachers.png' alt =''/> &nbsp; <span>Lecturer</span></li>
        <li onClick={openCourses} > <img src ='http://10.1.33.99:3000/schools.png' alt =''/> &nbsp; <span>Courses</span></li>
         <li onClick={openSignupModal} > <img src ='http://10.1.33.99:3000/teachers.png' alt =''/> &nbsp;<span>Add Lecturer</span> </li> 
         <li onClick={openSignupModal} > <img src ='http://10.1.33.99:3000/students.png' alt =''/> &nbsp; <span>Add Student</span></li> 
        <li  onClick={openEnrollModal} > <img src ='http://10.1.33.99:3000/students.png' alt =''/> &nbsp;<span>Enroll Student</span> </li>        
      </ul>      
  </div>
    <div className="container">
        <div className="header"> 
          <div className="reducer">
    <button onClick={toggleSidebar} className="toggle-btn">
  <img src="http://10.1.33.99:3000/dashboard.png" alt="Toggle Sidebar" className="toggle-icon" />
            </button>
            </div>
  <LogoutButton />
          <div className="user"> 
            <div className="Logout">
             
              </div>
          <div className="img-case">
          <img src ='http://10.1.33.99:3000/user.png' alt =''/>
          </div>       
    </div>
  </div>
  <div className="content">
    <div className="cards">
      <div className="card">
        <div className="box">
          <h1>{studentCount} </h1>
          <h3>Students</h3>
        </div>
        <div className="icon-case">
        <img src ='http://10.1.33.99:3000/students.png' alt =''/>
        </div>
      </div>
      <div className="card">
        <div className="box">
          <h1> {lecturerCount} </h1>
          <h3>Lecturers</h3>
        </div>
        <div className="icon-case">
        <img src ='http://10.1.33.99:3000/teachers.png' alt =''/>
        </div>
      </div>
      <div className="card">
        <div className="box">
          <h1> {schoolCount}</h1>
          <h3>Schools</h3>
        </div>
        <div className="icon-case">
        <img src ='http://10.1.33.99:3000/schools.png' alt =''/>
        </div>
      </div>
      <div className="card">
        <div className="box">
          <h1>{courseCount} </h1>
          <h3>Courses</h3>
        </div>
        <div className="icon-case">
        <img src ='http://10.1.33.99:3000/schools.png' alt =''/>
        </div>
      </div>
      
    </div>
    <div className="content-2">
      <div className="lecturers">
        <div className="title">
          <h2>Lecturers</h2>          
          <a href='/lecturers' className='btn'> view All </a>
        </div>
        <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>            
            <th>Email</th>            
            <th>Option</th>
          </tr>    
        </thead>
                <tbody>
                  {lecturers.map((lecturer) => (
                    <tr key={lecturer._id}>
                    <td>{lecturer.name} </td>
                    <td>{lecturer.contact} </td>                   
                    <td>{lecturer.email} </td>                   
                      <td><ul>
                        <li className='btn' onClick={() =>LecturerDelete(lecturer._id)} >Remove </li>
                      </ul>
                      </td>
                
                    </tr>
                  ))}
                </tbody>   
        </table>
      </div>
      <div className="new-students">
      <div className="title">
          <h2>New Students</h2>
          <a href='/students' className='btn'> view All </a>
        </div>
              <table>
                <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>option</th>
          </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td>{student.name} </td>
                      <td>{student.email} </td>
                       <td><ul>
                        <li className='btn' onClick={() =>StudentDelete(student._id)} >Remove </li>
                      </ul>
                      </td>
                    </tr> 
                  ))}
                  
                </tbody>
                
        </table>
      </div>
    </div>
  </div>
  
  {showSignupModal && (
   <div className="modal">
    <div className="modal-content">
      <span className='close' onClick={closeSignupModal}> &times;</span>
      <Signup CloseModal={closeSignupModal} />
    </div>
   </div>
  )}
  
        {showEnrollModal && (
          <div className="modal">
            <div className="modal-content">
              <span className='close' onClick={closeEnrollModal} > &times;</span>
           <EnrollModal closeModal = {closeEnrollModal} />
            </div>
          </div>
        )}
        {showCourses && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={CloseCourses}> &times;</span>
            <Courses CloseModal={CloseCourses} />
            </div>
          </div>
        )}
        
       {showLecturer2Modal && (
    <div className="modal">
        <div className="modal-content">
            <span className="close" onClick={CloseLecturer2Modal}> &times; </span>
            <Lecturer2Modal isOpen={showLecturer2Modal} onClose={CloseLecturer2Modal} />
        </div>
    </div>
        )}
        
        {showStudent2Modal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={CloseStudent2Modal} > &times; </span>
              <Student2Modal isOpen={showStudent2Modal} onClose = {CloseStudent2Modal} />
            </div>
          </div>
        )}

</div>
</div>
  )
}

export default Admin;
