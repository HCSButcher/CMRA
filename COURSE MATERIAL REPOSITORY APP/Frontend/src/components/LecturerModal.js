import { useState ,useEffect} from "react"
import axios from "axios"

const LecturerModal = () => {
    const [lecturers, setLecturers] = useState([]);
    const [filteredLecturers, setFilteredLecturers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:3001/getLecturers')
            .then((response) => {
                const fetchedLecturers = response.data;
                setLecturers(fetchedLecturers);
                setFilteredLecturers(fetchedLecturers);
            })
            .catch((error) => {
                console.error('Error fetching lecturers:', error);
            });
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

     // Lecturer delete
const LecturerDelete = (id) => {
  axios
    .delete(`http://localhost:3001/getLecturers/${id}`) 
    .then(() => {
      setLecturers(lecturers.filter((lecturer) => lecturer._id !== id));
    })
    .catch((error) => console.error('Error deleting lecturer', error));
};

    
  return (
      <div className="enroll-modal" >
          <style>
              {` body {
            background-color: #080710;
          }

          form {
           background-color: rgba(255, 255, 255, 0.13);
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
              <th>contact</th>
              <th>Action</th>
            </tr>
                  </thead>
                  <tbody>
                      {filteredLecturers.length === 0 && !isSearchActive ? (
                          lecturers.map((lecturer) => (
                              <tr key={lecturer.email} >
                                            <td>

   {lecturer.profilePicture ? (
    <img
       src={`http://localhost:3001/uploads/${lecturer.profilePicture}?${new Date().getTime()}`}
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
                                  <td> {lecturer.name} </td>
                                  <td> {lecturer.email} </td>
                                  <td> {lecturer.contact} </td>
                                  <td> <ul>
                        <li className='btn' onClick={() =>LecturerDelete(lecturer._id)} >Remove </li>
                      </ul>
                                  </td>
                                 
                              </tr>
                          ))
                      ) : (
                              <p>Enroll lecturers to view them</p>
                      )}
                  </tbody>
        </table>
      </div>
    </div>
  )
}
 
export default LecturerModal
