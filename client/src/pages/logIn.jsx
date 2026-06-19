import '../App.css'
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function LogIn() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
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

        try{
            const response = await fetch('/sign-in', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok){
                if (Array.isArray(result.errors)) {
                    setErrors(result.errors);
                } else {
                    setErrors([result.message || 'Unable to log in.']);
                }
                return;
            }
            navigate('/userProfile');
        } catch (error) {
            setErrors(['unable to connect to server. Ensure backend is running.']);
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <main className="new-user-page">
    <div className="ambient ambient-left" aria-hidden="true" />
    <div className="ambient ambient-right" aria-hidden="true" />

            <h1 className="newUserHeadline">Login In Here</h1>

            <form className="new-user-form" onSubmit={handleSubmit}>
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />

                <label htmlFor="password">Password</label>
                <input type ="password" id="password" name="password" value={formData.password} onChange={handleChange} required />

                {errors.length > 0 && (
                    <div className="form-errors" role="alert" aria-live="polite">
                        {errors.map((error) => (
                            <p key={error}>{error}</p>
                        ))}
                    </div>
                )}

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Logging In....': 'Log In'}
                </button>
            </form>
    
            <p>
                <Link to="/ResetRequest">Forgot Password?</Link>
            </p>

        </main>
    );
}

export default LogIn