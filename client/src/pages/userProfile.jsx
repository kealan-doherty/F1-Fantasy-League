import '../App.css';
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function UserProfile() {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [raceResults, setRaceResults] = useState([]);
    const [leaders, setLeaders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState([]);
    const [signOutError, setSignOutError] = useState('');
    const [raceResultsError, setRaceResultsError] = useState('');
    const [leaderboardError, setLeaderboardError] = useState('');
    const teamPanelRef = useRef(null);
    const [teamPanelHeight, setTeamPanelHeight] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            setIsLoading(true);
            setErrors([]);
            setRaceResultsError('');
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

                const [raceResponse, driversResponse] = await Promise.all([
                    fetch('https://api.openf1.org/v1/session_result?session_key=latest&position<=10', {
                        method: 'GET',
                        headers: { 'Accept': 'application/json' },
                    }),
                    fetch('https://api.openf1.org/v1/drivers?session_key=latest', {
                        method: 'GET',
                        headers: { 'Accept': 'application/json' },
                    }),
                ]);

                const userResponseType = userResponse.headers.get('content-type') || '';
                const userResult = userResponseType.includes('application/json') ? await userResponse.json() : null;

                const leaderboardResponseType = leaderboardResponse.headers.get('content-type') || '';
                const leaderboardResult = leaderboardResponseType.includes('application/json') ? await leaderboardResponse.json() : null;

                const raceResponseType = raceResponse.headers.get('content-type') || '';
                const raceResult = raceResponseType.includes('application/json') ? await raceResponse.json() : null;

                const driversResponseType = driversResponse.headers.get('content-type') || '';
                const driversResult = driversResponseType.includes('application/json') ? await driversResponse.json() : null;

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

                if (!raceResponse.ok) {
                    setRaceResultsError(`Unable to fetch race results (status ${raceResponse.status}).`);
                } else {
                    const toTitleCase = (str) => str.replace(/\S+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
                    const driverNameByNumber = Array.isArray(driversResult)
                        ? Object.fromEntries(driversResult.map((d) => {
                            const raw = d.full_name || d.broadcast_name || d.name_acronym;
                            return [d.driver_number, raw ? toTitleCase(raw) : null];
                        }))
                        : {};

                    const latestRaceResults = Array.isArray(raceResult)
                        ? raceResult.map((result) => {
                            const displayName = driverNameByNumber[result.driver_number] || 'Unknown Driver';

                            return {
                                label: `P${result.position ?? '-'}`,
                                value: displayName,
                            };
                        })
                        : [];
                    setRaceResults(latestRaceResults);
                }

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


    useLayoutEffect(() => {
        if (!teamPanelRef.current) {
            return undefined;
        }

        const teamPanel = teamPanelRef.current;

        const updatePanelHeight = () => {
            setTeamPanelHeight(teamPanel.offsetHeight);
        };

        updatePanelHeight();

        const resizeObserver = new ResizeObserver(() => {
            updatePanelHeight();
        });

        resizeObserver.observe(teamPanel);

        return () => {
            resizeObserver.disconnect();
        };
    }, [profileData, raceResults, leaders, isLoading, errors, raceResultsError, leaderboardError]);


    const profileFields = [
        { label: 'Username', value: profileData?.username },
        { label: 'First Driver', value: profileData?.first_driver },
        { label: 'Second Driver', value: profileData?.second_driver },
        { label: 'Constructor', value: profileData?.constructor },
        { label: 'Total Points', value: profileData?.points },
    ];


    const raceCardsCount = raceResults.length > 0 ? raceResults.length : 1;
    const teamCardsCount = profileFields.length;
    const leaderboardCardsCount = leaders.length > 0 ? leaders.length : 1;

    const panelHeightStyle = teamPanelHeight ? { height: `${teamPanelHeight}px` } : undefined;

    const handleSignOut = async () => {
        setSignOutError('');

        try {
            const response = await fetch('/sign-out', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const contentType = response.headers.get('content-type') || '';
                const result = contentType.includes('application/json') ? await response.json() : null;
                setSignOutError(result?.message || `Unable to sign out (status ${response.status}).`);
                return;
            }

            navigate('/');
        } catch (error) {
            setSignOutError('Unable to sign out right now. Please try again.');
        }
    };



    return (
        <main className="new-user-page user-profile-page">
            <div className="ambient ambient-left" aria-hidden="true" />
            <div className="ambient ambient-right" aria-hidden="true" />

            <h1 className="newUserHeadline">Welcome{profileData?.username ? `, ${profileData.username}` : '!'}</h1>

            <div className="profile-sections"> 

                <section
                    className="panel"
                    aria-live="polite"
                    style={{ ...panelHeightStyle, '--section-weight': raceCardsCount }}
                >
                    <h2 className="section-title">Race Results</h2>

                    {isLoading && <p>Loading race results...</p>}

                    {errors.length > 0 && (
                        <div className="form-errors" role="alert" aria-live="polite">
                            {errors.map((error) => (
                                <p key={error}>{error}</p>
                            ))}
                        </div>
                    )}

                    {!isLoading && errors.length === 0 && (
                        raceResultsError ? (
                            <div className="form-errors" role="alert" aria-live="polite">
                                <p>{raceResultsError}</p>
                            </div>
                        ) : raceResults.length > 0 ? (
                            <div className="points-grid race-results-grid">
                                {raceResults.map((field, index) => (
                                    <article className="card race-results-card" key={`${field.label}-${index}`}>
                                        <p className="card-label race-results-rank">{field.label}</p>
                                        <p className="card-value race-results-name">{field.value ?? 'Not set yet'}</p>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p>No race results available yet.</p>
                        )
                    )}
                </section>

                <section
                    className="panel"
                    aria-live="polite"
                    ref={teamPanelRef}
                    style={{ '--section-weight': teamCardsCount }}
                >
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

                <section
                    className="panel"
                    aria-live="polite"
                    style={{ ...panelHeightStyle, '--section-weight': leaderboardCardsCount }}
                >
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
                        <div className="points-grid leaderboard-grid">
                            {leaders.map((leader, index) => (
                                <article className="card leaderboard-card" key={`${leader.username}-${index}`}>
                                    <p className="card-label leaderboard-rank">#{index + 1}</p>
                                    <p className="card-value leaderboard-name">{leader.username}</p>
                                    <p className="card-footnote leaderboard-points">{leader.points} pts</p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <div className="hero-actions">
                <Link className="button button-primary" to="/selectTeam">Alter line-up</Link>
            
                <button className="button button-primary" onClick={handleSignOut} type="button">Sign Out</button>
            </div>

            {signOutError && (
                <div className="form-errors" role="alert" aria-live="polite">
                    <p>{signOutError}</p>
                </div>
            )}
            
        </main>
    );
}

export default UserProfile;