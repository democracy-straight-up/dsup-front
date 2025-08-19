import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { baseURL } from "../../store/conf";
import Form from "react-bootstrap/Form";

function BillItem({ bill, index, onVoteUpdate }) {
  const AuthUser = useSelector((state) => state.AuthUser.user);
  const [isVoting, setIsVoting] = useState(false);

  // Helper function to render advisement badge
  const renderAdvisement = (advisement) => {
    if (advisement === undefined || advisement === null) {
      return <span className="alert alert-secondary p-0 px-2 mx-1">N/A</span>;
    }
    return advisement ? (
      <span className="alert alert-success p-0 px-2 mx-1">Yea</span>
    ) : (
      <span className="alert alert-danger p-0 px-2 mx-1">Nay</span>
    );
  };

  // Handle vote submission
  const handleVoteChange = async (voteValue) => {
    if (!AuthUser?.token?.access) return;

    setIsVoting(true);
    try {
      const header = { Authorization: `Bearer ${AuthUser.token.access}` };
      const response = await axios.post(
        `${window.location.protocol}//${baseURL}/bill/bills/${bill.id}/vote/`,
        { your_vote: voteValue },
        { headers: header }
      );

      // Call parent function to refresh bill data
      if (onVoteUpdate) {
        onVoteUpdate();
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <tr key={index}>
      <td>{bill.number}</td>
      <td style={{ minWidth: "250px" }}>{bill.title} </td>
      <td>{bill.schedule_date}</td>
      <td style={{ minWidth: "180px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>F-Del</span>
          <span>{renderAdvisement(bill.advisements?.first_delegate?.advisement)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Sec-Del</span>
          <span>{renderAdvisement(bill.advisements?.second_delegate?.advisement)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>MoDA</span>
          <span>{renderAdvisement(bill.advisements?.moda?.advisement)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>HoLC</span>
          <span>{renderAdvisement(bill.advisements?.holc?.advisement)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>House Rep</span>
          <span>{renderAdvisement(bill.advisements?.house_rep?.advisement)}</span>
        </div>
      </td>

      <td>
        <Form>
          <Form.Check
            inline
            label="Yea"
            name={`vote_${bill.id}`}
            type="radio"
            id={`${bill.id}_yea`}
            checked={bill.user_vote === "Y"}
            onChange={() => handleVoteChange("Y")}
            disabled={isVoting}
          />
          <br />
          <Form.Check
            inline
            label="Nay"
            name={`vote_${bill.id}`}
            type="radio"
            id={`${bill.id}_nay`}
            checked={bill.user_vote === "N"}
            onChange={() => handleVoteChange("N")}
            disabled={isVoting}
          />
          <br />
          <Form.Check
            inline
            label="Present"
            name={`vote_${bill.id}`}
            type="radio"
            id={`${bill.id}_present`}
            checked={bill.user_vote === "Pr"}
            onChange={() => handleVoteChange("Pr")}
            disabled={isVoting}
          />
          <br />
          <Form.Check
            inline
            label="Proxy"
            name={`vote_${bill.id}`}
            type="radio"
            id={`${bill.id}_proxy`}
            checked={bill.user_vote === "Px"}
            onChange={() => handleVoteChange("Px")}
            disabled={isVoting}
          />
          {isVoting && <div className="text-muted">Updating...</div>}
        </Form>
      </td>

      <td>
        <span className="border border-dark px-5">{bill.district_yea_votes_count || 0}</span>
        <br />
        <span className="border border-dark px-5">{bill.district_nay_votes_count || 0}</span>
        <br />
        <span className="border border-dark px-5">{bill.district_present_votes_count || 0}</span>
        <br />
        <span className="border border-dark px-5">{bill.district_proxy_votes_count || 0}</span>
        <br />
      </td>
      <td>
        <span className="border border-dark px-5">{bill.yea_votes_count}</span>
        <br />
        <span className="border border-dark px-5">{bill.nay_votes_count}</span>
        <br />
        <span className="border border-dark px-5">{bill.present_votes_count}</span>
        <br />
        <span className="border border-dark px-5">{bill.proxy_votes_count}</span>
        <br />
      </td>
      <td>
        <Link to={`/bill/${bill.id}`}> Advisement & More </Link>
      </td>
    </tr>
  );
}

export default BillItem;
