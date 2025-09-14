export default function About() {
  return (
    <section className="page ledger-page">
      <div className="container-1120">
        <h1 className="title page-heading--nav">
          <span className="material-icons title-icon">info</span>
          About the Guild
        </h1>

        <p style={{ marginTop: 8 }}>
          Welcome to the Guild — a place where stories, gears, and glowing screens come together.
        </p>

        <p className="muted" style={{ marginTop: 6 }}>
          The Guild began as a simple idea: friends asking “What should we stream tonight?” and realizing the answer wasn’t so simple. Out of that question, StreamList was forged — a hub where movie lovers, series seekers, and curious explorers could chart their own adventures across film and television.
        </p>

        <div className="ornate-divider" />

        <h2 className="section-title" style={{ marginTop: 12 }}>
          <span className="material-icons">local_movies</span>
          What We Do
        </h2>
        <ul className="list">
          <li>
            <div>
              <strong>Build Watchlists:</strong> Keep track of what you’ve seen, what you loved, and what’s next on your journey.
            </div>
          </li>
          <li>
            <div>
              <strong>Discover Together:</strong> Search by actor, genre, or the latest releases — the Guild’s archives are always growing.
            </div>
          </li>
          <li>
            <div>
              <strong>Gather in the Lounge:</strong> Chat with fellow members, swap recommendations, and share what made you laugh, cry, or stay up way too late.
            </div>
          </li>
          <li>
            <div>
              <strong>Forge New Paths:</strong> With admin pages, curated picks, and ever-expanding features, the Guild keeps evolving.
            </div>
          </li>
        </ul>

        <h2 className="section-title" style={{ marginTop: 16 }}>
          <span className="material-icons">auto_awesome</span>
          Our Values
        </h2>
        <p className="muted">
          The Guild thrives on curiosity, collaboration, and creativity. We believe every member has a story worth sharing, and that the joy of watching is multiplied when experienced together.
        </p>

        <h2 className="section-title" style={{ marginTop: 16 }}>
          <span className="material-icons">vpn_key</span>
          How to Join
        </h2>
        <ul className="list">
          <li>
            <div>Register for an account.</div>
          </li>
          <li>
            <div>Create your first watchlist entry.</div>
          </li>
          <li>
            <div>Step into the Lounge and meet fellow explorers.</div>
          </li>
        </ul>
        <p className="muted" style={{ marginTop: 6 }}>
          From there, you’re part of the Guild — no secret handshakes required (though monocles and top hats are encouraged).
        </p>

        <h2 className="section-title" style={{ marginTop: 16 }}>
          <span className="material-icons">bolt</span>
          Our Motto
        </h2>
        <p style={{ fontStyle: "italic" }}>
          “No film unwatched, no story left untold.”
        </p>
      </div>
    </section>
  );
}
