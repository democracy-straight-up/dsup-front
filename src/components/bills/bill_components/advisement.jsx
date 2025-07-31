import { useEffect, useState } from "react";
import axios from "axios";
import { baseURL } from "../../../store/conf";
import { useChainOfDelegation } from "../../../hooks/useChainOfDelegation";

function Advisement({ bill, AuthUser, advisementType, title }) {
  const [advisement, setAdvisement] = useState(null);
  const [existingAdvisement, setExistingAdvisement] = useState(null);
  const [message, setMessage] = useState({ type: "", msg: "" });

  // Use chain of delegation hook for proper authorization
  const { isFDel, isSDel, isModa, isHolc, isHouseRep } = useChainOfDelegation();

  // Determine if user is authorized for this advisement type
  const isAuthorized = () => {
    switch (advisementType) {
      case "FD":
        return isFDel;
      case "SD":
        return isSDel;
      case "MD":
        return isModa;
      case "HL":
        return isHolc;
      case "HR":
        return isHouseRep;
      default:
        return false;
    }
  };

  // Get existing advisements for this bill
  useEffect(() => {
    if (!AuthUser || !advisementType || !bill?.id) return;
    let header = { Authorization: `Bearer ${AuthUser.token.access}` };
    axios
      .get(`${window.location.protocol}//${baseURL}/bill/bill-advisements/?bill_id=${bill?.id}`, {
        headers: header,
      })
      .then((response) => {
        const userAdvisement = response.data.results?.find(
          (adv) => adv.user.id === AuthUser.id && adv.type === advisementType
        );
        if (userAdvisement) {
          setExistingAdvisement(userAdvisement);
          setAdvisement(userAdvisement.advisement);
        }
      })
      .catch((error) => {
        console.log("Error fetching advisements:", error);
      });
  }, [bill, AuthUser, advisementType]);

  const handleSubmit = (advisementValue) => {
    if (!AuthUser || !bill) return;
    let header = { Authorization: `Bearer ${AuthUser.token.access}` };
    const data = {
      bill_id: bill.id,
      type: advisementType,
      advisement: advisementValue,
    };

    if (existingAdvisement) {
      // Update existing advisement
      axios
        .patch(
          `${window.location.protocol}//${baseURL}/bill/bill-advisements/${existingAdvisement.id}/`,
          data,
          {
            headers: header,
          }
        )
        .then((response) => {
          setMessage({ type: "alert alert-success", msg: "Advisement updated successfully!" });
          setExistingAdvisement(response.data);
          setAdvisement(response.data.advisement);
          setTimeout(() => setMessage({ type: "", msg: "" }), 3000);
        })
        .catch((error) => {
          const errorMsg =
            error.response?.data?.detail ||
            error.response?.data?.non_field_errors?.[0] ||
            "Error updating advisement";
          setMessage({ type: "alert alert-danger", msg: errorMsg });
          setTimeout(() => setMessage({ type: "", msg: "" }), 5000);
        });
    } else {
      // Create new advisement
      axios
        .post(`${window.location.protocol}//${baseURL}/bill/bill-advisements/`, data, {
          headers: header,
        })
        .then((response) => {
          setMessage({ type: "alert alert-success", msg: "Advisement created successfully!" });
          setExistingAdvisement(response.data);
          setAdvisement(response.data.advisement);
          setTimeout(() => setMessage({ type: "", msg: "" }), 3000);
        })
        .catch((error) => {
          const errorMsg =
            error.response?.data?.detail ||
            error.response?.data?.non_field_errors?.[0] ||
            "Error creating advisement";
          setMessage({ type: "alert alert-danger", msg: errorMsg });
          setTimeout(() => setMessage({ type: "", msg: "" }), 5000);
        });
    }
  };

  if (!isAuthorized()) {
    return (
      <div className="container-fluid pt-3">
        {/* <div className="alert alert-warning py-1">
          You are not authorized to create {title.toLowerCase()} advisements. Only{" "}
          {title.toLowerCase()} can provide advisements.
        </div> */}
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* <h4>{title} Advisement</h4> */}

      {message.msg && (
        <div className={`py-2 ${message.type}`} role="alert">
          {message.msg}
        </div>
      )}

      <div className="card border-0">
        <div className="card-body p-0">
          {/* <h5 className="card-title">Provide Your Advisement for {bill?.number}</h5> */}

          {existingAdvisement && (
            <div className="alert my-0 py-2 alert-info">
              <strong>Current Advisement:</strong> {existingAdvisement.advisement ? "YEA" : "NAY"}
              <br />
              <small>
                Last updated: {new Date(existingAdvisement.last_update).toLocaleString()}
              </small>
            </div>
          )}

          <div className=" container my-0 py-1">
            <div className="row py-0">
              <div className="col-md-6 ">
                <button
                  className={`btn my-2 btn-success w-100 ${advisement === true ? "active" : ""}`}
                  onClick={() => handleSubmit(true)}
                  style={{ marginRight: "10px" }}>
                  YEA
                </button>
              </div>
              <div className="col-md-6">
                <button
                  className={`btn btn-danger my-2  w-100 ${advisement === false ? "active" : ""}`}
                  onClick={() => handleSubmit(false)}>
                  NAY
                </button>
              </div>
            </div>
          </div>

          {existingAdvisement && (
            <div className="container">
              <small className="text-muted">
                Click YEA or NAY to update your advisement. Your current advisement will be
                overwritten.
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Advisement;
