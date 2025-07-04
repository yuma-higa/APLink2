import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

export default function Signup() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage('An unexpected error occurred.');
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h5" mb={2}>Sign Up</Typography>
      <form onSubmit={handleSubmit}>
        <TextField fullWidth label="Username" margin="normal" value={name} onChange={e => setName(e.target.value)} />
        <TextField fullWidth label="Password" margin="normal" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {message && <Typography color={message.startsWith('Signup successful') ? 'primary' : 'error'}>{message}</Typography>}
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>Sign Up</Button>
      </form>
    </Box>
  );
}