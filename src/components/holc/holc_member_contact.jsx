import { useSelector } from "react-redux";
import ContactInfoItem from "./contact_info_item";
import { useEffect, useState } from "react";
import { baseURL } from "../../store/conf";
import axios from "axios";
import { Suspense } from "react";

function HoLCMemberContactPage() {
  const AuthUser = useSelector((state) => state.AuthUser.user);
  const holc_info = useSelector((state) => state.AuthUser.holc);
  const [contactList, setContactList] = useState([]);
  const [delegate, setDelegate] = useState({});

  const fetchContactList = async () => {
    try {
      let header = { Authorization: `Bearer ${AuthUser.token.access}` };
      let url = `${window.location.protocol}//${baseURL}/api/holc/holc-member-contacts/by_holc_code/?code=${holc_info?.code}`;
      const response = await axios.get(url, { headers: header });
      setContactList(response.data);
      setDelegate(response.data.find((member) => member?.member.is_delegate) || {});
    } catch (error) {
      console.error("Error fetching contact list: ", error);
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
          <h1 className="text-center">Members Contact Page </h1>
          <h3 className="text-center">
            Sec Link: {holc_info?.code} District: {holc_info?.district?.code}
          </h3>
        </div>
        <div className="col-sm-12 col-md-3"></div>
      </div>

      <div className="row mt-3">
        {/* make a table with columns of No, Legal Name, Address, Contact Info, Contact Rules */}
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

export default HoLCMemberContactPage;
