import { useState, useEffect } from "react";
export default function Candidate({ chatSocket, index, AuthUser, Iam_delegate, candidate }) {
  const [voted, setVoted] = useState(false);

  const VoteIn = () => {
    console.log("voting in...");
    chatSocket.send(
      JSON.stringify({
        action: "vote_in",
        candidate: candidate.id,
      })
    );
    console.log("voted in... saving the vote counts to the local storage");
    // add this vote instance to the voted list to the local stroge
    let voted = JSON.parse(localStorage.getItem("voted"));
    if (!voted) {
      voted = [];
    }
    voted.push(candidate.id);
    localStorage.setItem("voted", JSON.stringify(voted));
    setVoted(true);
    console.log("voted in... saved the vote counts to the local storage");
  };

  // on render check if the user has voted
  useEffect(() => {
    let voted = JSON.parse(localStorage.getItem("voted"));
    if (voted) {
      if (voted.includes(candidate.id)) {
        setVoted(true);
      }
    }
  }, [candidate.id]);

  const removeCadidate = () => {
    chatSocket.send(
      JSON.stringify({
        action: "remove_candidate",
        candidate: candidate.id,
      })
    );
    console.log("voted in... saving the vote counts to the local storage");
  };

  return (
    <tr>
      <td>{index + 1}</td>
      <td>{candidate?.user?.users?.legalName}</td>

      {AuthUser.username !== candidate.user.username ? (
        <td>
          <span className="mx-2">Yes</span>
          {!voted ? (
            <input
              type="checkbox"
              checked={voted}
              onChange={() => VoteIn()}
              className="form-check-input mx-3"
            />
          ) : null}
          <span className="alert alert-primary p-0 px-2">{candidate?.vote_in_count} votes</span>
        </td>
      ) : (
        <td></td>
      )}

      {/* check if the auth user is delegate to this circle */}
      {Iam_delegate ? (
        <td>
          Yes
          <input
            type="checkbox"
            checked={false}
            onChange={() => removeCadidate()}
            className="form-check-input mx-2"
          />
        </td>
      ) : (
        <td></td>
      )}
    </tr>
  );
}
