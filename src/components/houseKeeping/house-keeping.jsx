import {useSelector,useDispatch, } from 'react-redux';
import {useNavigate,Link} from 'react-router-dom';
import {useState, useEffect} from 'react';
import {pod,desolvePod,authenticate,addPodmMembers} from '../../store/userSlice.js';
import Member from './member.jsx'
import Candidate  from './candidate.jsx';
import axios from "axios";
import Status from './statusMessages.jsx';

function HouseKeeping(){
    const AuthUser      = useSelector((state) => state.AuthUser.user);
    const podInfo       = useSelector((state) => state.AuthUser.pod);
    const [err, setErr] = useState('');
    const [connectionErr, setConnectionErr] = useState(null);
    const navigate      = useNavigate();
    const dispatch      = useDispatch();

    /** We have fDEl object which contains the details of FDel.
     * Iam_delegate is true if the auth user is a delegate.
     * Iam_member is true of the auth user is a member
      */
    const [ fDel , setFDel] = useState('');
    const [Iam_delegate, setIam_delegate] = useState(false);
    const [Iam_member, setIam_member] = useState(false);
    const [dissolve, setDissolve] = useState(false);
    const [candidate, setCandidate]   = useState('');
    const [members, setMembers]  = useState('');
    const [Iam_candidate, setIam_candidate] = useState(false);

    let ws_schame = window.location.protocol === "https:" ? "wss" : "ws";
    const url = `${ws_schame}://${process.env.REACT_APP_BASE_URL}/circle/${podInfo?.code}/${AuthUser.username}`
    const chatSocket = new WebSocket(url);

    useEffect(()=>{
        // on each member change, check if the Circle has one member.
        if(members.length <= 1 && candidate.length === 0){ setDissolve(true); 
        }else { setDissolve(false)}
    },[candidate,members,])

    useEffect(()=>{
        // if(members?.length > 5){
            // check for circle endpoint to update
            // getting the update of pod as it has become active.
            const podURL = `${window.location.protocol}//${process.env.REACT_APP_BASE_URL}/api/circle/${podInfo.id}/`;
            let header = { 'Authorization': `Bearer ${AuthUser.token.access}` }
            axios.get(podURL,{ headers: header } )
            .then((response)=>{ dispatch(pod(response.data))})
            .catch(err=>console.log(err))
        // }
    },[members,])


    // Function to update the error state and schedule the reset
    useEffect(() => {
        // Schedule the reset after 5000 milliseconds (5 seconds)
        setTimeout(() => { setErr('');}, 10000);
    },[err,])

    const MembersFilter = (data)=>{
        /** This function gets called on each message being sent from server
         * it saperate the delegate, members and candidates and sets their state
         */
        // if the new data being received is invitation key change, 
        // update the circle global state and return nothing to stop the function
        if(data.action === 'invitationKey'){
            dispatch(pod(data.circle))
            return
        }
        if(data.action === 'dissolve' && data.status === 'success'){
            dispatch(desolvePod())
            // set the userType to 0 and reset AuthUser
            let u = {...AuthUser}
            u.userType = 0
            dispatch(authenticate(u))
            // navigate back to voter page
            navigate('/voter-page');
        }

        if(data.status === 'success'){
            // on each members and candidate changes, check if the auth user is inside the list! 
            // if not, redirect to the voter page.
            if(!data.member_list?.find((member)=> member.user.username === AuthUser.username)){
                setErr('You have been removed fron this circle. Taking you back to your voter page.');
                navigate('/voter-page');
            }
            /**
             * set Iam_candidate or Iam_member to true based on AuthUser and is_member
             * and set Iam_delegate to true based on AuthUser and is_delegate
             */
            setIam_delegate(data.member_list?.find((member)=> member.user.username === AuthUser.username)?.is_delegate)
            setIam_member(data.member_list?.find((member)=> member.user.username === AuthUser.username)?.is_member)
            setIam_candidate(data.member_list?.find((member)=> member.user.username === AuthUser.username)?.is_member==false)

            /** set the fDel, candidate list and memebers list on each new message.
             * these new messages can come from joining a circle, vote in , vote out and ...
             * basically any changes to the circle can send back the list of members
             */
            setMembers(data.member_list?.filter((member)=> member.is_member))
            setFDel(data.member_list?.find((member) => member.is_delegate))
            setCandidate(data.member_list?.filter((member)=> !member.is_member))

            // this is circle members list is only for global state to use elsewhere.
            dispatch(addPodmMembers(data.member_list?.filter((member)=> member.is_member)))
        }
        if(data.status === 'error'){
            /** if the auth user is the same as user on error message:
             * set the error state to show to the user.
             */
            if(data.user.username === AuthUser.username){setErr(data.message)}
        }
    }

    useEffect(()=>{
        /** This is the functions that receives all the messages from server */
        chatSocket.onmessage = function(e) {
            const data = JSON.parse(e.data);
            /**
             * all the messages that comes from this end point is the same. 
             * it contains pod members
             * make a function that gets the data and saperate the candidates and members
             * adds the candidates and members to their states. 
             */
            // console.log("got new message: ", data)
            MembersFilter(data)
        };

        // what happens on closing the connection
        chatSocket.onclose = (e)=>{
            setConnectionErr("live connection is closed. Please refresh your page!");
        }


        // close the connection on page leave. cleanup function
        return () => {
            /**
             * 1. close the connection
             * 2. clear the states
             * 3. terminate any functions in running or in background 
             */
            setMembers('');
            setCandidate('');
            clearTimeout();
            setFDel('');
            // return () => { clearTimeout(resetTimeout); };
            console.log("closing the connection");
        }
    },[])


    // update or change the circle invitation key
    const invitationKey=()=>{
        chatSocket.send(JSON.stringify({
            "action":"invitationKey",
            "payload":{ "pod":podInfo.code,}
        }))
    }
    return (
        <div className="container">
            <div className="row">
                <div className="col-sm-12 col-md-3"></div>
                <div className="col-sm-12 col-md-6 mt-3">
                    <div className="row">
                        { err ? <div className="alert alert-danger" role="alert">{err} </div>:null}
                        { connectionErr ? <div className="alert alert-danger" role="alert">{connectionErr} </div>:null}
                    </div>
                    <h1 className="text-center">Housekeeping Page</h1>
                    <h3 className='text-center'>Circle No. {podInfo?.code} District: {podInfo?.district.code}</h3>
                    <h4 className='text-center'>Invitation Key: {podInfo?.invitation_code}</h4>

                    {fDel?.user?.username === AuthUser?.username ?
                        <button className='d-block mx-auto my-2 btn btn-success text-center' 
                        onClick={()=>invitationKey()}>Generate new key</button> 
                        :null}
                    
                    {podInfo?.is_active?
                        <p className='text-center'>Circle Status: ACTIVE!</p>
                    : null}
                </div>
                <div className="col-sm-12 col-md-3"></div>
            </div>
            <div className="row">
                <table className='table table-bordered '> 
                    <thead>
                        <tr>
                            <th className='fw-bold'>#</th>
                            <th className='fw-bold'>Member Name</th>
                            {podInfo?.is_active ? <>
                                <th className='fw-bold'>Put forward as First Delegate</th>
                            </>:null}
                            { Iam_delegate ? <th className='fw-bold'>Remove Member</th> :<th></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {/**
                         * It will always be 1 at least. 
                         * first check if the members is greater than 0. 
                         *  */ }
                        {members?.length > 0 ? 
                            members?.map((member, index)=>(
                                <Member 
                                key={index} 
                                dissolve={dissolve}
                                index={index} 
                                podInfo={podInfo}
                                member={member}
                                chatSocket = {chatSocket}
                                Iam_member={Iam_member}
                                Iam_delegate={Iam_delegate}
                                fDel={fDel}></Member>
                            ))
                        :null}
                    </tbody>
                </table>
                
                {/* candidate list table */}
                <p className='py-0 my-0 mt-2'>Candidate(s) awaiting votes...</p>
                <table className='table table-bordered '> 
                    <thead>
                        <tr>
                            <th className='fw-bold'>#</th>
                            <th className='fw-bold'>Candidate Name</th>
                            {Iam_delegate || Iam_member ? <th className='fw-bold'>Do you want this candidate to be a member?</th>:null} 
                            {Iam_delegate ? <th className='fw-bold'>Remove Candidate</th>:null}
                        </tr>
                    </thead>
                    <tbody>
                    {/**
                     * check if the candidate list is greater than 0
                     * 
                     */}
                     {candidate?.length > 0 ? 
                        candidate?.map((candidate, index)=>(
                            <Candidate 
                            chatSocket = {chatSocket} 
                            key={index} 
                            index={index} 
                            Iam_member={Iam_member}
                            Iam_delegate={Iam_delegate}
                            candidate={candidate}
                            fDel={fDel}></Candidate>
                        ))
                     :<tr><td colSpan='4' className='text-center'>No Candidates</td></tr>}
                    </tbody>
                </table>

            </div>

            {/* status messages */}
            <Status 
            Iam_delegate={Iam_delegate}
            Iam_member={Iam_member}
            Iam_candidate={Iam_candidate}
            podInfo={podInfo}
            candidate ={candidate}
            members = {members}
            >
            </Status>
        </div>
    )
}

export default HouseKeeping