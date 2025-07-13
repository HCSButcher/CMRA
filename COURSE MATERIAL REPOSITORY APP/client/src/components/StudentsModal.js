import { useState, useEffect } from "react";
import axios from "axios";

const StudentsModal = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No token found. User might not be authenticated.");
          return;
        }

        const response = await axios.get("https://project-2-1u71.onrender.com/getAllStudents", {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Response Status:", response.status);
        console.log("API Response Data:", response.data);

        if (Array.isArray(response.data)) {
          setStudents(response.data);
          setFilteredStudents(response.data);
        } else {
          console.error("Unexpected response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        if (error.response) {
          console.error("Server Response:", error.response.data);
        }
      }
    };

    fetchStudents();
  }, []);

  const handleSearchChange = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);

    if (searchValue === "") {
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

const StudentDelete = async (id) => {
    try {
        const response = await axios.delete(`https://project-2-1u71.onrender.com/deleteStudent/${id}`);

        if (response.status === 200) {
            console.log("Student deleted successfully:", response.data);
            setStudents((prevStudents) =>
                prevStudents.filter((student) => student._id !== id)
            );
            setFilteredStudents((prevStudents) =>
                prevStudents.filter((student) => student._id !== id)
            );
        } else {
            console.error(" Unexpected response:", response);
        }
    } catch (error) {
        console.error(" Error deleting student:", error);
        if (error.response) {
            console.error("Server Response:", error.response.data);
        }
    }
};


  return (
    <div className="enroll-modal">
      <style>
        {`
          .enroll-modal {
            width: 90%;
          }
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
      <h2>Students</h2>
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
              <th>Registration Number</th>
              <th>Course</th>
              <th>School</th> {/* ✅ Added "School" Column */}
              <th>Contact</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 && isSearchActive ? (
              <tr>
                <td colSpan="8">No students found</td> {/* Updated colspan */}
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.email}>
                  <td>
                    {student.profilePicture ? (
                      <img
                        src={`https://project-2-1u71.onrender.com/uploads/${student.profilePicture}?${new Date().getTime()}`}
                        alt="profile"
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      "No image"
                    )}
                  </td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.registrationNumber}</td>
                  <td>{student.course}</td>
                  <td>{student.school || "N/A"}</td> {/* ✅ Added School Data */}
                  <td>{student.contact}</td>
                  <td>
                    <button
                      className="btn-e"
                      onClick={() => StudentDelete(student._id)}
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

export default StudentsModal;
