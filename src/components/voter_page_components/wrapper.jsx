import { useSelector } from "react-redux";
import { Container } from "react-bootstrap";
import CircleCard from "./circle_card";
import FLinkWrapper from "./f_link_wrapper";
import VoterCard from "./voter_card";
import SLinkWrapper from "./s_link_wrapper";
import HolcWrapper from "./holc_wrapper";

const UserCardSwitch = (AuthUser) => {
  switch (AuthUser?.users?.userType.substring(0, 2)) {
    case "U0":
      return <VoterCard />;
      break;
    case "U1":
      return <CircleCard />;
      break;
    case "U2":
      return <FLinkWrapper />;
      break;
    case "U3":
      return <SLinkWrapper />;
      return;
    case "U4":
      return <HolcWrapper />;
      break;
    default:
      console.log("");
      return;
  }
};

export default function Wrapper() {
  const AuthUser = useSelector((state) => state.AuthUser.user);
  return <Container>{UserCardSwitch(AuthUser)}</Container>;
}
