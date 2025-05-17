import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useRef } from 'react';
import passwordResetService from '../services/passwordReset.service';

/**
 * ResetPassword component
 * 
 * This component allows users to reset their password using a token
 * received via email.
 */
const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userData, setUserData] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  
  // Show toast message
  const showToast = (severity, summary, detail, life = 3000) => {
    toast.current.show({ severity, summary, detail, life });
  };
  
  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        setVerifying(true);
        
        if (!token) {
          setTokenValid(false);
          setFormError('Invalid or missing token');
          setVerifying(false);
          return;
        }
        
        const response = await passwordResetService.verifyResetToken(token);
        
        if (response.success) {
          setTokenValid(true);
          setUserData(response.data.user);
        } else {
          setTokenValid(false);
          setFormError(response.error || 'Invalid or expired token');
          showToast('error', 'Invalid Token', response.error || 'The reset link is invalid or has expired');
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        setTokenValid(false);
        setFormError('An error occurred while verifying the token');
        showToast('error', 'Error', 'An error occurred while verifying the token');
      } finally {
        setVerifying(false);
        setLoading(false);
      }
    };
    
    verifyToken();
  }, [token]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate passwords
    if (!password || password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await passwordResetService.resetPassword(token, password);
      
      if (response.success) {
        showToast('success', 'Password Reset', 'Your password has been reset successfully');
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setFormError(response.error || 'Failed to reset password');
        showToast('error', 'Reset Failed', response.error || 'Failed to reset password');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setFormError('An error occurred while resetting your password');
      showToast('error', 'Error', 'An error occurred while resetting your password');
      setLoading(false);
    }
  };
  
  // Render loading state
  if (verifying) {
    return (
      <div className="flex justify-content-center align-items-center min-h-screen">
        <Card title="Verifying Reset Link" className="w-full max-w-30rem shadow-4">
          <div className="flex flex-column align-items-center">
            <ProgressSpinner style={{ width: '50px', height: '50px' }} />
            <p className="mt-3">Please wait while we verify your reset link...</p>
          </div>
        </Card>
      </div>
    );
  }
  
  // Render invalid token state
  if (!tokenValid) {
    return (
      <div className="flex justify-content-center align-items-center min-h-screen">
        <Card title="Invalid Reset Link" className="w-full max-w-30rem shadow-4">
          <div className="flex flex-column align-items-center">
            <i className="pi pi-times-circle text-6xl text-red-500 mb-3"></i>
            <p className="text-center">{formError || 'The password reset link is invalid or has expired. Please request a new password reset link.'}</p>
            <Button 
              label="Back to Login" 
              icon="pi pi-arrow-left" 
              className="mt-3" 
              onClick={() => navigate('/login')} 
            />
          </div>
        </Card>
      </div>
    );
  }
  
  // Render reset password form
  return (
    <div className="flex justify-content-center align-items-center min-h-screen">
      <Toast ref={toast} />
      <Card title="Reset Your Password" className="w-full max-w-30rem shadow-4">
        {userData && (
          <p className="mb-4">
            Hello <strong>{userData.firstName} {userData.lastName}</strong>, please set your new password below.
          </p>
        )}
        
        <form onSubmit={handleSubmit} className="p-fluid">
          {formError && (
            <div className="p-error mb-3">{formError}</div>
          )}
          
          <div className="field mb-4">
            <label htmlFor="password" className="font-medium">New Password*</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask
              feedback={true}
              className="p-inputtext-lg"
              inputClassName="w-full"
              disabled={loading}
            />
            <small className="text-secondary">Password must be at least 6 characters long</small>
          </div>
          
          <div className="field mb-4">
            <label htmlFor="confirmPassword" className="font-medium">Confirm Password*</label>
            <Password
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              toggleMask
              feedback={false}
              className="p-inputtext-lg"
              inputClassName="w-full"
              disabled={loading}
            />
          </div>
          
          <Button
            type="submit"
            label="Reset Password"
            icon="pi pi-check"
            className="p-button-lg"
            disabled={loading}
            loading={loading}
          />
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;
