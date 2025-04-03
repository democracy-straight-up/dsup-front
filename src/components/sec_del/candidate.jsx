import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

export default function Candidate({
  chatSocket,
  index,
  vote_ins,
  actionDone,
  Iam_delegate,
  candidate,
}) {
  const AuthUser = useSelector((state) => state.AuthUser.user);
  const [voted_in, setVoted_in] = useState(false);

  useEffect(() => {
    switch (actionDone?.action) {
      case "vote_in":
        if (
          actionDone?.instance.candidate === candidate?.id &&
          actionDone?.user.id === AuthUser?.id
        ) {
          setVoted_in(true);
        }
        break;
      default:
        console.log();
    }
  }, [actionDone]);

  useEffect(() => {
    // go through the vote_outs and put_forwards and check if the member is in the list
    // if the member is in the list then set the value to true.
    vote_ins?.map((vote) => {
      if (vote.candidate === candidate?.id && vote.voter === AuthUser?.id) {
        setVoted_in(true);
      }
    });
  }, []);

  const VoteIn = () => {
    chatSocket.send(
      JSON.stringify({
        action: "vote_in",
        payload: {
          voter: AuthUser?.username,
          candidate: candidate.id,
        },
      })
    );
  };

  const removeCadidate = () => {
    chatSocket.send(
      JSON.stringify({
        action: "remove_candidate",
        candidate: candidate.id,
      })
    );
  };

  return (
    <tr>
      <td>{index + 1}</td>
      <td>{candidate?.user?.users?.legalName}</td>

      {AuthUser.username !== candidate.user.username ? (
        <td>
          {!voted_in && (
            <>
              <div className="col">
                <span className="">Yes</span>
                <input
                  checked={voted_in}
                  type="checkbox"
                  className="form-check-input mx-2 "
                  onChange={() => VoteIn()}
                />
              </div>

              <span className="alert alert-primary p-0 px-2">
                Total Votes: {candidate?.count_vote_in}
              </span>
            </>
          )}
          {voted_in && (
            <span>
              {candidate.count_vote_in > "1" ? (
                <p>You and {candidate?.count_vote_in} have voted. </p>
              ) : (
                <p>You have voted.</p>
              )}
            </span>
          )}
        </td>
      ) : (
        <td></td>
      )}

      {/* check if the auth user is delegate to this circle */}
      {Iam_delegate ? (
        <td>
          {!voted_in && (
            <>
              Yes
              <input
                type="checkbox"
                checked={false}
                onChange={() => removeCadidate()}
                className="form-check-input mx-2"
              />
            </>
          )}
        </td>
      ) : (
        <td></td>
      )}
    </tr>
  );
}
