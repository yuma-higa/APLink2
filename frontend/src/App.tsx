import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import StudentPage from "./pages/StudentPage";
import CompanyPage from "./pages/CompanyPage";
import RequireAuth from "./components/RequireAuth";
import RoleGuard from "./components/RoleGuard";
import { USER_ROLES } from "./types/auth";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* 学生専用ページ */}
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
        
        {/* 企業専用ページ */}
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
        
        {/* 既存のダッシュボード（全ロール対応） */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        
        {/* ルートパスは認証状態に応じてリダイレクト */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* 不明なルートはログインページにリダイレクト */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;