// import logo from './logo.svg';

import logo from "./CYS-Logo.png";
import { Link } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";

function Home() {
  const { AuthUser, isTokenExpired } = useAuth();

  const isRefreshTokenExpired = () => {
    try {
      // Check if AuthUser and token exist before accessing them
      if (!AuthUser?.token?.refresh) {
        return true;
      }
      return isTokenExpired(AuthUser.token.refresh);
    } catch (error) {
      // Failed to decode the token (e.g., invalid format)
      return true;
    }
  };

  return (
    <div className="container">
      <div className="row"></div>
      <div className="row mt-5">
        <div className="col-sm-12 col-md-4 col-lg-4 mt-4">
          <div className="container text-center ">
            <a href="/" className="row text-decoration-none text-dark">
              <img
                src={logo}
                alt="Democracy Straight Up"
                className="img-fluid mx-auto"
                style={{ maxWidth: "80%" }}
              />
            </a>
          </div>
        </div>

        <div className="col-sm-12 col-md-8 col-lg-8">
          <div className="text-center mt-5">
            <h2 className="my-4">Welcome to the Claim Your Seat Voting Portal</h2>
            <h3 className="my-4">Where the will of the people becomes the law of the land.</h3>
            <div className="text-center">
              <h4 className="text-secondary m-4">Start voting directly on federal legislation</h4>
              <div className="row">
                {isRefreshTokenExpired() === true ? (
                  <div className="row">
                    <div className="col col-sm-12 col-md-6 col-lg-6">
                      <OverlayTrigger
                        overlay={
                          <Tooltip>
                            <strong>Sign Up </strong>
                          </Tooltip>
                        }>
                        <Link
                          to="/claim-your-seat"
                          className="btn btn-md btn-primary m-3 text-decoration-none">
                          Claim Your Seat
                        </Link>
                      </OverlayTrigger>
                    </div>
                    <div className="col col-sm-12 col-md-6 col-lg-6">
                      <Link
                        to="/enter-the-floor"
                        className="btn btn-md btn-primary m-3 text-decoration-none">
                        Enter The Floor
                      </Link>
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
