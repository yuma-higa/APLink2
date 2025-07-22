import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import InfoCard from "../components/InfoCard";
import { validateName, validatePassword } from "../utils/validation";
import theme from "../styles/theme";
import { type UserRole, USER_ROLES } from "../types/auth";

export default function SignUp(){
  const [name,setName] = useState("");
  const [password,setPassword] = useState("");
  const [role,setRole] = useState<UserRole>(USER_ROLES.STUDENT); 
  const [message,setMessage] = useState("");
  const [nameErr,setNameErr] = useState("");
  const [passwordErr,setPasswordErr] = useState("");
  const navigate = useNavigate();

  const handleNameChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
    const name = e.target.value;
    setName(name);
    setNameErr(validateName(name));
  }

  const handlePasswordChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
    const password = e.target.value;
    setPassword(password);
    setPasswordErr(validatePassword(password));
  }

  const handleRoleChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
    setRole(e.target.value as UserRole);
  }

  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault();
    setMessage("");

    const nameError = validateName(name);
    const passwordError = validatePassword(password);
    setNameErr(nameError);
    setPasswordErr(passwordError);

    if(nameError||passwordError){
      setMessage("Please fix the validation errors above");
      return;
    }
    
    try{
      const res = await fetch("/auth/signUp",{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({name,password,role})
      });
      
     
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      
      if(!res.ok) {
        const errorMessage = data.message || `HTTP ${res.status}: ${res.statusText}`;
        throw new Error(errorMessage);
      }
     
      setMessage("signUp successful! Please log in.");
      setTimeout(() => navigate("/login"), 2000);
    }catch(err:unknown){
      if(err instanceof Error){
        setMessage(err.message);
      }else{
        setMessage("An unexpected error occurred!")
      }
    }
  }



  return(
    <Box
    sx={{
      minHeight:"100vh",
      display:"flex",
      bgcolor:"background.default",
      alignItems:"center",
      justifyContent:"center"
    }}>
      <InfoCard>
        <Typography variant="h5" mb={2}
        sx={{
          textAlign:"center",
          fontWeight:"bold",
          color:theme.palette.primary.main
        }}>
          Sign Up
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{display:"flex", flexDirection: "column", gap:2}}>
          <TextField
          fullWidth
          label="user name"
          margin="normal"
          value={name}
          error={!!nameErr}
          onChange={handleNameChange}
          helperText={nameErr}
          />
          <TextField
          fullWidth
          label="password"
          margin="normal"
          type="password"
          value={password}
          error={!!passwordErr}
          onChange={handlePasswordChange}
          helperText={passwordErr}
          />
          
          {/* Role Selection */}
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <FormLabel component="legend" sx={{ color: theme.palette.text.primary, mb: 1 }}>
              Account Type
            </FormLabel>
            <RadioGroup
              row
              value={role}
              onChange={handleRoleChange}
              sx={{ justifyContent: 'space-around' }}
            >
              <FormControlLabel 
                value={USER_ROLES.STUDENT} 
                control={<Radio color="primary" />} 
                label="Student" 
              />
              <FormControlLabel 
                value={USER_ROLES.COMPANY} 
                control={<Radio color="primary" />} 
                label="Company" 
              />
            </RadioGroup>
          </FormControl>
          
          {message && <Typography color={message.startsWith("signUp successful")?'primary' : 'error'}>{message}</Typography>}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 1 }}>sign Up</Button>
        </Box>
      </InfoCard>
    </Box>
  )
}