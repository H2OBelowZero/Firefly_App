import { BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from '@/contexts/UserContext';
import { Toaster } from 'sonner';
import AppRoutes from './routes';

function App() {
  return (
    <Router>
      <UserProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </UserProvider>
    </Router>
  );
}

export default App;
