import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import { useToast } from '../../hooks/useToast';
import { createValidationRule, validateRequired } from '../../utils/validation';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { RiShieldKeyholeLine } from 'react-icons/ri';

export const Verify2FA = () => {
	const navigate = useNavigate();
	const { verify2FA } = useAuth();
	const { showToast } = useToast();
	const [isLoading, setIsLoading] = useState(false);

	const validationRules = {
		code: [
			createValidationRule(validateRequired, 'Verification code is required'),
		],
	};

	const onSubmit = async (formData) => {
		setIsLoading(true);
		try {
			await verify2FA(formData.code);
			showToast('2FA verification successful!', 'success');
			navigate('/dashboard');
		} catch (error) {
			showToast(error.message || '2FA verification failed', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	const { values, errors, handleChange, handleSubmit } = useForm(
		{
			code: '',
		},
		validationRules,
		onSubmit
	);

	

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					Verify Two-Factor Authentication
				</h2>
				<p className="mt-2 text-center text-sm text-gray-600">
					Enter the verification code from your authenticator app
				</p>
			</div>

			

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					<form className="space-y-6" onSubmit={handleSubmit}>
						<div>
							<label
								htmlFor="code"
								className="block text-sm font-medium text-gray-700"
							>
								Verification Code
							</label>
							<div className="mt-1 relative rounded-md shadow-sm">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<RiShieldKeyholeLine className="h-5 w-5 text-gray-400" />
								</div>
								<input
									id="code"
									name="code"
									type="text"
									required
									value={values.code}
									onChange={handleChange}
									className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
									placeholder="Enter 6-digit code"
								/>
							</div>
							{errors.code && (
								<p className="mt-2 text-sm text-red-600">{errors.code}</p>
							)}
						</div>

						<div>
							<Button
								type="submit"
								loading={isLoading}
								disabled={isLoading}
								className="w-full"
							>
								Verify Code
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};
