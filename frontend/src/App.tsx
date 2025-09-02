import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import StudentPage from "./pages/StudentPage";
import CompanyPage from "./pages/Company/CompanyPage";
import CompanyProfile from "./pages/Company/CompanyProfile";
import RequireAuth from "./components/RequireAuth";
import RoleGuard from "./components/RoleGuard";
import { USER_ROLES } from "./types/auth";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        
        <Route
          path="/student"
          element={
            <RequireAuth>
              <RoleGuard allowedRoles={[USER_ROLES.STUDENT]}>
                <StudentPage />
              </RoleGuard>
            </RequireAuth>
          }
        />
     
        <Route
          path="/company"
          element={
            <RequireAuth>
              <RoleGuard allowedRoles={[USER_ROLES.COMPANY]}>
                <CompanyPage />
              </RoleGuard>
            </RequireAuth>
          }
        />

        {/* 企業プロフィールページ */}
        <Route
          path="/company/profile"
          element={
            <RequireAuth>
              <RoleGuard allowedRoles={[USER_ROLES.COMPANY]}>
                <CompanyProfile />
              </RoleGuard>
            </RequireAuth>
          }
        />
        
       
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        
       
        <Route path="/" element={<Navigate to="/login" replace />} />
        
       
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;