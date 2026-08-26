import { useEffect } from 'react';
import Routes from './services/Routes';
import { RouterProvider } from 'react-router-dom';
import { useStore } from './zustand/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getSocket } from './services/socket';
import FloatingChatbot from './components/FloatingChatbot';

function App() {
  const fetchUser = useStore((state) => state.fetchUser);
  const setIsOnline = useStore((state) => state.setIsOnline);
  const checkPendingSync = useStore((state) => state.checkPendingSync);

  useEffect(() => {
    fetchUser();
    getSocket();

    const handleOnline = () => {
      setIsOnline(true);
      checkPendingSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      <RouterProvider router={Routes} />
      <FloatingChatbot />
      <ToastContainer position="top-right" autoClose={3500} />
    </>
  );
}

export default App;
