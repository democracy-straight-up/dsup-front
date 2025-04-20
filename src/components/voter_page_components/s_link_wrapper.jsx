import CircleCard from "./circle_card";
import FLinkCard from "./flink_card";
import SLinkCard from "./slink_card";
export default function SLinkWrapper() {
  return (
    <div className="row p-0 m-0 ">
      <div className="col-sm-12 col-lg-4 m-0 p-0">
        <CircleCard />
      </div>
      <div className="col-sm-12 col-lg-4 m-0 p-0">
        <FLinkCard />
      </div>
      <div className="col-sm-12 col-lg-4 m-0 p-0">
        <SLinkCard />
      </div>
    </div>
  );
}
