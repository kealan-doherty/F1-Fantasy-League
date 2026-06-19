import '../App.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function ResetRequest() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
    });
    const [errors, setErrors] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (event) => {
        const {name, value} = event.target;
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
            const response = await fetch('/requestReset', {
                method: 'post',
                headers: {
                    'Content-type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                if(Array.isArray(result.errors)) {
                    setErrors(result.errors);
                } else {
                    setErrors([result.message || 'unable to sent password reset request']);
                }
                return; 
            }
            navigate('/ResetPassword');
        } catch (error) {
            setErrors(['unable to connect to server']);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className='reset-request-page'>
    <div className="ambient ambient-right" aria-hidden="true" />
    <div className="ambient ambient-left" aria-hidden="true" />

            <h1 className="newUserHeadline">Submit a password reset request here!</h1>

            <form className="reset-request-form" onSubmit={handleSubmit}>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />

                {errors.length > 0 && (
                    <div className='form-errors' role = 'alert' aria-live="polite">
                        {errors.map((error) => (
                            <p key={error}>{error}</p>
                        ))}
                    </div>
                )}

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'submitting request....': 'Reset Token Sent'}
                </button>
            </form>
        </main>
    )
}

export default ResetRequest;