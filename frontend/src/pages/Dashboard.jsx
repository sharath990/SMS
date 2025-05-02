import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect admin users to admin dashboard
    if (user && user.isAdmin) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-4">
      <Card title="User Dashboard" className="shadow-4">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Welcome, {user?.username}!</h2>
          <p className="mb-4 text-lg">You are now logged in to the application.</p>
          <p className="mb-4 text-lg">This is a protected dashboard page for regular users.</p>
          <div className="flex justify-content-end">
            <Button
              label="Logout"
              icon="pi pi-sign-out"
              severity="danger"
              onClick={handleLogout}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
