import { useSelector, useDispatch } from "react-redux";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Member from "./member.jsx";
import Candidate from "./candidate.jsx";
import { sec_del } from "../../store/userSlice.js";
import Status from "./status_message.jsx";

function SecondDelegatePage() {
  const AuthUser = useSelector((state) => state.AuthUser.user);
  const first_link = useSelector((state) => state.AuthUser.sec_del);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [err, setErr] = useState("");
  const [Iam_delegate, setIam_delegate] = useState(false);
  const [Iam_member, setIam_member] = useState(false);
  const [Iam_candidate, setIam_candidate] = useState(false);
  const [dissolve, setDissolve] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [members, setMembers] = useState("");
  const [vote_ins, setVote_ins] = useState([]);
  const [actionDone, setActionDone] = useState({});
  const [vote_outs, setVote_outs] = useState([]);
  const [put_forwards, setPut_forwards] = useState([]);

  const [isConnecting, setIsConnecting] = useState(false); // Track connection attempt state
  const [isConnected, setIsConnected] = useState(false); // Track connection status
  // Use useRef to hold the WebSocket instance
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null); // To hold reconnect timeout ID

  // Define connection parameters - ensure they only trigger effect when they change
  const code = first_link?.code;
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

    const url = `${ws_scheme}://${baseUrl}/sec-del/${code}/${username}`;
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
        console.log("Parsed message data:");
        // !!! IMPLEMENT THIS FUNCTION !!!
        // action_lists(data);
        action_lists(data);
      } catch (error) {
        console.error("Failed to parse message data:", error);
      }
    };

    chatSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      // Don't set connecting false here, let onclose handle final state
      setErr("WebSocket error occurred.");
      // Note: onclose will usually be called immediately after onerror
    };

    chatSocket.onclose = (event) => {
      console.log("WebSocket closed! and event is: ", event.code, event.reason);
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

  const action_lists = (msg) => {
    // add the members and candidates on their states.
    setActionDone(msg.action);
    if (msg.action === "dissolve" && msg.status === "success") {
      navigate("/voter-page");
      return;
    }

    if (msg.status === "success") {
      if (msg.member_list) {
        // set the members and candidates
        // setSec_del(msg.member_list[0]?.first_link);
        dispatch(sec_del(msg.member_list[0]?.sec_del));

        // on each member change, check if the Circle has one member.
        if (msg.member_list.length <= 1) {
          setDissolve(true);
          console.log("eligible to Dissolve the first link...");
        } else {
          setDissolve(false);
        }

        // set the Iam_delegate and Iam_member based on the members list
        const instance = msg?.member_list?.find(
          (member) => member.user.username === AuthUser?.username
        );
        // check the msg.member_list to AuthUser.username, if not found, redirect to voter page
        if (instance === undefined) {
          navigate("/voter-page");
        }

        if (instance.is_delegate && instance.is_member) {
          setIam_member(false);
          setIam_candidate(false);
          setIam_delegate(true);
          console.log("i am delegate...");
        } else if (instance.is_member && !instance.is_delegate) {
          setIam_delegate(false);
          setIam_candidate(false);
          setIam_member(true);
          console.log("i am member...");
        } else if (!instance.is_member && !instance.is_delegate) {
          setIam_delegate(false);
          setIam_member(false);
          setIam_candidate(true);
          console.log("i am candidate...");
        }

        const membersList = msg.member_list.filter((member) => member.is_member);
        const candidatesList = msg.member_list.filter((member) => !member.is_member);
        setMembers(membersList);
        setCandidates(candidatesList.length > 0 ? [candidatesList[0]] : []);
      }

      if (msg?.action === "init") {
        if (msg?.vote_ins.length > 0) {
          setVote_ins(msg.vote_ins);
        }
        if (msg?.vote_outs?.length > 0) {
          setVote_outs(msg.vote_outs);
        }
        if (msg.put_forwards?.length > 0) {
          setPut_forwards(msg.put_forwards);
        }
      }
    }
    if (msg.action === "invitationKey") {
      dispatch(sec_del(msg.sec_del));
    }
  };

  // update or change the circle invitation key
  const invitationKey = () => {
    // 1. !! MOST IMPORTANT CHECK !!: Ensure the socket reference actually exists.
    //    If the ref is null, we definitely cannot send.
    if (!socketRef.current) {
      console.error(
        "Cannot send invitation key: WebSocket reference is missing (socketRef.current is null/undefined)."
      );
      // Log the isConnected state just for debugging context if needed
      console.log("(State check: isConnected was", isConnected, "when ref was null)");
      setErr("Cannot send: Connection is not available."); // Update UI feedback
      return; // Exit early - cannot proceed
    }

    // 2. Now that we know socketRef.current exists, check its readyState.
    if (socketRef.current.readyState === WebSocket.OPEN) {
      // 3. Check if the required payload data (`first_link.code`) exists
      const linkCode = first_link?.code;

      if (linkCode) {
        try {
          // 4. Send the message
          socketRef.current.send(
            JSON.stringify({
              action: "invitationKey",
              payload: { f_link: linkCode },
            })
          );
          console.log("Invitation key message sent successfully.");
          // setErr(""); // Optional: Clear error state on success
        } catch (error) {
          console.error("Failed to send invitation key message:", error);
          setErr("Error sending message. Please try again.");
        }
      } else {
        console.error("Cannot send invitation: Missing first_link.code.");
        setErr("Cannot send invitation: Required data is missing.");
      }
    } else {
      // 5. Handle cases where socket exists but is not OPEN
      //    This is the correct place to handle states like CONNECTING, CLOSING, CLOSED
      console.log(
        "Cannot send invitation key: WebSocket is not OPEN. Current state:",
        socketRef.current.readyState
      );
      setErr("Cannot send: Connection is not ready (State: " + socketRef.current.readyState + ").");
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-12 col-md-3"></div>
        <div className="col-sm-12 col-md-6 mt-3">
          <div className="row ">{err && <p className="text-danger text-center">{err}</p>}</div>

          <h1 className="text-center">Housekeeping Page</h1>
          <h3 className="text-center">
            First Link No: {first_link?.code} &nbsp;&nbsp; District:
            {first_link?.district.code}
          </h3>
          <h4 className="text-center">Invitation Key: {first_link?.invitation_key}</h4>

          {Iam_delegate ? (
            <button
              className="d-block mx-auto my-2 btn btn-success text-center"
              onClick={() => invitationKey()}>
              Generate new key
            </button>
          ) : null}

          {first_link?.is_active ? <p className="text-center">Circle Status: ACTIVE!</p> : null}
        </div>
        <div className="col-sm-12 col-md-3"></div>
      </div>
      <div className="row">
        <table className="table table-bordered ">
          <thead>
            <tr>
              <th className="fw-bold">#</th>
              <th className="fw-bold">Mamber Name</th>
              {first_link?.is_active ? (
                <>
                  <th className="fw-bold">Put forward as First Delegate</th>
                </>
              ) : null}
              {Iam_delegate || Iam_member ? (
                <th className="fw-bold">
                  {dissolve === true ? "Dissolve First Link? " : "Remove Member?"}
                </th>
              ) : (
                <th></th>
              )}
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
                    Iam_member={Iam_member}
                    circleInfo={first_link}
                    member={member}
                    Iam_delegate={Iam_delegate}
                    chatSocket={socketRef.current}
                    err={err}
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
              ) : (
                <th></th>
              )}
              {Iam_delegate ? <th className="fw-bold">Remove Candidate</th> : <th></th>}
            </tr>
          </thead>
          <tbody>
            {/**
             * check if the candidate list is greater than 0
             *
             */}
            {candidates?.length > 0 ? (
              candidates?.map((cand, index) => (
                <Candidate
                  actionDone={actionDone}
                  vote_ins={vote_ins}
                  chatSocket={socketRef.current}
                  key={index}
                  index={index}
                  Iam_member={Iam_member}
                  Iam_delegate={Iam_delegate}
                  candidate={cand}></Candidate>
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
      <Status
        Iam_candidate={Iam_candidate}
        Iam_delegate={Iam_delegate}
        Iam_member={Iam_member}
        circleInfo={first_link}
        candidates={candidates}
        members={members}></Status>
    </div>
  );
}

export default SecondDelegatePage;
