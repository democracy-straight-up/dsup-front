import { Link } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { circle, authenticate } from '../store/userSlice.js';
// import { baseURL } from '../store/conf.js'

import Form from "react-bootstrap/Form";

function BillItem({ bill, index }) {
  // Helper function to render advisement badge
  const renderAdvisement = (advisement) => {
    if (advisement === undefined || advisement === null) {
      return <span className="alert alert-secondary p-0 px-2 mx-1">N/A</span>;
    }
    return advisement ? (
      <span className="alert alert-success p-0 px-2 mx-1">Yea</span>
    ) : (
      <span className="alert alert-danger p-0 px-2 mx-1">Nay</span>
    );
  };

  return (
    <tr key={index}>
      <td>{bill.number}</td>
      <td style={{ minWidth: "300px" }}>{bill.title} </td>
      <td>{bill.schedule_date}</td>
      <td style={{ minWidth: "180px" }}>
        F-Del &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;
        {renderAdvisement(bill.advisements?.first_delegate?.advisement)} <br />
        Sec-Del&nbsp;&nbsp;&nbsp; &nbsp;
        {renderAdvisement(bill.advisements?.second_delegate?.advisement)} <br />
        MoDA &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{" "}
        {renderAdvisement(bill.advisements?.moda?.advisement)} <br />
        HoLC &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;
        {renderAdvisement(bill.advisements?.holc?.advisement)} <br />
        House Rep {renderAdvisement(bill.advisements?.house_rep?.advisement)} <br />
      </td>

      <td>
        {["radio"].map((type) => (
          <div key={`inline-${type}`} className="mb-3">
            <Form>
              <Form.Check inline label="YEA" name="group1" type={type} id={index} />
              <br />
              <Form.Check inline label="Nay" name="group1" type={type} id={index} />
              <br />
              <Form.Check
                inline
                label="PRESENT"
                name="group1"
                type={type}
                id={index}
                defaultChecked
              />
              <br />
              <Form.Check
                inline
                label="PROXY"
                name="group1"
                type={type}
                id={index}
                defaultChecked
              />
            </Form>
          </div>
        ))}
      </td>

      <td>
        <span className="border border-dark px-5">{bill.yea_votes_count}</span>
        <br />
        <span className="border border-dark px-5">{bill.nay_votes_count}</span>
        <br />
        <span className="border border-dark px-5">{bill.present_votes_count}</span>
        <br />
        <span className="border border-dark px-5">{bill.proxy_votes_count}</span>
        <br />
      </td>
      <td>
        <span className="border border-dark px-5">{bill.yea_votes_count}</span>
        <br />
        <span className="border border-dark px-5">{bill.nay_votes_count}</span>
        <br />
        <span className="border border-dark px-5">{bill.present_votes_count}</span>
        <br />
        <span className="border border-dark px-5">{bill.proxy_votes_count}</span>
        <br />
      </td>
      <td>
        <Link to={`/bill/${bill.id}`}> More </Link>
      </td>
    </tr>
  );
}

export default BillItem;
