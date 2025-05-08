import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiMailLine, RiLockLine, RiUserLine, RiBuildingLine, RiShieldLine, RiBriefcaseLine } from 'react-icons/ri';
import Select from '../../components/common/Select';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/common/Button';

export const Register = () => {
	const navigate = useNavigate();
	const { showToast } = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		department: '',
		role: '',
		jobTitle: '',
	});
	const [error, setError] = useState('');

	const departmentOptions = [
		{ value: 'engineering', label: 'Engineering' },
		{ value: 'marketing', label: 'Marketing' },
		{ value: 'sales', label: 'Sales' },
		{ value: 'hr', label: 'Human Resources' },
		{ value: 'finance', label: 'Finance' },
		{ value: 'operations', label: 'Operations' },
	];

	const roleOptions = [
		{ value: 'ROLE_USER', label: 'User' },
		{ value: 'ROLE_MANAGER', label: 'Manager' },
		{ value: 'ROLE_ADMIN', label: 'Admin' },
	];

	const jobTitleOptions = [
		{ value: 'Software Engineer', label: 'Software Engineer' },
		{ value: 'Senior Software Engineer', label: 'Senior Software Engineer' },
		{ value: 'Team Lead', label: 'Team Lead' },
		{ value: 'Project Manager', label: 'Project Manager' },
		{ value: 'HR Manager', label: 'HR Manager' },
		{ value: 'System Administrator', label: 'System Administrator' },
	];

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setIsLoading(true);

		try {
			const { firstName, lastName, email, password, department, role, jobTitle } = formData;
			if (firstName && lastName && email && password && department && role && jobTitle) {
				const response = await fetch(
					'http://localhost:8080/api/auth/register',
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							firstName,
							lastName,
							email,
							password,
							department,
							role,
							jobTitle,
						}),
					}
				);

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(
						errorData.message || 'Registration failed'
					);
				}

				showToast('Registration successful! Please log in.', 'success');
				navigate('/login');
			} else {
				setError('Please fill in all fields');
				showToast('Please fill in all fields', 'error');
			}
		} catch (err) {
			setError(err.message || 'Registration failed');
			showToast(err.message || 'Registration failed', 'error');
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					Create your account
				</h2>
				<p className="mt-2 text-center text-sm text-gray-600">
					Sign up to get started
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					<form className="space-y-6" onSubmit={handleSubmit}>
						<div>
							<label
								htmlFor="firstName"
								className="block text-sm font-medium text-gray-700"
							>
								First Name
							</label>
							<div className="mt-1 relative rounded-md shadow-sm">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<RiUserLine className="h-5 w-5 text-gray-400" />
								</div>
								<input
									id="firstName"
									name="firstName"
									type="text"
									required
									value={formData.firstName}
									onChange={handleChange}
									className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
									placeholder="Enter your first name"
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="lastName"
								className="block text-sm font-medium text-gray-700"
							>
								Last Name
							</label>
							<div className="mt-1 relative rounded-md shadow-sm">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<RiUserLine className="h-5 w-5 text-gray-400" />
								</div>
								<input
									id="lastName"
									name="lastName"
									type="text"
									required
									value={formData.lastName}
									onChange={handleChange}
									className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
									placeholder="Enter your last name"
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700"
							>
								Email address
							</label>
							<div className="mt-1 relative rounded-md shadow-sm">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<RiMailLine className="h-5 w-5 text-gray-400" />
								</div>
								<input
									id="email"
									name="email"
									type="email"
									required
									value={formData.email}
									onChange={handleChange}
									className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
									placeholder="Enter your email"
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700"
							>
								Password
							</label>
							<div className="mt-1 relative rounded-md shadow-sm">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<RiLockLine className="h-5 w-5 text-gray-400" />
								</div>
								<input
									id="password"
									name="password"
									type="password"
									required
									value={formData.password}
									onChange={handleChange}
									className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
									placeholder="Create a password"
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="department"
								className="block text-sm font-medium text-gray-700"
							>
								Department
							</label>
							<div className="mt-1 relative rounded-md shadow-sm">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<RiBuildingLine className="h-5 w-5 text-gray-400" />
								</div>
								<Select
									id="department"
									name="department"
									value={formData.department}
									onChange={handleChange}
									options={departmentOptions}
									placeholder="Select your department"
									required
									className="pl-10"
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="role"
								className="block text-sm font-medium text-gray-700"
							>
								Role
							</label>
							<div className="mt-1 relative rounded-md shadow-sm">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<RiShieldLine className="h-5 w-5 text-gray-400" />
								</div>
								<Select
									id="role"
									name="role"
									value={formData.role}
									onChange={handleChange}
									options={roleOptions}
									placeholder="Select your role"
									required
									className="pl-10"
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="jobTitle"
								className="block text-sm font-medium text-gray-700"
							>
								Job Title
							</label>
							<div className="mt-1 relative rounded-md shadow-sm">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<RiBriefcaseLine className="h-5 w-5 text-gray-400" />
								</div>
								<Select
									id="jobTitle"
									name="jobTitle"
									value={formData.jobTitle}
									onChange={handleChange}
									options={jobTitleOptions}
									placeholder="Select your job title"
									required
									className="pl-10"
								/>
							</div>
						</div>

						<div>
							<Button
								type="submit"
								loading={isLoading}
								disabled={isLoading}
								className="w-full"
							>
								Register
							</Button>
						</div>
					</form>

					<div className="mt-6 text-center">
						<p className="text-sm text-gray-600">
							Already have an account?{' '}
							<button
								type="button"
								onClick={() => navigate('/login')}
								className="font-medium text-blue-600 hover:text-blue-500"
							>
								Log in
							</button>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
