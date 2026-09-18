import { useSelector } from "react-redux";
import ContactInfoItem from "./contact_info_item";
import { useEffect, useState } from "react";
import { baseURL } from "../../store/conf";
import axios from "axios";
import { Suspense } from "react";

function CircleMemberContactPage() {
  const AuthUser = useSelector((state) => state.AuthUser.user);
  const circleInfo = useSelector((state) => state.AuthUser.circle);
  const [contactList, setContactList] = useState([]);
  const [delegate, setDelegate] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const fetchContactList = async () => {
  setLoading(true);
  setError("");

  try {
    let header = { Authorization: `Bearer ${AuthUser.token.access}` };
    let url = `${window.location.protocol}//${baseURL}/api/circle-member-contacts/`;
    const response = await axios.get(url, { headers: header });
    setDelegate(response.data.find((member) => member?.member.is_delegate) || {});
    setContactList(response.data);
  } catch (error) {
    console.error("Error fetching contact list: ", error);
    setError("Could not load member contacts. Check your connection and try again.");
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    fetchContactList();
  }, []);

  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-12 col-md-3"></div>
        <div className="col-sm-12 col-md-6 mt-3">
          <h1 className="text-center">Member Contact Page </h1>
          <h3 className="text-center">
            Circle: {circleInfo?.code} District: {circleInfo?.district?.code}
          </h3>
        </div>
        <div className="col-sm-12 col-md-3"></div>
      </div>

      <div className="row mt-3">
        {/* make a table with columns of No, Legal Name, Address, Contact Info, Contact Rules */}
        {loading && (
            <div role="status" className="alert alert-info">
              Loading member contacts...
            </div>
          )}
          {error && (
            <div role="alert" className="alert alert-danger">
              {error}
            </div>
          )}
        <table className="table table-bordered">
          <thead>
            <tr className="">
              <th className="fs-5">No</th>
              <th className="fs-5">Legal Name</th>
              <th className="fs-5">Address</th>
              <th className="fs-5">Contact Information</th>
              <th className="fs-5">Contact Rules</th>
            </tr>
          </thead>
          <tbody>
            {contactList?.map((member, index) => (
              <Suspense key={index} fallback={<>loading</>}>
                <ContactInfoItem delegate={delegate} index={index} member={member} />
              </Suspense>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CircleMemberContactPage;
