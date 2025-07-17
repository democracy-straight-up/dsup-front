import { useParams } from "react-router-dom";

// ** READ BELOW **

// this is a sample page for the bill page, it is not connected to the backend
// currently, this is mimicking a situation where the person signed in is a regular user, and is not a first del or higher
// the notes section is currently not connected to the backend, but it is a good example of how we can implement it
// nothing will persist, and "add notes" buttons will have to be added and conditionally rendered later on, this
// is a quick example and is hard coded and not meant to be a long term solution

function Insight() {
  const { id } = useParams();
  console.log("id", id);
  return (
    <div className="container my-4">
      {/* row section for bill stats and text */}
      <div className="row">
        <h1>H.R. 123</h1>
        <h5>Bill Title</h5>
        <br />
        <h5>Latest Actions</h5>
        <ul className="mx-3">
          <li>Date</li>
          <li>Action</li>
        </ul>

        {/* card container for bill text */}
        <div className="card p-3">
          <h5>Text</h5>
          <article>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
            dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
            mollit anim id est laborum.
          </article>
        </div>
      </div>

      {/* row section for bill personal notes */}
      <div className="row my-5">
        <h1>Personal Notes:</h1>
        {/* textarea full width of row for personal notes */}

        <div
          className="border border-secondary rounded p-2 mb-3"
          contentEditable
          style={{ overflow: "auto", minHeight: "100px", maxHeight: "200px" }}></div>
      </div>

      {/* row section for bill first delegate notes */}
      <div className="row my-5">
        <h1>First Delegate Notes:</h1>
        {/* textarea full width of row for first delegate notes */}
        <div
          className="border border-secondary rounded p-2 mb-3"
          contentEditable
          style={{ overflow: "auto", minHeight: "100px", maxHeight: "200px" }}></div>
      </div>

      {/* row section for bill second delegate notes */}
      <div className="row my-5">
        <h1>Second Delegate Notes:</h1>
        {/* textarea full width of row for second delegate notes */}
        <div
          className="border border-secondary rounded p-2 mb-3"
          contentEditable
          style={{ overflow: "auto", minHeight: "100px", maxHeight: "200px" }}></div>
      </div>

      {/* row section for bill Member of District Assembly notes */}
      <div className="row my-5">
        <h1>MoDa Notes:</h1>
        {/* textarea full width of row for MoDa notes */}
        <div
          className="border border-secondary rounded p-2 mb-3"
          contentEditable
          style={{ overflow: "auto", minHeight: "100px", maxHeight: "200px" }}></div>
      </div>

      {/* row section for bill Co-Rep notes */}
      <div className="row my-5">
        <h1>HoLC Notes:</h1>
        {/* textarea full width of row for HoLC notes */}
        <div
          className="border border-secondary rounded p-2 mb-3"
          contentEditable
          style={{ overflow: "auto", minHeight: "100px", maxHeight: "200px" }}></div>
      </div>

      {/* row section for bill House Rep note */}
      <div className="row my-5">
        <h1>House Rep Notes:</h1>
        {/* textarea full width of row for House Rep notes */}
        <div
          className="border border-secondary rounded p-2 mb-3"
          contentEditable
          style={{ overflow: "auto", minHeight: "100px", maxHeight: "200px" }}></div>
      </div>
    </div>
  );
}

export default Insight;
