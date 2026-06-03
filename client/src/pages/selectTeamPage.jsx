import '../App.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function selectTeamPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        first_driver: '',
        second_driver: '',
        constructor: '',
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

        try{
            const response = await fetch('/updateTeam', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                if(Array.isArray(result.errors)) {
                    setErrors(result.errors);
                } else {
                    setErrors([result.message || 'unable to update team']);
                }
                return;
            }

            navigate('/userProfile');
        
    } catch (error) {
        setErrors(['Unable to connect to server. Ensure backend is running']);
    } finally {
        setIsSubmitting(false);
    }
};
    return (
        <main className="update-user-team">
    <div className="ambient ambient-left" aria-hidden="true" />
    <div className="ambient ambient-right" aria-hidden="true" />
            <h1 className="newUserHeadline">Select your Team</h1>

            <form className="update-team-form" onSubmit={handleSubmit}>
                <label htmlFor="first_driver">First Driver</label>
                <select id = "first_driver" name = 'first_driver' value={formData.first_driver} onChange={handleChange} required> 
                    <option value="" disabled> First Driver </option>
                    <option className = 'mclaren' value = 'Lando_Norris'> Lando Norris</option>
                    <option className = 'mclaren' value = 'Oscar_Piastri'> Oscar Piastri</option>
                    <option className = 'redBull' value = 'Max_Verstappen'> Max Verstappen</option>
                    <option className = 'redBull' value = 'Isack_Hadjar'> Isack Hadjar</option>
                    <option className = 'ferrari' value = 'Charles_Leclerc'> Charles Leclerc </option>
                    <option className = 'ferrari' value = 'Lewis_Hamilton'> Lewis Hamilton</option>
                    <option className = 'merc' value = 'George_Russell'> George Russell</option>
                    <option className = 'merc' value = 'Kimi_Antonelli'> Kimi Antonelli</option>
                    <option className = 'aston' value = 'Fernando_Alonso'> Fernando Alonso</option>
                    <option className = 'aston' value = 'Lance_Stroll'> Lance Stroll</option>
                    <option className = 'williams' value = 'Alex_Albon'> Alex Albon</option>
                    <option className = 'williams' value = 'Carlos_Sainz'> Carlos Sainz</option>
                    <option className = 'racingBulls' value = 'Liam_Lawson'> Liam Lawson</option>
                    <option className = 'racingBulls' value = 'Arvid_Lindblad'> Arvid Lindblad</option>
                    <option className = 'audi' value = 'Nico_Hulkenberg'> Nico Hulkenberg</option>
                    <option className = 'audi' value = 'Gabriel_Bortoleto'> Gabriel Bortoleto</option>
                    <option className = 'haas' value = 'Esteban_Ocon'> Esteban Ocon</option>
                    <option className = 'haas' value = 'Oliver_Bearman'> Oliver Bearman</option>
                    <option className = 'alpine' value = 'Pierre_Gasly'> Pierre Gasly</option>
                    <option className = 'alpine' value = 'Franco_Colapinto'> Franco Colapinto</option>
                    <option className = 'cadillac' value = 'Sergio_Perez'> Sergio Perez</option>
                    <option className = 'cadillac' value = 'Valtteri_Bottas'> Valtteri Bottas</option>
                </select>

                <label htmlFor="second_driver">Second Driver</label>
                <select id = "second_driver" name = 'second_driver' value={formData.second_driver} onChange={handleChange} required> 
                    <option value="" disabled> Second Driver </option>
                    <option className = 'mclaren' value = 'Lando_Norris'> Lando Norris</option>
                    <option className = 'mclaren' value = 'Oscar_Piastri'> Oscar Piastri</option>
                    <option className = 'redBull' value = 'Max_Verstappen'> Max Verstappen</option>
                    <option className = 'redBull' value = 'Isack_Hadjar'> Isack Hadjar</option>
                    <option className = 'ferrari' value = 'Charles_Leclerc'> Charles Leclerc </option>
                    <option className = 'ferrari' value = 'Lewis_Hamilton'> Lewis Hamilton</option>
                    <option className = 'merc' value = 'George_Russell'> George Russell</option>
                    <option className = 'merc' value = 'Kimi_Antonelli'> Kimi Antonelli</option>
                    <option className = 'aston' value = 'Fernando_Alonso'> Fernando Alonso</option>
                    <option className = 'aston' value = 'Lance_Stroll'> Lance Stroll</option>
                    <option className = 'williams' value = 'Alex_Albon'> Alex Albon</option>
                    <option className = 'williams' value = 'Carlos_Sainz'> Carlos Sainz</option>
                    <option className = 'racingBulls' value = 'Liam_Lawson'> Liam Lawson</option>
                    <option className = 'racingBulls' value = 'Arvid_Lindblad'> Arvid Lindblad</option>
                    <option className = 'audi' value = 'Nico_Hulkenberg'> Nico Hulkenberg</option>
                    <option className = 'audi' value = 'Gabriel_Bortoleto'> Gabriel Bortoleto</option>
                    <option className = 'haas' value = 'Esteban_Ocon'> Esteban Ocon</option>
                    <option className = 'haas' value = 'Oliver_Bearman'> Oliver Bearman</option>
                    <option className = 'alpine' value = 'Pierre_Gasly'> Pierre Gasly</option>
                    <option className = 'alpine' value = 'Franco_Colapinto'> Franco Colapinto</option>
                    <option className = 'cadillac' value = 'Sergio_Perez'> Sergio Perez</option>
                    <option className = 'cadillac' value = 'Valtteri_Bottas'> Valtteri Bottas</option>
                </select>

                <label htmlFor="constructor">Constructor</label>
                <select id = 'constructor' name = 'constructor' value={formData.constructor} onChange={handleChange} required>
                    <option value="" disabled> Constructor </option>
                    <option className = 'ferrari' value = 'ferrari'>ferrari</option>
                    <option className = 'redBull' value = 'Red_Bull'> Red Bull</option>
                    <option className = 'merc' value = 'Mercedes'> Mercedes</option>
                    <option className = 'mclaren' value = 'mclaren'> Mclaren</option>
                    <option className = 'aston' value = 'Aston_Martin'> Aston Martin</option>
                    <option className = 'racingBulls' value = 'Racing_Bulls'> Racing Bulls</option>
                    <option className = 'williams' value = 'Williams'> Williams</option>
                    <option className = 'haas' value = 'Haas'> Haas</option>
                    <option className = 'audi' value = 'Audi'> Audi</option>
                    <option className = 'alpine' value = 'Alpine'> Alpine</option>
                    <option className = 'cadillac' value = 'Cadillac'> Cadillac</option>
                </select>

                {errors.length > 0 && (
                    <div className="form-errors" role="alert" aria-live="polite">
                        {errors.map((error) => (
                            <p key={error}>{error}</p>
                        ))}
                    </div>
                )}

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Updating....': 'Update Teams'}
                </button>
            </form>
        </main>
    );
}

export default selectTeamPage;