import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import AuthContext from '../context/AuthContext';
import mesCollegeBg from '../assets/image/mes-college.jpg';
import chaitanyaLogo from '../assets/image/chaitanya-logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const toast = useRef(null);

  const { login, user, isAuthenticated, error, clearError } = useContext(AuthContext);

  // Show toast message
  const showToast = (severity, summary, detail, life = 3000) => {
    if (toast.current) {
      toast.current.show({
        severity,
        summary,
        detail,
        life,
        closable: true
      });
    }
  };
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Login component mounted or updated');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
    console.log('error:', error);

    // If user is already authenticated, redirect to admin dashboard
    if (isAuthenticated && user) {
      console.log('User is authenticated, redirecting...');
      navigate('/admin');
    }

    // Set form error if there's an authentication error
    if (error) {
      console.log('Setting form error:', error);
      setFormError(error);
      clearError();
    }
  }, [isAuthenticated, user, error, navigate, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login form submitted');

    // Validate form
    if (!email || !password) {
      console.log('Validation failed: missing email or password');
      setFormError('Please enter both email and password');
      return;
    }

    // Clear previous errors
    setFormError('');
    console.log('Attempting login with:', { email });

    try {
      // Attempt login
      const result = await login({ email, password });
      console.log('Login result:', result);

      if (result.success) {
        // Show success toast
        console.log('Login successful, showing toast');
        showToast('success', 'Login Successful', 'Welcome back!');

        // Redirect all users to admin dashboard
        console.log('Redirecting user to admin dashboard:', result.user);
        navigate('/admin');
      } else {
        console.log('Login failed:', result.error);

        // Check if the error message indicates an inactive account
        if (result.error && result.error.includes('deactivated')) {
          setFormError(result.error);
          showToast('error', 'Account Deactivated', 'Your account has been deactivated. Please contact an administrator.', 5000);
        } else {
          setFormError(result.error || 'Invalid credentials');
          showToast('error', 'Login Failed', 'Invalid email or password', 3000);
        }
      }
    } catch (error) {
      console.error('Unexpected error during login:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-row" style={{ width: '100vw' }}>
      {/* Left: Background Image (70%) */}
      <div
        className="hidden md:block position-relative"
        style={{
          flexBasis: '75%',
          backgroundImage: `url(${mesCollegeBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        {/* Overlayed Welcome Text */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          pointerEvents: 'none',
        }}>
          <h1 style={{
            color: '#fff',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            textAlign: 'center',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            marginBottom: '1rem',
            letterSpacing: '1px',
          }}>
            Welcome to Chaitanya Pre University College
          </h1>
          <div style={{
            color: '#fff',
            fontSize: '1.2rem',
            textAlign: 'center',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            fontStyle: 'italic',
            letterSpacing: '1px',
          }}>
            "सा विद्या या विमुक्तये"
          </div>
        </div>
        
        
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.15)',
          pointerEvents: 'none',
        }} />
      </div>
      {/* Right: Login Form (30%) */}
      <div className="flex flex-column justify-content-center align-items-center p-6" style={{ flexBasis: '25%', background: 'rgba(255,255,255,0.95)', minHeight: '100vh' }}>
        <Toast ref={toast} position="top-right" />
        <div className="mb-6 text-center">
          <img src={chaitanyaLogo} alt="Chaitanya Logo" style={{ width: '80px', margin: '0 auto 1rem auto', display: 'block' }} />
          <span className="font-bold text-3xl text-900 block">ChaitanyaConnect</span>
          <span className="text-xs text-500 block">Parent Messaging Platform</span>
        </div>
        <form onSubmit={handleSubmit} className="p-fluid w-full" style={{ maxWidth: 400 }}>
          {formError && (
            <Message severity="error" text={formError} className="mb-3 w-full" />
          )}
          <div className="field mb-4">
            <label htmlFor="email" className="font-bold block mb-2">Email</label>
            <InputText
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-inputtext-sm"
              placeholder="Enter your email"
            />
          </div>
          <div className="field mb-4">
            <label htmlFor="password" className="font-bold block mb-2">Password</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask
              feedback={false}
              className="w-full p-inputtext-sm"
              inputClassName="w-full"
              placeholder="Enter your password"
            />
          </div>
          <Button
            type="submit"
            label="Login"
            icon="pi pi-sign-in"
            className="w-full p-button-primary p-button-raised"
            style={{ padding: '0.5rem 1rem' }}
          />
        </form>
      </div>
    </div>
  );
};

export default Login;
