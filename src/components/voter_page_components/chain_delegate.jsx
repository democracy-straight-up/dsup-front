import { useSelector } from "react-redux";
export default function ChainOfDelegate() {
  const AuthUser = useSelector((state) => state.AuthUser.user);
  return (
    <div className="container my-2">
      <div className="row align-items-start">
        <div className="col-md-8 offset-md-2 ">
          <div className="card rounded-3 bg-light">
            <div className="row text-center m-0">
              <div className="col  p-1">
                <h1 className="fs-4 m-0">Voter</h1>
                <p className="m-0 text-capitalize">{AuthUser?.users?.legalName}</p>
              </div>
              <div className="col user-card-middle-border p-1">
                <h1 className="fs-4 m-0">F-Del</h1>
                <p className="m-0">TBD </p>
              </div>
              <div className="col  user-card-middle-border p-1">
                <h1 className="fs-4 m-0">Sec-Del</h1>
                <p className="m-0">TBD </p>
              </div>
              <div className="col user-card-middle-border p-1">
                <h1 className="fs-4 m-0">MoDA</h1>
                <p className="m-0">TBD </p>
              </div>
              <div className="col user-card-middle-border p-1">
                <h1 className="fs-4 m-0">HoLC</h1>
                <p className="m-0">TBD </p>
              </div>
              <div className="col p-1">
                <h1 className="fs-4 m-0">House Rep</h1>
                <p className=" m-0">TBD</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
