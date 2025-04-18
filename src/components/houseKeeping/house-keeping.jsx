import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { circle, desolveCircle, authenticate, addCirclemMembers } from "../../store/userSlice.js";
import Member from "./member.jsx";
import Candidate from "./candidate.jsx";
import axios from "axios";
import Status from "./statusMessages.jsx";

function HouseKeeping() {
  const AuthUser = useSelector((state) => state.AuthUser.user);
  const circleInfo = useSelector((state) => state.AuthUser.circle);
  const [err, setErr] = useState("");
  const [connectionErr, setConnectionErr] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /** We have fDEl object which contains the details of FDel.
   * Iam_delegate is true if the auth user is a delegate.
   * Iam_member is true of the auth user is a member
   */
  const [fDel, setFDel] = useState("");
  const [Iam_delegate, setIam_delegate] = useState(false);
  const [Iam_member, setIam_member] = useState(false);
  const [dissolve, setDissolve] = useState(false);
  const [candidate, setCandidate] = useState("");
  const [members, setMembers] = useState("");
  const [Iam_candidate, setIam_candidate] = useState(false);
  const [actionDone, setActionDone] = useState({});
  const [vote_outs, setVote_outs] = useState([]);
  const [put_forwards, setPut_forwards] = useState([]);

  const [isConnecting, setIsConnecting] = useState(false); // Track connection attempt state
  const [isConnected, setIsConnected] = useState(false); // Track connection status
  // Use useRef to hold the WebSocket instance
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null); // To hold reconnect timeout ID

  // Define connection parameters - ensure they only trigger effect when they change
  const code = circleInfo?.code;
  const username = AuthUser?.username;
  const ws_scheme = window.location.protocol === "https:" ? "wss" : "ws";
  const baseUrl = process.env.REACT_APP_BASE_URL;

  // Effect for WebSocket connection management
  useEffect(() => {
    // Only attempt connection if we have the necessary details and aren't already connected/connecting
    if (!code || !username || !baseUrl || isConnected || isConnecting) {
      // Optional: set an error if connection can't be attempted due to missing info
      if (!code || !username || !baseUrl) {
        setErr("Missing connection details.");
      }
      return;
    }

    const url = `${ws_scheme}://${baseUrl}/circle/${circleInfo?.code}/${AuthUser?.username}`;
    setIsConnecting(true);
    setErr("Connecting...");

    // Create the WebSocket instance
    const chatSocket = new WebSocket(url);
    socketRef.current = chatSocket; // Store it in the ref

    chatSocket.onopen = () => {
      setIsConnected(true);
      setIsConnecting(false);
      setErr(""); // Clear connection status message
      // Clear any previous reconnect timer if connection succeeds
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      // Reset reconnect attempts logic if needed here
    };

    chatSocket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        console.log("Parsed message data:", data);
        // !!! IMPLEMENT THIS FUNCTION !!!
        // action_lists(data);
        MembersFilter(data);
      } catch (error) {
        console.error("Failed to parse message data:", error);
      }
    };

    chatSocket.onerror = (error) => {
      // Don't set connecting false here, let onclose handle final state
      setErr("WebSocket error occurred.");
      // Note: onclose will usually be called immediately after onerror
    };

    chatSocket.onclose = (event) => {
      setIsConnected(false);
      setIsConnecting(true);
      // socketRef.current = null; // Clear the ref
      // Prevent reconnect loops if the closure was clean/intended or essential params are missing
      if (!code || !username || !baseUrl || event.wasClean) {
        setErr("Disconnected. Connection closed cleanly.");
        return;
      }

      setErr("Disconnected. Attempting to reconnect in 5 seconds...");
      // Simple reconnect delay
      if (!reconnectTimerRef.current) {
        // Avoid setting multiple timers
        reconnectTimerRef.current = setTimeout(() => {
          setIsConnecting(true); // Trigger the effect again by changing state
          reconnectTimerRef.current = null; // Clear timer ID
        }, 5000);
      }
    };

    // Dependencies: The effect should re-run if connection details change, or if we need to trigger a reconnect attempt
  }, [code, username, baseUrl, ws_scheme, isConnecting]); // isConnecting is added to trigger reconnects

  // let ws_schame = window.location.protocol === "https:" ? "wss" : "ws";
  // const url = `${ws_schame}://${process.env.REACT_APP_BASE_URL}/circle/${circleInfo?.code}/${AuthUser?.username}`;
  // const chatSocket = new WebSocket(url);

  useEffect(() => {
    // on each member change, check if the Circle has one member.
    if (members.length <= 1 && candidate.length === 0) {
      setDissolve(true);
    } else {
      setDissolve(false);
    }
  }, [candidate, members]);

  useEffect(() => {
    // if(members?.length > 5){
    // check for circle endpoint to update
    // getting the update of circle as it has become active.
    const circleURL = `${window.location.protocol}//${process.env.REACT_APP_BASE_URL}/api/circle/${circleInfo?.id}/`;
    let header = { Authorization: `Bearer ${AuthUser.token.access}` };
    axios
      .get(circleURL, { headers: header })
      .then((response) => {
        dispatch(circle(response.data));
      })
      .catch((err) => console.log(err));
    // }
  }, [members]);

  // Function to update the error state and schedule the reset
  // useEffect(() => {
  //   // Schedule the reset after 5000 milliseconds (5 seconds)
  //   timout_id = setTimeout(() => {
  //     setErr("");
  //   }, 10000);
  // }, [err]);

  const MembersFilter = (data) => {
    /** This function gets called on each message being sent from server
     * it saperate the delegate, members and candidates and sets their state
     */
    // if the new data being received is invitation key change,
    // update the circle global state and return nothing to stop the function
    // keep the action being done and send it to child compoments
    setActionDone(data.action);

    if (data.action === "invitationKey") {
      dispatch(circle(data.circle));
      return;
    }
    if (data.action === "dissolve" && data.status === "success") {
      dispatch(desolveCircle());
      // set the userType to 0 and reset AuthUser
      let u = { ...AuthUser };
      u.userType = "U0D0";
      dispatch(authenticate(u));
      // navigate back to voter page
      navigate("/voter-page");
    }

    if (data.status === "success") {
      // on each members and candidate changes, check if the auth user is inside the list!
      // if not, redirect to the voter page.

      if (!data.member_list?.find((member) => member.user.username === AuthUser.username)) {
        setErr("You have been removed fron this circle. Taking you back to your voter page.");
        navigate("/voter-page");
      }

      // set the vote_outs and put_forwards. the first load of the socket data has a init action type.
      if (data?.action === "init") {
        if (data?.vote_outs.length > 0) {
          setVote_outs(data.vote_outs);
        }
        if (data.put_forwards.length > 0) {
          setPut_forwards(data.put_forwards);
        }
      }
      /**
       * set Iam_candidate or Iam_member to true based on AuthUser and is_member
       * and set Iam_delegate to true based on AuthUser and is_delegate
       */
      setIam_delegate(
        data.member_list?.find((member) => member.user.username === AuthUser.username)?.is_delegate
      );
      setIam_member(
        data.member_list?.find((member) => member.user.username === AuthUser.username)?.is_member
      );
      setIam_candidate(
        data.member_list?.find((member) => member.user.username === AuthUser.username)?.is_member ==
          false
      );

      /** set the fDel, candidate list and memebers list on each new message.
       * these new messages can come from joining a circle, vote in , vote out and ...
       * basically any changes to the circle can send back the list of members
       */
      setMembers(data.member_list?.filter((member) => member.is_member));
      setFDel(data.member_list?.find((member) => member.is_delegate));
      setCandidate(data.member_list?.filter((member) => !member.is_member));

      // this is circle members list is only for global state to use elsewhere.
      dispatch(addCirclemMembers(data.member_list?.filter((member) => member.is_member)));
    }
    if (data.status === "error") {
      /** if the auth user is the same as user on error message:
       * set the error state to show to the user.
       */
      setErr(data.message);
      //   if (data.user.username === AuthUser.username) {
      //   }
    }
  };

  // update or change the circle invitation key
  const invitationKey = () => {
    // 1. !! MOST IMPORTANT CHECK !!: Ensure the socket reference actually exists.
    //    If the ref is null, we definitely cannot send.
    if (!socketRef.current) {
      setErr("Cannot send: Connection is not available."); // Update UI feedback
      return; // Exit early - cannot proceed
    }

    // 2. Now that we know socketRef.current exists, check its readyState.
    if (socketRef.current.readyState === WebSocket.OPEN) {
      // 3. Check if the required payload data (`first_link.code`) exists
      const circleCode = circleInfo?.code;

      if (circleCode) {
        try {
          // 4. Send the message
          socketRef.current.send(
            JSON.stringify({
              action: "invitationKey",
              payload: { circle: circleCode },
            })
          );
          // setErr(""); // Optional: Clear error state on success
        } catch (error) {
          setErr("Error sending message. Please try again.");
        }
      } else {
        setErr("Cannot send invitation: Required data is missing.");
      }
    } else {
      setErr("Cannot send: Connection is not ready (State: " + socketRef.current.readyState + ").");
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-12 col-md-3"></div>
        <div className="col-sm-12 col-md-6 mt-3">
          <div className="row">
            {err ? (
              <div className="alert alert-danger" role="alert">
                {err}{" "}
              </div>
            ) : null}
            {connectionErr ? (
              <div className="alert alert-danger" role="alert">
                {connectionErr}{" "}
              </div>
            ) : null}
          </div>
          <h1 className="text-center">Housekeeping Page</h1>
          <h3 className="text-center">
            Circle {circleInfo?.district.code}-{circleInfo?.code}
          </h3>
          <h4 className="text-center">Invitation Key: {circleInfo?.invitation_code}</h4>

          {fDel?.user?.username === AuthUser?.username ? (
            <button
              className="d-block mx-auto my-2 btn btn-success text-center"
              onClick={() => invitationKey()}>
              Generate new key
            </button>
          ) : null}

          {circleInfo?.is_active ? <p className="text-center">Circle Status: ACTIVE!</p> : null}
        </div>
        <div className="col-sm-12 col-md-3"></div>
      </div>
      <div className="row">
        <table className="table table-bordered ">
          <thead>
            <tr>
              <th className="fw-bold">#</th>
              <th className="fw-bold">Member Name</th>
              {circleInfo?.is_active ? (
                <>
                  <th className="fw-bold">Put forward as First Delegate</th>
                </>
              ) : null}
              {Iam_delegate ? <th className="fw-bold">Remove Member</th> : <th></th>}
            </tr>
          </thead>
          <tbody>
            {/**
             * It will always be 1 at least.
             * first check if the members is greater than 0.
             *  */}
            {members?.length > 0
              ? members?.map((member, index) => (
                  <Member
                    actionDone={actionDone}
                    vote_outs={vote_outs}
                    put_forwards={put_forwards}
                    key={index}
                    dissolve={dissolve}
                    index={index}
                    circleInfo={circleInfo}
                    member={member}
                    chatSocket={socketRef?.current}
                    err={err}
                    Iam_member={Iam_member}
                    Iam_delegate={Iam_delegate}
                  />
                ))
              : null}
          </tbody>
        </table>

        {/* candidate list table */}
        <p className="py-0 my-0 mt-2">Candidate(s) awaiting votes...</p>
        <table className="table table-bordered ">
          <thead>
            <tr>
              <th className="fw-bold">#</th>
              <th className="fw-bold">Candidate Name</th>
              {Iam_delegate || Iam_member ? (
                <th className="fw-bold">Do you want this candidate to be a member?</th>
              ) : null}
              {Iam_delegate ? <th className="fw-bold">Remove Candidate</th> : null}
            </tr>
          </thead>
          <tbody>
            {/**
             * check if the candidate list is greater than 0
             *
             */}
            {candidate?.length > 0 ? (
              candidate?.map((cand, index) => (
                <Candidate
                  chatSocket={socketRef?.current}
                  key={index}
                  index={index}
                  Iam_member={Iam_member}
                  Iam_delegate={Iam_delegate}
                  candidate={cand}
                  fDel={fDel}></Candidate>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No Candidates
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* status messages */}
      <Status></Status>
    </div>
  );
}

export default HouseKeeping;
