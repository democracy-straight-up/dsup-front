import { useSelector } from "react-redux";
import { useState } from "react";
import { useChainOfDelegation } from "../../hooks/useChainOfDelegation";

export default function ChainOfDelegate() {
  const AuthUser = useSelector((state) => state.AuthUser.user);
  const { chainOfDelegation, fetchChainOfDelegation } = useChainOfDelegation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRefreshChain = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchChainOfDelegation();
    } catch (error) {
      setError("Failed to refresh delegation chain");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row align-items-start">
        <div className="col-md-8 offset-md-2 ">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <div className="card rounded-3 bg-light">
            {AuthUser?.users?.userType !== "U0D0" && (
              <div className="row">
                <div className="col-12 p-2 text-end">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={handleRefreshChain}
                    disabled={loading}>
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                          aria-hidden="true"></span>
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Refresh
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
            <div className="row text-center m-0">
              <div className="col p-1">
                <h1 className="fs-4 m-0">Voter</h1>
                <p className="m-0 text-capitalize">{AuthUser?.users?.legalName}</p>
              </div>
              <div className="col user-card-middle-border p-1">
                <h1 className="fs-4 m-0">F-Del</h1>
                {loading ? (
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <p className="m-0">{chainOfDelegation?.f_del?.users?.legalName || "TBD"}</p>
                )}
              </div>
              <div className="col user-card-middle-border p-1">
                <h1 className="fs-4 m-0">Sec-Del</h1>
                {loading ? (
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <p className="m-0">{chainOfDelegation?.sec_del?.users?.legalName || "TBD"}</p>
                )}
              </div>
              <div className="col user-card-middle-border p-1">
                <h1 className="fs-4 m-0">MoDA</h1>
                {loading ? (
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <p className="m-0">{chainOfDelegation?.moda?.users?.legalName || "TBD"}</p>
                )}
              </div>
              <div className="col user-card-middle-border p-1">
                <h1 className="fs-4 m-0">HoLC</h1>
                <p className="m-0">{chainOfDelegation?.holc?.users?.legalName || "TBD"}</p>
              </div>
              <div className="col p-1">
                <h1 className="fs-4 m-0">House Rep</h1>
                <p className=" m-0">{chainOfDelegation?.house_rep?.users?.legalName || "TBD"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
