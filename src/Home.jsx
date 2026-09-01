import { Link } from "react-router-dom";
import pigLogo from "./DSUp-Pig-Logo.png";
import chairLogo from "./CYS-Logo.png";
import "./Home.css";

function Home() {
  return (
    <div className="cys-home">
      <div className="cys-topbar">
        <a
          className="cys-project-link"
          href="https://straightupdemocracy.org"
          target="_blank"
          rel="noreferrer"
        >
          The Democracy, Straight-Up! Project
        </a>

        <a className="cys-what-link" href="#">
          What is this?
        </a>
      </div>

      <main className="cys-main">
        <div className="cys-kicker">
          Vote Directly on Federal Legislation
        </div>

        <section className="cys-hero">
          <div className="cys-logo-box">
            <img src={pigLogo} alt="Democracy Straight-Up pig logo" />
          </div>

          <div className="cys-intro">
            <h1>The Claim Your Seat Voting Portal</h1>

            <h2>Put the Voters in Charge!</h2>

            <p>
              This portal enables the eligible voters of a U.S. congressional
              district to organize their own Directly-connected Legislature
              (DcL). Voters can decide bills directly or through their chosen
              delegates. The district can then elect a member of its own DcL
              to Congress through the normal electoral process, pledged to
              vote bill by bill according to the voters’ instructions.
            </p>

            <div className="cys-diesel">
              We call it a “diesel” because it is the engine of democracy.
              For the full explanation, visit{" "}
              <a
                href="https://straightupdemocracy.org"
                target="_blank"
                rel="noreferrer"
              >
                StraightUpDemocracy.org
              </a>.
            </div>
          </div>

          <div className="cys-logo-box">
            <img src={chairLogo} alt="Claim Your Seat chair logo" />
          </div>
        </section>

        <section className="cys-actions">
          <div className="cys-action-card cys-primary-card">
            <div className="cys-card-label">Sign Up</div>

            <h2>Claim Your Seat</h2>

            <p>
              There is already a seat in your Directly-connected Legislature
              with your name on it. Claim it and cast your Straight-Up vote
              on bills before Congress.
            </p>

            <Link className="cys-button cys-primary-button" to="/claim-your-seat">
              Claim Your Seat
            </Link>
          </div>

          <div className="cys-action-card">
            <div className="cys-card-label">Sign In</div>

            <h2>Enter the Floor</h2>

            <p>
              If you have already claimed your seat and have your entry code,
              enter the floor of your district’s Directly-connected Legislature.
            </p>

            <Link className="cys-button cys-secondary-button" to="/enter-the-floor">
              Enter the Floor
            </Link>
          </div>
        </section>

        <section className="cys-clarification">
          <strong>Important clarification</strong>

          <p>
            The Claim Your Seat Voting Portal is operated by The Democracy,
            Straight-Up! Project, a tax-exempt 501(c)(3) nonprofit
            organization. It is not a government website and is not affiliated
            with the U.S. government or any other government. Votes cast here
            are Straight-Up votes and are not official votes of Congress.
          </p>
        </section>

        <section className="cys-mobile-note">
          <strong>Desktop only for now</strong>

          <p>
            This version of the portal is currently designed for desktop use.
            A mobile version is in development.
          </p>

          <a
            href="https://straightupdemocracy.org"
            target="_blank"
            rel="noreferrer"
          >
            Support Mobile Development
          </a>
        </section>
      </main>
    </div>
  );
}

export default Home;