import {useSelector, } from 'react-redux';
function MeetingsAndMinutes(){
    // const AuthUser      = useSelector((state) => state.AuthUser.user);
    const podInfo       = useSelector((state) => state.AuthUser.pod);
    return(
        <div className="container">
            <div className="row">
                <div className="col-sm-12 col-md-3"></div>
                <div className="col-sm-12 col-md-6 mt-3">
                    {/* <div className="row">
                        <div class="alert alert-danger" role="alert"> </div>
                    </div> */}
                    <h1 className="text-center">Meeting And Minutes Page </h1>
                    <h3 className='text-center'>Circle: {podInfo?.code} District: {podInfo?.district?.code}</h3>
                    <p>This page is editable by the Sec-Del after a meeting schedule has been approved by the Circle Voters, via a resolution. 
                    It is accessible to all the Circle Voters represented by the F-Dels in a given F-Link.
                    </p>
                </div>
                <div className="col-sm-12 col-md-3"></div>
            </div>
        </div>
    )
} 

export default MeetingsAndMinutes;