import React from "react";
import { Navigate } from "react-router-dom";
import { getUserRole } from "../utils/auth";
import { type UserRole } from "../types/auth";
import { Box, Typography, Button } from "@mui/material";

interface RoleGuardProps {
  children: React.ReactElement;
  allowedRoles: UserRole[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const userRole = getUserRole();

  // ユーザーロールが取得できない場合（無効なトークンなど）
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  // ユーザーロールが許可されたロールに含まれていない場合
  if (!allowedRoles.includes(userRole)) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.50',
          p: 3
        }}
      >
        <Typography variant="h4" color="error" gutterBottom>
          アクセス権限がありません
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          このページにアクセスする権限がありません。
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          現在のロール: {userRole}
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            // ユーザーのロールに応じて適切なページにリダイレクト
            const student:UserRole = "STUDENT";
            const company:UserRole = "COMPANY";
            if (userRole === student) {
              window.location.href = '/student';
            } else if (userRole === company) {
              window.location.href = '/company';
            } else {
              window.location.href = '/dashboard';
            }
          }}
        >
          適切なページに移動
        </Button>
      </Box>
    );
  }

  return children;
}
