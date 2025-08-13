import { useState, useRef } from "react";

const MessageInput = ({ onSendMessage, onTyping, disabled = false }) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Handle message input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicator
    if (value.length > 0 && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    } else if (value.length === 0 && isTyping) {
      setIsTyping(false);
      onTyping(false);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    if (value.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping(false);
      }, 2000);
    }
  };

  // Handle send message
  const handleSendMessage = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");

      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        onTyping(false);
      }

      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle textarea auto-resize
  const handleTextareaInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  };

  return (
    <div className="d-flex gap-2 align-items-end">
      <div className="flex-grow-1">
        <textarea
          ref={textareaRef}
          className="form-control"
          placeholder={disabled ? "Connecting..." : "Type your message..."}
          value={message}
          onChange={handleInputChange}
          onInput={handleTextareaInput}
          onKeyDown={handleKeyPress}
          disabled={disabled}
          rows="1"
          style={{
            resize: "none",
            minHeight: "40px",
            maxHeight: "120px",
          }}
        />
      </div>
      <button
        className="btn btn-primary"
        onClick={handleSendMessage}
        disabled={!message.trim() || disabled}
        style={{ height: "40px" }}>
        Send
      </button>
    </div>
  );
};

export default MessageInput;
