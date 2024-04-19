import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { pod, authenticate } from '../store/userSlice.js';
import { baseURL } from '../store/conf.js'
import jwtDecode from 'jwt-decode';
import { Container, Row, Col, Table } from 'react-bootstrap';
import Bill_Item from './bills/bill_item.jsx';

// import { retrieveBillsSuccess } from '../store/billSlice';

function VoterPage() {
    const AuthUser = useSelector((state) => state.AuthUser.user);
    const [message, setMessage] = useState({ type: 'alert alert-', msg: '' });
    const [token, setToken] = useState('');
    const [action, setAction] = useState('');
    // eslint-disable-next-line
    const [pageLoaded, setPageLoaded] = useState(false)
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const podMembers = useSelector((state) => state.AuthUser.podMembers);
    const [delegate, setDelegate] = useState(podMembers?.filter((e) => e.is_delegate === true)[0]);
    // const bills = useSelector((state) => state.bills.bills);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [bills, setBills] = useState({})

    let date = new Date(AuthUser.date_joined)

    // get the new access token on each page load or redirect
    useEffect(() => {
        const TokenUrl = `${window.location.protocol}//${baseURL}/api/token/refresh/`;
        const token_params = { refresh: AuthUser.token.refresh }
        axios.post(TokenUrl, token_params)
            .then(response => {
                if (response.status === 200) {
                    // set the new access token and which btn is clicked via clicked const.
                    setToken(response.data.access);
                    let u = { ...AuthUser }
                    u.token = { refresh: AuthUser.token.refresh, access: response.data.access }
                    dispatch(authenticate(u))
                    setAction('userinfo')
                } else {
                    setMessage({ type: "alert alert-danger", msg: "could not get access token" })
                }
            })
            .catch(error => {
                setMessage({ type: "alert alert-danger", msg: "something went wrong with your request" })
                // setErr("Something went wrong. Check your inputs and try again.");
            });
    }, [])

    // load bills
    useEffect(()=>{
        let header = { 'Authorization': `Bearer ${AuthUser.token.access}` }
        axios.get(`${window.location.protocol}//${baseURL}/bill/bills/?page=${currentPage}`, { headers: header })
            .then(response => { setBills(response.data) })
            .catch(error => {
                setMessage({ type: "alert alert-danger", msg: "error getting bills." })
                // setErr("Something went wrong. Check your inputs and try again.");
                console.log(error)
            });
    },[currentPage, ])


    useEffect(() => {
        switch (action) {
            // if no action is specified, fetch user info and pod
            case 'userinfo':
                if (AuthUser.token.access.length > 0) {
                    const url = `${window.location.protocol}//${baseURL}/api/userinfo/`;
                    const params = { user: AuthUser.username }
                    let header = { 'Authorization': `Bearer ${AuthUser.token.access}` }
                    axios.post(url, params, { headers: header })
                        .then(response => {
                            if (response.status === 200) {
                                let token = AuthUser.token
                                dispatch(authenticate({ ...response.data.user, token }))
                                if (response.data.user.users.userType === 1) {
                                    dispatch(pod(response.data.pod))
                                }
                            } else {
                                setMessage({ type: "alert alert-danger", msg: "could not get user info and pod" })
                            }
                        })
                        .catch(error => {
                            console.log("error on fetching user and pod info:", error)
                        });
                }
                break
            case 'joinPd':
                console.log("joining a pod here")
                break
            case 'createPod':
                console.log("creating a pod")
                if (token.length > 0) {
                    let header = { 'Authorization': `Bearer ${token}` }
                    const url = `${window.location.protocol}//${baseURL}/api/create-pod/`
                    const param = { "user": AuthUser.username, 'district': AuthUser.users.district.code }
                    axios.post(url, param, { headers: header })
                        .then(response => {
                            if (response.status === 400) {
                                setMessage({ msg: response.data.message, type: "alert alert-danger" })
                            } else if (response.status === 200) {
                                dispatch(pod(response.data))
                                let u = { ...AuthUser }
                                u.userType = 1
                                dispatch(authenticate(u))
                                setMessage({ type: "alert alert-success", msg: "pod created." })
                                // nagivate to voter page...
                                navigate('/house-keeping-page');
                            } else {
                                console.log("something went wrong:", response)
                            }
                        })
                        .catch(error => {
                            console.log("err: ", error)
                            setMessage({ msg: error.response?.data?.message, type: "alert alert-danger" })
                        });
                }
                break
            default:
                console.log("defualt is here")
        }
    }, [action])

    useEffect(() => {
        const isTokenExpired = () => {
            const decodedToken = jwtDecode(AuthUser.token.refresh);
            return decodedToken.exp < Date.now() / 1000;
        };

        if (isTokenExpired()) {
            navigate('/enter-the-floor');
        }
    }, []);

    const houseKeepingType = () => {
        switch (AuthUser?.users?.userType) {
            case 0:
                return (
                    <div className="row text-center">
                        <div className="col-sm-12 ">
                            <Link to={'/join-pod'} className="btn btn-success m-2">Join a Circle</Link>
                        </div>
                        <div className="col-sm-12 ">
                            <a onClick={() => setAction('createPod')} className="btn btn-success m-2">Create a Circle</a>
                        </div>
                    </div>
                )
            case 1:
                return (
                    <div className="row text-center">
                        <div className="col-sm-12 col-lg-6 my-1">
                            <Link to='/house-keeping-page' className="btn btn-primary "> My Circle</Link>
                        </div>
                        {/* add if the user is delegate and then show this two. */}
                        {AuthUser?.username === delegate?.user?.username ? <>
                            <div className="col-sm-12 col-lg-6 my-1">
                                <a className="btn btn-primary " style={{ whiteSpace: 'nowrap' }} >Join First Link</a>
                            </div>
                            <div className="col-sm-12 col-lg-6 my-1">
                                <a className="btn btn-primary " style={{ whiteSpace: 'nowrap' }} >Create First Link</a>
                            </div>
                        </>
                            : ""}
                        <div className="col-sm-12 col-lg-6 my-1">
                            <Link className='btn btn-primary' style={{ whiteSpace: 'nowrap' }} to={'/pod-back-n-forth'}>Back & Forth</Link>
                            {/* <a className="btn btn-primary m-2" >Back-and-Forth</a> */}
                        </div>
                    </div>
                )

            default:
                return (
                    <div className='row text-center'>
                        <h5>Something is wrong with your registration.</h5>
                    </div>
                )
        }
    }
    return (
        <div className="container">
            <div className="row">
                <div className="col">
                    {message.msg ?
                        <div className={message?.type} role="alert"> {message?.msg}</div>
                        : ""}

                    {AuthUser?.users?.is_reg ?
                        <div className="alert alert-warning mt-3">
                            <p>
                                You have to got until <span className='text-danger'>{date.toDateString()}</span> to
                                registered to vote in your district or your account will be deleted! Yikes!
                                <a href="#"> Learn More</a>.
                            </p>
                            <p>
                                But, if you have gotten registered since the last time you entered the floor,
                                <a href="#"> click here</a>.
                            </p>
                        </div>
                        : ""}
                </div>
            </div>
            <Container style={{ marginTop: "2%" }} >
                <div className="row text-center">
                    <h1>Voter Page</h1>
                </div>
                <Row>
                   
                    <Col>
                        <Row>
                            <Col xs="auto">
                                <p className="text-left">Voter Name:</p>
                            </Col>
                            <Col>
                                <p>{AuthUser?.users?.legalName}</p>
                            </Col>
                        </Row>
                    </Col>
                    <Col>
                        <Row>
                            <Col xs="auto">
                                <p className="text-left">Verification Score:</p>
                            </Col>
                            <Col>
                                <p>{AuthUser?.users?.verificationScore}/7</p>
                            </Col>
                        </Row>
                    </Col>
                    <Col>
                        <Row>
                            <Col xs="auto">
                                <p className="text-left">District:</p>
                            </Col>
                            <Col>
                                <p>{AuthUser.users?.district?.code}</p>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>

            {/* the three columns on  kyle note: fix to center the below when on mobile*/}

            <div className="row d-flex justify-content-center align-items-center mt-2">
                <div className="col-sm-12 col-md-4 d-flex justify-content-center text-lg-start text-center text-md-start">
                    <ul className="list-unstyled">
                        {/* {(AuthUser?.users?.userType != 0) ? <li className="mb-2"><Link to={'/voter-page'}>List of Delegates</Link></li>:""} */}
                        {(AuthUser?.users?.userType != 0) ? <li className="mb-2"><Link to={'/pod-back-n-forth'}> Back-and-Forth </Link></li>:""}
                        {(AuthUser?.users?.userType != 0) ? <li className="mb-2"><Link to={'/member-contact'}>  Member Contact Page </Link></li>:""}
                        {(AuthUser?.users?.userType != 0) ? <li className="mb-2"><Link to={'/house-keeping-page'}>Pod Housekeeping Page </Link></li>:""}
                    </ul>
                </div>
                <div className="col-sm-12 col-md-4 d-flex justify-content-center">
                    {houseKeepingType()}
                </div>
                <div className="col-sm-12 col-md-4 d-flex justify-content-center text-lg-start text-center text-md-start">
                    <ul className="list-unstyled">
                        {(AuthUser?.users?.userType != 0) ? <>
                            {/* <li className="mb-2"><Link to={'/meeting-schedule'}> First Link Meeting Schedule </Link></li> */}
                            <li className="mb-2"><Link to={'/meetings-and-minutes'}> Meetings & Minutes </Link></li>
                            {/* <li className="mb-2"><Link to={'/voter-page'}> Bill Metrics </Link></li> */}
                            <li className="mb-2"><Link to={'/voter-page'}> Voter Settings </Link></li>
                        </>:""}
                    </ul>
                </div>
            </div>
            <h1 className="header-semibold" style={{ marginBottom: "1%" }}>List of Bills</h1>
            {/* <p> <Link> Bills sorted by Latest Action </Link></p> */}
            <Table striped bordered hover responsive>
                <thead>
                    <tr className='bills-list-voter-page-header-row'>
                        <th>Bill Number</th>
                        <th style={{"minWidth":"300px"}}>Short Title</th>
                        <th>Scheduled For Vote</th>
                        <th>Advisement</th>
                        <th>Your Vote</th>
                        <th>District Tally</th>
                        <th>National Tally</th>
                        <th>More...</th>
                    </tr>
                </thead>
                <tbody>
                    {bills?.results?.map((bill, index) => (
                        <Bill_Item bill={bill} key={index} index={index}></Bill_Item> 
                    ))}
                </tbody> 
                <tfoot className='border-0'>
                    <tr className='p-2 border-0'>
                        <td colSpan={4} className='border-0'></td>
                        <td colSpan={4} className='border-0' style={{ textAlign: 'right' }}>
                            {bills?.previous ? <span 
                                className='btn btn-outline-success mx-1 p-0 px-3'
                                onClick={()=>setCurrentPage(currentPage-1)}>Previous</span> : ""}

                            {bills?.previous ? <span 
                                    className='btn btn-outline-success mx-1 p-0 px-3'
                                    onClick={()=>setCurrentPage(currentPage-1)}>{currentPage-1}</span>: ""}

                            <span className='btn btn-success mx-1 p-0 px-3'>{currentPage}</span>

                            {bills?.next ? <span 
                                    className='btn btn-outline-success mx-1 p-0 px-3' 
                                    onClick={()=>setCurrentPage(currentPage+1)}>{currentPage+1}</span> : ""}
                            
                            {bills?.next ? <span 
                                className='btn btn-outline-success mx-1 p-0 px-3'
                                onClick={()=>setCurrentPage(currentPage+1)}>Next</span> : ""}
                        </td>
                    </tr>
                </tfoot>
            </Table>
        </div>
    )
}
export default VoterPage;