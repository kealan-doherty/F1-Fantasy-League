import './App.css'

function App() {
  return (
    <main className="home-page">
      <div className="ambient ambient-left" aria-hidden="true" />
      <div className="ambient ambient-right" aria-hidden="true" />

      <header className="hero">
        <p className="season-pill">Season 2026</p>
        <h1 className="headline">Own The Grid. Build Your Fantasy Legacy.</h1>
        <p className="subhead">
          Pick two drivers and one constructor, then race your friends through every
          grand prix weekend.
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="/newUser.html">Create Account</a>
          <a className="button button-secondary" href="/returningUser.html">Sign In</a>
        </div>
      </header>

      <section className="panel">
        <h2 className="section-title">Scoring Snapshot</h2>
        <div className="points-grid">
          <article className="card">
            <p className="card-label">Race Winner</p>
            <p className="card-value">+25 pts</p>
            <p className="card-footnote">Big gains start at the top step.</p>
          </article>
          <article className="card">
            <p className="card-label">Top Three</p>
            <p className="card-value">25 / 18 / 15</p>
            <p className="card-footnote">Stack reliable podium finishers.</p>
          </article>
          <article className="card">
            <p className="card-label">Full Top Ten</p>
            <p className="card-value">Points To P10</p>
            <p className="card-footnote">Every position can decide the league.</p>
          </article>
        </div>
      </section>

      <section className="panel timeline">
        <h2 className="section-title">Weekly Flow</h2>
        <div className="timeline-row">
          <div className="timeline-step">
            <p className="step-day">Friday</p>
            <p className="step-text">Lock your lineup before the weekend starts.</p>
          </div>
          <div className="timeline-step">
            <p className="step-day">Sunday</p>
            <p className="step-text">Race results settle your fantasy points.</p>
          </div>
          <div className="timeline-step">
            <p className="step-day">Monday</p>
            <p className="step-text">Standings refresh and the chase continues.</p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
