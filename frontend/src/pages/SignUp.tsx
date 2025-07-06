import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import InfoCard from "../components/InfoCard";
import { validateName, validatePassword } from "../utils/validation";

export default function Signup() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [nameError, setNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setNameError(validateName(value));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    // フォーム送信前にバリデーションチェック
    const nameErr = validateName(name);
    const passwordErr = validatePassword(password);
    setNameError(nameErr);
    setPasswordError(passwordErr);
    
    if (nameErr || passwordErr) {
      setMessage('Please fix the validation errors above');
      return;
    }

    try {
      const res = await fetch('/auth/signUp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Signup failed');
      }
      setMessage('Signup successful! You can log in now.');
      // サインアップ成功後にログインページに遷移
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage('An unexpected error occurred.');
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <InfoCard>
        <Typography variant="h5" mb={2}>Sign Up</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField 
            fullWidth 
            label="Username" 
            margin="normal" 
            value={name} 
            onChange={handleNameChange}
            error={!!nameError}
            helperText={nameError}
          />
          <TextField 
            fullWidth 
            label="Password" 
            margin="normal" 
            type="password" 
            value={password} 
            onChange={handlePasswordChange}
            error={!!passwordError}
            helperText={passwordError}
          />
          {message && <Typography color={message.startsWith('Signup successful') ? 'primary' : 'error'}>{message}</Typography>}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 1 }}>Sign Up</Button>
        </Box>
      </InfoCard>
    </Box>
  );
}