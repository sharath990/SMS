import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import AuthContext from '../context/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

  const { register, isAuthenticated, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }

    // Set form error if there's an authentication error
    if (error) {
      setFormError(error);
      clearError();
    }
  }, [isAuthenticated, error, navigate, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!username || !email || !password || !confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    // Clear previous errors
    setFormError('');

    // Attempt registration
    const result = await register({ username, email, password });

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex justify-content-center align-items-center min-h-screen p-4">
      <div className="w-full max-w-30rem">
        <Card title="Register" className="shadow-4">
          <form onSubmit={handleSubmit} className="p-fluid">
            {formError && (
              <Message severity="error" text={formError} className="mb-3 w-full" />
            )}

            <div className="field mb-4">
              <label htmlFor="username" className="font-bold block mb-2">Username</label>
              <InputText
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-inputtext-sm"
                placeholder="Enter your username"
              />
            </div>

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
                className="w-full p-inputtext-sm"
                inputClassName="w-full"
                placeholder="Enter your password"
              />
            </div>

            <div className="field mb-4">
              <label htmlFor="confirmPassword" className="font-bold block mb-2">Confirm Password</label>
              <Password
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                toggleMask
                feedback={false}
                className="w-full p-inputtext-sm"
                inputClassName="w-full"
                placeholder="Confirm your password"
              />
            </div>

            <Button
              type="submit"
              label="Register"
              className="w-full"
            />

            <div className="mt-4 text-center">
              <p>
                Already have an account?{' '}
                <a href="/login" className="text-primary font-medium">Login</a>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
