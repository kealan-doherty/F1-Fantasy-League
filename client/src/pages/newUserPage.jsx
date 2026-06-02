import '../App.css';

function NewUserPage() { 
    return (
        <main className="new-user-page">
    <div className="ambient ambient-left" aria-hidden="true" />
    <div className="ambient ambient-right" aria-hidden="true" />


            <h1 className="newUserHeadline">Create Your Account</h1>
            <form className="new-user-form">
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" required />

                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" required />
                
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" required />

                <label htmlFor="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" required />
                <button type="submit">Create Account</button>
            </form>
        </main>
    );
}

export default NewUserPage;