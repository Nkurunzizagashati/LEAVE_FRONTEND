import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Setup2FA } from './pages/auth/Setup2FA';
import { Verify2FA } from './pages/auth/Verify2FA';
import { OAuth2Callback } from './pages/auth/OAuth2Callback';
import { Dashboard } from './pages/Dashboard';
import {ApplyLeave} from './pages/leaves/ApplyLeave';
import LeaveHistory from './pages/leaves/LeaveHistory';
import TeamCalendar from './pages/calendar/TeamCalendar';
import Settings from './pages/settings/Settings';
import  UserManagement from './pages/admin/UserManagement';
import Reports from './pages/admin/Reports';
import Approvals from './pages/approvals/Approvals';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getLoggedInUser } from './store/slices/userSlice';

function App() {

	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(getLoggedInUser());
	}, [dispatch]);

	return (
		<Router>
			<ToastContainer />
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/setup-2fa" element={<Setup2FA />} />
				<Route path="/verify-2fa" element={<Verify2FA />} />
				<Route path="/oauth2/callback" element={<OAuth2Callback />} />
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/leaves/apply" element={<ApplyLeave />} />
				<Route path="/leaves/history" element={<LeaveHistory />} />
				<Route path="/calendar" element={<TeamCalendar />} />
				<Route path="/settings" element={<Settings />} />
				<Route path="/admin/users" element={<UserManagement />} />
				<Route path="/admin/reports" element={<Reports />} />
				<Route path="/approvals" element={<Approvals />} />
				<Route path="/" element={<Navigate to="/dashboard" replace />} />
			</Routes>
		</Router>
	);
}

export default App;
