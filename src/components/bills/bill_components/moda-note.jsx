import { useEffect } from "react";

export default function ModaNotes({ bill, AuthUser }) {
  useEffect(() => {
    console.log("Moda notes here...");

    return () => {
      console.log("moda com unmouting and cleaning up...");
    };
  });
  return (
    <div className="container-fluid p-4">
      <h4>MoDa Notes</h4>
      <p>MoDa notes will be displayed here...</p>
    </div>
  );
}
