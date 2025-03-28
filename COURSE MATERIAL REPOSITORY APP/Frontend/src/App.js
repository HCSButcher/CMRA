import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Reset from './components/Reset';
import Alert from './hooks/Alert';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Signup from './components/Signup';
import Admin from './components/Admin';
import Materials from './components/Materials';
import UploadMaterials from './components/UploadMaterials';
import Student from './components/Student';
import Lecturer from './components/Lecturer';
import Updates from './components/Updates';
import AnnouncementModal from './components/AnnouncementModal';
import CoursesModal from './components/CoursesModal';
import CommentModal from './components/CommentModal';
import Stage from './components/Stage';
import Repository from './components/Repository';
import SCoursesModal from './components/SCoursesModal';
import ViewUnitsModal from './components/ViewUnitsModal';
import RepoDisplay from './components/RepoDisplay';
import ViewModal from './components/ViewModal';
import EnrollModal from './components/EnrollModal';
import Courses from './components/Courses';
import Lecturer2Modal from './components/Lecturer2Modal';
import Student2Modal from './components/Student2Modal';
import CourseManagement from './components/CourseManagement';
import LecturerModal from './components/LecturerModal';
import StudentsModal from './components/StudentsModal';
import Comment2Modal from './components/Comment2Modal';
import axios from 'axios';

const App = () => {
  const [messages, setMessages] = useState({
    errors: [],
    success_msg: '',
    error_msg: '',
  });

  // ✅ Function to refresh token
  const refreshAccessToken = async () => {
    try {
      const response = await fetch('/api/refresh-token', { method: 'POST', credentials: 'include' });

      if (!response.ok) {
        console.error("Failed to refresh token");
        return false;
      }

      const data = await response.json();
      localStorage.setItem("token", data.accessToken); // Store new token
      return true;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  };

  // ✅ Axios Global Interceptor for Token Refresh
  axios.interceptors.response.use(
    (response) => response, // Return response normally if successful
    async (error) => {
      if (error.response && error.response.status === 401) {
        console.warn("🚨 Token expired! Attempting refresh...");

        const refreshed = await refreshAccessToken();
        if (refreshed) {
          console.log("🔄 Token refreshed! Retrying request...");
          error.config.headers['Authorization'] = `Bearer ${localStorage.getItem("token")}`;
          return axios(error.config); // Retry failed request
        }
      }
      return Promise.reject(error); // If refresh fails, reject request
    }
  );

  // ✅ Fetch Messages with Token Refresh Handling
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        let response = await fetch('/api/messages', { credentials: 'include' });

        // If unauthorized, attempt to refresh the token
        if (response.status === 401) {
          const refreshResponse = await fetch('/api/refresh-token', { method: 'POST', credentials: 'include' });

          if (!refreshResponse.ok) {
            throw new Error('Failed to refresh token');
          }

          // Retry fetching messages after refreshing token
          response = await fetch('/api/messages', { credentials: 'include' });

          if (!response.ok) {
            throw new Error('Failed to fetch messages after refreshing token');
          }
        }

        const data = await response.json();
        setMessages({
          errors: data.errors || [],
          success_msg: data.success_msg || '',
          error_msg: data.error_msg || '',
        });
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <TokenRedirect /> {/* ✅ Moved inside BrowserRouter */}
        <Alert type="success" messages={messages.success_msg ? [messages.success_msg] : []} />
        <Alert type="danger" messages={messages.error_msg ? [messages.error_msg] : []} />
        <Alert type="warning" messages={messages.errors} />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Signup />} />

          <Route element={<ProtectedRoute allowedRoles={['admin', 'Super-admin']} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['student', 'admin', 'Super-admin']} />}>
            <Route path="/student" element={<Student />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['lecturer', 'admin', 'Super-admin']} />}>
            <Route path="/lecturer" element={<Lecturer />} />
          </Route>

          <Route path="/reset" element={<Reset />} />                
          <Route path="/materials" element={<Materials />} />
          <Route path="/upload" element={<UploadMaterials />} />
          <Route path="/lecturer/:email" element={<Lecturer />} />
          <Route path="/student/:email" element={<Student />} />
          <Route path="/updates" element={<Updates />} />
          <Route path="/announcements" element={<AnnouncementModal />} />
          <Route path="/courses" element={<CoursesModal />} />
          <Route path="/comments" element={<CommentModal />} />
          <Route path="/stages" element={<Stage />} />
          <Route path="/courseManagement" element={<CourseManagement />} />
          <Route path="/lecturer2Modal" element={<Lecturer2Modal />} />
          <Route path="/student2Modal" element={<Student2Modal />} />
          <Route path="/sRegistrations" element={<SCoursesModal />} />
          <Route path="/viewUnits" element={<ViewUnitsModal />} />
          <Route path="/enroll" element={<EnrollModal />} />
          <Route path="/lecturers" element={<LecturerModal />} />
          <Route path="/students" element={<StudentsModal />} />
          <Route path="/repository" element={<Repository />} />
          <Route path="/comment2Modal" element={<Comment2Modal />} />
          <Route path="/viewModal" element={<ViewModal />} />
          <Route path="/notes/:unitName" element={<RepoDisplay />} />

          <Route path="*" element={<Login />} /> {/* ✅ Fixed incorrect syntax */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

// ✅ Moved Token Check to a Separate Component
const TokenRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return null;
};

export default App;
