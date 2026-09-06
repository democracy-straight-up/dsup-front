import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { baseURL } from "../store/conf";

function UserActivate() {
  // get the uid and token
  const { uid, token } = useParams();
  const [message, setMessage] = useState(null);
  const [entryCode, setEntryCode] = useState(false);
  // sent the request to backend url for activation

  useEffect(() => {
    axios
      .get(
        `${window.location.protocol}//${baseURL}/api/activate/${uid}/${token}/`
      )
      .then((response) => {
        if (response.status === 200) {
          setMessage(true);
          setEntryCode(response.data.entry_code);
        }
      })
      .catch((error) => {
        setMessage(false);
      });
  }, [uid, token]);

  return (
    <div className="container">
              {message === null ? (
          <div className="mt-5 text-center">
            <p>Activating your account...</p>
          </div>
        ) : message === true ? (
          <div className="mt-5">
            <h3 className="text-success text-center">Congratulations</h3>
            <p className="text-center">
              Here is your unique entry code. Please write it down and save it
              somewhere safe, or memorize it. To Enter the Floor, you will also
              need to use the password you entered when you signed up.
            </p>
            <p className="text-center">
              <strong>{entryCode}</strong>
            </p>
            <br />
            <p className="text-center">
              <Link className="btn btn-primary" to="/enter-the-floor">
                Enter The Floor
              </Link>
            </p>
          </div>
        ) : (
          <div className="mt-5 text-center">
            <p className="text-danger">
              We could not activate your account with this link.
            </p>
            <Link to="/" className="btn btn-primary">
              Back to Home
            </Link>
          </div>
        )}
    </div>
  );
}
export default UserActivate;
