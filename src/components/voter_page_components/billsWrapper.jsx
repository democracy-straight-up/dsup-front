import { useEffect, useState } from "react";
import BillItem from "../bills/bill_item";
import { Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import axios from "axios";
import { baseURL } from "../../store/conf";

export default function BillsWrapper({ setMessage }) {
  const AuthUser = useSelector((state) => state.AuthUser.user);
  const [currentPage, setCurrentPage] = useState(1);
  const [bills, setBills] = useState({});

  // load bills
  useEffect(() => {
    let header = { Authorization: `Bearer ${AuthUser.token.access}` };
    axios
      .get(`${window.location.protocol}//${baseURL}/bill/bills/?page=${currentPage}`, {
        headers: header,
      })
      .then((response) => {
        setBills(response.data);
      })
      .catch((error) => {
        setMessage({ type: "alert alert-danger", msg: "error getting bills." });
        // setErr("Something went wrong. Check your inputs and try again.");
        console.log(error);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  return (
    <>
      <h1 className="fs-3 mt-4 pl-4">List of Bills</h1>
      <Table striped bordered hover responsive>
        <thead>
          <tr className="fw-normal bills-list-voter-page-header-row">
            <th className="">Bill Number</th>
            <th style={{ minWidth: "300px" }}>Short Title</th>
            <th>Scheduled For Vote</th>
            <th>Advisement</th>
            <th>Your Vote</th>
            <th>District Tally</th>
            <th>National Tally</th>
            <th>More...</th>
          </tr>
        </thead>
        <tbody>
          {bills?.results?.map((bill, index) => (
            <BillItem bill={bill} key={index} index={index}></BillItem>
          ))}
        </tbody>
        <tfoot className="border-0">
          <tr className="p-2 border-0">
            <td colSpan={4} className="border-0"></td>
            <td colSpan={4} className="border-0" style={{ textAlign: "right" }}>
              {bills?.previous ? (
                <span
                  className="btn btn-outline-success mx-1 p-0 px-3"
                  onClick={() => setCurrentPage(currentPage - 1)}>
                  Previous
                </span>
              ) : (
                ""
              )}

              {bills?.previous ? (
                <span
                  className="btn btn-outline-success mx-1 p-0 px-3"
                  onClick={() => setCurrentPage(currentPage - 1)}>
                  {currentPage - 1}
                </span>
              ) : (
                ""
              )}

              <span className="btn btn-success mx-1 p-0 px-3">{currentPage}</span>

              {bills?.next ? (
                <span
                  className="btn btn-outline-success mx-1 p-0 px-3"
                  onClick={() => setCurrentPage(currentPage + 1)}>
                  {currentPage + 1}
                </span>
              ) : (
                ""
              )}

              {bills?.next ? (
                <span
                  className="btn btn-outline-success mx-1 p-0 px-3"
                  onClick={() => setCurrentPage(currentPage + 1)}>
                  Next
                </span>
              ) : (
                ""
              )}
            </td>
          </tr>
        </tfoot>
      </Table>
    </>
  );
}
