import './Lecturer.css'
import { useEffect, useState , useContext} from 'react'
import { SidebarContext } from '../context/SidebarContext';
import { useNavigate } from 'react-router-dom';
import UploadModal from './UploadMaterials'
import UpdateModal from './Updates'
import Comment2Modal from './Comment2Modal';
import LogoutButton from './LogoutButton';
import AnnouncementModal from './AnnouncementModal'
import CoursesModal from './CoursesModal'
import ViewModal from './ViewModal'
import axios from 'axios'


const Lecturer = () => {

  const navigate = useNavigate();
  const handleNavigate = (path) => {
    navigate(path);
  };

  useEffect(() => {
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    if (!email || role !== 'lecturer' || !token) {
        navigate('/login'); 
    }
}, [navigate]);


const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);

  const [registrations, setRegistrations] = useState([]);
  const[announcements, setAnnouncements] =useState([]);
  const [ materials, setMaterials] = useState([]);
	const [ updates, setUpdates] = useState([]);

  //announcement modal
  const [showAnnouncementModal, setShowAnnouncementModal]= useState(false);
  const openAnnouncementModal= () => setShowAnnouncementModal(true);
  const CloseAnnouncementModal = () => setShowAnnouncementModal(false);


  //view modal
  const [showViewModal, setShowViewModal] = useState(false);
  const openViewModal = () => setShowViewModal(true);
  const CloseViewModal = () => setShowViewModal(false);

	//upload modal
  const[ showUploadModal , setShowUploadModal ] = useState(false);
  const openUploadModal = () => setShowUploadModal(true);
  const CloseUploadModal = () => setShowUploadModal(false);

	//update modal
const [showUpdateModal, setShowUpdateModal]= useState(false);
const openUpdateModal = () => setShowUpdateModal(true);
const CloseUpdateModal = () => setShowUpdateModal(false);
 
// courses modal
  const [showCoursesModal, setShowCoursesModal] = useState(false);
  const openCoursesModal = () => setShowCoursesModal(true);
  const CloseCoursesModal = () => setShowCoursesModal(false);

  //comment2Modal
  const [showComment2Modal, setShowComment2Modal] = useState(false)
  const openComment2Modal = () => setShowComment2Modal(true);
  const CloseComment2Modal = () => setShowComment2Modal(false);

//registration courses fetch
useEffect(() => {
    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            const email = localStorage.getItem('email');  // Get logged-in lecturer's email

            const response = await axios.get(`http://localhost:3001/courses?email=${email}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (Array.isArray(response.data)) {
                setRegistrations(response.data);
            } else {
                console.error('Unexpected response format:', response.data);
            }
        } catch (error) {
            console.error('Error fetching lecturers:', error);
        }
    };
    fetchCourses();
}, []);


//material fetch
useEffect(() => {
    const fetchMaterials = async () => {
        try {
            const token = localStorage.getItem('token');
            const email = localStorage.getItem('email'); 

            const response = await axios.get(`http://localhost:3001/materials?email=${email}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (Array.isArray(response.data)) {
                setMaterials(response.data);
            } else {
                console.error('Unexpected response format:', response.data);
            }
        } catch (error) {
            console.error('Error fetching materials:', error);
        }
    };
    fetchMaterials();
}, []);


	//update fetch
useEffect(() => {
    const fetchUpdates = async () => {
        try {
            const token = localStorage.getItem('token');
            const email = localStorage.getItem('email'); 

            const response = await axios.get(`http://localhost:3001/updates?email=${email}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data && Array.isArray(response.data.updates)) {
                setUpdates(response.data.updates);
            } else {
                console.error('Unexpected response format:', response.data);
            }
        } catch (error) {
            console.error('Error fetching updates:', error);
        }
    };
    fetchUpdates();
}, []);


  //announcement fetch

useEffect(() => {
    const fetchAnnouncements = async () => {
        try {
            const token = localStorage.getItem('token');
            const email = localStorage.getItem('email'); 

            if (!token || !email) {
                console.error("❌ Missing token or email in localStorage");
                return;
            }

            const response = await axios.get(`http://localhost:3001/announcements?email=${email}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("📌 API Response:", response.data); // Debugging log

            if (response.data && Array.isArray(response.data.announcements)) {
                setAnnouncements(response.data.announcements);
                console.log("📢 Announcements updated:", response.data.announcements);
            } else {
                console.error("❌ Unexpected response format:", response.data);
            }
        } catch (error) {
            console.error("❌ Error fetching announcements:", error);
        }
    };

    fetchAnnouncements();
}, []);



//handle announcement delete
const handleDelete = (id) =>{
  axios.delete(`http://localhost:3001/announcements/${id}`)
  .then(()=> {
    setAnnouncements(announcements.filter(announcement => announcement._id !== id));
  })
  .catch (error => console.error('Error deleting announcement', error));
}

  //handle update delete
  const updateDelete = (id) => {
    axios.delete(`http://localhost:3001/updates/${id}`)
    .then(() => {
      setUpdates(updates.filter(update => update._id !== id));      
    })
    .catch(error => console.error('Error deleting updates', error));
  }

// handle course registration delete
const regDelete = (id) => {
  axios.delete(`http://localhost:3001/courses/${id}`)
  .then (() =>{
    setRegistrations(registrations.filter(registration =>registration._id !==id));
  })
  .catch(error => console.error('Error deleting course registration', error));
}

//handle upload delete
const uploadDelete = (id) => {
  axios.delete(`http://localhost:3001/materials/${id}`)
    .then(() => {
      setMaterials(prevMaterials => prevMaterials.filter(material => material._id !== id));
      console.log(`Upload with ID: ${id} deleted successfully.`);
    })
    .catch(error => console.error('Error deleting upload:', error));
};


  return (
    <div>  
      <style>
        {` 
        body {
        min-height : 100vh;
        font-family: var(--font-family-bai);
        }
        h1, h2 {
    color: #444

    }
    
       
        `}
      </style>
      <div className={`side-menu ${isSidebarOpen ?'open':'closed' }`}>
        <div className='brand-name'>
        <h1 >Lecturer</h1>
        </div>     
      <ul>        
       
        <li onClick={() =>handleNavigate('/enroll')} > <img src ='http://localhost:3000/teachers.png' alt =''/> &nbsp; <span>Course Management</span></li>
        <li onClick={openComment2Modal }  > <img src ='http://localhost:3000/students.png' alt =''/> &nbsp; <span>Student Interaction</span></li>        
        <li > <a style={{color:'white'}} href ="https://kabarak.ac.ke/library" target = "_blank" rel = "noopener noreferrer" >  <img src ='http://localhost:3000/schools.png' alt =''/> &nbsp;<br /> <span>Library</span></a></li>
        <li  onClick={openUploadModal}> <img src ='http://localhost:3000/download.png' alt =''/> &nbsp;<span>Upload Materials</span> </li>        
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

  <div className="content-5">
    <div className="cards-5">      
    <div className="card-5">
      <div className="box-5">
          <h2>Pending Updates</h2>
          <ul>
						<li onClick={openUpdateModal} className='btn'> Add</li>
					</ul>
        </div>
        <table>
          <thead>
          <tr>
            <th>Unit</th>
            <th>Name</th>
            <th>option</th>
          </tr>
          </thead>
          <tbody>
                  {updates && updates.length > 0 ? (
                    updates.map((update) => (
                      <tr key={update._id}>
                        <td>{update.unit} </td>
                        <td>{update.unitName} </td>
                        <td> <li className='btn' onClick={openUploadModal}> Send</li>
                          <li className='btn' onClick={() => updateDelete(update._id)}> Delete</li>
                        </td>

                      </tr>
                    ))
                  ) : (
                       <tr>
                        <td colSpan='3' > No updates available </td>
                    </tr>
                  )}
           </tbody>       
        </table>
      </div>
      
      <div className="cards-6">
        <div className="box-6">
          <h2> Announcements</h2>
       <ul>
        <li className='btn' onClick={openAnnouncementModal}>Add</li>
       </ul>
        </div>
        <table>
          <thead>
          <tr>
            <th>Unit</th>
            <th>Date</th>
            <th>Announcement</th>            
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
                        <td>  <li className='btn' onClick={() => handleDelete(announcement._id)} > Delete</li></td>

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
    
    <div className="content-6">
      <div className="lecturer-5">
        <div className="titles-5">
          <h2> Course Registration List</h2>
          <ul>
          <li className='btn' onClick={() => navigate('/courses')}> Add</li>

          </ul>
        </div>
        <table>
          <thead>
            <tr>
            <th>Action</th>
            <th>Stage</th>
            <th>School</th>
            <th>Units taken</th>
            <th>Reg Date</th>
            </tr>
          </thead>
        <tbody>
                  {registrations && registrations.length > 0 ? (
                    registrations.map((registration) => (
                      <tr key={registration._id}>
                        <td>
                          <ul>                            
                            <li className='btn' onClick={() => regDelete(registration._id)}> Delete</li>
                          </ul>
                        </td>
                        <td>{registration.stage} </td>
                        <td>
                          {registration.schoolUnits.map((item, idx) => (
                            <div key={idx}>{item.school}</div>
                          ))}
                        </td>
                        <td>
                          {registration.schoolUnits.map((item, idx) => (
                            <div key={idx}>{item.units}</div>
                          ))}
                        </td>
                        <td>{new Date(registration.regDate).toLocaleDateString()} </td>

                      </tr>
                    ))
                  ) : (
                       <tr>
                        <td colSpan='3' > No course registration available </td>
                    </tr>
                  )}          
          </tbody>         
        </table>
      </div>

      <div className="new-student-5">
      <div className="titles-5">
          <h2>Recent Uploads</h2>
          <ul>
            <li className='btn' onClick={openViewModal}>View All</li>
        </ul>
        </div>       
        <table>
          <thead>
          <tr>
            <th>Unit</th>
            <th>Name</th>
            <th>Option</th>
           
          </tr>
          </thead>
          <tbody>
                  {materials && materials.length > 0 ? (
                    materials.map((material) => (
                      <tr key={material._id}>
                        <td>{material.unit} </td>
                        <td>{material.name} </td>
                        <td>
                          <ul>
                            <li className='btn' onClick={() => uploadDelete(material._id)}> Delete</li>
                          </ul>
                        </td>
                      </tr>
                    ))
                  ) : (
                       <tr>
                        <td colSpan='3' > No recent uploads available </td>
                    </tr>
                  )}
           </tbody>       
        </table>
      </div>
    </div>
  </div>
        {showCoursesModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={CloseCoursesModal} >&times; </span>
              <CoursesModal CloseModal = {CloseCoursesModal} />
            </div>
          </div>
)}

  {showUploadModal && (
    <div className='modal'>
      <div className="modal-content">
        <span className='close' onClick={CloseUploadModal}> &times;</span>
        <UploadModal CloseModal={CloseUploadModal}/>
        </div>
      </div>
        )}
  
        {showViewModal && (
          <div className="modal">
            <div className="modal-content">
              <span className='close' onClick={CloseViewModal}> &times;</span>
            <ViewModal CloseModal = {CloseViewModal} />
            </div>
          </div>
  )}
  {showAnnouncementModal && (
    <div className="modal">
      <div className="modal-content">
        <span className='close' onClick={CloseAnnouncementModal}>&times;</span>
      <AnnouncementModal CloseModal={CloseAnnouncementModal}/>
      </div>
    </div>
  )}
	{showUpdateModal && (
		<div className="modal">
			<div className="modal-content">
				<span className='close' onClick={CloseUpdateModal}> &times;</span>
				<UpdateModal  CloseModal ={CloseUpdateModal} />
			</div>
		</div>
        )}
        {showComment2Modal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={CloseComment2Modal} >&times;  </span>
              <Comment2Modal  CloseModal = {CloseComment2Modal} />
            </div>
          </div>
  ) }
</div>
</div>
  )
}

export default Lecturer;
