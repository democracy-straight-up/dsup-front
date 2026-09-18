import { useState } from "react";
import { useSelector } from "react-redux";
import { baseURL } from "../../store/conf";
import axios from "axios";

export default function ContactInfoItem({ index, delegate, member }) {
  const [editContactRules, setEditContactRules] = useState(member?.contact_rules);
  const [savedContactRules, setSavedContactRules] = useState(member?.contact_rules);
  const [editEmail, setEditEmail] = useState(member?.email);
  const [editPhone, setEditPhone] = useState(member?.phone);
  const [savedContact, setSavedContact] = useState({
    email: member?.email,
    phone: member?.phone,
  });
  const [editAddress, setEditAddress] = useState(member?.address);
  const [savedAddress, setSavedAddress] = useState(member?.address);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const AuthUser = useSelector((state) => state.AuthUser.user);

  const [editing, setEditing] = useState(false);
  const [editingRules, setEditingRules] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);

  const canEdit = () => {
    if (delegate?.member?.user?.username === AuthUser?.username) {
      return true;
    }

    return false;
  };

  const handleUpdate = () => {
    if (saving) return;

    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    const data = {
      email: editEmail,
      phone: editPhone,
      user: AuthUser.username,
      address: editAddress,
      contact_rules: editContactRules,
    };

    let header = { Authorization: `Bearer ${AuthUser.token.access}` };
    let url = `${window.location.protocol}//${baseURL}/api/circle-member-contacts/${member?.id}/`;

    axios
      .patch(url, data, { headers: header })
      .then((res) => {
        setSaveSuccess("Contact information saved.");
        setSavedContact({
          email: res.data.email,
          phone: res.data.phone,
        });
        setEditPhone(res.data.phone);
        setEditEmail(res.data.email);
        setEditAddress(res.data?.address);
        setSavedAddress(res.data?.address);
        setSavedContactRules(res.data?.contact_rules);
        setEditContactRules(res.data?.contact_rules);
        setEditing(false);
        setEditingAddress(false);
        setEditingRules(false);
      })
      .catch(() => {
        setSaveError("Could not save contact information. Please try again.");
      })
      .finally(() => {
        setSaving(false);
      });
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
            disabled={saving}
            className="btn btn-primary btn-sm col-5"
          >
            {saving ? "Saving..." : "Update Contact"}
          </button>
          <button
            disabled={saving}
            onClick={() => {
              setEditEmail(savedContact.email);
              setEditPhone(savedContact.phone);
              setSaveError("");
              setSaveSuccess("");
              setEditing(false);
            }}
            className="btn btn-secondary btn-sm col-5"
          >
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
            value={editContactRules ?? ""}
            placeholder="Please specify how/when members can reach you out."></textarea>
        </div>

        <div className="row py-1 gap-1">
          <button
            onClick={() => handleUpdate()}
            disabled={saving}
            className="btn btn-primary btn-sm col-5"
          >
            {saving ? "Saving..." : "Update Rules"}
          </button>
          <button
            disabled={saving}
            onClick={() => {
              setEditContactRules(savedContactRules);
              setSaveError("");
              setSaveSuccess("");
              setEditingRules(false);
            }}
            className="btn btn-secondary btn-sm col-5"
          >
            cancel
          </button>
        </div>
      </div>
    );
  };

  const AddressEditMode = () => {
    return (
      <div className="container">
        <div className="row">
          <textarea
            onChange={(e) => setEditAddress(e.target.value)}
            rows={2}
            defaultValue={editAddress}
            placeholder="Please specify your address."></textarea>
        </div>

        <div className="col py-1 gap-1">
          <button
            onClick={() => handleUpdate()}
            disabled={saving}
            className="btn btn-primary btn-sm"
          >
            {saving ? "Saving..." : "Update Address"}
          </button>
          <button
            disabled={saving}
            onClick={() => {
              setEditAddress(savedAddress);
              setSaveError("");
              setSaveSuccess("");
              setEditingAddress(false);
            }}
            className="btn btn-secondary btn-sm mx-2"
          >
            cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
    <tr>
      <td>{index + 1}</td>
      <td>
        {member?.member.user?.users?.legalName}
        {member.member.is_delegate ? (
          <span className="alert alert-primary p-0 px-2 mx-1">Del</span>
        ) : null}
      </td>
      <td>
        <div className="container">
          {editingAddress === true ? (
            AddressEditMode()
          ) : (
            <div className="p-0">
              <p className="m-0">Address: {editAddress}</p>
              {canEdit() === true && (
                <span
                  className="  text-primary text-decoration-underline"
                  style={{ cursor: "pointer" }}
                  onClick={() => setEditingAddress(true)}>
                  Edit this section
                </span>
              )}
            </div>
          )}
        </div>
      </td>
      <td>
        <div className="container">
          {editing === true ? (
            ContactEditMode()
          ) : (
            <div className="p-0">
              <p className="m-0">Email: {editEmail}</p>
              <p className="m-0">Phone: {editPhone}</p>
              {canEdit() === true && (
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
                <textarea disabled={true} value={editContactRules ?? ""}></textarea>
              </div>
              {canEdit() === true && (
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
    {(saveError || saveSuccess) && (
      <tr>
        <td colSpan={5}>
          {saveError && (
            <div role="alert" className="alert alert-danger mb-0">
              {saveError}
            </div>
          )}
          {saveSuccess && (
            <div role="status" className="alert alert-success mb-0">
              {saveSuccess}
            </div>
          )}
        </td>
      </tr>
    )}
    </>
  );
}
