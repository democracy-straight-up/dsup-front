import React from  'react';
import {Link} from 'react-router-dom';

function Footer(){

    return (
        <footer className='container'>
            <div className="row my-3">
                <div className="col">
                    <p className='text-secondary'>The Democracy, Straight-Up! Project </p>
                </div>
                <div className="col text-end">
                    <Link to='https://democracystraightup.org/about-us/' className='mx-3 text-secondary'>About</Link>
                    <Link to='https://democracystraightup.org/contact-us/' className='mx-3 text-secondary'>Contact</Link>
                    <Link to='https://democracystraightup.org/category/blog/' className='mx-3 text-secondary'>News</Link>
                    {/* <a className='mx-3 text-secondary' href="#">About</a>
                    <a className='mx-3 text-secondary' href="#">Contact</a>
                    <a className='mx-3 text-secondary' href="#">News</a> */}
                </div>
            </div>
        </footer>
    );
}

export default Footer;