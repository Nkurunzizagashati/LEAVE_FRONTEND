import { useState } from 'react';
import { getValidationErrors } from '../utils/validation';

export const useForm = (initialValues, validationRules, onSubmit) => {
	const [values, setValues] = useState(initialValues);
	const [errors, setErrors] = useState({});
	const [touched, setTouched] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setValues((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleBlur = (e) => {
		const { name } = e.target;
		setTouched((prev) => ({
			...prev,
			[name]: true,
		}));
	};

	const validate = () => {
		const validationErrors = getValidationErrors(values, validationRules);
		setErrors(validationErrors);
		return Object.keys(validationErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		if (e && typeof e.preventDefault === 'function') {
			e.preventDefault();
		}

		setIsSubmitting(true);
		setErrors({});

		if (validate()) {
			try {
				await onSubmit(values);
			} catch (error) {
				setErrors((prev) => ({
					...prev,
					submit: error.message || 'An error occurred',
				}));
			}
		}

		setIsSubmitting(false);
	};

	const resetForm = () => {
		setValues(initialValues);
		setErrors({});
		setTouched({});
		setIsSubmitting(false);
	};

	return {
		values,
		errors,
		touched,
		isSubmitting,
		handleChange,
		handleBlur,
		handleSubmit,
		resetForm,
		setValues,
		setErrors,
	};
}; 