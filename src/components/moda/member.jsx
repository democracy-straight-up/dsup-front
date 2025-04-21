import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button } from "react-bootstrap";

export default function Member({
  member,
  index,
  chatSocket,
  dissolve,
  err,
  actionDone,
  vote_outs,
  put_forwards,
  modaInfo,
  Iam_delegate,
}) {
  const AuthUser = useSelector((state) => state.AuthUser.user);
  const [voted_out, setVoted_out] = useState(false);
  const [put_forward, setPut_forward] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleInputChange = () => {
    // Open the modal when the input value changes
    setShowModal(true);
  };

  useEffect(() => {
    switch (actionDone?.action) {
      case "vote_out":
        if (actionDone?.instance.candidate === member?.id && actionDone?.user.id === AuthUser?.id) {
          setVoted_out(true);
        }
        break;
      case "undo_vote_out":
        if (actionDone?.instance.candidate === member?.id && actionDone?.user.id === AuthUser?.id) {
          setVoted_out(false);
        }
        break;
      case "put_forward":
        if (actionDone?.instance.candidate === member?.id && actionDone?.user.id === AuthUser?.id) {
          setPut_forward(true);
        }
        break;
      case "undo_put_forward":
        if (actionDone?.instance.candidate === member?.id && actionDone?.user.id === AuthUser?.id) {
          setPut_forward(false);
        }
        break;
      default:
        console.log();
    }
  }, [actionDone]);

  useEffect(() => {
    // go through the vote_outs and put_forwards and check if the member is in the list
    // if the member is in the list then set the value to true.
    vote_outs.map((vote_out) => {
      if (vote_out.candidate === member?.id && vote_out.voter === AuthUser?.id) {
        setVoted_out(true);
      }
    });
    put_forwards.map((put_forward) => {
      if (put_forward.candidate === member?.id && put_forward?.voter === AuthUser?.id) {
        setPut_forward(true);
      }
    });
  }, []);

  //   if there is any error, hide the model show
  useEffect(() => {
    setShowModal(false);
  }, [err]);

  const handleCloseModal = () => {
    // Close the modal without performing the action
    setShowModal(false);
  };

  const removeMember = () => {
    /** send the vote to the server */
    chatSocket.send(
      JSON.stringify({
        action: "remove_candidate",
        remover: AuthUser.username,
        candidate: member?.id,
      })
    );
  };

  const voteOut = () => {
    /** send the vote to the server */
    chatSocket.send(
      JSON.stringify({
        action: "vote_out",
        payload: {
          voter: AuthUser.username,
          member: member?.id,
        },
      })
    );
  };
  const RemoveVoteOut = () => {
    /** send the vote to the server */
    chatSocket.send(
      JSON.stringify({
        action: "undo_vote_out",
        payload: {
          voter: AuthUser.username,
          member: member?.id,
        },
      })
    );
  };

  const removeCircle = () => {
    /** send the vote to the server */
    chatSocket.send(
      JSON.stringify({
        action: "dissolve",
        payload: {
          voter: AuthUser.username,
          member: member?.id,
        },
      })
    );
  };

  const putForward = () => {
    /** send the vote to the server */
    chatSocket.send(
      JSON.stringify({
        action: "putForward",
        payload: {
          voter: AuthUser.username,
          member: member?.id,
        },
      })
    );
  };

  const undo_putForward = () => {
    /** send the vote to the server */
    chatSocket.send(
      JSON.stringify({
        action: "undo_putForward",
        payload: {
          voter: AuthUser.username,
          member: member?.id,
        },
      })
    );
  };

  return (
    <>
      <tr>
        <td className="text-center">{index + 1}</td>
        <td className="align-middle">
          {member?.user?.users?.legalName}
          {member?.is_delegate ? (
            <span className="alert alert-success p-0 px-2 mx-2">S-Del</span>
          ) : null}
        </td>

        {modaInfo?.is_active ? (
          <>
            {/* ckeck if the member is auth user so that he/she can not vote for his own delegation  */}
            <th className="fw-normal align-middle py-3">
              {!put_forward ? (
                <input
                  type="checkbox"
                  checked={put_forward}
                  style={{ width: "30px", height: "30px" }}
                  onChange={() => putForward()}
                  className="sm:m-3 form-check-input mx-3 mt-0 pt-0 mb-2"
                />
              ) : (
                <input
                  type="checkbox"
                  checked={put_forward}
                  style={{ width: "30px", height: "30px" }}
                  onChange={() => undo_putForward()}
                  className="sm:m-3 form-check-input mx-3 mt-0 pt-0 mb-2"
                />
              )}

              {/* <p className="py-2"> */}
              <span className="alert alert-primary text-nowrap p-1 px-2">
                {member?.count_put_forward} votes
              </span>
              {/* </p> */}
            </th>
          </>
        ) : null}
        {/* if the circle is not active
             and the member is delegate
             then can he remove the member.
             otherwise, the members can vote out to remove.. */}

        {/* you can not not remove yourself. */}
        {member?.user?.username === AuthUser.username ? (
          <td className="align-middle py-3">
            {/* check if the circle is dissolvable.  */}

            {dissolve === true ? (
              <>
                Dissolve This Circle {dissolve} ?
                <input
                  type="checkbox"
                  checked={showModal}
                  onChange={() => handleInputChange()}
                  className="sm:m-3 form-check-input mx-3 mt-0 pt-0 mb-2"
                />
              </>
            ) : null}
          </td>
        ) : modaInfo?.is_active === true ? (
          // if the user vote out this member
          <td className="align-middle py-3">
            {!voted_out ? (
              <input
                checked={voted_out}
                onChange={() => voteOut()}
                type="checkbox"
                style={{ width: "30px", height: "30px" }}
                className="sm:m-3 form-check-input mx-3 mt-0 pt-0 mb-2"
              />
            ) : (
              <input
                checked={voted_out}
                type="checkbox"
                style={{ width: "30px", height: "30px" }}
                className="sm:m-3 form-check-input mx-3 mt-0 pt-0 mb-2"
                onChange={() => RemoveVoteOut()}
              />
            )}
            {/* <p className="py-2"> */}
            <span className=" alert alert-primary text-nowrap p-1 px-2">
              {member?.count_vote_out} votes
            </span>
            {/* </p> */}
          </td>
        ) : (
          // if the circle is not active and the auth user is the delegate.
          // then he can remove the members.
          <td className="align-middle py-3">
            {Iam_delegate ? (
              <>
                <span> Yes </span>
                <input
                  checked={false}
                  onChange={() => removeMember()}
                  type="checkbox"
                  style={{ width: "30px", height: "30px" }}
                  className="sm:m-3 form-check-input mx-3 mt-0 pt-0 mb-2"
                />
              </>
            ) : null}
          </td>
        )}
      </tr>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header className="border-0" closeButton>
          <Modal.Title>Dissolve S-Link</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This action will dissolve this S-Link permanently, do you want to proceed?
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={handleCloseModal}>
            No
          </Button>
          <Button variant="primary" onClick={() => removeCircle()}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
