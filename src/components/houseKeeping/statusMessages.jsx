import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { baseURL } from "../../store/conf";
import axios from "axios";
import { Link } from "react-router-dom";

const Status = () => {
  // get the user
  const AuthUser = useSelector((state) => state.AuthUser.user);
  const circle = useSelector((state) => state.AuthUser.circle);
  const members = useSelector((state) => state.AuthUser.circleMembers);
  const [list, setList] = useState([]);
  const [candiate_waiting, setCandidateWaiting] = useState(false);

  useEffect(() => {
    // check if the user is a candidate and waiting for the circle to be created.
    const _yes = members?.filter((item) => !item.is_member);
    if (_yes?.length === 0) {
      setCandidateWaiting(true);
      setList(list.filter((item) => !item.is_candidate_waiting));
    }
  }, [circle]);

  useEffect(() => {
    // get the list of the messages.
    let header = { Authorization: `Bearer ${AuthUser?.token?.access}` };
    const url = `${window.location.protocol}//${baseURL}/api/get-status-messages/`;

    axios
      .get(url, { headers: header })
      .then((res) => {
        let list = [];
        if (AuthUser?.users?.userType === "U1D1") {
          list = res.data?.filter((item) => item.is_for_circle && item.is_for_delegate);
        } else if (AuthUser?.users?.userType === "U1D0") {
          list = res.data?.filter((item) => item.is_for_circle && item.is_for_member);
        } else if (AuthUser?.users?.userType === "U0D0") {
          list = res.data?.filter((item) => item.is_for_circle && item.is_for_candidate);
        }

        if (circle?.is_active === false) {
          list = list?.filter((item) => !item.is_active);
        }
        setList(list.sort((a, b) => a.sort - b.sort));
      })
      .catch((err) => {
        console.log("err: ", err);
      });
  }, [AuthUser]);

  return (
    <>
      {/* message status area */}
      <div className="row border p-3 shadow-sm">
        <p className="m-0 p-0">
          <strong>Status: </strong>
        </p>
        <div>
          <ul>
            {list.map((item, index) => (
              <li key={index}>
                {item.message}
                {item.item_list && (
                  <ol>
                    {item?.item_list?.split(";").map((item, index) => {
                      return <li key={index}>{item}</li>;
                    })}
                  </ol>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="row">
        {/* helper links for delegate */}
        {AuthUser?.users?.userType === "U1D1" ? (
          <div className="row mt-2">
            <strong>Learn about:</strong>
            <Link className="mx-3 text-secondary" to="/house-keeping-page">
              Active vs inactive Circle.
            </Link>
            <Link className="mx-3 text-secondary" to="/house-keeping-page">
              How to invite new members.
            </Link>
            <Link className="mx-3 text-secondary" to="/house-keeping-page">
              How to hold a First Delegate Election.
            </Link>
            <Link className="mx-3 text-secondary" to="/house-keeping-page">
              How to dissolve a Circle.
            </Link>
          </div>
        ) : null}

        {AuthUser?.users.userType === "U1D0" ? (
          <div className="row mt-2">
            <strong>Learn about:</strong>
            <Link className="mx-3 text-secondary" to="/house-keeping-page">
              Invite someone to join this Circle.
            </Link>
            <Link className="mx-3 text-secondary" to="/house-keeping-page">
              Being removed from this Circle.
            </Link>
            <Link className="mx-3 text-secondary" to="/house-keeping-page">
              Elect a new first Delegate.
            </Link>
            <Link className="mx-3 text-secondary" to="/house-keeping-page">
              Circle Dessolution.
            </Link>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default Status;
