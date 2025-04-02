import axios from "axios";
import { useEffect, useState } from "react";

const CourseManagement = () => {

    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);




    useEffect(() => {
        axios.get('http://10.1.33.99:3001/coursesReg')
            .then((response) => {
                setCourses(response.data);
                setFilteredCourses(response.data); // Initialize filtered courses
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, []);

useEffect(() => {
    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.warn("No token found. User might not be authenticated.");
                return;
            }

            const response = await axios.get("http://10.1.33.99:3001/courseReg", {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("Response from server:", response.data);

            if (Array.isArray(response.data)) {
                setCourses(response.data);
                setFilteredCourses(response.data);
            } else {
                console.error("Unexpected response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching CoursesReg:", error.response ? error.response.data : error.message);
        }
    };

    fetchCourses();
}, []);


    // Handle search
    const handleSearchChange = (e) => {
        const searchValue = e.target.value.toLowerCase();
        setSearchTerm(searchValue);

        if (searchValue === '') {
            setIsSearchActive(false);
            setFilteredCourses(courses); // Reset to all courses
        } else {
            setIsSearchActive(true);
            setFilteredCourses(
                courses.filter(
                    (course) =>
                        course.school?.toLowerCase().includes(searchValue) || // Ensure `school` exists
                        course.courseName?.some(c => c.toLowerCase().includes(searchValue)) // Ensure `courseName` exists
                )
            );
        }
    };

    // delete school
const handleDeleteSchool = (school) => {  

    axios.delete(`http://10.1.33.99:3001/coursesReg/${school}`)
        .then(() => {
            setCourses(courses.filter((course) => course.school !== school));
        })
        .catch((error) => console.error('Error deleting school:', error));
};



    // Delete a specific course
    const handleDeleteCourse = (school, courseToDelete) => {
        const updatedCourses = courses.map((course) =>
            course.school === school
                ? { ...course, courseName: course.courseName.filter((c) => c !== courseToDelete) }
                : course
        );

        // Optionally update the backend
        axios.delete(`http://10.1.33.9910.1.33.99:3001/deleteCourse`, { data: { school, course: courseToDelete } })
            .then(() => setCourses(updatedCourses))
            .catch((error) => console.error('Error deleting course:', error));
    };

    return (
        <div className="enroll-modal">
            <style>
                {`
                body {
                    background-color: #080710;
                }

                .search-bar {
                    margin-bottom: 20px;
                    padding: 10px;
                    width: 100%;
                    border-radius: 5px;
                    border: 1px solid #ccc;
                }

                .table-container {
                    margin-top: 20px;
                }

                .student-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .student-table th, .student-table td {
                    border: 1px solid #ccc;
                    padding: 10px;
                    text-align: left;
                }

                .student-table th , .student-table td , li{
                color: #080710;
                    background-color: #f2f2f2;
                }

                .btn {
                    margin: 5px;
                    padding: 5px 10px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 3px;
                    cursor: pointer;
                }

                .btn:hover {
                    background-color: #0056b3;
                }
                `}
            </style>

            <h2>Course Management</h2>
            <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by school or course"
                className="search-bar"
            />
            <div className="table-container">
                <table className="student-table">
                    <thead>
                        <tr>
                            <th>School</th>
                            <th>Courses</th>
                            <th>Options</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCourses.length > 0 ? (
                            filteredCourses.map((schoolData) => (
                                <tr key={schoolData.school}>
                                    <td>
                                        {schoolData.school}
                                       
                                    </td>
                                    <td>
                                        <ul>
                                            {/* Ensure that courseName is an array before mapping */}
                                            {Array.isArray(schoolData.courseName) && schoolData.courseName.length > 0 ? (
                                                schoolData.courseName.map((course) => (
                                                    <li key={course}>
                                                        {course}
                                                        <button
                                                            className="btn"
                                                            onClick={() =>
                                                                handleDeleteCourse(schoolData.school, course)
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </li>
                                                ))
                                            ) : (
                                                <li>No courses available</li>
                                            )}
                                        </ul>
                                    </td>
                                    <td>
                                         <button
                                            className="btn"
                                            onClick={() => handleDeleteSchool(schoolData.school)}
                                        >
                                            Delete <br/>School
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'center' }}>
                                    No courses registered
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CourseManagement;
