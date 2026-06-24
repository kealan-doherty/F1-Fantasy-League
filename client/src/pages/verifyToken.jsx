import '../App.css';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function VerifyToken() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        code: ''
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

    const handleSubmit = async (event) =>{
        event.preventDefault();
        setErrors([]);
        setIsSubmitting(true);

        try {
            const response = await fetch('/resetInfo', {
                method: 'post',
                headers: {
                    'Content-type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                if (Array.isArray(result.errors)) {
                    setErrors(result.errors);
                } else {
                    setErrors([result.message || 'unable to verify reset token']);
                }
                return;
            }
            navigate('/ResetPassword');
        } catch (error) {
            setErrors(['unable to connect to server unsure the backend is running']);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="new-user-page">
    <div className="ambient ambient-left" aria-hidden="true"/>
    <div className="ambient ambient-right" aria-hidden="true"/>
            <h1 className="newUserHeadline">Enter Email and Reset Token Here</h1>

            <form className="new-user-form" onSubmit={handleSubmit}>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />

                <label htmlFor="code">Reset Code</label>
                <input type="text" id="code" name="code" value={formData.code} onChange={handleChange} required />

                {errors.length > 0 && (
                    <div className="form-errors" role="alert" aria-live="polite">
                        {errors.map((error) =>(
                            <p key={error}>{error}</p>
                        ))}
                    </div>
                )}

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'checking email and reset code': 'code verified'}
                </button>
            </form>

            <p>
                <Link to="/LogIn">Login In</Link>
            </p>
        </main>
    );
}

export default VerifyToken;