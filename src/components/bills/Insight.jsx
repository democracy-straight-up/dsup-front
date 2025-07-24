import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { baseURL } from "../../store/conf";
// ** READ BELOW **

// this is a sample page for the bill page, it is not connected to the backend
// currently, this is mimicking a situation where the person signed in is a regular user, and is not a first del or higher
// the notes section is currently not connected to the backend, but it is a good example of how we can implement it
// nothing will persist, and "add notes" buttons will have to be added and conditionally rendered later on, this
// is a quick example and is hard coded and not meant to be a long term solution

function Insight() {
  const { id } = useParams();
  const AuthUser = useSelector((state) => state.AuthUser.user);
  const [bill, setBill] = useState();
  const [message, setMessage] = useState({ type: "alert alert-", msg: "" });
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    let header = { Authorization: `Bearer ${AuthUser.token.access}` };
    axios
      .get(`${window.location.protocol}//${baseURL}/bill/bills/${id}/`, {
        headers: header,
      })
      .then((response) => {
        setBill(response.data);
        console.log("bill", response.data);
      })
      .catch((error) => {
        setMessage({ type: "alert alert-danger", msg: "error getting bill." });
        // setErr("Something went wrong. Check your inputs and try again.");
        console.log(error);
      });
  }, []);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "summary":
        return (
          <div className="container-fluid p-4">
            <h4>Bill Summary</h4>
            <p>{bill?.summary || "Summary content will be displayed here..."}</p>
          </div>
        );
      case "text":
        return (
          <div className="container-fluid p-4">
            <h4>Full Bill Text</h4>
            <p>{bill?.text || "Full bill text will be displayed here..."}</p>
          </div>
        );
      case "mynotes":
        return (
          <div className="container-fluid p-4">
            <h4>My Notes</h4>
            <p>Your personal notes about this bill will be displayed here...</p>
          </div>
        );
      case "firstdel":
        return (
          <div className="container-fluid  p-4">
            <h4>First Delegate Notes</h4>
            <p>First delegate notes will be displayed here...</p>
          </div>
        );
      case "seconddel":
        return (
          <div className="container-fluid p-4">
            <h4>Second Delegate Notes</h4>
            <p>Second delegate notes will be displayed here...</p>
          </div>
        );
      case "moda":
        return (
          <div className="container-fluid p-4">
            <h4>MoDa Notes</h4>
            <p>MoDa notes will be displayed here...</p>
          </div>
        );
      case "holc":
        return (
          <div className="container-fluid p-4">
            <h4>HoLC Notes</h4>
            <p>HoLC notes will be displayed here...</p>
          </div>
        );
      case "houserep":
        return (
          <div className="container-fluid p-4">
            <h4>House Rep Notes</h4>
            <p>House representative notes will be displayed here...</p>
          </div>
        );
      default:
        return (
          <div className="container-fluid p-4">
            <h4>Bill Summary</h4>
            <p>Summary content will be displayed here...</p>
          </div>
        );
    }
  };

  return (
    <div className="container my-4">
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
      {/* add all the content here */}
      <div className="contianer">
        <div className="row text-center">
          <h1>Bill Details</h1>
        </div>
        {/* bill overview */}
        <div className="row align-items-start">
          <div className="card rounded-3 bg-light p-4 m-0">
            <div className="row">
              <div className=" text-center">
                <h1 className="fs-3  text-center">Overview</h1>
                <div
                  style={{ maxWidth: "98%" }}
                  className="d-flex justify-content-between mx-auto border-bottom  border-1"></div>
              </div>
            </div>
            <div className="row justify-content-center pt-3">
              <div style={{ maxWidth: "98%" }} className="d-flex flex-column flex-wrap  ">
                <p className=" text-nowrap fw-light text-dark">
                  <span className="fw-semibold">Title:</span> &nbsp; {bill?.title}
                </p>
                <p className=" text-nowrap fw-light text-dark">
                  <span className="fw-semibold">When Introduced:</span>&nbsp;{" "}
                  {bill?.introduced_date
                    ? (() => {
                        const date = new Date(bill.created_at);
                        const mm = String(date.getMonth() + 1).padStart(2, "0");
                        const dd = String(date.getDate()).padStart(2, "0");
                        const yyyy = date.getFullYear();
                        return `${mm}/${dd}/${yyyy}`;
                      })()
                    : ""}
                </p>
                <p className=" text-nowrap fw-light text-dark">
                  <span className="fw-semibold">Sponsors:</span>&nbsp;{bill?.sponsors}
                </p>
                <p className=" text-nowrap fw-light text-dark">
                  <span className="fw-semibold">Committees:</span> &nbsp; {bill?.committees}
                </p>
                <p className=" text-nowrap fw-light text-dark">
                  <span className="fw-semibold">Committees Meetings:</span> &nbsp;{" "}
                  {bill?.committee_meeting
                    ? (() => {
                        const date = new Date(bill.committee_meeting);
                        return date.toLocaleString("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        });
                      })()
                    : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* the tabs container */}
      <div className="row mt-3">
        <ul className="nav nav-tabs d-flex justify-content-center w-100">
          <li className="nav-item flex-fill text-center">
            <a
              className={`nav-link ${activeTab === "summary" ? "active" : ""}`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleTabClick("summary");
              }}>
              Summary
            </a>
          </li>
          <li className="nav-item flex-fill text-center">
            <a
              className={`nav-link ${activeTab === "text" ? "active" : ""}`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleTabClick("text");
              }}>
              Text
            </a>
          </li>
          <li className="nav-item flex-fill text-center">
            <a
              className={`nav-link ${activeTab === "mynotes" ? "active" : ""}`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleTabClick("mynotes");
              }}>
              My Notes
            </a>
          </li>
          <li className="nav-item flex-fill text-center">
            <a
              className={`nav-link ${activeTab === "firstdel" ? "active" : ""}`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleTabClick("firstdel");
              }}>
              First Delegate Notes
            </a>
          </li>
          <li className="nav-item flex-fill text-center">
            <a
              className={`nav-link ${activeTab === "seconddel" ? "active" : ""}`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleTabClick("seconddel");
              }}>
              Second Delegate Notes
            </a>
          </li>
          <li className="nav-item flex-fill text-center">
            <a
              className={`nav-link ${activeTab === "moda" ? "active" : ""}`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleTabClick("moda");
              }}>
              MoDa Notes
            </a>
          </li>
          <li className="nav-item flex-fill text-center">
            <a
              className={`nav-link ${activeTab === "holc" ? "active" : ""}`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleTabClick("holc");
              }}>
              HoLC Notes
            </a>
          </li>
          <li className="nav-item flex-fill text-center">
            <a
              className={`nav-link ${activeTab === "houserep" ? "active" : ""}`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleTabClick("houserep");
              }}>
              House Rep Notes
            </a>
          </li>
        </ul>

        {/* Tab Content Container */}
        <div className="tab-content border border-top-0 bg-white">{renderTabContent()}</div>
      </div>
    </div>
  );
}

export default Insight;
