import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CoursesSection from "./components/CoursesSection";
import TrustSection from "./components/TrustSection";
import Partners from "./components/Partners";
import Footer from "./components/footer";


import Login from "./pages/login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import Students from "./pages/admin/students";
import Profs from "./pages/admin/profs";  
import Courses from "./pages/admin/Courses";
import CourseDetail from "./pages/admin/CourseDetail";
import AddCourse from "./pages/admin/AddCourse";
import AddPdf from "./pages/admin/AddPdf";
import AddQuiz from "./pages/admin/AddQuiz";
import QuizDetail from "./pages/admin/Quizdetail";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherCourseDetail from "./pages/teacher/TeacherCourseDetail";
import TeacherStudents from "./pages/teacher/TeacherStudents";
import TeacherCourses from "./pages/teacher/TeacherCourses";
import TeacherAddPdf from "./pages/teacher/TeacherAddPdf";
import TeacherAddQuiz from "./pages/teacher/TeacherAddQuiz";


import StudentDashboard from "./pages/student/StudentDashboard";
import StudentCourses from "./pages/student/StudentCourses";
import StudentCourseDetail from "./pages/student/StudentCourseDetail";
import StudentQuiz from "./pages/student/StudentQuiz";
import StudentResults from "./pages/student/StudentResults";
import StudentChatbot from "./components/StudentChatbot";




function App() {
  return (
    <div className="w-full font-sans bg-white">
      <Routes>
        {/* Page d'accueil */}
        <Route 
          path="/" 
          element={
            <>
              <Navbar />
              <Hero />
              <CoursesSection />
              <TrustSection />
              <Partners />
              <Footer />
            </>
          } 
        />

        {/* Pages Login / Register */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/students" element={<TeacherStudents />} />
        <Route path="/teacher/courses/:id" element={<TeacherCourseDetail />} />
        <Route path="/teacher/courses" element={<TeacherCourses />} />
        <Route path="/teacher/courses/:id/pdfs/add" element={<TeacherAddPdf />} />
        <Route path="/teacher/courses/:id/quizzes/add" element={<TeacherAddQuiz />} />



            
        {/* Pages Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/students" element={<Students />} />
        <Route path="/admin/profs" element={<Profs />} />
        <Route path="/admin/Courses" element={<Courses />} />
        <Route path="/admin/courses/add" element={<AddCourse />} />
        <Route path="/admin/courses/:id" element={<CourseDetail />} /> 
        <Route path="/admin/courses/:id/add-pdf" element={<AddPdf />} />
        <Route path="/admin/courses/:id/add-quiz" element={<AddQuiz />} />
        <Route path="/admin/quizzes/:id" element={<QuizDetail />} />

        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/courses" element={<StudentCourses />} />
        <Route path="/student/courses/:id" element={<StudentCourseDetail />} />
        <Route path="/student/quiz/:id" element={<StudentQuiz />} />
        <Route path="/student/results" element={<StudentResults />} />.
        <Route path="./components/StudentChatbot" element={<StudentResults />} />

      </Routes>
      <StudentChatbot />



    </div>
  );
}

export default App;