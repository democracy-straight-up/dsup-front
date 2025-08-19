import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import axios from "axios";
import { baseURL } from "../../store/conf";
import { circle, authenticate, sec_del } from "../../store/userSlice";

export default function CircleCard() {
  const AuthUser = useSelector((state) => state.AuthUser.user);
  const circleInfo = useSelector((state) => state.AuthUser.circle);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    // get the circle info
    const url = `${window.location.protocol}//${baseURL}/api/get-circle/get_circle_by_user/`;
    let header = { Authorization: `Bearer ${AuthUser?.token.access}` };
    axios
      .post(url, { user: AuthUser.username }, { headers: header })
      .then((res) => {
        dispatch(circle(res.data));
      })
      .catch((err) => {
        setError(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const CopyInviteKey = (value) => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        alert("Invitation key copied");
      })
      .catch((err) => {
        alert("Failed to copy ");
      });
  };

  const handleCreate = () => {
    if (AuthUser?.token.access.length > 0) {
      // console.log("ceating a circle...")
      // constructing to request to create the first link
      let header = { Authorization: `Bearer ${AuthUser.token.access}` };
      const url = `${window.location.protocol}//${baseURL}/api/second-delegate/`;
      const param = {
        user: AuthUser.username,
        district: AuthUser.users.district.code,
      };

      axios
        .post(url, param, { headers: header })
        .then((response) => {
          if (response.status === 200) {
            // if the request was a succcess, set the sec_del state so that we need it in the next page (sec_del housekeeping page)
            dispatch(sec_del(response.data));

            // set the userType to 2 without requesting new data from the server.
            let u = { ...AuthUser.users };
            let userType = "U2D2";
            let users = { ...u, userType };
            dispatch(authenticate({ ...AuthUser, users }));

            //   after successfull operation of creating, settign datas and users, take the voter to first link page
            navigate("/first-link-page");
          } else {
            console.log("something went wrong:", response);
          }
        })
        .catch((error) => {
          console.log("something is not right!.", error);
        });
    }
  };

  return (
    <div className="mt-3">
      <div className="">
        <div className="px-2">
          <div className={`card rounded-3 bg-light p-4 ${!circleInfo?.status ? "" : ""}`}>
            {error === false ? (
              <>
                <div className="row">
                  <div className="text-center">
                    <h1 className="fs-3 m-0 text-center">
                      Circle-{circleInfo?.district?.code}-{circleInfo?.code}
                    </h1>
                    <div
                      className="d-flex justify-content-between mx-auto border-bottom border-1"
                      style={{
                        maxWidth: AuthUser.users.userType.substring(0, 2) === "U1" ? "60%" : "90%",
                      }}>
                      <p className="m-0">
                        Circle Status: {circleInfo?.status ? "Active" : "Inactive"}
                      </p>
                      <p className="m-0">Members: {circleInfo?.member_count}</p>
                    </div>
                    <h1 className="fs-3 fw-light">Invitation Key</h1>
                    <div className="row">
                      <div className="d-flex flex-wrap justify-content-center">
                        <p
                          className="fw-light font-monospace m-0"
                          style={{ letterSpacing: ".3rem" }}>
                          {circleInfo?.invitation_code}
                        </p>
                        &nbsp; &nbsp;
                        <button
                          onClick={() => CopyInviteKey(circleInfo?.invitation_code)}
                          className="m-0 p-0 border-0 bg-transparent">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24">
                            <path
                              fill="#31302c"
                              fillRule="evenodd"
                              d="M15 1.25h-4.056c-1.838 0-3.294 0-4.433.153c-1.172.158-2.121.49-2.87 1.238c-.748.749-1.08 1.698-1.238 2.87c-.153 1.14-.153 2.595-.153 4.433V16a3.75 3.75 0 0 0 3.166 3.705c.137.764.402 1.416.932 1.947c.602.602 1.36.86 2.26.982c.867.116 1.97.116 3.337.116h3.11c1.367 0 2.47 0 3.337-.116c.9-.122 1.658-.38 2.26-.982s.86-1.36.982-2.26c.116-.867.116-1.97.116-3.337v-5.11c0-1.367 0-2.47-.116-3.337c-.122-.9-.38-1.658-.982-2.26c-.531-.53-1.183-.795-1.947-.932A3.75 3.75 0 0 0 15 1.25m2.13 3.021A2.25 2.25 0 0 0 15 2.75h-4c-1.907 0-3.261.002-4.29.14c-1.005.135-1.585.389-2.008.812S4.025 4.705 3.89 5.71c-.138 1.029-.14 2.383-.14 4.29v6a2.25 2.25 0 0 0 1.521 2.13c-.021-.61-.021-1.3-.021-2.075v-5.11c0-1.367 0-2.47.117-3.337c.12-.9.38-1.658.981-2.26c.602-.602 1.36-.86 2.26-.981c.867-.117 1.97-.117 3.337-.117h3.11c.775 0 1.464 0 2.074.021M7.408 6.41c.277-.277.665-.457 1.4-.556c.754-.101 1.756-.103 3.191-.103h3c1.435 0 2.436.002 3.192.103c.734.099 1.122.28 1.399.556c.277.277.457.665.556 1.4c.101.754.103 1.756.103 3.191v5c0 1.435-.002 2.436-.103 3.192c-.099.734-.28 1.122-.556 1.399c-.277.277-.665.457-1.4.556c-.755.101-1.756.103-3.191.103h-3c-1.435 0-2.437-.002-3.192-.103c-.734-.099-1.122-.28-1.399-.556c-.277-.277-.457-.665-.556-1.4c-.101-.755-.103-1.756-.103-3.191v-5c0-1.435.002-2.437.103-3.192c.099-.734.28-1.122.556-1.399"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="d-flex flex-sm-column flex-md-row justify-content-around  flex-wrap mt-3 ">
                    <Link to="/house-keeping-page" className=" p-1 text-nowrap fw-light text-dark">
                      Housekeeping Page &nbsp;
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24">
                        <path d="M12 1.25h-.057c-2.309 0-4.118 0-5.53.19c-1.444.194-2.584.6-3.479 1.494c-.895.895-1.3 2.035-1.494 3.48c-.19 1.411-.19 3.22-.19 5.529v.114c0 2.309 0 4.118.19 5.53c.194 1.444.6 2.584 1.494 3.479c.895.895 2.035 1.3 3.48 1.494c1.411.19 3.22.19 5.529.19h.114c2.309 0 4.118 0 5.53-.19c1.444-.194 2.584-.6 3.479-1.494c.895-.895 1.3-2.035 1.494-3.48c.19-1.411.19-3.22.19-5.529V12a.75.75 0 0 0-1.5 0c0 2.378-.002 4.086-.176 5.386c-.172 1.279-.5 2.05-1.069 2.62c-.57.569-1.34.896-2.619 1.068c-1.3.174-3.008.176-5.386.176s-4.086-.002-5.386-.176c-1.279-.172-2.05-.5-2.62-1.069c-.569-.57-.896-1.34-1.068-2.619c-.174-1.3-.176-3.008-.176-5.386s.002-4.086.176-5.386c.172-1.279.5-2.05 1.069-2.62c.57-.569 1.34-.896 2.619-1.068c1.3-.174 3.008-.176 5.386-.176a.75.75 0 0 0 0-1.5" />
                        <path d="M12.47 10.47a.75.75 0 1 0 1.06 1.06l7.72-7.72v3.534a.75.75 0 0 0 1.5 0V2a.75.75 0 0 0-.75-.75h-5.344a.75.75 0 0 0 0 1.5h3.533z" />
                      </svg>
                    </Link>
                    <Link
                      to="/circle-member-contact"
                      className=" p-1 text-nowrap fw-light text-dark">
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

                    <Link to="/voter-page" className="p-1 text-nowrap fw-light text-dark">
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
                    <Link to="/circle-back-n-forth" className="p-1 text-nowrap fw-light text-dark">
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

                    <Link to="/meetings-and-minutes" className="p-1 text-nowrap fw-light text-dark">
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
                  {/* {AuthUser?.users.userType === "U1D1" ? ( */}
                  <div className="d-flex flex-sm-column flex-md-row justify-content-evenly mt-4 ">
                    {circleInfo?.status && (
                      <>
                        <Link to="#" onClick={handleCreate} className="py-1 text-nowrap text-dark">
                          Create F-Link
                        </Link>
                        {}
                        <Link to="/join-sec-del" className="py-1 text-nowrap  text-dark">
                          Join F-Link
                        </Link>
                      </>
                    )}
                  </div>
                  {/* ) : (<div style={{ height: "3.5rem", display: "block" }}></div>
                  )} */}
                </div>
              </>
            ) : (
              <div>
                <p>Something went wrong..</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
