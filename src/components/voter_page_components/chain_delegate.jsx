import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseURL } from "../../store/conf";
export default function ChainOfDelegate() {
  const AuthUser = useSelector((state) => state.AuthUser.user);

  const [chain_of_delegation, setChain_of_delegation] = useState({
    f_del: "TBD",
    sec_del: "TBD",
    moda: "TBD",
    holc: "TBD",
    house_rep: "TBD",
  });

  const getChain = async () => {
    if (AuthUser?.username) {
      await axios
        .get(`${window.location.protocol}//${baseURL}/api/chain-of-delegation/`, {
          params: { user: AuthUser?.username },
        })
        .then((response) => {
          setChain_of_delegation(response.data);
        })
        .catch((error) => {
          console.error("Error fetching delegation data:", error);
        });
    }
  };

  useEffect(() => {
    if (AuthUser?.users?.userType !== "U0D0") getChain();
  }, [AuthUser]);

  return (
    <div className="container">
      <div className="row align-items-start">
        <div className="col-md-8 offset-md-2 ">
          <div className="card rounded-3 bg-light">
            <div className="row text-center m-0">
              <div className="col p-1">
                <h1 className="fs-4 m-0">Voter</h1>
                <p className="m-0 text-capitalize">{AuthUser?.users?.legalName}</p>
              </div>
              <div className="col user-card-middle-border p-1">
                <h1 className="fs-4 m-0">F-Del</h1>
                <p className="m-0">{chain_of_delegation?.f_del} </p>
              </div>
              <div className="col user-card-middle-border p-1">
                <h1 className="fs-4 m-0">Sec-Del</h1>
                <p className="m-0">{chain_of_delegation?.sec_del} </p>
              </div>
              <div className="col user-card-middle-border p-1">
                <h1 className="fs-4 m-0">MoDA</h1>
                <p className="m-0">{chain_of_delegation?.moda} </p>
              </div>
              <div className="col user-card-middle-border p-1">
                <h1 className="fs-4 m-0">HoLC</h1>
                <p className="m-0">{chain_of_delegation?.holc} </p>
              </div>
              <div className="col p-1">
                <h1 className="fs-4 m-0">House Rep</h1>
                <p className=" m-0">{chain_of_delegation?.house_rep}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
