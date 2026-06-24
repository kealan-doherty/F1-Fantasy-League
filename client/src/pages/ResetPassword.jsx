import '../App.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function ResetPassword() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (event) => {
        const {name, value} = event.target;
        setFormData((previous) =>({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrors([]);
        setIsSubmitting(true);

        try {
            const response = await fetch('/resetPasswordConfirm', {
                method: 'post',
                headers: {
                    'Content-type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                if (Array.isArray(result.errors)) {
                    setErrors(result.errors);
                } else {
                    setErrors([result.errors || 'Error resetting password']);
                }
                return;
            }
            navigate('/LogIn');
            } catch (error) {
                setErrors(['unable to connect to the server ensure the backend is running']);
            } finally {
                setIsSubmitting(false);
            }
        };

        return(
            <main className="new-user-page">
        <div className="ambient ambient-left" aria-hidden="true" />
        <div className="ambient ambient-right" aria-hidden="true" />

                <h1 className="newUserHeadLine">Reset Your Password Here</h1>

                <form className="new-user-form" onSubmit={handleSubmit}>
                    <label htmlFor="password">New Password</label>
                    <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />

                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input type ="password" id="confirmPassword" name ="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />

                    {errors.length > 0 && (
                        <div className="form-errors" role="alert" aria-live="polite">
                            {errors.map((error) => (
                                <p key={error}>{error}</p>
                            ))}
                        </div>
                    )}

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Resetting Password': 'Password Reset'}
                    </button>

                </form>
            </main>
        );
    }


export default ResetPassword;