import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { authenticate, sec_del } from "../../store/userSlice.js";
import { baseURL } from "../../store/conf.js";

function JoinSecDel() {
  const AuthUser = useSelector((state) => state.AuthUser.user);
  const [inviteKey, setInviteKey] = useState("");
  const [message, setMessage] = useState({ type: "alert alert-", msg: "" });
  const [f_link, setFLink] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // F_link is being set and sending a msg to the live server
    if (f_link?.code > 1) {
      let ws_schame = window.location.protocol === "https:" ? "wss" : "ws";
      const url = `${ws_schame}://${process.env.REACT_APP_BASE_URL}/sec-del/${f_link.code}/${AuthUser.username}/`;
      const chatSocket = new WebSocket(url);

      chatSocket.onmessage = function (e) {
        const data = JSON.parse(e.data);
        /**
         * all the messages that comes from this end point is the same.
         * it contains members
         */
        if (data.status === "success") {
          console.log("closing the connection and redirecting to the first link page");
          chatSocket.close();
          // navigate("/first-link-page");
        }
        console.log("data from server: ", data);
      };

      chatSocket.onopen = () => {
        console.log("connected to the server");
        chatSocket.send(
          JSON.stringify({
            action: "join",
            payload: {
              voter: AuthUser.username,
              f_link: f_link.code,
            },
          })
        );
        console.log("joined the f-link");
        //
      };

      //
      // what happens on closing the connection
      chatSocket.onclose = (e) => {
        console.error("Chat socket closed unexpectedly", e);
      };
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f_link]);

  const handleJoin = () => {
    // get the access token and set the clicked to join

    if (AuthUser?.token.access.length > 0 && inviteKey?.length === 10) {
      let header = { Authorization: `Bearer ${AuthUser.token.access}` };
      const url = `${window.location.protocol}//${baseURL}/api/second-delegate-members/join_invite_key/`;
      const param = { user: AuthUser.username, inviteKey: inviteKey };
      axios
        .post(url, param, { headers: header })
        .then((response) => {
          if (response.status === 400) {
            setMessage({
              msg: response.data.message,
              type: "alert alert-danger",
            });
          } else if (response.status === 200) {
            // set the user and create a store for circle

            dispatch(sec_del(response.data[0].sec_del));
            setFLink(response.data[0].sec_del);

            let u = { ...AuthUser.users };
            let userType = "U2D1";
            let users = { ...u, userType };
            dispatch(authenticate({ ...AuthUser, users }));
            setMessage({
              type: "alert alert-success",
              msg: "Joint the f-link. wait for the members to aprove you. Redirecting to f-link...",
            });
          }
        })
        .catch((error) => {
          setMessage({
            msg: error.response.data.message,
            type: "alert alert-danger",
          });
        });
    }
  };

  const handleCreate = () => {
    console.log("creating first link and adding the member...");
    if (AuthUser?.token.access.length > 0) {
      // console.log("ceating a circle...")
      // constructing to request to create the first link
      let header = { Authorization: `Bearer ${AuthUser.token.access}` };
      const url = `${window.location.protocol}//${baseURL}/api/second-delegate/`;
      const param = {
        user: AuthUser.username,
        district: AuthUser.users.district.code,
      };

      axios
        .post(url, param, { headers: header })
        .then((response) => {
          console.log("res: ", response);
          if (response.status === 400) {
            setMessage({
              msg: response.data.message,
              type: "alert alert-danger",
            });
          } else if (response.status === 200) {
            // if the request was a succcess, set the sec_del state so that we need it in the next page (sec_del housekeeping page)
            dispatch(sec_del(response.data));

            // set the userType to 2 without requesting new data from the server.
            let u = { ...AuthUser.users };
            let userType = "U2D2";
            let users = { ...u, userType };
            dispatch(authenticate({ ...AuthUser, users }));
            setMessage({
              type: "alert alert-success",
              msg: "sec del created.",
            });

            //   after successfull operation of creating, settign datas and users, take the voter to first link page
            navigate("/first-link-page");
          } else {
            console.log("something went wrong:", response);
          }
        })
        .catch((error) => {
          setMessage({
            msg: error.response?.data?.message,
            type: "alert alert-danger",
          });
        });
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-12 col-md-3"></div>
        <div className="col-sm-12 col-md-6 mt-3">
          <h1 className="text-center">Join a F-Link</h1>
          <div className="">
            <h4 className="text-left">You must have an Invitation Key to join a F-Link.</h4>
            <p className="text-left">
              The First Delegate of a Sec-Del should send you an Invitation Key. This cannot be done
              via the website.
            </p>
            <p className="text-left">
              Or you can create your own F-Link and start inviting others to join it.
            </p>
            <div className="col text-center">
              <span onClick={handleCreate} className="btn btn-primary btn-sm mb-3">
                Create A F-Link
              </span>
            </div>
          </div>

          {message?.msg ? (
            <div className={message?.type} role="alert">
              {message?.msg}
            </div>
          ) : (
            ""
          )}

          <label className="text-left">invitation Key</label>
          <input
            type="text"
            onChange={(e) => setInviteKey(e.target.value)}
            className="form-control"
            placeholder="Enter the first link invitation key here"
          />
          <div className="col text-center">
            <button className="btn btn-success mt-2" onClick={handleJoin}>
              Join The F-Link
            </button>
          </div>
        </div>
        <div className="col-sm-12 col-md-3"></div>
      </div>
    </div>
  );
}

export default JoinSecDel;
