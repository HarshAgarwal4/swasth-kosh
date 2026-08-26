import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home.jsx';
import SignUp from '../pages/signup.jsx';
import LoginPage from '../pages/login.jsx';
import { ProtectedRoute } from './Auth.jsx';
import { Dashboard } from '../pages/Dashboard.jsx';
import ScreeningWizard from '../pages/ScreeningWizard.jsx';
import ScreeningResult from '../pages/ScreeningResult.jsx';
import DoctorDashboard from '../pages/DoctorDashboard.jsx';
import VideoCallRoom from '../pages/VideoCallRoom.jsx';
import ChatPage from '../pages/ChatPage.jsx';
import AiAssistantPage from '../pages/AiAssistantPage.jsx';
import ReferralsPage from '../pages/ReferralsPage.jsx';
import AdminDashboard from '../pages/AdminDashboard.jsx';
import AdminPanel from '../pages/AdminPanel.jsx';
import ProfessionalsDirectory from '../pages/ProfessionalsDirectory.jsx';
import AppointmentsPage from '../pages/AppointmentsPage.jsx';
import RoleApplicationPage from '../pages/RoleApplicationPage.jsx';

const Routes = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/screening/start',
    element: (
      <ProtectedRoute>
        <ScreeningWizard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/screening/:id/result',
    element: (
      <ProtectedRoute>
        <ScreeningResult />
      </ProtectedRoute>
    ),
  },
  {
    path: '/find-doctors',
    element: (
      <ProtectedRoute>
        <ProfessionalsDirectory />
      </ProtectedRoute>
    ),
  },
  {
    path: '/appointments',
    element: (
      <ProtectedRoute>
        <AppointmentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/role-application/:token',
    element: <RoleApplicationPage />,
  },
  {
    path: '/doctor/dashboard',
    element: (
      <ProtectedRoute>
        <DoctorDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/call/:roomId',
    element: (
      <ProtectedRoute>
        <VideoCallRoom />
      </ProtectedRoute>
    ),
  },
  {
    path: '/chat',
    element: (
      <ProtectedRoute>
        <ChatPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/ai-assistant',
    element: <AiAssistantPage />,
  },
  {
    path: '/referrals',
    element: (
      <ProtectedRoute>
        <ReferralsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminPanel />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/analytics',
    element: (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
]);

export default Routes;
