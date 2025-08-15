import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import MessageItem from "../sec_del/MessageItem";
import MessageInput from "../sec_del/MessageInput";
import axios from "axios";

const SLinkBackNForth = () => {
  const AuthUser = useSelector((state) => state.AuthUser.user);
  const moda_info = useSelector((state) => state.AuthUser.moda);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState(null);
  const [websocket, setWebsocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastScrollHeight = useRef(0);

  // Scroll to bottom smoothly
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load initial messages (recent messages)
  const loadInitialMessages = async () => {
    try {
      setLoading(true);
      // Load more messages initially to ensure scrollable content
      const url = `${window.location.protocol}//${process.env.REACT_APP_BASE_URL}/api/moda/moda/backnforth/${moda_info?.code}/messages/?page=1&page_size=20`;

      console.log("Loading messages from URL:", url);
      console.log("Moda info:", moda_info);
      console.log("Auth token:", AuthUser?.token?.access ? "Present" : "Missing");

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${AuthUser?.token?.access}` },
      });

      console.log("API Response:", response.data);

      if (response.data.results) {
        // Display messages in chronological order (oldest first)
        const initialMessages = response.data.results.reverse();
        console.log("Loaded messages:", initialMessages.length);
        setMessages(initialMessages);
        setNextPageUrl(response.data.next);

        // Scroll to bottom after messages are rendered and force scroll update
        setTimeout(() => {
          scrollToBottom();
          // Force scroll container to recognize its scrollable state
          const container = messagesContainerRef.current;
          if (container) {
            container.scrollTop = container.scrollHeight;
            console.log(
              "Initial scroll setup - scrollHeight:",
              container.scrollHeight,
              "clientHeight:",
              container.clientHeight
            );
          }
        }, 100);
      }
    } catch (err) {
      console.error("Error loading initial messages:", err);
      console.error("Error response:", err.response?.data);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  // Load older messages (pagination)
  const loadOlderMessages = async () => {
    if (!nextPageUrl || loadingOlder) return;

    try {
      setLoadingOlder(true);
      const container = messagesContainerRef.current;

      // Store current scroll position
      if (container) {
        lastScrollHeight.current = container.scrollHeight;
      }

      const response = await axios.get(nextPageUrl, {
        headers: { Authorization: `Bearer ${AuthUser?.token?.access}` },
      });

      if (response.data.results) {
        // Add older messages to the beginning
        const olderMessages = response.data.results.reverse();
        setMessages((prev) => [...olderMessages, ...prev]);
        setNextPageUrl(response.data.next);

        // Maintain scroll position after adding messages
        setTimeout(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            const scrollDiff = newScrollHeight - lastScrollHeight.current;
            container.scrollTop = scrollDiff;
          }
        }, 50);
      }
    } catch (err) {
      console.error("Error loading older messages:", err);
    } finally {
      setLoadingOlder(false);
    }
  };

  // Handle scroll to load older messages
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container || loadingOlder || !nextPageUrl) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    console.log(
      "Scroll event - scrollTop:",
      scrollTop,
      "scrollHeight:",
      scrollHeight,
      "clientHeight:",
      clientHeight
    );

    // Load more messages when scrolled near the top (increased threshold for better UX)
    if (scrollTop < 300) {
      console.log("Loading older messages due to scroll");
      loadOlderMessages();
    }
  };

  // Check if container needs more content to be scrollable
  const checkAndLoadMoreIfNeeded = async () => {
    const container = messagesContainerRef.current;
    if (!container || !nextPageUrl || loadingOlder) return;

    const { scrollHeight, clientHeight } = container;
    console.log(
      "Checking if more content needed - scrollHeight:",
      scrollHeight,
      "clientHeight:",
      clientHeight
    );

    // If content doesn't fill the container, load more messages
    if (scrollHeight <= clientHeight + 50) {
      // 50px buffer
      console.log("Container not scrollable, loading more messages automatically");
      await loadOlderMessages();
      // Recursively check again after loading
      setTimeout(() => checkAndLoadMoreIfNeeded(), 500);
    }
  };

  // Connect to WebSocket
  const connectWebSocket = () => {
    if (!moda_info?.code || !AuthUser?.token?.access) {
      return;
    }

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${process.env.REACT_APP_BASE_URL}/ws/moda/backnforth/${moda_info.code}/?token=${AuthUser.token.access}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to S-Link BackNForth chat");
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket message received:", data);

      switch (data.type) {
        case "chat_message":
          console.log("Adding new message to state:", data.message_data);
          setMessages((prev) => [...prev, data.message_data]);
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
          console.log(data.message);
          break;

        default:
          console.log("Unknown message type:", data.type);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from S-Link BackNForth chat");
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("Connection error. Retrying...");
    };

    setWebsocket(ws);
  };

  // Send message via WebSocket
  const sendMessage = (messageText, replyTo = null) => {
    console.log("Sending message:", messageText);
    console.log("WebSocket state:", websocket?.readyState);
    console.log("WebSocket OPEN constant:", WebSocket.OPEN);

    if (websocket && websocket.readyState === WebSocket.OPEN && messageText.trim()) {
      const messagePayload = {
        type: "chat_message",
        message: messageText.trim(),
        reply_to: replyTo,
      };
      console.log("Sending WebSocket message:", messagePayload);
      websocket.send(JSON.stringify(messagePayload));
    } else {
      console.log("Cannot send message - WebSocket not ready");
    }
  };

  // Send typing indicator (simplified - not implemented in backend)
  const sendTyping = (isTyping) => {
    // Note: Typing indicators are not implemented as requested
  };

  // Edit message
  const editMessage = (messageId, newContent) => {
    if (websocket && websocket.readyState === WebSocket.OPEN && newContent.trim()) {
      websocket.send(
        JSON.stringify({
          type: "edit_message",
          message_id: messageId,
          message: newContent.trim(),
        })
      );
    }
  };

  // Delete message
  const deleteMessage = (messageId) => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(
        JSON.stringify({
          type: "delete_message",
          message_id: messageId,
        })
      );
    }
  };

  // Initialize chat when component mounts
  useEffect(() => {
    if (moda_info?.code) {
      // First connect WebSocket, then load messages
      connectWebSocket();
      loadInitialMessages();
    }

    return () => {
      if (websocket) {
        websocket.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moda_info?.code]);

  // Ensure scroll is properly initialized after messages are loaded
  useEffect(() => {
    if (isInitialized && messages.length > 0) {
      setTimeout(() => {
        const container = messagesContainerRef.current;
        if (container) {
          // Force the container to recognize its scrollable state
          container.scrollTop = container.scrollHeight;
          console.log("Container scrollHeight:", container.scrollHeight);
          console.log("Container clientHeight:", container.clientHeight);
          console.log("Scroll enabled:", container.scrollHeight > container.clientHeight);
        }
      }, 200);
    }
  }, [isInitialized, messages.length]);

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
    <div className="container-fluid d-flex flex-column p-3" style={{ height: "85vh" }}>
      <div className="row justify-content-center flex-grow-1">
        <div className="col-lg-8 col-md-10 d-flex flex-column">
          <div
            className="card border-gray d-flex flex-column"
            style={{ height: "calc(85vh - 2rem)" }}>
            {/* Header */}
            <div className="card-header bg-success text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  S-Link-{moda_info?.district?.code}-{moda_info?.code} BackNForth
                </h4>
                <div className="d-flex align-items-center">
                  <span
                    className={`badge ${isConnected ? "bg-light text-success" : "bg-danger"} me-2`}>
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                  <small>{moda_info?.member_count} members</small>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
              <div
                className="overflow-auto p-3"
                ref={messagesContainerRef}
                onScroll={handleScroll}
                style={{
                  flexGrow: 1,
                  minHeight: 0,
                  height: 0, // This forces the div to use flexGrow for height
                  overflowY: "auto", // Ensure vertical scrolling is always enabled
                  overflowX: "hidden", // Prevent horizontal scroll
                }}>
                {error && <div className="alert alert-danger m-3">{error}</div>}

                {/* Loading older messages indicator */}
                {loadingOlder && (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading older messages...</span>
                    </div>
                    <div className="small text-muted mt-1">Loading older messages...</div>
                  </div>
                )}

                {/* No more messages indicator */}
                {!nextPageUrl && messages.length > 0 && isInitialized && (
                  <div className="text-center py-3">
                    <small className="text-muted">
                      <i className="bi bi-check-circle me-1"></i>
                      Beginning of conversation
                    </small>
                  </div>
                )}

                {/* Initial loading */}
                {loading && (
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ minHeight: "300px" }}>
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading messages...</span>
                      </div>
                      <div className="mt-2 text-muted">Loading chat...</div>
                    </div>
                  </div>
                )}

                {/* Messages */}
                {isInitialized && (
                  <>
                    {messages.length === 0 ? (
                      <div className="text-center text-muted py-5">
                        <h5>No messages yet</h5>
                        <p>Start the conversation by sending the first message!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <MessageItem
                          key={message.id}
                          message={message}
                          currentUser={AuthUser}
                          onEdit={editMessage}
                          onDelete={deleteMessage}
                        />
                      ))
                    )}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </div>

            {/* Message Input */}
            <div className="card-footer">
              <MessageInput
                onSendMessage={sendMessage}
                onTyping={sendTyping}
                disabled={!isConnected}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SLinkBackNForth;
