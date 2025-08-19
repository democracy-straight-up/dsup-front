import { useState, useEffect } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import axios from "axios";
import { baseURL } from "../../../store/conf";

function Voting({ bill, AuthUser, onVoteUpdate }) {
  const [currentVote, setCurrentVote] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [message, setMessage] = useState({ type: "", msg: "" });
  const [voteCounts, setVoteCounts] = useState({
    national_counts: { yea: 0, nay: 0, present: 0, proxy: 0 },
    district_counts: { yea: 0, nay: 0, present: 0, proxy: 0 },
  });

  // Load current vote and vote counts
  useEffect(() => {
    if (bill?.id && AuthUser?.token?.access) {
      loadCurrentVote();
      loadVoteCounts();
    }
  }, [bill?.id, AuthUser?.token?.access]);

  const loadCurrentVote = async () => {
    try {
      const header = { Authorization: `Bearer ${AuthUser.token.access}` };
      const response = await axios.get(
        `${window.location.protocol}//${baseURL}/bill/bills/${bill.id}/my_vote/`,
        { headers: header }
      );
      setCurrentVote(response.data.your_vote);
    } catch (error) {
      console.error("Error loading current vote:", error);
    }
  };

  const loadVoteCounts = async () => {
    try {
      const header = { Authorization: `Bearer ${AuthUser.token.access}` };
      const response = await axios.get(
        `${window.location.protocol}//${baseURL}/bill/bills/${bill.id}/vote_counts/`,
        { headers: header }
      );
      setVoteCounts(response.data);
    } catch (error) {
      console.error("Error loading vote counts:", error);
    }
  };

  const handleVoteSubmit = async (voteValue) => {
    if (!AuthUser?.token?.access) return;

    setIsVoting(true);
    try {
      const header = { Authorization: `Bearer ${AuthUser.token.access}` };
      const response = await axios.post(
        `${window.location.protocol}//${baseURL}/bill/bills/${bill.id}/vote/`,
        { your_vote: voteValue },
        { headers: header }
      );

      setCurrentVote(voteValue);
      setMessage({
        type: "alert alert-success",
        msg: `Vote recorded successfully: ${response.data.vote_display}`,
      });

      // Reload vote counts
      await loadVoteCounts();

      // Call parent update function
      if (onVoteUpdate) {
        onVoteUpdate();
      }

      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: "", msg: "" }), 3000);
    } catch (error) {
      console.error("Error submitting vote:", error);
      setMessage({
        type: "alert alert-danger",
        msg: "Error submitting vote. Please try again.",
      });
    } finally {
      setIsVoting(false);
    }
  };

  const getVoteDisplayName = (vote) => {
    switch (vote) {
      case "Y":
        return "Yea";
      case "N":
        return "Nay";
      case "Pr":
        return "Present";
      case "Px":
        return "Proxy";
      default:
        return "Not Voted";
    }
  };

  const getVoteColorClass = (vote) => {
    switch (vote) {
      case "Y":
        return "text-success";
      case "N":
        return "text-danger";
      case "Pr":
        return "text-warning";
      case "Px":
        return "text-info";
      default:
        return "text-muted";
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Cast Your Vote</h5>
      </Card.Header>
      <Card.Body>
        {message.msg && (
          <Alert variant={message.type.includes("success") ? "success" : "danger"}>
            {message.msg}
          </Alert>
        )}

        <div className="row">
          <div className="col-md-6">
            <Form>
              <div className="d-grid gap-2">
                <Button
                  variant={currentVote === "Y" ? "primary" : "outline-secondary"}
                  onClick={() => handleVoteSubmit("Y")}
                  disabled={isVoting}
                  size="lg">
                  {isVoting && currentVote !== "Y" ? "Voting..." : "Yea"}
                </Button>

                <Button
                  variant={currentVote === "N" ? "primary" : "outline-secondary"}
                  onClick={() => handleVoteSubmit("N")}
                  disabled={isVoting}
                  size="lg">
                  {isVoting && currentVote !== "N" ? "Voting..." : "Nay"}
                </Button>

                <Button
                  variant={currentVote === "Pr" ? "primary" : "outline-secondary"}
                  onClick={() => handleVoteSubmit("Pr")}
                  disabled={isVoting}
                  size="lg">
                  {isVoting && currentVote !== "Pr" ? "Voting..." : "Present"}
                </Button>

                <Button
                  variant={currentVote === "Px" ? "primary" : "outline-secondary"}
                  onClick={() => handleVoteSubmit("Px")}
                  disabled={isVoting}
                  size="lg">
                  {isVoting && currentVote !== "Px" ? "Voting..." : "Proxy"}
                </Button>
              </div>
            </Form>
          </div>

          <div className="col-md-6 mt-2">
            {/* <h6>Vote Counts</h6> */}

            <div className="row">
              <div className="col-6">
                <strong>National Tally:</strong>
                <ul className="list-unstyled mt-2" style={{ display: "table" }}>
                  <li style={{ display: "table-row" }}>
                    <span style={{ display: "table-cell", paddingRight: "1rem" }}>Yea:</span>
                    <span className="badge bg-primary">{voteCounts.national_counts.yea}</span>
                  </li>
                  <li style={{ display: "table-row" }}>
                    <span style={{ display: "table-cell", paddingRight: "1rem" }}>Nay:</span>
                    <span className="badge bg-primary">{voteCounts.national_counts.nay}</span>
                  </li>
                  <li style={{ display: "table-row" }}>
                    <span style={{ display: "table-cell", paddingRight: "1rem" }}>Present:</span>
                    <span className="badge bg-primary">{voteCounts.national_counts.present}</span>
                  </li>
                  <li style={{ display: "table-row" }}>
                    <span style={{ display: "table-cell", paddingRight: "1rem" }}>Proxy:</span>
                    <span className="badge bg-primary">{voteCounts.national_counts.proxy}</span>
                  </li>
                </ul>
              </div>

              {voteCounts.district_counts && (
                <div className="col-6">
                  <strong>District Tally:</strong>
                  <ul className="list-unstyled mt-2" style={{ display: "table" }}>
                    <li style={{ display: "table-row" }}>
                      <span style={{ display: "table-cell", paddingRight: "1rem" }}>Yea:</span>
                      <span className="badge bg-primary">{voteCounts.district_counts.yea}</span>
                    </li>
                    <li style={{ display: "table-row" }}>
                      <span style={{ display: "table-cell", paddingRight: "1rem" }}>Nay:</span>
                      <span className="badge bg-primary">{voteCounts.district_counts.nay}</span>
                    </li>
                    <li style={{ display: "table-row" }}>
                      <span style={{ display: "table-cell", paddingRight: "1rem" }}>Present:</span>
                      <span className="badge bg-primary">{voteCounts.district_counts.present}</span>
                    </li>
                    <li style={{ display: "table-row" }}>
                      <span style={{ display: "table-cell", paddingRight: "1rem" }}>Proxy:</span>
                      <span className="badge bg-primary">{voteCounts.district_counts.proxy}</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default Voting;
