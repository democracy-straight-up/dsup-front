import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { baseURL } from "../store/conf";
import { circle, authenticate, sec_del } from "../store/userSlice";
import jwtDecode from "jwt-decode";
import { Container } from "react-bootstrap";

import BillsWrapper from "./voter_page_components/billsWrapper";
import UserCard from "./voter_page_components/user_card";
import Wrapper from "./voter_page_components/wrapper";

function VoterPage() {
  const AuthUser = useSelector((state) => state.AuthUser.user);
  const [message, setMessage] = useState({ type: "alert alert-", msg: "" });
  const [token, setToken] = useState("");
  const [action, setAction] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const circleMembers = useSelector((state) => state.AuthUser.circleMembers);
  const [delegate, setDelegate] = useState({});
  let date = new Date(AuthUser.date_joined);

  // set the delegate on render
  useEffect(() => {
    setDelegate(circleMembers?.filter((e) => e.is_delegate === true)[0]);
  }, [circleMembers]);

  // get the new access token on each page load or redirect
  useEffect(() => {
    const TokenUrl = `${window.location.protocol}//${baseURL}/api/token/refresh/`;
    const token_params = { refresh: AuthUser.token.refresh };
    axios
      .post(TokenUrl, token_params)
      .then((response) => {
        if (response.status === 200) {
          // set the new access token and which btn is clicked via clicked const.
          setToken(response.data.access);
          let u = { ...AuthUser };
          u.token = {
            refresh: AuthUser.token.refresh,
            access: response.data.access,
          };
          dispatch(authenticate(u));
          setAction("userinfo");
        } else {
          setMessage({
            type: "alert alert-danger",
            msg: "could not get access token",
          });
        }
      })
      .catch((error) => {
        setMessage({
          type: "alert alert-danger",
          msg: "something went wrong with your request",
        });
        // setErr("Something went wrong. Check your inputs and try again.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    switch (action) {
      // if no action is specified, fetch user info and circle
      case "userinfo":
        if (AuthUser.token.access.length > 0) {
          const url = `${window.location.protocol}//${baseURL}/api/userinfo/`;
          const params = { user: AuthUser.username };
          let header = { Authorization: `Bearer ${AuthUser.token.access}` };
          axios
            .post(url, params, { headers: header })
            .then((response) => {
              if (response.status === 200) {
                let token = AuthUser.token;
                dispatch(authenticate({ ...response.data.user, token }));
                if (response.data.user.users.userType.substring(0, 2) === "U1") {
                  console.log("user is a circle member");
                  // dispatch(circle(response.data.circle));
                }
              } else {
                setMessage({
                  type: "alert alert-danger",
                  msg: "could not get user info and circle",
                });
              }
            })
            .catch((error) => {
              console.log("error on fetching user and circle info:", error);
            });
        }
        break;
      case "joinPd":
        console.log("joining a circle here");
        break;
      default:
        console.log("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action]);

  useEffect(() => {
    const isTokenExpired = () => {
      const decodedToken = jwtDecode(AuthUser.token.refresh);
      return decodedToken.exp < Date.now() / 1000;
    };

    if (isTokenExpired()) {
      navigate("/enter-the-floor");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // get the detials of f_link if the f_link (sec_del) state is not found
  useEffect(() => {
    if (sec_del.code === undefined && AuthUser?.users?.userType.substring(0, 2) === "U2") {
      // get the f_link details.
      let header = { Authorization: `Bearer ${AuthUser.token.access}` };
      const url = `${window.location.protocol}//${baseURL}/api/second-delegate/get_f_link_by_user/`;
      const param = {
        user: AuthUser.username,
      };

      axios
        .post(url, param, { headers: header })
        .then((response) => {
          dispatch(sec_del(response.data));
        })
        .catch((error) => {
          console.log("error getting f_link details...:", error);
        });
    }
  }, []);

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          {message?.msg ? (
            <div className={message?.type} role="alert">
              {message?.msg}
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
      <div className="row text-center ">
        <h1>Voter Page</h1>
      </div>
      <Container>
        <UserCard />
      </Container>
      <Container>
        <Wrapper />
      </Container>

      <BillsWrapper setMessage={() => setMessage()} />
    </div>
  );
}
export default VoterPage;
