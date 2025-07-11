import { BrowserRouter as Router, Routes, Route, Navigate, useRoutes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import routes from './routes/routes.jsx';
import { ConfirmDialog } from 'primereact/confirmdialog';

// PrimeReact imports
import 'primereact/resources/themes/lara-light-blue/theme.css'; // modern theme
import 'primereact/resources/primereact.min.css'; // core css
import 'primeicons/primeicons.css'; // icons
import 'primeflex/primeflex.css'; // PrimeFlex for layout utilities
import './App.css';

// AppRoutes component to use the useRoutes hook
const AppRoutes = () => {
  const routeElements = useRoutes(routes);
  return routeElements;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ConfirmDialog />
        <div className="app-container">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
