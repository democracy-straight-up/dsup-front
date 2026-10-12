import { useEffect, useState } from "react";
import BillItem from "../bills/bill_item";
import { Table, Tabs, Tab } from "react-bootstrap";
import { useSelector } from "react-redux";
import axios from "axios";
import { baseURL } from "../../store/conf";

export default function BillsWrapper({ setMessage }) {
  const AuthUser = useSelector((state) => state.AuthUser.user);
  const circleInfo = useSelector((state) => state.AuthUser.circle);
  const firstLinkInfo = useSelector((state) => state.AuthUser.sec_del);
  const caucusInfo = useSelector((state) => state.AuthUser.holc);
  const secondLinkInfo = useSelector((state) => state.AuthUser.moda);
  const isFirstDelegate = AuthUser?.users?.userType === "U1D1";
  const [currentPage, setCurrentPage] = useState(1);
  const [bills, setBills] = useState({});

  // load bills
  const loadBills = () => {
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
        console.log(error);
      });
  };

  useEffect(() => {
    loadBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Handle vote updates
  const handleVoteUpdate = () => {
    loadBills(); // Reload bills to get updated vote counts
  };

  return (
    <>
      <Tabs
      id="voter-bill-tabs"
      defaultActiveKey="my-bills"
      className="mt-4 mb-3"
      transition={false}
    >
      <Tab eventKey="my-bills" title="My Bills">
            {["U1D0", "U1D1", "U2D2", "U3D3", "U4D4"].includes(AuthUser?.users?.userType) ? (
          <>
            <section className="mb-4">
              <h2 className="fs-4">Bill Focus from My Delegate</h2>
              <p>Your delegate's Bill Focus will appear here once connected.</p>
            </section>

            {isFirstDelegate && (
              <section className="mb-4">
                <h2 className="fs-4">
                  Bill Focus for Circle {circleInfo?.code}
                </h2>
                <p>Your Circle's Bill Focus will appear here once connected.</p>
              </section>
            )}

            {AuthUser?.users?.userType === "U2D2" && (
              <section className="mb-4">
                <h2 className="fs-4">
                  Bill Focus for First Link {firstLinkInfo?.code}
                </h2>
                <p>
                  Your First Link's Bill Focus will appear here once connected.
                </p>
              </section>
            )}
                        {AuthUser?.users?.userType === "U3D3" && (
              <section className="mb-4">
                <h2 className="fs-4">
                  Bill Focus for Second Link {secondLinkInfo?.code}
                </h2>
                <p>
                  Your Second Link's Bill Focus will appear here once connected.
                </p>
              </section>
            )}
                       {AuthUser?.users?.userType === "U4D4" && (
              <section className="mb-4">
                <h2 className="fs-4">
                  Bill Focus for Caucus {caucusInfo?.code}
                </h2>
                <p>
                  Your Caucus's Bill Focus will appear here once connected.
                </p>
              </section>
            )}
          </>
        ) : AuthUser?.users?.userType === "U5D5" ? (
          <section className="mb-4">
            <h2 className="fs-4">Bill Focus for HoLCs</h2>
            <p>Your Bill Focus for HoLCs will appear here once connected.</p>
          </section>
        ) : (
          <p>Your Bill Focus lists will appear here once connected.</p>
        )}
      </Tab>
      <Tab eventKey="all-bills" title="All Bills">
      <Table striped bordered hover responsive="lg">
        <thead>
          <tr className="fw-normal ">
            <th className="fw-semibold fs-5 text-nowrap">Bill Number</th>
            <th className="fw-semibold fs-5 text-nowrap" style={{ minWidth: "250px" }}>
              Short Title
            </th>
            <th className="fw-semibold fs-5 text-nowrap">Scheduled For Vote</th>
            <th className="fw-semibold fs-5 text-nowrap">Advisement</th>
            <th className="fw-semibold fs-5 text-nowrap">My Vote</th>
            <th className="fw-semibold fs-5 text-nowrap">District Tally</th>
            <th className="fw-semibold fs-5 text-nowrap">National Tally</th>
            <th className="fw-semibold fs-5 text-nowrap">Advisement & More</th>
          </tr>
        </thead>
        <tbody>
          {bills?.results?.map((bill, index) => (
            <BillItem bill={bill} key={index} index={index} onVoteUpdate={handleVoteUpdate} />
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
        </Tab>
      </Tabs>
    </>
  );
}
