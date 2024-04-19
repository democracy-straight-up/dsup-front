import React from "react";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from "axios";
import { baseURL } from '../store/conf.js'


function ForgotEnterCode() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        const param = {
            email: email
        }
       
        const url = `${window.location.protocol}//${baseURL}/api/get-username/`;
        axios.post(url, param)

        .then(response => {
            if (response.status === 200) {
                setMessage(true)
                navigate('/sign-up')
            }
        })
        .catch(error => {
            setMessage(false);
        });
       
     
    }


    return (
        <div className="container p-3">
            <div className="text-center">
                <h1>Forgot your entry code?</h1>
            </div>

            <form onSubmit={(e) => handleSubmit(e)}
                className="form-horizontal form-label-left mx-auto bg-light p-3 rounded-2 shadow-sm mb-3 ">
                <div className="row d-flex justify-content-center">
                    <div className="col col-sm-12 col-md-6" id="big-font">
                     
                       
                        
                        <span> Email</span>
                            <span className="red-airstrike ">*</span>
                        
                       
                        <input type="email"
                            onChange={(e) => setEmail(e.target.value)}
                          
                            className="form-control" id="email"
                            placeholder="Enter your email address" />
                         
                          
                        <br />

                 {       <div className="row">
                            <div className="col">
                                {message && email.length > 0?
                                    <div className="alert alert-danger">
                                        Error submiting the form
                                    </div>
                                    : ''}
                            </div>
                        </div> }
                        <div className="row">
                            <div className="col text-center">
                                <input type="submit"
                                    
                                    value="Submit"
                                    className="btn btn-lg btn-primary m-3" />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>

    )
}

export default ForgotEnterCode;