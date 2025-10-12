import { Link } from "react-router-dom";
// import { Link, useNavigate } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import axios from "axios";
import { baseURL } from "../../store/conf";
import { holc } from "../../store/userSlice";
// import { holc, house_rep, authenticate } from "../../store/userSlice";

export default function HolcCard() {
  const AuthUser = useSelector((state) => state.AuthUser.user);
  const holc_info = useSelector((state) => state.AuthUser.holc);
  const dispatch = useDispatch();
  // const navigate = useNavigate();

  const [error, setError] = useState(false);

  useEffect(() => {
    // get the fLink info
    const url = `${window.location.protocol}//${baseURL}/api/holc/holc/get_holc_by_user/`;
    let header = { Authorization: `Bearer ${AuthUser?.token.access}` };
    axios
      .post(url, { user: AuthUser?.username }, { headers: header })
      .then((res) => {
        dispatch(holc(res.data));
      })
      .catch((err) => {
        setError(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const CopyInviteKey = (value) => {
  //   navigator.clipboard
  //     .writeText(value)
  //     .then(() => {
  //       alert("Invitation key copied");
  //     })
  //     .catch((err) => {
  //       alert("Failed to copy ");
  //     });
  // };

  // const handleCreate = () => {
  //   if (AuthUser?.token.access.length > 0) {
  //     // console.log("ceating a circle...")
  //     // constructing to request to create the first link
  //     let header = { Authorization: `Bearer ${AuthUser.token.access}` };
  //     const url = `${window.location.protocol}//${baseURL}/api/rep/district-council/`;
  //     const param = {
  //       user: AuthUser?.username,
  //       district: AuthUser?.users?.district?.code,
  //     };

  //     axios
  //       .post(url, param, { headers: header })
  //       .then((response) => {
  //         if (response.status === 200) {
  //           // if the request was a succcess, set the sec_del state so that we need it in the next page (sec_del housekeeping page)
  //           dispatch(house_rep(response.data));

  //           // set the userType to 2 without requesting new data from the server.
  //           let u = { ...AuthUser.users };
  //           let userType = "U5D5";
  //           let users = { ...u, userType };
  //           dispatch(authenticate({ ...AuthUser, users }));

  //           //   after successfull operation of creating, settign datas and users, take the voter to first link page
  //           navigate("/house-rep-page");
  //         } else {
  //           console.log("something went wrong:", response);
  //         }
  //       })
  //       .catch((error) => {
  //         console.log("something is not right!.", error);
  //       });
  //   }
  // };

  const toTwoDigits = (num) => {
    return num < 10 ? `0${num}` : `${num}`;
  };

  return (
    <div className="mt-3 ">
      <div className="">
        <div className="mx-2">
          <div className={`card rounded-3 bg-light p-4`}>
            {error === false ? (
              <>
                <div className="row">
                  <div className=" text-center">
                    <h1 className="fs-3 m-0 text-center">
                      Legislative Caucus-{holc_info?.district?.code}-{toTwoDigits(holc_info?.code)}
                    </h1>
                    <div
                      style={{ maxWidth: "90%" }}
                      className="d-flex justify-content-center mx-auto border-bottom border-1">
                      <p className="m-0">Members: {holc_info?.member_count}</p>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="d-flex flex-sm-column flex-wrap mt-3 align-items-center">
                    <Link to="/holc-member-contact" className="p-1 text-nowrap fw-light text-dark">
                      Member Contact Page &nbsp;
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24">
                        <path d="M12 1.25h-.057c-2.309 0-4.118 0-5.53.19c-1.444.194-2.584.6-3.479 1.494c-.895.895-1.3 2.035-1.494 3.48c-.19 1.411-.19 3.22-.19 5.529v.114c0 2.309 0 4.118.19 5.53c.194 1.444.6 2.584 1.494 3.479c.895.895 2.035 1.3 3.48 1.494c1.411.19 3.22.19 5.529.19h.114c2.309 0 4.118 0 5.53-.19c1.444-.194 2.584-.6 3.479-1.494c.895-.895 1.3-2.035 1.494-3.48c.19-1.411.19-3.22.19-5.529V12a.75.75 0 0 0-1.5 0c0 2.378-.002 4.086-.176 5.386c-.172 1.279-.5 2.05-1.069 2.62c-.57.569-1.34.896-2.619 1.068c-1.3.174-3.008.176-5.386.176s-4.086-.002-5.386-.176c-1.279-.172-2.05-.5-2.62-1.069c-.569-.57-.896-1.34-1.068-2.619c-.174-1.3-.176-3.008-.176-5.386s.002-4.086.176-5.386c.172-1.279.5-2.05 1.069-2.62c.57-.569 1.34-.896 2.619-1.068c1.3-.174 3.008-.176 5.386-.176a.75.75 0 0 0 0-1.5" />
                        <path d="M12.47 10.47a.75.75 0 1 0 1.06 1.06l7.72-7.72v3.534a.75.75 0 0 0 1.5 0V2a.75.75 0 0 0-.75-.75h-5.344a.75.75 0 0 0 0 1.5h3.533z" />
                      </svg>
                    </Link>
                    <Link to="/voter-settings" className="p-1 text-nowrap fw-light text-dark">
                      Voter Settings &nbsp;
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24">
                        <path d="M12 1.25h-.057c-2.309 0-4.118 0-5.53.19c-1.444.194-2.584.6-3.479 1.494c-.895.895-1.3 2.035-1.494 3.48c-.19 1.411-.19 3.22-.19 5.529v.114c0 2.309 0 4.118.19 5.53c.194 1.444.6 2.584 1.494 3.479c.895.895 2.035 1.3 3.48 1.494c1.411.19 3.22.19 5.529.19h.114c2.309 0 4.118 0 5.53-.19c1.444-.194 2.584-.6 3.479-1.494c.895-.895 1.3-2.035 1.494-3.48c.19-1.411.19-3.22.19-5.529V12a.75.75 0 0 0-1.5 0c0 2.378-.002 4.086-.176 5.386c-.172 1.279-.5 2.05-1.069 2.62c-.57.569-1.34.896-2.619 1.068c-1.3.174-3.008.176-5.386.176s-4.086-.002-5.386-.176c-1.279-.172-2.05-.5-2.62-1.069c-.569-.57-.896-1.34-1.068-2.619c-.174-1.3-.176-3.008-.176-5.386s.002-4.086.176-5.386c.172-1.279.5-2.05 1.069-2.62c.57-.569 1.34-.896 2.619-1.068c1.3-.174 3.008-.176 5.386-.176a.75.75 0 0 0 0-1.5" />
                        <path d="M12.47 10.47a.75.75 0 1 0 1.06 1.06l7.72-7.72v3.534a.75.75 0 0 0 1.5 0V2a.75.75 0 0 0-.75-.75h-5.344a.75.75 0 0 0 0 1.5h3.533z" />
                      </svg>
                    </Link>
                    <Link to="/holc-back-and-forth" className="p-1 text-nowrap fw-light text-dark">
                      Back And Forth &nbsp;
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24">
                        <path d="M12 1.25h-.057c-2.309 0-4.118 0-5.53.19c-1.444.194-2.584.6-3.479 1.494c-.895.895-1.3 2.035-1.494 3.48c-.19 1.411-.19 3.22-.19 5.529v.114c0 2.309 0 4.118.19 5.53c.194 1.444.6 2.584 1.494 3.479c.895.895 2.035 1.3 3.48 1.494c1.411.19 3.22.19 5.529.19h.114c2.309 0 4.118 0 5.53-.19c1.444-.194 2.584-.6 3.479-1.494c.895-.895 1.3-2.035 1.494-3.48c.19-1.411.19-3.22.19-5.529V12a.75.75 0 0 0-1.5 0c0 2.378-.002 4.086-.176 5.386c-.172 1.279-.5 2.05-1.069 2.62c-.57.569-1.34.896-2.619 1.068c-1.3.174-3.008.176-5.386.176s-4.086-.002-5.386-.176c-1.279-.172-2.05-.5-2.62-1.069c-.569-.57-.896-1.34-1.068-2.619c-.174-1.3-.176-3.008-.176-5.386s.002-4.086.176-5.386c.172-1.279.5-2.05 1.069-2.62c.57-.569 1.34-.896 2.619-1.068c1.3-.174 3.008-.176 5.386-.176a.75.75 0 0 0 0-1.5" />
                        <path d="M12.47 10.47a.75.75 0 1 0 1.06 1.06l7.72-7.72v3.534a.75.75 0 0 0 1.5 0V2a.75.75 0 0 0-.75-.75h-5.344a.75.75 0 0 0 0 1.5h3.533z" />
                      </svg>
                    </Link>
                    <Link to="/holc-minutes" className="p-1 text-nowrap fw-light text-dark">
                      Meetings & Minutes &nbsp;
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24">
                        <path d="M12 1.25h-.057c-2.309 0-4.118 0-5.53.19c-1.444.194-2.584.6-3.479 1.494c-.895.895-1.3 2.035-1.494 3.48c-.19 1.411-.19 3.22-.19 5.529v.114c0 2.309 0 4.118.19 5.53c.194 1.444.6 2.584 1.494 3.479c.895.895 2.035 1.3 3.48 1.494c1.411.19 3.22.19 5.529.19h.114c2.309 0 4.118 0 5.53-.19c1.444-.194 2.584-.6 3.479-1.494c.895-.895 1.3-2.035 1.494-3.48c.19-1.411.19-3.22.19-5.529V12a.75.75 0 0 0-1.5 0c0 2.378-.002 4.086-.176 5.386c-.172 1.279-.5 2.05-1.069 2.62c-.57.569-1.34.896-2.619 1.068c-1.3.174-3.008.176-5.386.176s-4.086-.002-5.386-.176c-1.279-.172-2.05-.5-2.62-1.069c-.569-.57-.896-1.34-1.068-2.619c-.174-1.3-.176-3.008-.176-5.386s.002-4.086.176-5.386c.172-1.279.5-2.05 1.069-2.62c.57-.569 1.34-.896 2.619-1.068c1.3-.174 3.008-.176 5.386-.176a.75.75 0 0 0 0-1.5" />
                        <path d="M12.47 10.47a.75.75 0 1 0 1.06 1.06l7.72-7.72v3.534a.75.75 0 0 0 1.5 0V2a.75.75 0 0 0-.75-.75h-5.344a.75.75 0 0 0 0 1.5h3.533z" />
                      </svg>
                    </Link>
                  </div>
                </div>

                <div className="row">
                  {/* the userType is U4D4 and the next level is auto */}
                  <div style={{ height: "3.5rem", display: "block" }}></div>

                </div>
              </>
            ) : (
              <div>
                <p>Data not available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
