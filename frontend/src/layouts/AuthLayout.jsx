import { Outlet } from 'react-router-dom';

/**
 * AuthLayout component
 * 
 * This layout is used for authentication-related pages like login and registration.
 * It provides a simple container for the auth forms.
 */
const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
