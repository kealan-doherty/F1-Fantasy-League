import '../App.css'


function LogIn() {
    return (
        <main className="new-user-page">
    <div className="ambient ambient-left" aria-hidden="true" />
    <div className="ambient ambient-right" aria-hidden="true" />

            <h1 className="newUserHeadline">Login In Here</h1>

            <form className="new-user-form">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" requied />

                <label htmlFor="password">Password</label>
                <input type ="password" id="password" name="password" required />

                <button type="forgotPassword"> Forgot Password? </button>

                <button type="submit">Submit</button>
            </form>

        </main>
    )
}

export default LogIn