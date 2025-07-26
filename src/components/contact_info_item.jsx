import { useState } from "react";
import { useSelector } from "react-redux";
import { baseURL } from "../store/conf";
import axios from "axios";

export default function ContactInfoItem({ index, isDelegate, member }) {
  const [editContactRules, setEditContactRules] = useState(
    member?.contact_rules
  );
  const [editEmail, setEditEmail] = useState(member?.email);
  const [editPhone, setEditPhone] = useState(member?.phone);

  const AuthUser = useSelector((state) => state.AuthUser.user);
  const [editing, setEditing] = useState(false);
  const [editingRules, setEditingRules] = useState(false);

  const canEdite = () => {
    if (isDelegate() === true) {
      return true;
    } else if (member?.member?.user.username === AuthUser.username) {
      return true;
    }

    return false;
  };

  const handleUpdate = () => {
    const data = {
      email: editEmail,
      phone: editPhone,
      user: AuthUser.username,
      contact_rules: editContactRules,
    };

    let header = { Authorization: `Bearer ${AuthUser.token.access}` };
    let url = `${window.location.protocol}//${baseURL}/api/contact-info/${member?.id}/`;

    axios
      .patch(url, data, { headers: header })
      .then((res) => {
        setEditPhone(res.data.phone);
        setEditEmail(res.data.email);
        setEditContactRules(res.data.contact_rules);
        setEditing(false);
        setEditingRules(false);
      })
      .catch((err) => console.log("error: ", err));
  };

  const ContactEditMode = () => {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12 p-2">
            <input
              type="email"
              defaultValue={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="Email"
              className="form-control"
            />
          </div>
          <div className="col-12 p-2">
            <input
              type="tel"
              defaultValue={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="Phone"
              className="form-control"
            />
          </div>
        </div>
        <div className="row p-2 gap-3 mx-auto">
          <button
            onClick={() => handleUpdate()}
            className="btn btn-primary btn-sm col-5">
            Update Contact
          </button>
          <button
            onClick={() => setEditing(false)}
            className="btn btn-secondary btn-sm col-5">
            cancel
          </button>
        </div>
      </div>
    );
  };
  const ContactRulesEditMode = () => {
    return (
      <div className="container">
        <div className="row">
          <textarea
            onChange={(e) => setEditContactRules(e.target.value)}
            rows={2}
            defaultValue={editContactRules}
            placeholder="Please specify how/when members can reach you out."></textarea>
        </div>

        <div className="row py-1 gap-1">
          <button
            onClick={() => handleUpdate()}
            className="btn  btn-primary btn-sm col-5">
            Update Rules
          </button>
          <button
            onClick={() => setEditingRules(false)}
            className="btn btn-secondary btn-sm col-5">
            cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <tr>
      <td>{index + 1}</td>
      <td>
        {member?.member.user?.users?.legalName}
        {member.member.is_delegate ? (
          <span className="alert alert-primary p-0 px-2 mx-1">Del</span>
        ) : null}
      </td>
      <td>
        {member?.address} <br />
      </td>
      <td>
        <div className="container">
          {editing === true ? (
            ContactEditMode()
          ) : (
            <div className="p-0">
              <p className="m-0">Email: {editEmail}</p>
              <p className="m-0">Phone: {editPhone}</p>
              {canEdite() === true && (
                <span
                  className="  text-primary text-decoration-underline"
                  style={{ cursor: "pointer" }}
                  onClick={() => setEditing(true)}>
                  Edit this section
                </span>
              )}
            </div>
          )}
        </div>
      </td>
      <td>
        <div className="container ">
          {editingRules === true ? (
            ContactRulesEditMode()
          ) : (
            <div className="container p-0 m-0">
              <div className="row  m-0 mb-1">
                <textarea
                  disabled={true}
                  defaultValue={editContactRules}></textarea>
              </div>
              {canEdite() === true && (
                <span
                  className=" text-sm text-primary text-decoration-underline"
                  style={{ cursor: "pointer" }}
                  onClick={() => setEditingRules(true)}>
                  Edit Contact Rules
                </span>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
