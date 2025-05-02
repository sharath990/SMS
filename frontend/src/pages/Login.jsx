import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import AuthContext from '../context/AuthContext';

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
    // If user is already authenticated, redirect based on role
    if (isAuthenticated && user) {
      if (user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }

    // Set form error if there's an authentication error
    if (error) {
      setFormError(error);
      clearError();
    }
  }, [isAuthenticated, user, error, navigate, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!email || !password) {
      setFormError('Please enter both email and password');
      return;
    }

    // Clear previous errors
    setFormError('');

    // Attempt login
    const result = await login({ email, password });

    if (result.success) {
      // Show success toast
      showToast('success', 'Login Successful', 'Welcome back!');

      // Redirect based on user role
      if (result.user && result.user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="flex justify-content-center align-items-center min-h-screen p-4">
      <Toast ref={toast} position="top-right" />
      <div className="w-full max-w-30rem">
        <Card title="Login" className="shadow-4">
          <form onSubmit={handleSubmit} className="p-fluid">
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

            <div className="mt-4 text-center">
              <p>
                Don't have an account?{' '}
                <a href="/register" className="text-primary font-medium">Register</a>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
