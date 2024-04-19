import {useState, useEffect} from 'react';
import {useSelector } from 'react-redux';
import axios from "axios";
import { baseURL } from '../../store/conf.js'

const Candidate = ({candidate, index, chatSocket,fDel, Iam_member,Iam_delegate})=>{
    const [voted, setVoted] = useState(false);
    const AuthUser  = useSelector((state) => state.AuthUser.user);
    
    useEffect(()=>{ 
        /** Check for the AuthUser if he/she voted in for this candidate */
        const Url = `${window.location.protocol}//${baseURL}/api/circle-vote-in-list/`;
        axios.get(Url, {params: { candidate: candidate.id} },
        {headers: { Authorization: `Bearer ${AuthUser.token.access}`}})
        .then(response=>{
            // checking whether the auth user has voted for this candidate
            response.data.map((res)=>{ if(res.voter == AuthUser.id){setVoted(true) }})
        })
        .catch(err=>console.log(err))
    },)

    const VoteIn = ()=>{
        /** send the vote to the server */
        chatSocket.send(JSON.stringify({
            "action":"vote_in",
            "payload":{
                "voter": AuthUser.username,
                "candidate":candidate.id,
                "pod":candidate.pod.code,
            }
        }))
    }

    const removeCadidate = ()=>{
        /** send the vote to the server */
        chatSocket.send(JSON.stringify({
            "action":"remove_candidate",
            "payload":{
                "remover": AuthUser.username,
                "candidate":candidate.id,
                "pod":candidate.pod.code,
            }
        }))
    }

    return (
        <tr>
        <td>{index+1}</td>
        <td>{candidate?.user?.users?.legalName}</td>

        {Iam_delegate || Iam_member ? 
            <td> <span className='mx-2'>Yes</span>
                {!voted ?  <input type="checkbox"  checked={voted} 
                        onChange={()=>VoteIn()} className='form-check-input mx-3' />
                :null}
                <span className="alert alert-primary p-0 px-2">{candidate?.count_vote_in} votes</span>
            </td>
        :null}

        {/* check if the auth user is delegate to this circle */}
        {Iam_delegate ? 
            <td> Yes 
                <input 
                type="checkbox" 
                checked={false} 
                onChange={()=>removeCadidate()}
                className='form-check-input mx-2' />
            </td>
        : null}
        
    </tr>
    )
}

export default Candidate;