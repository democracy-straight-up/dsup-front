import { useSelector } from "react-redux";
import ContactInfoItem from "./contact_info_item";
import { useEffect, useState } from "react";
import { baseURL } from "../store/conf";
import axios from "axios";
import { Suspense } from "react";

function MemberContactPage() {
  const AuthUser = useSelector((state) => state.AuthUser.user);
  const circleInfo = useSelector((state) => state.AuthUser.circle);
  const circleMembers = useSelector((state) => state.AuthUser.circleMembers);
  const [contactList, setContactList] = useState([]);

  const isDelegate = () => {
    return circleMembers.some(
      (member) =>
        member.user.username === AuthUser.username && member.is_delegate
    );
  };

  const fetchContactList = async () => {
    try {
      let header = { Authorization: `Bearer ${AuthUser.token.access}` };
      let url = `${window.location.protocol}//${baseURL}/api/contact-info/`;
      const response = await axios.get(url, { headers: header });
      // console.log("Contact List: ", response.data);
      setContactList(response.data);
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
          {/* <div className="row">
                  <div class="alert alert-danger" role="alert"> </div>
              </div> */}
          <h1 className="text-center">Members Contant Page </h1>
          <h3 className="text-center">
            Circle: {circleInfo?.code} District: {circleInfo?.district?.code}
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
              <Suspense fallback={<>loading</>}>
                <ContactInfoItem
                  key={index}
                  isDelegate={() => isDelegate()}
                  index={index}
                  member={member}
                />
              </Suspense>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MemberContactPage;
