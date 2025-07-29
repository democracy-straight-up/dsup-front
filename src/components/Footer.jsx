import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="container">
      <div className="row my-3">
        <div className="col-12 col-md-6 text-center text-md-start">
          <p className="text-secondary">The Democracy, Straight-Up! Project </p>
        </div>
        <div className="col-12 col-md-6 text-center text-md-end">
          <Link to="/" className="mx-3 text-secondary d-inline-block">
            About
          </Link>
          <Link to="/" className="mx-3 text-secondary d-inline-block">
            Contact
          </Link>
          <Link to="/" className="mx-3 text-secondary d-inline-block">
            News
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
