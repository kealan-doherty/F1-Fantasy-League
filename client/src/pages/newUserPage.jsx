import '../App.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NewUserPage() { 
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrors([]);
        setIsSubmitting(true);

        try {
            const response = await fetch('/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                if (Array.isArray(result.errors)) {
                    setErrors(result.errors);
                } else {
                    setErrors([result.message || 'Unable to create account.']);
                }
                return;
            }

            navigate('/selectTeam');
        } catch (error) {
            setErrors(['Unable to connect to server. Ensure backend is running.']);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="new-user-page">
    <div className="ambient ambient-left" aria-hidden="true" />
    <div className="ambient ambient-right" aria-hidden="true" />

            <h1 className="newUserHeadline">Create Your Account</h1>
            <form className="new-user-form" onSubmit={handleSubmit}>
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />

                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />

                <label htmlFor="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />

                {errors.length > 0 && (
                    <div className="form-errors" role="alert" aria-live="polite">
                        {errors.map((error) => (
                            <p key={error}>{error}</p>
                        ))}
                    </div>
                )}

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
            </form>
        </main>
    );
}

export default NewUserPage;