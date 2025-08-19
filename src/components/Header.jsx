import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Dropdown from "react-bootstrap/Dropdown";
import "bootstrap-icons/font/bootstrap-icons.css";

function Header() {
  const { AuthUser, handleLogout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg bg-light">
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold fs-4">
          DSUp
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className="collapse navbar-collapse"
          id="navbarSupportedContent"
          data-toggle="collapse"
          data-target=".navbar-collapse">
          <ul className="navbar-nav ms-auto">
            {AuthUser ? (
              <li className="nav-item">
                <Link
                  style={{
                    borderRadius: "8px",
                    transition: "background-color 0.3s, color 0.3s",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "#0d6efd"; // Blue background on hover
                    e.target.style.color = "#ffffff"; // White text on hover
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = ""; // Revert background on mouse out
                    e.target.style.color = ""; // Revert text color on mouse out
                  }}
                  to="/voter-page"
                  className="nav-link fs-5 px-3 py-1"
                  aria-current="page">
                  My Voter Page
                </Link>
              </li>
            ) : (
              ""
            )}
            <li className="nav-item">
              {AuthUser ? (
                <Link
                  to="/search"
                  className="nav-link fs-5 mx-1 px-3 py-1"
                  style={{
                    borderRadius: "8px",
                    transition: "background-color 0.3s, color 0.3s",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "#0d6efd"; // Blue background on hover
                    e.target.style.color = "#ffffff"; // White text on hover
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = ""; // Revert background on mouse out
                    e.target.style.color = ""; // Revert text color on mouse out
                  }}>
                  Search and Sort Bills
                </Link>
              ) : null}
            </li>
            <li className="nav-item px-3">
              {!AuthUser ? (
                <Link
                  to="/enter-the-floor"
                  className="nav-link fs-5 px-3 py-1"
                  style={{
                    borderRadius: "8px",
                    transition: "background-color 0.3s, color 0.3s",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "#0d6efd"; // Blue background on hover
                    e.target.style.color = "#ffffff"; // White text on hover
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = ""; // Revert background on mouse out
                    e.target.style.color = ""; // Revert text color on mouse out
                  }}>
                  Enter The Floor
                </Link>
              ) : (
                ""
              )}
            </li>

            <Dropdown>
              <Dropdown.Toggle className="">
                <i className="bi bi-gear"> </i> Settings
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item href="#">Help</Dropdown.Item>
                <Dropdown.Item href="#">Settings</Dropdown.Item>
                {AuthUser && (
                  <Dropdown.Item href="#">
                    <span onClick={handleLogout}>Logout</span>
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;
