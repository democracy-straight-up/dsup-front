import { useState } from "react";

const MessageItem = ({ message, currentUser, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.message);
  const [showOptions, setShowOptions] = useState(false);

  // Check if current user is the sender
  const isOwnMessage =
    message.sender?.username === currentUser?.username || message.sender?.id === currentUser?.id;

  // Format timestamp
  const formatMessageTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      const timeString = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      if (messageDate.getTime() === today.getTime()) {
        return timeString;
      } else if (messageDate.getTime() === today.getTime() - 86400000) {
        return `Yesterday ${timeString}`;
      } else {
        return `${date.toLocaleDateString()} ${timeString}`;
      }
    } catch (error) {
      return "";
    }
  };

  // Handle edit save
  const handleEditSave = () => {
    if (editText.trim() && editText !== message.message) {
      onEdit(message.id, editText.trim());
    }
    setIsEditing(false);
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditText(message.message);
    setIsEditing(false);
  };

  // Handle delete
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      onDelete(message.id);
    }
    setShowOptions(false);
  };

  // Handle key press in edit mode
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === "Escape") {
      handleEditCancel();
    }
  };

  return (
    <div className={`mb-3 ${isOwnMessage ? "text-end" : ""}`}>
      <div
        className={`d-inline-block position-relative ${
          isOwnMessage ? "bg-primary text-white" : "bg-light"
        } rounded p-3`}
        style={{
          maxWidth: "70%",
          wordBreak: "break-word",
          textAlign: "left", // Force text to be left-aligned even when container is right-aligned
          direction: "ltr", // Ensure left-to-right text direction
        }}
        onMouseEnter={() => setShowOptions(true)}
        onMouseLeave={() => setShowOptions(false)}>
        {/* Reply indicator */}
        {message.reply_to_message && (
          <div
            className={`small mb-2 p-2 rounded ${
              isOwnMessage
                ? "bg-primary-dark border-start border-3 border-light"
                : "bg-secondary bg-opacity-25 border-start border-3 border-primary"
            }`}>
            <div className="fw-bold">{message.reply_to_message.sender}</div>
            <div className="text-truncate" style={{ maxWidth: "200px" }}>
              {message.reply_to_message.message}
            </div>
          </div>
        )}

        {/* Sender name (only for others' messages) */}
        {!isOwnMessage && (
          <div className="fw-bold small text-primary mb-1">
            {message.sender_name || message.sender}
          </div>
        )}

        {/* Message content */}
        {isEditing ? (
          <div className="row ">
            <textarea
              className="form-control mb-2"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyPress}
              rows="3"
              autoFocus
            />
            <div>
              <button
                className="btn btn-sm btn-success me-2"
                onClick={handleEditSave}
                disabled={!editText.trim()}>
                Save
              </button>
              <button className="btn btn-sm btn-secondary" onClick={handleEditCancel}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div
              className="mb-1"
              style={{
                whiteSpace: "pre-wrap",
                textAlign: "left",
                direction: "ltr",
              }}>
              {message.message}
            </div>

            {/* Message footer */}
            <div
              className={`d-flex align-items-center justify-content-between small ${
                isOwnMessage ? "text-white-50" : "text-muted"
              }`}>
              <span>
                {formatMessageTime(message.timestamp)}
                {message.is_edited && <span className="ms-1">(edited)</span>}
              </span>

              {/* Options menu */}
              {showOptions && isOwnMessage && (
                <div className="d-flex gap-1">
                  <button
                    className={`btn btn-sm  ${
                      isOwnMessage ? "btn-outline-light" : "btn-outline-secondary"
                    }`}
                    onClick={() => setIsEditing(true)}
                    title="Edit message">
                    Edit
                  </button>
                  <button
                    className={`btn btn-sm  ${
                      isOwnMessage ? "btn-outline-light" : "btn-outline-danger"
                    }`}
                    onClick={handleDelete}
                    title="Delete message">
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Message status for own messages */}
      {isOwnMessage && !isEditing && (
        <div className="small text-muted mt-1">
          <span>You</span>
        </div>
      )}
    </div>
  );
};

export default MessageItem;
