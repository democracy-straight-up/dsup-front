import { useEffect } from "react";

export default function FirstDelegateNote({ bill, AuthUser }) {
  useEffect(() => {
    console.log("rendering the first delegate note here. ");
    return () => {
      console.log("cleaning first delegate note comes here.");
    };
  });
  return (
    <div className="container-fluid p-4">
      <h4>First Delegate Notes</h4>
      <p>First delegate notes will be displayed here...</p>
    </div>
  );
}
