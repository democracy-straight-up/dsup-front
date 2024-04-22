import { useSelector } from 'react-redux';
import { useState, useEffect, useRef } from 'react';
import { ModalHeader } from 'react-bootstrap';
import { Modal } from 'react-bootstrap';
import axios from 'axios';
import { baseURL } from '../store/conf.js'



const CircleBackNforth = () => {
    const circleInfo = useSelector((state) => state.AuthUser.circle);
    const AuthUser = useSelector((state) => state.AuthUser.user);
    const [pages, setPages] = useState(2)
    const [message, setMessage] = useState('')
    const [serverMessage, setServerMessage] = useState([]);
    const [loadMoreVisible, setLoadMoreVisible] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [errorModal, setErrorModal] = useState('')
    const [err, setErr] = useState('')
    let socketRef = useRef(null);

    const scrollableElementRef = useRef(null);

    useEffect (()=>{
        /** This use effect function is responsible for smooth scrolling to
         * the end of entries list
         * does so by new entries being added
         */
        if (scrollableElementRef.current) {
            const scrollableElement = scrollableElementRef.current;
            // Scroll to the bottom if the element is not in view
            scrollableElement.scrollIntoView({ behavior: "smooth" });
        }
    }, [serverMessage])

    useEffect(() => {
        /** This useEffect opens the web socket protocal and fetches B&F data */
        let ws_schame = window.location.protocol == "https:" ? "wss" : "ws";
        const url = `${ws_schame}://${process.env.REACT_APP_BASE_URL}/ws/${circleInfo?.code}/${AuthUser?.username}/`
        socketRef.current = new WebSocket(url);

        socketRef.current.onopen = (event) => {
            console.log("connected.");
        };

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (Array.isArray(data)) {
                // when the first time it connects, it retrives a list of old messages
                // check weather to show  "load more" on pagination from api.
                data.length < 10 ? setLoadMoreVisible(false) : setLoadMoreVisible(true)
                setServerMessage((prevserverMessage) => [...data.reverse(), ...prevserverMessage])
            } else {
                // when a new message is being sent and receives an instance of it
                setServerMessage((serverMessage) => [...serverMessage, data]);
            }
        };
        socketRef.current.onerror = (error) => {
            console.log("web socket: ", error)
        };

        socketRef.current.onclose = (event) => {
            setErr('connection lost! try again.')
            console.log("close web socket, ", event);
        };

        return () => {
            socketRef.current.close();
        };

    }, []);

    const handleLoad = () => {
        /** B&F Entries are paginated based on 10 entries in each page.
         * This loads the next page.
         */
        setPages(pages + 1)
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(`page_number,${pages}`)
        }

    }
    const handleSend = () => {
        /* This function sends a new message entry (Back And Forth Entry).
        It checks if the web socket is open   */
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({sender: AuthUser.username,message: message}));
            setMessage("");
        }
    }

    const date_format = (date, _24h = false) => {
        /* this function is used on msg function for the date format of message.
        _24h is only for the last part of the date format which is in hours: minutes: seconds. */

        if (_24h === true){
            return new Date(date).toLocaleString('en-US', {hour: "2-digit", minute: "2-digit", second: "2-digit",hour12: false})
        }else{
            return new Date(date).toLocaleString('en-US', {year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric',});
        }
    }

    const msg = (message, index) => {
        return (
            <div key={index} className="container mb-3">
                <div className='row'>
                    {/* checking if this message has handle */}
                    <p className='mb-0'>
                    <span className='fw-bold fw-bold'>{message.sender?.users?.legalName}</span>
                    <span className='text-muted small'> &nbsp;&nbsp;{date_format(message.date)}&nbsp; [ {date_format(message.date, true)} ] </span>
                    </p>
                </div>
                <div className='row'>
                    <article>
                        {message.message}
                    </article>
                </div>
            </div>
        )
    }

    // User.handle?
    return (
        // the message history area.
        <div className="container my-5">
            <div className="container">
                <div className="row">
                    {err ? <div class="alert alert-danger" role="alert">{err} </div> :""}
                </div>
            </div>
            <div className="card mx-auto "  >
                <div className="card-header border-0 shadow-sm text-center" >
                    <h3>Back & Forth <br /> Circle No. {circleInfo?.code} <br />  {circleInfo?.district?.code} </h3>
                </div>
                <div className="card-body mh-100 p-0" style={{ height: "500px", overflowY: 'auto' }}>
                    <div className='text-center p-2' >

                        {loadMoreVisible && (<a href="#" className='btn btn-sm btn-outline-primary rounded-pill px-3' onClick={handleLoad}>load more</a>)}
                    </div>
                    {serverMessage.map((message, index) => msg(message, index))}

                    <div ref={scrollableElementRef} />
                </div>

                {/* enter your message area */}
                <div className="card-header shadow-sm p-3 z-1 border-0">
                    <div className="input-group">
                        <textarea className="form-control" id="exampleFormControlTextarea1" rows="3"
                            placeholder="Type your entry here. This is your Circle's permanent log of orders sent forward to your First Delegate, and reports and requests they send back. Entries cannot be undone or edited, only amended."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}> </textarea>
                        <span className="input-group-text"
                            onClick={handleSend}
                            style={{ "cursor": "pointer" }}
                            id="basic-addon1">Send</span>
                    </div>

                </div>
            </div>

        </div>
    )
}

export default CircleBackNforth;