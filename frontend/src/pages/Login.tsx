import { useAuth } from '@hooks/useAuth';
import { loginUser } from '@services/authService';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
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

const validationLoginSchema = Yup.object({
  email: Yup.string()
    .required('Email is Required')
    .email('Invalid email format'),
  password: Yup.string().required('Password is required'),
});

type FormLoginTypes = {
  email: string;
  password: string;
};

const Login: React.FC = () => {
  const [errorLoginApi, setErrorLoginApi] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const { control, handleSubmit, watch } = useForm<FormLoginTypes>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: yupResolver(validationLoginSchema),
  });

  const onSubmit = async (data: FormLoginTypes) => {
    try {
      const response = await loginUser(data.email, data.password);
      setAccessToken(response.data.accessToken);
      navigate('/dashboard');
    } catch (error: any) {
      if (
        error?.response?.status === 401 &&
        error?.response?.data?.error === 'Invalid credentials'
      ) {
        setErrorLoginApi('Invalid email or password');
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
            bgcolor: 'primary.main',
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
          Sign In
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ mt: 1 }}
        >
          <FormInputText
            label="Enter email"
            name="email"
            control={control}
            sx={{ mb: 2 }}
            fullWidth
            autoFocus
          />
          <FormInputText
            label="Enter password"
            name="password"
            control={control}
            sx={{ mb: 1 }}
            fullWidth
            autoFocus
            type="password"
          />

          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
            sx={{ mb: 2 }}
          />

          <Button type="submit" variant="contained" fullWidth sx={{ mb: 2 }}>
            Sign In
          </Button>

          {errorLoginApi && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorLoginApi}
            </Alert>
          )}
        </Box>
        <Grid2 container justifyContent="space-between">
          <Grid2>
            <Link component={RouterLink} to="/forgot" style={{ textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </Grid2>
          <Grid2>
            <Link component={RouterLink} to="/register" style={{ textDecoration: 'none' }}>
              Sign Up
            </Link>
          </Grid2>
        </Grid2>
      </Paper>
    </Container>
  );
};

export default Login;
