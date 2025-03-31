import { useSelector } from "react-redux";
import { Container } from "react-bootstrap";
import CircleCard from "./circle_card";
import FLinkWrapper from "./f_link_wrapper";
import VoterCard from "./voter_card";

const UserCardSwitch = (AuthUser) => {
  switch (AuthUser.users?.userType.substring(0, 2)) {
    case "U0":
      return <VoterCard />;
    case "U1":
      return <CircleCard />;
    case "U2":
      return <FLinkWrapper />;
    case "U3":
      console.log("case s del.");
      return;
    default:
      console.log("default case here...");
      return;
  }
};

export default function Wrapper() {
  const AuthUser = useSelector((state) => state.AuthUser.user);
  return <Container>{UserCardSwitch(AuthUser)}</Container>;
}
