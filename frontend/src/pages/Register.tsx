import { useAuth } from '@hooks/useAuth';
import { loginUser, registerUser } from '@services/authService';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Grid2,
  Link,
  Paper,
  Typography,
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { FormInputText } from '@components/form-components/FormInputText';

const validationRegisterSchema = Yup.object({
  firstname: Yup.string().required('First Name is Required'),
  lastname: Yup.string().required('Last Name is Required'),
  email: Yup.string()
    .required('Email is Required')
    .email('Invalid email format'),

  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      'Password must contain at least one symbol'
    )
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

type FormLoginTypes = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const Register: React.FC = () => {
  const [errorLoginApi, setErrorLoginApi] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const { control, handleSubmit, watch } = useForm<FormLoginTypes>({
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    resolver: yupResolver(validationRegisterSchema),
  });

  const onSubmit = async (data: FormLoginTypes) => {
    try {      
      const response = await registerUser(data.firstname, data.lastname, data.email, data.password);
      setAccessToken(response.data.accessToken);
      navigate('/dashboard');
    } catch (error: any) {
      if (
        error?.response?.status === 400 &&
        error?.response?.data?.error === 'Email already taken'
      ) {
        setErrorLoginApi('Email already taken');
      } else {
        setErrorLoginApi('An unexpected error occurred. Please try later.');
      }
      setAccessToken(null);
      console.error(error);
    }
  };

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      setErrorLoginApi(null);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <Container maxWidth="xs">
      <Paper elevation={10} sx={{ marginTop: 8, padding: 2 }}>
        <Avatar
          sx={{
            mx: 'auto',
            bgcolor: 'secondary.main',
            textAlign: 'center',
            mb: 1,
          }}
        >
          <LockOutlined />
        </Avatar>
        <Typography
          component="h1"
          variant="h5"
          sx={{ textAlign: 'center', mb: 4 }}
        >
          Sign Up
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ mt: 1 }}
        >
          {/* First Name and Last Name on the Same Line */}
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <FormInputText
                label="First Name"
                name="firstname"
                control={control}
                sx={{ mb: 2 }}
                fullWidth
                autoFocus
                variant="outlined"
              />
            </Grid2>
            <Grid2 size={6}>
              <FormInputText
                label="Last Name"
                name="lastname"
                control={control}
                sx={{ mb: 2 }}
                fullWidth
                variant="outlined"
              />
            </Grid2>
          </Grid2>
          <FormInputText
            label="Enter email"
            name="email"
            control={control}
            sx={{ mb: 2 }}
            fullWidth
          />
          <FormInputText
            label="Enter password"
            name="password"
            control={control}
            sx={{ mb: 2 }}
            fullWidth
            type="password"
          />
          <FormInputText
            label="Confirm password"
            name="confirmPassword"
            control={control}
            sx={{ mb: 2 }}
            fullWidth
            type="password"
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mb: 2 }}>
            Sign Up
          </Button>

          {errorLoginApi && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorLoginApi}
            </Alert>
          )}
        </Box>
        <Grid2 container justifyContent="flex-end">
          <Grid2>
            <Link component={RouterLink} to="/login">
              Sign In
            </Link>
          </Grid2>
        </Grid2>
      </Paper>
    </Container>
  );
};

export default Register;
