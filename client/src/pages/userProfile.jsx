import '../App.css';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function UserProfile() {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [leaders, setLeaders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState([]);
    const [leaderboardError, setLeaderboardError] = useState('');

    useEffect(() => {
        const fetchProfileData = async () => {
            setIsLoading(true);
            setErrors([]);
            setLeaderboardError('');

            try {
                const userResponse = await fetch('/userData', {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json',
                        'Accept': 'application/json',
                    },
                    credentials: 'include',
                });

                const leaderboardResponse = await fetch('/leaderboard/top5', {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json',
                        'Accept': 'application/json',
                    },
                    credentials: 'include',
                });

                const userResponseType = userResponse.headers.get('content-type') || '';
                const userResult = userResponseType.includes('application/json') ? await userResponse.json() : null;

                const leaderboardResponseType = leaderboardResponse.headers.get('content-type') || '';
                const leaderboardResult = leaderboardResponseType.includes('application/json') ? await leaderboardResponse.json() : null;

                if (!userResponse.ok) {
                    if (userResponse.status === 401) {
                        navigate('/logIn');
                        return;
                    }
                    setErrors([userResult?.message || `Unable to fetch user data (status ${userResponse.status}).`]);
                    return;
                }

                if (!leaderboardResponse.ok) {
                    if (leaderboardResponse.status === 401) {
                        navigate('/logIn');
                        return;
                    }
                    setLeaderboardError(leaderboardResult?.message || `Unable to fetch leaderboard data (status ${leaderboardResponse.status}).`);
                }

                const profile = userResult?.rows?.[0] || null;
                setProfileData(profile);

                const topLeaders = Array.isArray(leaderboardResult?.leaders) ? leaderboardResult.leaders : [];
                setLeaders(topLeaders);
            } catch (error) {
                setErrors(['Unable to connect to server. Ensure backend is running.']);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [navigate]);

    const profileFields = [
        { label: 'Username', value: profileData?.username },
        { label: 'First Driver', value: profileData?.first_driver },
        { label: 'Second Driver', value: profileData?.second_driver },
        { label: 'Constructor', value: profileData?.constructor },
        { label: 'Total Points', value: profileData?.points },
    ];

    return (
        <main className="new-user-page">
            <div className="ambient ambient-left" aria-hidden="true" />
            <div className="ambient ambient-right" aria-hidden="true" />

            <h1 className="newUserHeadline">Welcome{profileData?.username ? `, ${profileData.username}` : '!'}</h1>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', width: '100%' }}> 
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

                <section className="panel" aria-live="polite">
                    <h2 className="section-title">Top 5 Leaderboard</h2>

                    {isLoading && <p>Loading leaderboard...</p>}

                    {!isLoading && leaderboardError && (
                        <div className="form-errors" role="alert" aria-live="polite">
                            <p>{leaderboardError}</p>
                        </div>
                    )}

                    {!isLoading && !leaderboardError && leaders.length === 0 && (
                        <p>No leaderboard data available yet.</p>
                    )}

                    {!isLoading && !leaderboardError && leaders.length > 0 && (
                        <div className="points-grid">
                            {leaders.map((leader, index) => (
                                <article className="card" key={`${leader.username}-${index}`}>
                                    <p className="card-label">#{index + 1}</p>
                                    <p className="card-value">{leader.username}</p>
                                    <p className="card-footnote">{leader.points} pts</p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <div className="hero-actions">
                <Link className="button button-primary" to="/selectTeam">Alter line-up</Link>
            </div>
        </main>
    );
}

export default UserProfile;