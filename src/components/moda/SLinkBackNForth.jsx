import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { baseURL } from "../../store/conf";
import MessageItem from "./MessageItem";
import MessageInput from "./MessageInput";

const SLinkBackNForth = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [socket, setSocket] = useState(null);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const AuthUser = useSelector((state) => state.AuthUser.user);
  const moda_info = useSelector((state) => state.AuthUser.moda);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // WebSocket connection
  useEffect(() => {
    if (!moda_info?.code || !AuthUser?.token?.access) {
      setError("S-Link information or authentication token not available");
      setLoading(false);
      return;
    }

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${baseURL}/ws/moda/backnforth/${moda_info.code}/?token=${AuthUser.token.access}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnectionStatus("Connected");
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "chat_message":
          setMessages((prev) => [data.message_data, ...prev]);
          setTimeout(scrollToBottom, 100);
          break;

        case "message_edited":
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === data.message_id
                ? { ...msg, message: data.new_content, is_edited: true, edited_at: data.edited_at }
                : msg
            )
          );
          break;

        case "message_deleted":
          setMessages((prev) => prev.filter((msg) => msg.id !== data.message_id));
          break;

        case "user_status":
          break;

        case "error":
          setError(data.message || "WebSocket error occurred");
          break;

        default:
          console.log("Unknown message type:", data.type);
      }
    };

    ws.onerror = (error) => {
      console.error("S-Link BackNForth WebSocket error:", error);
      setConnectionStatus("Connection Error");
      setError("WebSocket connection failed");
    };

    ws.onclose = (event) => {
      console.log("S-Link BackNForth WebSocket disconnected:", event.code, event.reason);
      setConnectionStatus("Disconnected");
      setSocket(null);
    };
    setSocket(ws);
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [moda_info?.code, AuthUser?.token?.access]);

  // Fetch initial messages
  useEffect(() => {
    if (!moda_info?.code || !AuthUser?.token?.access) {
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${window.location.protocol}//${baseURL}/api/moda/moda/backnforth/${moda_info.code}/messages/`,
          {
            headers: {
              Authorization: `Bearer ${AuthUser.token.access}`,
            },
          }
        );

        if (response.data.results) {
          setMessages(response.data.results);
          setNextPageUrl(response.data.next);
          setTimeout(scrollToBottom, 100);
        } else {
          console.warn("No results in response:", response.data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        if (error.response?.status === 403) {
          setError("You must be a S-Link member to view messages");
        } else if (error.response?.status === 404) {
          setError("S-Link not found");
        } else {
          setError("Failed to load messages");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [moda_info?.code, AuthUser?.token?.access]);

  // Load more messages (pagination)
  const loadMoreMessages = async () => {
    if (!nextPageUrl || loadingMore) return;

    try {
      setLoadingMore(true);
      const response = await axios.get(nextPageUrl, {
        headers: {
          Authorization: `Bearer ${AuthUser.token.access}`,
        },
      });

      if (response.data.results) {
        setMessages((prev) => [...prev, ...response.data.results]);
        setNextPageUrl(response.data.next);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Send message via WebSocket
  const sendMessage = (messageText, replyTo = null) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError("Connection not available. Please refresh the page.");
      return;
    }
    if (!messageText.trim()) {
      return;
    }
    const messageData = {
      type: "chat_message",
      message: messageText.trim(),
      reply_to: replyTo?.id || null,
    };
    socket.send(JSON.stringify(messageData));
  };

  // Edit message via WebSocket
  const editMessage = (messageId, newContent) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError("Connection not available. Please refresh the page.");
      return;
    }

    const editData = {
      type: "edit_message",
      message_id: messageId,
      message: newContent.trim(),
    };
    socket.send(JSON.stringify(editData));
  };

  // Delete message via WebSocket
  const deleteMessage = (messageId) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError("Connection not available. Please refresh the page.");
      return;
    }

    const deleteData = {
      type: "delete_message",
      message_id: messageId,
    };
    socket.send(JSON.stringify(deleteData));
  };

  if (error) {
    return (
      <div className="container mt-4">
        <div className="row">
          <div className="col-12 col-lg-10 offset-lg-1">
            <div className="card">
              <div className="card-header bg-info text-white">
                <h4 className="mb-0">
                  <i className="fas fa-comments me-2"></i>
                  S-Link BackNForth Chat - Error
                </h4>
              </div>
              <div className="card-body text-center">
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
                <button className="btn btn-info" onClick={() => window.location.reload()}>
                  <i className="fas fa-refresh me-2"></i>
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!moda_info?.code) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4>No S-Link Found</h4>
          <p>You need to be a member of an S-Link to access the chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12 col-lg-10 offset-lg-1">
          <div className="card h-100">
            {/* Header */}
            <div className="card-header d-flex justify-content-center align-items-center">
              <h4 className="mb-0">S-Link-{moda_info?.code} Back & Forth</h4>
            </div>

            {/* Messages Container */}
            <div className="card-body p-0" style={{ height: "70vh", overflow: "hidden" }}>
              <div
                ref={messagesContainerRef}
                className="messages-container p-3"
                style={{
                  height: "100%",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column-reverse",
                }}>
                {loading ? (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <>
                    <div ref={messagesEndRef} />
                    {messages.map((message, index) => (
                      <MessageItem
                        key={message.id}
                        message={message}
                        currentUser={AuthUser}
                        onEdit={editMessage}
                        onDelete={deleteMessage}
                        onReply={(replyToMessage) => {
                          // Scroll to message input and set reply
                          const messageInput = document.querySelector(".message-input");
                          if (messageInput) {
                            messageInput.scrollIntoView({ behavior: "smooth" });
                            // You might want to implement a reply state here
                          }
                        }}
                        isLastMessage={index === 0}
                      />
                    ))}

                    {/* Load More Button */}
                    {nextPageUrl && (
                      <div className="text-center my-3">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={loadMoreMessages}
                          disabled={loadingMore}>
                          {loadingMore ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"></span>
                              Loading...
                            </>
                          ) : (
                            <>Load Earlier Messages</>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Message Input */}
            <div className="card-footer bg-light">
              <MessageInput
                onSendMessage={sendMessage}
                disabled={connectionStatus !== "Connected"}
                placeholder={
                  connectionStatus !== "Connected" ? "Connecting..." : "Type your message..."
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SLinkBackNForth;
