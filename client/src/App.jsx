import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Home from "./Home";
import MainHome from "./MainHome";
import VerifyOtp from "./VerifyOtp";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import MalwareScanner from "./components/MalwareScanner/MalwareScanner";
import Chatbot from "./components/Chatbot";
import FileUpload from "./components/FileUpload";
import { ToastProvider } from "./components/Toast";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainHome />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/password/reset/:token" element={<ResetPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/reset-password/:id/:token" element={<ResetPassword />} />
          <Route path="/scanner" element={<MalwareScanner />} />
          <Route path="/scan" element={<MalwareScanner />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/upload" element={<FileUpload />} />
          <Route path="/files" element={<FileUpload />} />
          <Route path="/vault" element={<FileUpload />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
