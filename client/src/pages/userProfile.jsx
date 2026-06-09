import '../App.css';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function UserProfile() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/userData', {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json',
                        'Accept': 'application/json',
                    },
                    credentials: 'include',
                });

                const responseType = response.headers.get('content-type') || '';
                const result = responseType.includes('application/json') ? await response.json() : null;

                if (!response.ok) {
                    if (response.status === 401) {
                        navigate('/logIn');
                        return;
                    }
                    setErrors([result?.message || `Unable to fetch user data (status ${response.status}).`]);
                    return;
                }

                const profile = result?.rows?.[0] || null;
                setUserData(profile);
            } catch (error) {
                setErrors(['Unable to connect to server. Ensure backend is running.']);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, [navigate]);

    const profileFields = [
        { label: 'Username', value: userData?.username },
        { label: 'First Driver', value: userData?.first_driver },
        { label: 'Second Driver', value: userData?.second_driver },
        { label: 'Constructor', value: userData?.constructor },
        { label: 'Total Points', value: userData?.points },
    ];

    return (
        <main className="new-user-page">
            <div className="ambient ambient-left" aria-hidden="true" />
            <div className="ambient ambient-right" aria-hidden="true" />

            <h1 className="newUserHeadline">Welcome{userData?.username ? `, ${userData.username}` : '!'}</h1>

            <section className="panel" aria-live="polite">
                <h2 className="section-title">Your Team</h2>

                {isLoading && <p>Loading profile...</p>}

                {errors.length > 0 && (
                    <div className="form-errors" role="alert" aria-live="polite">
                        {errors.map((error) => (
                            <p key={error}>{error}</p>
                        ))}
                    </div>
                )}

                {!isLoading && errors.length === 0 && (
                    <div className="points-grid">
                        {profileFields.map((field) => (
                            <article className="card" key={field.label}>
                                <p className="card-label">{field.label}</p>
                                <p className="card-value">{field.value ?? 'Not set yet'}</p>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <div className="hero-actions">
                <Link className="button button-primary" to="/selectTeam">Alter line-up</Link>
            </div>
        </main>
    );
}

export default UserProfile;