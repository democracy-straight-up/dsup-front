import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { baseURL } from "../../store/conf";
import { circle, authenticate } from "../../store/userSlice";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function VoterCard() {
  const AuthUser = useSelector((state) => state.AuthUser.user);
  const [message, setMessage] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const CreateCircle = () => {
    if (AuthUser?.token?.access.length > 0) {
      let header = { Authorization: `Bearer ${AuthUser?.token?.access}` };
      const url = `${window.location.protocol}//${baseURL}/api/create-circle/`;
      const param = {
        user: AuthUser.username,
        district: AuthUser.users.district.code,
      };
      axios
        .post(url, param, { headers: header })
        .then((response) => {
          if (response.status === 400) {
            setMessage({
              msg: response.data.message,
              type: "alert alert-danger",
            });
          } else if (response.status === 200) {
            dispatch(circle(response.data));
            let u = { ...AuthUser };
            u.userType = "U1D1";
            dispatch(authenticate(u));
            setMessage({
              type: "alert alert-success",
              msg: "circle created.",
            });
            // nagivate to voter page...
            navigate("/house-keeping-page");
          } else {
            console.log("something went wrong:", response);
          }
        })
        .catch((error) => {
          console.log("err: ", error);
          setMessage({
            msg: error.response?.data?.message,
            type: "alert alert-danger",
          });
        });
    }
  };
  return (
    <div className="container">
      <div className="row text-center">
        <div className="col-sm-12 col-md-2"></div>
        <div className="col-sm-12 col-md-4">
          <Link to={"/join-circle"} className="btn btn-success m-2">
            Join a Circle
          </Link>
        </div>
        <div className="col-sm-12 col-md-4">
          <button onClick={CreateCircle} className="btn btn-success m-2">
            Create a Circle
          </button>
        </div>
        <div className="col-sm-12 col-md-2"></div>
      </div>
    </div>
  );
}
