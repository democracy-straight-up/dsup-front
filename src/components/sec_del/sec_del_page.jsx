import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
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
  const [dissolve, setDissolve] = useState(false);
  const [candidate, setCandidate] = useState("");
  const [members, setMembers] = useState("");
  const [vote_ins, setVote_ins] = useState([]);
  const [Iam_candidate, setIam_candidate] = useState(false);
  const [actionDone, setActionDone] = useState({});

  const [con_closed, setCon_closed] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [firstAttempt, setFirstAttempt] = useState(true);

  const ws_schame = window.location.protocol === "https:" ? "wss" : "ws";
  const url = `${ws_schame}://${process.env.REACT_APP_BASE_URL}/sec-del/${first_link?.code}/${AuthUser?.username}`;
  let chatSocket = new WebSocket(url);

  useEffect(() => {
    let countdownInterval;
    let reconnectTimeout;

    if (con_closed && !firstAttempt) {
      // Start the countdown only after the first connection attempt fails
      setErr(`Reconnecting in ${countdown}`);
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            clearInterval(countdownInterval); // Stop the countdown
            setErr("Connecting...");
            return 0;
          }
        });
      }, 1000);

      // Attempt to reconnect after the countdown ends
      reconnectTimeout = setTimeout(() => {
        tryReconnect();
      }, 5000);
    } else if (firstAttempt) {
      // On first load, try to connect immediately
      tryReconnect();
    }

    // Cleanup intervals and timeouts
    return () => {
      clearInterval(countdownInterval);
      clearTimeout(reconnectTimeout);
    };
  }, [con_closed, countdown, firstAttempt]);

  const tryReconnect = () => {
    chatSocket = new WebSocket(url);

    chatSocket.onmessage = function (e) {
      const data = JSON.parse(e.data);
      /**
       * all the messages that comes from this end point is the same.
       * it contains members
       */
      action_lists(data);
    };

    chatSocket.onopen = () => {
      console.log("WebSocket connected!");
      setCon_closed(false); // Stop reconnection attempts
      setErr(""); // Clear the message
      setFirstAttempt(false); // Mark the first attempt as completed
    };

    chatSocket.onclose = () => {
      console.log("WebSocket disconnected!");
      setCon_closed(true); // Trigger reconnection
      setCountdown(5); // Reset the countdown
    };

    chatSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setCon_closed(true); // Keep trying to reconnect
      setCountdown(5); // Reset the countdown
      setFirstAttempt(false); // Mark the first attempt as completed
    };
  };

  useEffect(() => {
    // on each member change, check if the Circle has one member.
    if (members.length <= 1 && candidate.length === 0) {
      setDissolve(true);
    } else {
      setDissolve(false);
    }

    // check if the authuser is not

    // set the iam_delegate and iam_member based on the members list
    if (members.length > 0) {
      const member = members.find((member) => member.user.username === AuthUser?.username);
      if (member) {
        if (member.is_delegate) {
          setIam_delegate(true);
        } else {
          setIam_delegate(false);
        }

        if (member.is_member) {
          setIam_member(true);
        }
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate, members]);

  const action_lists = (msg) => {
    // add the members and candidates on their states.
    setActionDone(msg.action);
    if (msg.status === "success") {
      if (msg.member_list) {
        // set the members and candidates
        // setSec_del(msg.member_list[0]?.first_link);
        dispatch(sec_del(msg.member_list[0]?.sec_del));

        const membersList = msg.member_list.filter((member) => member.is_member);
        const candidatesList = msg.member_list.filter((member) => !member.is_member);
        setMembers(membersList);
        setCandidate(candidatesList);
      }

      // check the msg.member_list to AuthUser.username, if not found, redirect to voter page
      const member = msg.member_list.find((member) => member.user.username === AuthUser?.username);
      if (member === undefined) {
        navigate("/voter-page");
      }

      if (msg?.action === "init") {
        if (msg?.vote_ins.length > 0) {
          setVote_ins(msg.vote_ins);
        }
      }
    }
    if (msg.action === "invite_key") {
      dispatch(sec_del(msg.f_link));
    }
    if (msg.action === "dissolve" && msg.status === "success") {
      navigate("/voter-page");
    }
  };

  // update or change the circle invitation key
  const invitationKey = () => {
    chatSocket.send(
      JSON.stringify({
        action: "invitationKey",
        payload: { f_link: first_link.code },
      })
    );
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
              {Iam_delegate ? (
                <th className="fw-bold">
                  {dissolve === true ? "Dissolve First Link? " : "Remove Member"}
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
                    key={index}
                    dissolve={dissolve}
                    index={index}
                    circleInfo={first_link}
                    member={member}
                    Iam_delegate={Iam_delegate}
                    chatSocket={chatSocket}
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
            {candidate?.length > 0 ? (
              candidate?.map((cand, index) => (
                <Candidate
                  actionDone={actionDone}
                  vote_ins={vote_ins}
                  chatSocket={chatSocket}
                  key={index}
                  index={index}
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
        circleInfo={first_link}
        candidate={candidate}
        members={members}></Status>
    </div>
  );
}

export default SecondDelegatePage;
