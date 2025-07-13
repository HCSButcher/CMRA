import './Student.css'
import { useEffect, useState, useContext } from 'react';
import { SidebarContext } from '../context/SidebarContext';
import axios from 'axios';
import CommentModal from './CommentModal';
import LogoutButton from './LogoutButton';
import SCoursesModal from './SCoursesModal'
import ViewUnitsModal from './ViewUnitsModal';
import { useNavigate } from 'react-router-dom';

const Student = () => {
  const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);
const navigate = useNavigate();
  const handleNavigate = (path) => {
    navigate(path);
  };



 

  
const [materials, setMaterials] = useState([]);
const [announcements, setAnnouncements] = useState([]);
const [comments, setComments] = useState([]);
const [sRegistrations, setSRegistrations] = useState([]);
  

//views Modal
const [showViewUnitsModal, setViewUnitsModal] = useState(false)
const openViewUnitsModal = () => setViewUnitsModal(true);
const CloseViewUnitsModal = () =>setViewUnitsModal(false);

//courses Modal
const[showSCoursesModal, setSCoursesModal] = useState(false);
const openSCoursesModal = () => setSCoursesModal(true);
const CloseSCoursesModal = () => setSCoursesModal(false);

//comment modal
const [showCommentModal, setCommentModal] = useState(false);
const openCommentModal = () =>setCommentModal(true);
const CloseCommentModal = () =>setCommentModal(false);

  
const handleCourseViewDelete = (unitToDelete) => {
  setMaterials((prevMaterials) => prevMaterials.filter((material) => material.unit !== unitToDelete));
};



//handle comment delete
const commentDelete = (id) => {
  axios.delete(`https://project-2-1u71.onrender.com/comments/${id}`)
    .then(() => {
      setComments(comments.filter(comment =>comment._id !==id))
    })
    .catch(error => console.error('Error deleting comments', error))
  
}

//sRegistration fetch
useEffect(() => {
  const fetchSRegistrations = async () => {
    try {     
      const token = localStorage.getItem('token');
      const response = await axios.get('https://project-2-1u71.onrender.com/sRegistrations', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('API Response:', response.data); // Debugging

      // Handle cases where data might be inside an object key
      if (Array.isArray(response.data)) {
        setSRegistrations(response.data);
      } else if (Array.isArray(response.data.items)) {  // Check if data is nested
        setSRegistrations(response.data.items);
      } else {
        console.error('Unexpected response format:', response.data);
        setSRegistrations([]); // Prevent crashes by setting an empty array
      }
    } catch (error) {
      console.error('Error fetching sRegistrations:', error);
      setSRegistrations([]); // Set empty array in case of an error
    }
  };

  fetchSRegistrations();
}, []);


  
useEffect(() => {
  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem("token");

            const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get('https://project-2-1u71.onrender.com/materials?recent=true', { headers });

      if (Array.isArray(response.data)) {
        setMaterials(response.data);
      } else {
        console.error('Unexpected response format', response.data);
      }
    } catch (error) {
      console.error('Error fetching materials', error);
    }
  };
  fetchMaterials();
}, []);


  //announcement fetch
useEffect(() => {
  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://project-2-1u71.onrender.com/announcements', {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('API Response:', response.data); // Debugging log

      // Handle different response structures
      if (Array.isArray(response.data)) {
        setAnnouncements(response.data);
      } else if (response.data && Array.isArray(response.data.announcements)) {
        setAnnouncements(response.data.announcements);
      } else {
        console.error('Unexpected response format:', response.data);
        setAnnouncements([]); // Prevents crashes
      }
    } catch (error) {
      console.error('Error fetching Announcements:', error);
      setAnnouncements([]); // Ensures the UI doesn't break
    }
  };

  fetchAnnouncements();
}, []);


  //comments fetch
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://project-2-1u71.onrender.com/comments', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (Array.isArray(response.data)) {
          setComments(response.data);
        } else {
          console.error('Unexpected response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    fetchComments();
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
        <h1 >Student</h1>
        </div>     
      <ul> 
        
        <li > <a style={{color:'white'}} href ="https://kabarak.ac.ke/library" target = "_blank" rel = "noopener noreferrer" >  <img src ='http://10.1.33.99:3000/schools.png' alt =''/> &nbsp;<br /> <span>Library</span></a></li>
          <li > <a style={{color:'white'}}  href='https://pastpapers.kabarak.ac.ke/login?next=%2F' target='blank' rel='noopener noreferrer' >  <img src ='http://10.1.33.99:3000/schools.png' alt =''/> &nbsp; <br /> <span>Past Papers</span></a> </li>
        <li > <a style={{color:'white'}} href='https://eserver.kabarak.ac.ke/Students/' target='blank' rel='noopener noreferrer' > <img src ='http://10.1.33.99:3000/teachers.png' alt =''/> &nbsp; <br /> <span>Student Portal</span></a> </li>
        <li   onClick={() =>handleNavigate('/repository')} >  <img src ='http://10.1.33.99:3000/students.png' alt =''/> &nbsp; <span>  Repo <br />sitory  </span>  </li>
               
      
      </ul>      
  </div>
   <div className="container">
        <div className="header"> 
          <div className="reducer">
    <button onClick={toggleSidebar} className="toggle-btn">
  <img src="http://localhost:3000/dashboard.png" alt="Toggle Sidebar" className="toggle-icon" />
            </button>
            </div>
  <LogoutButton />
        <div className="user">          
          
          <div className="img-case">
          <img src ='http://localhost:3000/user.png' alt =''/>
          </div>       
    </div>
  </div>

  <div className="content">
    <div className="cards-1">      
    <div className="card-1">
      <div className="box-1">
          <h2>Comments</h2>
          <ul>
            <li onClick={openCommentModal} className='btn'>Add</li>
          </ul>
        </div>
        <table>
          <thead>
            <tr>
            <th>Unit</th>
            <th>Comment</th> 
            <th>Action</th> 
            </tr>        
          </thead> 
          <tbody>                     
                  {comments && comments.length > 0 ? (
                    comments.map((comment) => (
                      <tr key={comment._id}>
                        <td>{comment.unit} </td>
                        <td>{comment.comments} </td>
                        <td>
                          <ul>
                            <li className='btn' onClick={() => commentDelete(comment._id)}>Delete</li>
                          </ul>
                        </td>
                      </tr>
                    ))
                  ) : (
                       <tr>
                        <td colSpan='3' > No comments available </td>
                    </tr>
                  )}
          </tbody>
      </table>
      </div>
    
      <div className="cards-2">
        <div className="card-2">
          <h2> Announcements</h2>          
        </div>
        <table>
          <thead>
            <tr>
            <th>Unit</th>
            <th>Date</th>
            <th>Announcements</th>            
            <th>Option</th>
            </tr>
          </thead>
          <tbody>
                  {announcements && announcements.length > 0 ? (
                    announcements.map((announcement) => (
                      <tr key={announcement._id}>
                        <td>{announcement.unit} </td>
                        <td>{announcement.date} </td>
                        <td>{announcement.announcements} </td>
                        <td>
                          <input type="checkbox"
                          />
                        </td>

                      </tr>
                    ))
                  ) : (
                       <tr>
                        <td colSpan='3' > No announcements available </td>
                    </tr>
                  )}
          </tbody>
          </table>
    </div>
    </div>

    <div className="content-3">
      <div className="lecturer">
        <div className="titles">
          <h2> Course Registration List</h2>
          <ul>
            <li onClick={openSCoursesModal} className='btn'> Add</li>
          </ul>
        </div>
        <table>
                <thead>
                  <tr>                    
            <th>Action</th>
            <th>Stage</th>           
            <th>Unit taken</th>
            <th>Reg Date</th>
                  </tr>
          </thead>
          <tbody>
                  {sRegistrations && sRegistrations.length > 0 ? (
                    sRegistrations.map((sRegistration) => (
                      <tr key={sRegistration._id}>
                        <td>
                          <ul>
                            <li className='btn' onClick={openViewUnitsModal} >View units</li>
                          </ul>
                        </td>
                        <td>{sRegistration.stage} </td>
                        <td>{sRegistration.unitsTaken} </td>
                        <td>{sRegistration.sDate} </td>
                      </tr>
                    ))
                  ) : (
                      <tr>
                         <td colSpan='3' > No course content available </td>
                      </tr>                    
                  )}
          </tbody>        

        </table>
      </div>
      <div className="new-student">
      <div className="titles">
                <h2>Recent Uploads</h2>
                
                
        </div>
        <table>
                <thead>
                  <tr>
            <th>Unit</th>
            <th>Date</th>
            <th>option</th>
                  </tr>
          </thead>
          <tbody>
                  {materials && materials.length > 0 ? (
                    materials.map((material) => (
                      <tr key={material._id}>
                        <td> {material.unit} </td>
                        <td>{new Date(material.uploadDate).toLocaleDateString()} </td>
                        <td>
                          <a onClick={() =>handleCourseViewDelete (material.unit)} className='btn' > Delete</a>
                        </td>
                      </tr>
                    ))
                  ) : (
                      <tr>
                        <td colSpan='3' > No materials available </td>
                    </tr>
                  )}  
          </tbody>
        </table>
      </div>
    </div>
  </div>
  {showCommentModal && (
    <div className="modal">
      <div className="modal-content">
        <span className='close' onClick={CloseCommentModal}>&times; </span>
      </div>
      <CommentModal CloseModal={CloseCommentModal} />
    </div>
  )}

  {showSCoursesModal && (
    <div className="modal">
      <div className="modal-content">
        <span className='close'onClick={CloseSCoursesModal}> &times;</span>
      </div>
      < SCoursesModal/>
    </div>
  )}

  {showViewUnitsModal && (
    <div className="modal">
      <div className="modal-content">
        <span className='close' onClick={CloseViewUnitsModal}> &times;</span>
        <ViewUnitsModal />
      </div>
    </div>
  )}
</div>
</div>
  )
}

export default Student;
