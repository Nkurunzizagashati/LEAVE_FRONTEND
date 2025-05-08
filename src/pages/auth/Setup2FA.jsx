import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import { useToast } from '../../hooks/useToast';
import { createValidationRule, validateRequired } from '../../utils/validation';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { RiShieldKeyholeLine, RiQrCodeLine } from 'react-icons/ri';
import { Alert } from '../../components/common/Alert';

export const Setup2FA = () => {
	const navigate = useNavigate();
	const { setup2FA, verify2FASetup } = useAuth();
	const { showToast } = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [setupData, setSetupData] = useState(null);
	const [error, setError] = useState(null);
	

	useEffect(() => {
		const fetchSetupData = async () => {
			try {
				setIsLoading(true);
				const data = await setup2FA();
				setSetupData(data);
			} catch (err) {
				setError(err.message || 'Failed to load 2FA setup data');
			} finally {
				setIsLoading(false);
			}
		};

		fetchSetupData();
	}, []);


	

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					Two-Factor Authentication
				</h2>
				<p className="mt-2 text-center text-sm text-gray-600">
					
						Scan the QR code with your authenticator app
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					{error && <Alert type="error" message={error} />}

					
						<div className="flex flex-col items-center space-y-6">
							<div className="h-48 w-48 flex items-center justify-center">
								{isLoading ? (
									<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
								) : setupData?.qrCodeUrl ? (
									<div className="p-4 bg-white rounded-lg shadow">
										<img
											src={setupData.qrCodeUrl}
											alt="QR Code"
											className="w-40 h-40"
										/>
									</div>
								) : (
									<div className="text-center text-red-500">
										No QR code available. Please try again.
									</div>
								)}
							</div>

							<div className="min-h-[100px] w-full text-center">
								{setupData?.secretKey && (
									<>
										<p className="text-sm text-gray-600">Or enter this key manually:</p>
										<p className="mt-2 text-lg font-mono bg-gray-100 p-2 rounded">
											{setupData.secretKey}
										</p>
									</>
								)}
							</div>

							<Button
								onClick={() => navigate('/verify-2fa')}
								className="w-full"
								disabled={!setupData?.qrCodeUrl || !setupData?.secretKey || isLoading}
							>
								Continue to Verification
							</Button>
						</div>
					
				</div>
			</div>
		</div>
	);
};
