import { useEffect } from "react";

export default function SecondDelegateNote({ bill, AuthUser }) {
  useEffect(() => {
    console.log("rendering the Second delegate note here. ");
    return () => {
      console.log("cleaning Second delegate note comes here.");
    };
  });
  return (
    <div className="container-fluid p-4">
      <h4>Second Delegate Notes</h4>
      <p>Second delegate notes will be displayed here...</p>
    </div>
  );
}
