import { useEffect } from "react";

export default function HolcNotes({ bill, AuthUser }) {
  useEffect(() => {
    console.log("Holc notes here...");

    return () => {
      console.log("Holc com unmouting and cleaning up...");
    };
  });
  return (
    <div className="container-fluid p-4">
      <h4>Holc Notes</h4>
      <p>Holc notes will be displayed here...</p>
    </div>
  );
}
