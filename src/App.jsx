import { Routes, Route} from 'react-router-dom';
import SignUpConfirm from './components/signUpConform.jsx';
import ClaimYourSeat from './components/Claim-Your-Seat.jsx';
import Home from './Home.jsx';
import EnterTheFloor from './components/Enter-the-Floor.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Error from './components/Error.jsx';
import VoterPage from './components/Voter-Page.jsx';
import ProtectedRoute from './protectedRoutes.js';
import JoinCircle from './components/joinCircle.jsx';
// import HouseKeeping from './components/houseKeeping/houseKeeping.jsx';
import UserActivate from './components/UserActivate';
import CircleBackNforth from './components/CircleBackNforth.jsx';
import SettingsPage from './components/SettingsPage.jsx';
// import SearchFeature from './components/SearchFeature.jsx';
import Insight from './components/bills/Insight.jsx';
import MemberContactPage from './components/MemberContactPage.jsx';
import MeetingsAndMinutes from './components/MeetingsAndMinutes.jsx';

import HouseKeeping from './components/houseKeeping/house-keeping.jsx';

function App(){
  return (
    <Routes>
      <Route>
        <Route index element={<><Header/><Home/><Footer/></>}/>
        <Route path='/claim-your-seat' element={<><Header/><ClaimYourSeat/><Footer/></>}/>
        <Route path="/enter-the-floor" element={<><Header/><EnterTheFloor/><Footer/></>}/>

        <Route path="/voter-page" element={<ProtectedRoute><Header/><VoterPage/><Footer/></ProtectedRoute>}/>
        <Route path="/house-keeping-page" element={<ProtectedRoute><Header/><HouseKeeping/><Footer/></ProtectedRoute>}/>
        <Route path="/join-circle" element={<ProtectedRoute><Header/><JoinCircle/><Footer/></ProtectedRoute>}/>
        <Route path="/circle-back-n-forth" element={<ProtectedRoute><Header/><CircleBackNforth/><Footer/></ProtectedRoute>}/>

        <Route path="/sign-up" element={<><Header/><SignUpConfirm/><Footer/></>}/>
        <Route path="/api/activate/:uid/:token" element={<><Header/><UserActivate/><Footer/></>}/>
        <Route path='/*' element={<><Header/><Error/> <Footer/> </>}></Route>
        <Route path="/settings" element={<><Header/><SettingsPage/><Footer/></>}/>
        {/* <Route path="/search" element={<><Header/><SearchFeature/><Footer/></>}/> */}
        <Route path="/bill/:billId" element={<><Header/><Insight/><Footer/></>}/>
        {/* fake path below, real path above for rendering the specific bill that gets clicked on */}
        <Route path="/bill" element={<><Header/><Insight/><Footer/></>}/>
        <Route path="/member-contact" element={<><Header/><MemberContactPage/><Footer/></>}/>
        <Route path="/meetings-and-minutes" element={<><Header/><MeetingsAndMinutes/><Footer/></>}/>
      </Route>
    </Routes>
  )
}

export default App;