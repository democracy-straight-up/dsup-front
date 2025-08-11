// import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import SignUpConfirm from "./components/signUpConform";
import ClaimYourSeat from "./components/Claim-Your-Seat";
import Home from "./Home";
import EnterTheFloor from "./components/Enter-the-Floor";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Error from "./components/Error";
import VoterPage from "./components/Voter-Page";
import ProtectedRoute from "./protectedRoutes";
import JoinCircle from "./components/joinCircle";
// import HouseKeeping from './components/houseKeeping/houseKeeping';
import UserActivate from "./components/UserActivate";
import CircleBackNforth from "./components/CircleBackNforth";
import SettingsPage from "./components/SettingsPage";
// import SearchFeature from './components/SearchFeature';
import Insight from "./components/bills/Insight";
import CircleMemberContactPage from "./components/houseKeeping/CircleMemberContactPage";
import FLinkMemberContactPage from "./components/sec_del/MemberContactPage";
import MeetingsAndMinutes from "./components/MeetingsAndMinutes";
import RegistarationStatusVerfication from "./components/RegisterationStatusVerification";
import HouseKeeping from "./components/houseKeeping/house-keeping";
import JoinSecDel from "./components/sec_del/sec_del_join";
import SecondDelegatePage from "./components/sec_del/sec_del_page";
import ModaPage from "./components/moda/moda_page";
import JoinModa from "./components/moda/moda_join";
import { useActivityTracker } from "./hooks/useActivityTracker";
import JoinHolc from "components/holc/holc_join";
import HolcPage from "components/holc/holc_page";
import House_repPage from "components/house_rep/house_rep_page";
import JoinHouseRep from "components/house_rep/house_rep_join";
import SLinkMemberContactPage from "components/moda/moda_member_contact";
import HoLCMemberContactPage from "components/holc/holc_member_contact";
import RepMemberContactPage from "components/house_rep/rep_member_contact";
// const JoinSecDel = lazy(() => import("./components/sec_del/sec_del_join"));

function App() {
  // Enable activity-based token refresh
  useActivityTracker();

  return (
    <Routes>
      <Route>
        <Route
          index
          element={
            <>
              <Header />
              <Home />
              <Footer />
            </>
          }
        />
        <Route
          path="/claim-your-seat"
          element={
            <>
              <Header />
              <ClaimYourSeat />
              <Footer />
            </>
          }
        />
        <Route
          path="/registeration-status-verification"
          element={
            <>
              <Header />
              <RegistarationStatusVerfication />
              <Footer />
            </>
          }
        />
        <Route
          path="/claim-your-seat"
          element={
            <>
              <Header />
              <ClaimYourSeat />
              <Footer />
            </>
          }
        />
        <Route
          path="/enter-the-floor"
          element={
            <>
              <Header />
              <EnterTheFloor />
              <Footer />
            </>
          }
        />
        <Route
          path="/voter-page"
          element={
            <ProtectedRoute>
              <Header />
              <VoterPage />
              <Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/house-keeping-page"
          element={
            <ProtectedRoute>
              <Header />
              <HouseKeeping />
              <Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/join-circle"
          element={
            <ProtectedRoute>
              <Header />
              <JoinCircle />
              <Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/join-sec-del"
          element={
            <ProtectedRoute>
              <Header />
              <JoinSecDel />
              <Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/first-link-page"
          element={
            <ProtectedRoute>
              <Header />
              <SecondDelegatePage />
              <Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/join-s-link"
          element={
            <ProtectedRoute>
              <Header />
              <JoinModa />
              <Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/join-holc"
          element={
            <ProtectedRoute>
              <Header />
              <JoinHolc />
              <Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/s-link-page"
          element={
            <ProtectedRoute>
              <Header />
              <ModaPage />
              <Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/s-link-member-contact"
          element={
            <ProtectedRoute>
              <Header />
              <SLinkMemberContactPage />
              <Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/f-link-member-contact"
          element={
            <ProtectedRoute>
              <Header />
              <FLinkMemberContactPage />
              <Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/holc-member-contact"
          element={
            <ProtectedRoute>
              <Header />
              <HoLCMemberContactPage />
              <Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/holc-page"
          element={
            <ProtectedRoute>
              <Header />
              <HolcPage />
              <Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/house-rep-join"
          element={
            <ProtectedRoute>
              <Header />
              <JoinHouseRep />
              <Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/house-rep-member-contact"
          element={
            <ProtectedRoute>
              <Header />
              <RepMemberContactPage />
              <Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/house-rep-page"
          element={
            <ProtectedRoute>
              <Header />
              <House_repPage />
              <Footer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/circle-back-n-forth"
          element={
            <ProtectedRoute>
              <Header />
              <CircleBackNforth />
              <Footer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sign-up"
          element={
            <>
              <Header />
              <SignUpConfirm />
              <Footer />
            </>
          }
        />
        <Route
          path="/api/activate/:uid/:token"
          element={
            <>
              <Header />
              <UserActivate />
              <Footer />
            </>
          }
        />
        <Route
          path="/*"
          element={
            <>
              <Header />
              <Error /> <Footer />{" "}
            </>
          }></Route>
        <Route
          path="/settings"
          element={
            <>
              <Header />
              <SettingsPage />
              <Footer />
            </>
          }
        />
        {/* <Route path="/search" element={<><Header/><SearchFeature/><Footer/></>}/> */}
        <Route
          path="/bill/:id"
          element={
            <>
              <Header />
              <Insight />
              <Footer />
            </>
          }
        />
        {/* fake path below, real path above for rendering the specific bill that gets clicked on */}
        <Route
          path="/bill"
          element={
            <>
              <Header />
              <Insight />
              <Footer />
            </>
          }
        />
        <Route
          path="/circle-member-contact"
          element={
            <>
              <Header />
              <CircleMemberContactPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/meetings-and-minutes"
          element={
            <>
              <Header />
              <MeetingsAndMinutes />
              <Footer />
            </>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
