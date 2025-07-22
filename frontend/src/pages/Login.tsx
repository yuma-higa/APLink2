import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import InfoCard from "../components/InfoCard";
import { validateName, validatePassword } from "../utils/validation";
import { decodeToken } from "../utils/auth";
import { USER_ROLES } from "../types/auth";
import theme from '../styles/theme';

export default function Login() {
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
      const res = await fetch('/auth/signIn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error('Login failed');
      
      // トークンを保存
      localStorage.setItem('accessToken', data.accessToken);
      
      // トークンからユーザー情報を取得してロールに応じてリダイレクト
      const userInfo = decodeToken(data.accessToken);
      if (userInfo) {
        setMessage('Login successful!');
        
        // ロールに応じてリダイレクト
        if (userInfo.role === USER_ROLES.STUDENT) {
          navigate('/student');
        } else if (userInfo.role === USER_ROLES.COMPANY) {
          navigate('/company');
        } else {
          // フォールバック（予期しないロールの場合）
          navigate('/dashboard');
        }
      } else {
        throw new Error('Invalid token received');
      }
      
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
        <Typography variant="h5" mb={2} sx={{ textAlign: "center", fontWeight:"bold",color: theme.palette.primary.main}}>Login</Typography>
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
          {message && <Typography color={message.startsWith('Login successful') ? 'primary' : 'error'}>{message}</Typography>}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 1 }}>Login</Button>
          
          {/* サインアップページへのリンク */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              アカウントをお持ちでないですか？{' '}
              <Button 
                variant="text" 
                size="small" 
                onClick={() => navigate('/signup')}
                sx={{ textTransform: 'none' }}
              >
                サインアップ
              </Button>
            </Typography>
          </Box>
        </Box>
      </InfoCard>
    </Box>
  );
}