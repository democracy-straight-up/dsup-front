import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from "axios";
import { baseURL } from '../store/conf.js'
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';


export const GenPass = function(length) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    const lowerCase = "abcdefghijklmnopqrstuvwxyz";
    const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const specialChars = "!@#$%^&*()";
    let password = [];

    password.push(lowerCase.charAt(Math.floor(Math.random() * lowerCase.length)));
    password.push(upperCase.charAt(Math.floor(Math.random() * upperCase.length)));
    password.push(numbers.charAt(Math.floor(Math.random() * numbers.length)));
    password.push(specialChars.charAt(Math.floor(Math.random() * specialChars.length)));

    for (let i = 4; i < length; i++) {
        password.push(charset.charAt(Math.floor(Math.random() * charset.length)));
    }

    // shuffle password
    password = password.sort(() => Math.random() - 0.5);

    return password.join('');
};

function ClaimYourSeat() {
    const navigate = useNavigate();
    const [district, setDistrict] = useState('');
    const [legalName, setLegalName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [reg, setReg] = useState(true);
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [confirmPass, setConfirmPass] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(false);
    const [District_OK, setDistrict_OK] = useState(false);
    const [Pass_Err, setPass_Err] = useState(false);
    const [passwordType, setPasswordType] = useState('password');    // show/hide password input
    const [passwordTypeConf, setPasswordTypeConf] = useState('password'); // show/hide confirm password input

    const [formErr, setFormErr] = useState('');
    const [LegalName_Err, setLegalName_Err] = useState(false);
    const [Address_Err, setAddress_Err] = useState(false);
    const [is_formErr, setIs_formErr] = useState(false);

    const handleCheck = (e) => {
        //check weather the district is listed
        axios.get(`${window.location.protocol}//${baseURL}/api/districts/`)
            .then(function (response) {
                const is_listed_districts = response.data.find((i) => (i.code === district.toUpperCase()))
                if (is_listed_districts) {
                    // set the border of district input green
                    setDistrict_OK(false);
                } else {
                    // set the border of the district input red and show help text
                    if (e.target.value.length > 0) {
                        setDistrict_OK(true)
                    } else {
                        setDistrict_OK(false)
                    }
                }
            }); //endof then function
    }

    const handleCheckLegalName = (e) => {
        //check legal name in valid or not
        const reEmoji = /[^a-zA-Z0-9 ]/gm;
        if (!reEmoji.test(e.target.value)) {
            setLegalName_Err(false);
        } else {
            setLegalName_Err(true);
        }
         //endof then function
    }

    const handleCheckAddress = (e) => {
        //check legal name in valid or not
        const reAddress = /[^a-zA-Z0-9\s,.-]/gm;
        if (!reAddress.test(e.target.value)) {
            setAddress_Err(false);
        } else {
            setAddress_Err(true);
        }
         //endof then function
    }

    const handlePassword = (e) => {
        setPassword(e)
        if (passcheck(e)) {
            setPass_Err(false);
            setSubmitStatus(true);
        } else {
            setPass_Err(true);
            setSubmitStatus(false);
        }
    }

    const handleConfirmPass = (e) => {
        setPassword2(e);
        if (e === password) {
            setConfirmPass(true);
            setSubmitStatus(true);
        } else {
            setConfirmPass(false);
            setSubmitStatus(false);
        }
    }

    function passcheck(str) {
        "Check password for min 8 char, upper and lower case, number, special character"
        const re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        return re.test(str);
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const register_obj = {
            district: district,
            username: district,
            legalName: legalName,
            email: email,
            address: address,
            is_reg1: !reg,
            password: password,
            password2: password2
        }
        const url = `${window.location.protocol}//${baseURL}/api/register/`;
        axios.post(url, register_obj)
            .then(function (response) {
                if (response.statusText === 'Created') {
                    navigate('/sign-up')
                }
            })
            .catch((err) => {
                setFormErr(err.response.data);
                setIs_formErr(true);
                // set this to an array
                // console.log(err.response.data.email?.[0])
                console.log("err: ", err)
            });
    }
    const changePassType = () => {
        passwordType === 'password' ? setPasswordType('') : setPasswordType('password');
    }
    const changePassTypeConfirm = () => {
        passwordTypeConf === 'password' ? setPasswordTypeConf('') : setPasswordTypeConf('password');
    }

    const generatePass = (e) => {
        e.preventDefault()
        // this password could be wrong in a very rare case...
        const res = GenPass(8);

        setPassword(res);
        setPassword2(res);
        setConfirmPass(true);
        setPasswordType('')
        setPasswordTypeConf('')
        setSubmitStatus(true);

    }

    /**
     * Form check in case of submission, any input changes, or click, password generation btn as.
     */
    function CheckForm(){
        // 1. check district input is not empty.
        if (district.length === 0) {
            setSubmitStatus(false);
        }

        // 2. district input is a valid district code
        // 3. check legal name input is not empty
        // 4. check email input is not empty and is valid email format
        // 5. check address input is not empty
        // 6. check password input is not empty and is valid password format
        // 7 check password confirm input is not empty and matches the password

    }

    return (
        <div className="container p-3">
            <div className="text-center">
                <h1>Enter The Floor</h1>
                <p> If you've already claimed your seat,
                    you can enter the floor of your District Legislature (D-Leg).
                </p>
                <Link className="btn btn-lg btn-primary m-3" to="/enter-the-floor" >Enter The Floor</Link>

                <p className="mt-3">Otherwise...</p>
                <h1>Claim Your Seat</h1>
                {/* <p>Fill out the form below. <br/> </p> */}
            </div>

            <form onSubmit={(e) => handleSubmit(e)}
                className="form-horizontal form-label-left mx-auto bg-light p-3 rounded-2 shadow-sm mb-3 ">
                <div className="row d-flex justify-content-center">
                    <div className="col col-sm-12 col-md-6" id="big-font">
                        <span>
                            Enter your district as your two-letter state postal code
                            followed by a two-digit number. For instance,
                            the third district in Alabama would be AL03.
                        </span>
                        <span className="red-airstrike ">*</span>
                        <br />
                        {/* <label htmlFor="district" className="text-right">District:</label> */}
                        <input type="text"
                            maxLength={4}
                            onChange={(e) => setDistrict(e.target.value)}
                            onBlur={(e) => handleCheck(e)}
                            className={`form-control ${District_OK ? 'border border-2 border-danger' : ''}`}
                            id="district" placeholder="Enter your 4-digit district code" />
                        {District_OK ? <p className="p-0 text-danger"> Please enter a valid district code. </p> : ''}

                        <br />

                        <div className="form-check">
                            <input className="form-check-input"
                                onChange={() => setReg(true)}
                                checked={reg}
                                type="radio" name="flexRadioDefault"
                                id="flexRadioDefault2" />
                            <label className="form-check-label" htmlFor="flexRadioDefault2">
                                I am legally registered to vote in this US congressional district.
                            </label>
                        </div>

                        <div className="form-check">
                            <input className="form-check-input"
                                onChange={() => setReg(false)}
                                type="radio" name="flexRadioDefault"
                                id="flexRadioDefault1" />
                            <label className="form-check-label" htmlFor="flexRadioDefault1">
                                I believe I am eligible to vote in this district under the name and address
                                I will provide below and I intend to register as a voter within 30 days.
                            </label>
                        </div>
                        <br />

                        <span>
                            Use your name as it appears on your voter registration card. If you don't know exactly,
                            use your name as it would
                            normally appear on legal documents, in the order you would use for your signature.
                        </span> <span className="red-airstrike ">*</span><br />
                        {/* <label htmlFor="legalName" required ={true} className="text-right">Legal Name:</label> */}
                        <input type="text"
                            onChange={(e) => setLegalName(e.target.value)}
                            onBlur={(e) => handleCheckLegalName(e)}
                            className="form-control"
                            id="legalName" placeholder="Enter your full legal name " />
                        {is_formErr ? <p className="m-0 text-danger"> {formErr?.legalName ? formErr?.legalName[0] : ''}</p> : ''}
                        {LegalName_Err && legalName.length > 0 ? <p className="text-danger m-0">Please enter valid legal name.</p> : ''}
                        <br />


                        <span> This email address will only be used to confirm your registration.
                            Once you join a Circle, all further communications from the project will go through your First Delegate.</span>
                            <span className="red-airstrike ">*</span>
                        <br />
                        {/* <label htmlFor="email" className="text-right">Email:</label> */}
                        <input type="email"
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-control" id="email"
                            placeholder="Enter your email address" />
                        {is_formErr ? <p className="m-0 text-danger"> {formErr?.email ? 'Email already taken' : ''}</p> : ''}
                        <br />

                        <span>
                            Use the address that appears on your voter registration card.
                            If you don't know exactly, use your address as you would write it if sending a letter.
                        </span> <span className="red-airstrike ">*</span><br />
                        {/* <label htmlFor="address" className="text-right">Address:</label> */}
                        <textarea placeholder="Enter your address "
                            onChange={(e) => setAddress(e.target.value)}
                            onBlur={(e) => handleCheckAddress(e)}
                            className="form-control" rows="5" />
                        {/* <input type="text"
                        className="form-control"

                        id="address" placeholder="enter your address"/>
                        <br/> */}
                        {Address_Err && address.length > 0 ? <p className="text-danger m-0">Please enter valid address.</p> : ''}
                        <br />
                        <button className="btn btn-primary my-2" onClick={(e) => generatePass(e)}>
                            Generate password
                        </button>
                        <div className="input-group mb-3 border rounded">
                            <input className="form-control border-0"
                                onChange={(e) => handlePassword(e.target.value)}
                                type={passwordType}
                                value={password}
                                placeholder="Enter your password"
                                name="password"
                                id="password" />
                            <div className=" p-1 px-2 bg-white rounded">
                                {passwordType === 'password' ?
                                    <EyeSlash size="30" onClick={(e) => changePassType()} />
                                    :
                                    <Eye size="30" onClick={(e) => changePassType()} />
                                }
                            </div>
                        </div>

                        {Pass_Err && password.length > 0 ? <p className="text-danger m-0">Your password is not valid</p> : ''}
                        <p className="m-0 fw-bold">Password Guidelines:</p>
                        <ol>
                            <li>Is at least 8 characters long</li>
                            <li>Has at least one upper and lower case</li>
                            <li>Has at least one number</li>
                            <li>Has at least one special character such as: @,#,$...</li>
                        </ol>

                        <br />
                        {/* <label htmlFor="confirm_password" className="text-right">Confirm your password:</label> */}
                        <div className="input-group mb-3 border rounded ">
                            <input
                                type={passwordTypeConf}
                                className="form-control border-0"
                                onChange={(e) => handleConfirmPass(e.target.value)}
                                value={password2}
                                id="confirm_password"
                                placeholder="Confirm your password" />
                            <div className=" p-1 px-2 bg-white rounded">
                                {passwordTypeConf === 'password' ?
                                    <EyeSlash size="30" onClick={(e) => changePassTypeConfirm()} />
                                    :
                                    <Eye size="30" onClick={(e) => changePassTypeConfirm()} />
                                }
                            </div>
                        </div>
                        {!confirmPass && password2.length > 0 ? <p className="m-0 text-danger">Your password does not match.</p> : ''}


                        <div className="row">
                            <div className="col">
                                {is_formErr ?
                                    <div className="alert alert-danger">
                                        Error submiting the form
                                    </div>
                                    : ''}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col text-center">
                                <input type="submit"
                                    disabled={submitStatus ? false : true}
                                    value="Create my account"
                                    className="btn btn-lg btn-primary m-3" />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>

    )
}

export default ClaimYourSeat;