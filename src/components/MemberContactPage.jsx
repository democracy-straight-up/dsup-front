import React from "react";
import {useSelector, } from 'react-redux';
function MemberContactPage() {
  // const AuthUser      = useSelector((state) => state.AuthUser.user);
  const circleInfo       = useSelector((state) => state.AuthUser.circle);
  const circleMembers    = useSelector((state) => state.AuthUser.circleMembers);

  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-12 col-md-3"></div>
          <div className="col-sm-12 col-md-6 mt-3">
              {/* <div className="row">
                  <div class="alert alert-danger" role="alert"> </div>
              </div> */}
              <h1 className="text-center">Members Contant Page </h1>
              <h3 className='text-center'>Circle: {circleInfo?.code} District: {circleInfo?.district?.code}</h3>
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
                <th className="fs-5" >Contact Information</th>
                <th className="fs-5">Contact Rules</th>
              </tr>
          </thead>
          <tbody>
            {circleMembers?.map((member, index) => (
              <tr key={index}>
                <td>{index+1}</td>
                <td>{member?.user?.users?.legalName}
                {member.is_delegate ? <span className="alert alert-primary p-0 px-2 mx-1">Del</span> : null}</td>
                <td>{member?.user?.users?.address}</td>
                {/**
                 * I am not sure how are we going to collect phone numbers of the members?
                 * consult with Don!
                 */}
                <td> +1 32123223 <br /> {member.user?.email} </td>
                <td>
                  <div className="container">
                    <div className="row">
                      <textarea rows={2} placeholder="Please specify how/when members can reach you out. ">
                      </textarea>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MemberContactPage;