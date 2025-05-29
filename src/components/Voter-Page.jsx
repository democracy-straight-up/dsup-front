import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import axios from "axios";
import { baseURL } from "../store/conf";
import { authenticate } from "../store/userSlice";
import { Container } from "react-bootstrap";

import BillsWrapper from "./voter_page_components/billsWrapper";
import UserCard from "./voter_page_components/user_card";
import Wrapper from "./voter_page_components/wrapper";
import ChainOfDelegate from "./voter_page_components/chain_delegate";

function VoterPage() {
  const AuthUser = useSelector((state) => state.AuthUser.user);
  const [message, setMessage] = useState({ type: "alert alert-", msg: "" });
  const dispatch = useDispatch();
  const circleMembers = useSelector((state) => state.AuthUser.circleMembers);
  const [delegate, setDelegate] = useState({});

  // set the delegate on render
  useEffect(() => {
    setDelegate(circleMembers?.filter((e) => e.is_delegate === true)[0]);
  }, [circleMembers]);

  // get the userinfo (the complete information about the voter.)
  useEffect(() => {
    if (AuthUser?.token.access.length > 0) {
      const url = `${window.location.protocol}//${baseURL}/api/userinfo/`;
      const params = { user: AuthUser.username };
      let header = { Authorization: `Bearer ${AuthUser?.token.access}` };
      axios
        .post(url, params, { headers: header })
        .then((response) => {
          if (response.status === 200) {
            let token = AuthUser.token;
            dispatch(authenticate({ ...response.data.user, token }));
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <ChainOfDelegate />
      </Container>
      <Container>
        <Wrapper />
      </Container>

      <BillsWrapper setMessage={() => setMessage()} />
    </div>
  );
}
export default VoterPage;
