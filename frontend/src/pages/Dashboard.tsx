import React from "react";
import { Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("accessToken");
    navigate("/login");
  }

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" mb={2}>Welcome to your dashboard!</Typography>
      <Button onClick={logout} variant="outlined" color="secondary">Logout</Button>
    </Box>
  );
}