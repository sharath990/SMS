import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';

/**
 * NotFound component
 * 
 * This component is displayed when a user navigates to a route that doesn't exist.
 */
const NotFound = () => {
  return (
    <div className="flex align-items-center justify-content-center min-h-screen bg-gray-100">
      <div className="text-center p-5 border-round bg-white shadow-2" style={{ maxWidth: '500px' }}>
        <i className="pi pi-exclamation-circle text-primary" style={{ fontSize: '5rem' }}></i>
        <h1 className="text-900 font-bold text-5xl mb-3">404</h1>
        <h2 className="text-600 font-normal text-3xl mb-5">Page Not Found</h2>
        <p className="text-700 line-height-3 mb-5">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex justify-content-center">
          <Link to="/admin">
            <Button label="Go to Dashboard" icon="pi pi-home" className="p-button-primary p-button-raised" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
