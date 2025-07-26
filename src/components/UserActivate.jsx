import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import { baseURL } from "../store/conf";

function UserActivate() {
  // get the uid and token
  const { uid, token } = useParams();
  const [message, setMessage] = useState(false);
  const [entryCode, setEntryCode] = useState(false);
  // sent the request to backend url for activation

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

  return (
    <div className="container">
      <div className="row center">
        {/* {message === true? */}
        <div className="mt-5">
          <h3 className="text-success text-center">Congratulations </h3>
          <p className="text-center">
            Here is your unique entry code. Please write it down and save it
            somewhere safe, or memorize it. To Enter the Floor, you will also
            need to use the password you entered when you signed up.
          </p>
          <p className="text-center">
            <strong> {entryCode}</strong>
          </p>
          <br />
          <p className="text-center">
            <Link className="btn btn-primary" to="/enter-the-floor">
              {" "}
              Enter The Floor
            </Link>
          </p>
        </div>
        {/* : <>
                <p 
                className='text-center text-danger'> Activation link is invalid!</p>
                <div className="container text-center">
                <Link to='/'
                className='btn btn-primary'>Back to Home</Link>
                </div>
            </>
             }  */}
      </div>
    </div>
  );
}
export default UserActivate;
