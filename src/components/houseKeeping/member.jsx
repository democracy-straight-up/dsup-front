import {useSelector } from 'react-redux';
import {useState, useEffect} from 'react';
import axios from "axios";
import { baseURL } from '../../store/conf.js'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';

const Member = ({member, index, chatSocket,dissolve, fDel, podInfo, Iam_member, Iam_delegate}) => {
    const AuthUser  = useSelector((state) => state.AuthUser.user);
    const [voted_out, setVoted_out] = useState(false);
    const [put_farward, setPut_farward] = useState(false);
    const [clicked, setClicked] = useState(false)   //check the member that clicked

    const [showModal, setShowModal] = useState(false);

    const handleInputChange = () => {
      // Open the modal when the input value changes
      setShowModal(true);
    };
  
    const handleCloseModal = () => {
      // Close the modal without performing the action
      setShowModal(false);
    };

    // checking if the member voted out for the member
    useEffect(()=>{ 
        /** Check for the AuthUser if he/she voted in for this candidate */
        const Url = `${window.location.protocol}//${baseURL}/api/circle-vote-out-list/`;
        axios.get(Url, {params: { member: member.id} },
        {headers: { Authorization: `Bearer ${AuthUser.token.access}`}})
        .then(response=>{
            // checking whether the auth user has voted for this candidate
            response.data.map((res)=>{ if(res.voter == AuthUser.id){setVoted_out(true) }})
        })
        .catch(err=>console.log(err))
    },[clicked])

    // checking if the member voted for gelegation.
    useEffect(()=>{ 
        /** Check for the AuthUser if he/she vote for delegation  */
        const putFarwardURL = `${window.location.protocol}//${baseURL}/api/circle-put-farward-list/`;
        axios.get(putFarwardURL, {params: { member: member.id} },
        {headers: { Authorization: `Bearer ${AuthUser.token.access}`}})
        .then(response=>{
            // checking whether the auth user has voted for delegation.
            response.data.map((res)=>{ if(res.voter == AuthUser.id){setPut_farward(true) }})
        })
        .catch(err=>console.log(err))
    },[clicked])


    const removeMember = ()=>{
        /** send the vote to the server */
        chatSocket.send(JSON.stringify({
            "action":"remove_candidate",
            "payload":{
                "remover": AuthUser.username,
                "candidate":member.id,
                "pod":member.pod.code,
            }
        }))
    }
    
    const voteOut = ()=>{
        /** send the vote to the server */
        chatSocket.send(JSON.stringify({
            "action":"vote_out",
            "payload":{
                "voter": AuthUser.username,
                "member":member.id,
                "pod":member.pod.code,
            }
        }))
    }

    const removeCircle = ()=>{
        /** send the vote to the server */
        chatSocket.send(JSON.stringify({
            "action":"dissolve",
            "payload":{
                "voter": AuthUser.username,
                "member":member.id,
                "pod":member.pod.code,
            }
        }))
    }


    const putFarward = ()=>{
        /** send the vote to the server */
        chatSocket.send(JSON.stringify({
            "action":"putFarward",
            "payload":{
                "voter": AuthUser.username,
                "member":member.id,
                "pod":member.pod.code,
            }
        }))
        setClicked(!clicked);
    }

    return (
        <>
        <tr>
            <td>{index+1}</td>
            <td> {member?.user?.users?.legalName}
                { member?.is_delegate ? <span className='alert alert-success p-0 px-2 mx-2'>F-Del</span>:null}
            </td>

            {podInfo?.is_active ? <>
            {/* ckeck if the member is auth user so that he/she can not vote for his own delegation  */}
                <th className='fw-bold'>Yes 
                    <input
                    type="checkbox" 
                    checked={put_farward}
                    onChange={()=>putFarward()}
                    className='form-check-input mx-2'
                    /> 
                    <span className="alert alert-primary p-0 px-2 mx-2">{member?.count_put_farward} votes</span>
                </th>
            </>:null}
             {/* if the pod is not active
             and the member is delegate
             then can he remove the member.
             otherwise, the members can vote out to remove.. */}

             {/* you can not not remove yourself. */}
             {member?.user?.username === AuthUser.username ? <td>
                {/* check if the circle is dissolvable.  */}
               
                {dissolve === true ? <>
                    Dissolve This Circle {dissolve} ? 
                    <input type='checkbox' checked={clicked} 
                    onChange={()=>handleInputChange()} 
                    className='form-check-input mx-2'/>
                </> :null}

             </td> :

                podInfo?.is_active === true ? 
                // if the user vote out this member
                <td> Yes 
                    {!voted_out ? 
                        <input checked={voted_out}
                        onChange={()=>voteOut()}
                        type="checkbox"  
                        className='form-check-input mx-2' /> 
                    :null}
                    <span className="alert alert-primary p-0 px-2 mx-2">{member?.count_vote_out} votes</span>
                </td>

                :
                // if the circle is not active and the auth user is the delegate. 
                // then he can remove the members.
                <td> 
                {Iam_delegate ? <>
                    <span> Yes </span>
                    <input checked={false}
                    onChange={()=>removeMember()}
                    type="checkbox"  
                    className='form-check-input mx-2' /> 
                </>
                :null}
                </td>
             }
    
        </tr>
        <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header className='border-0' closeButton>
                <Modal.Title>Dissolve Circle</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                This action will dissolve this Circle permanently, do you want to proceed?
            </Modal.Body>
            <Modal.Footer className='border-0'>
                <Button variant="secondary" onClick={handleCloseModal}> No </Button>
                <Button variant="primary" onClick={()=>removeCircle()}> Yes</Button>
            </Modal.Footer>
        </Modal>
        </>
    );

}
export default Member;