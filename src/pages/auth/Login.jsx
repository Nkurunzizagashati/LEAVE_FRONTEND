import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import { useToast } from '../../hooks/useToast';
import { createValidationRule, validateEmail, validateRequired } from '../../utils/validation';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import { Link, useNavigate } from 'react-router-dom';
import { RiMailLine, RiLockLine } from 'react-icons/ri';
import { FcGoogle } from 'react-icons/fc';

export const Login = () => {
	const navigate = useNavigate();
	const { login } = useAuth();
	const { showToast } = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);

	const validationRules = {
		email: [
			createValidationRule(validateRequired, 'Email is required'),
			createValidationRule(validateEmail, 'Please enter a valid email'),
		],
		password: [
			createValidationRule(validateRequired, 'Password is required'),
		],
	};

	const onSubmit = async (formData) => {
		setIsLoading(true);
		try {
			await login(formData);
			showToast('Login successful!', 'success');
			navigate('/setup-2fa');
		} catch (error) {
			showToast(error.message || 'Login failed', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleLogin = async () => {
		setIsGoogleLoading(true);
		try {
			// Redirect to Spring Boot OAuth2 endpoint
			window.location.href = 'http://localhost:8080/oauth2/authorization/google';
		} catch (error) {
			showToast('Google login failed', 'error');
			setIsGoogleLoading(false);
		}
	};

	const { values, errors, handleChange, handleSubmit } = useForm(
		{
			email: '',
			password: '',
		},
		validationRules,
		onSubmit
	);

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					Sign in to your account
				</h2>
				<p className="mt-2 text-center text-sm text-gray-600">
					Welcome back! Please enter your details
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					<form className="space-y-6" onSubmit={(e) => {
						e.preventDefault();
						handleSubmit();
					}}>
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
									value={values.email}
									onChange={handleChange}
									className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
									placeholder="Enter your email"
								/>
							</div>
							{errors.email && (
								<p className="mt-2 text-sm text-red-600">{errors.email}</p>
							)}
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
									value={values.password}
									onChange={handleChange}
									className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
									placeholder="Enter your password"
								/>
							</div>
							{errors.password && (
								<p className="mt-2 text-sm text-red-600">{errors.password}</p>
							)}
						</div>

						<div>
							<Button
								type="submit"
								loading={isLoading}
								disabled={isLoading}
								className="w-full"
							>
								Sign in
							</Button>
						</div>
					</form>

					<div className="mt-6">
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-300" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-white text-gray-500">Or continue with</span>
							</div>
						</div>

						<div className="mt-6">
							<button
								onClick={handleGoogleLogin}
								disabled={isGoogleLoading}
								className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							>
								<FcGoogle className="h-5 w-5 mr-2" />
								{isGoogleLoading ? 'Signing in...' : 'Sign in with Google'}
							</button>
						</div>
					</div>

					<div className="mt-6 text-center">
						<p className="text-sm text-gray-600">
							Don't have an account?{' '}
							<Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
								Register
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
