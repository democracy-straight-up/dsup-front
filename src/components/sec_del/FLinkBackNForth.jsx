import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import MessageItem from "./MessageItem";
import MessageInput from "./MessageInput";
import axios from "axios";

const FLinkBackNForth = () => {
  const AuthUser = useSelector((state) => state.AuthUser.user);
  const sec_del_info = useSelector((state) => state.AuthUser.sec_del);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [websocket, setWebsocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load messages from API
  const loadMessages = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const url = `${window.location.protocol}//${process.env.REACT_APP_BASE_URL}/api/backnforth/${sec_del_info?.code}/messages/?page=${pageNum}`;
      //   console.log("Loading messages from:", url, "Page:", pageNum, "Append:", append);

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${AuthUser?.token?.access}` },
      });

      //   console.log("Messages API response:", {
      //     pageNum,
      //     append,
      //     resultsLength: response.data.results?.length,
      //     hasNext: !!response.data.next,
      //     hasPrevious: !!response.data.previous,
      //     count: response.data.count,
      //   });

      if (response.data.results) {
        const prevScrollHeight = messagesContainerRef.current?.scrollHeight || 0;

        if (append) {
          // When loading older messages (pagination), add them at the beginning
          setMessages((prev) => {
            // Get the IDs of existing messages to avoid duplicates
            const existingIds = new Set(prev.map((msg) => msg.id));

            // Filter out any messages that already exist
            const newMessages = response.data.results.filter((msg) => !existingIds.has(msg.id));

            // Reverse new messages (API returns newest first, we want oldest first in display)
            const filteredNewMessages = newMessages.reverse();

            const finalMessages = [...filteredNewMessages, ...prev];

            console.log("Appending older messages:", {
              previousCount: prev.length,
              newMessagesFromAPI: response.data.results.length,
              duplicatesFiltered: response.data.results.length - newMessages.length,
              newMessagesAdded: filteredNewMessages.length,
              finalCount: finalMessages.length,
            });

            return finalMessages;
          });

          // Maintain scroll position after adding messages at the top
          setTimeout(() => {
            const container = messagesContainerRef.current;
            if (container) {
              const newScrollHeight = container.scrollHeight;
              const scrollDiff = newScrollHeight - prevScrollHeight;

              // Set scroll position to maintain user's view
              const newScrollTop = scrollDiff;
              container.scrollTop = newScrollTop;

              //   console.log("📍 Adjusted scroll position after loading older messages:", {
              //     prevScrollHeight,
              //     newScrollHeight,
              //     scrollDiff,
              //     newScrollTop,
              //     currentScrollTop: container.scrollTop,
              //   });

              // After maintaining scroll position, check if we can load more
              setTimeout(() => {
                const { scrollTop } = container;
                console.log("🔄 Post-adjustment scroll check:", {
                  scrollTop: Math.round(scrollTop),
                  isAtTop: scrollTop === 0,
                  isNearTop: scrollTop < 100,
                  hasMore,
                  loadingMore,
                });
              }, 100);
            }
          }, 50);
        } else {
          // Initial load: Display latest messages (reverse to show oldest first)
          const latestMessages = response.data.results.reverse();
          setMessages(latestMessages);
          console.log("Initial load - latest messages:", {
            count: latestMessages.length,
            firstMessageId: latestMessages[0]?.id,
            lastMessageId: latestMessages[latestMessages.length - 1]?.id,
            hasNext: !!response.data.next,
            nextPage: response.data.next,
            sampleMessage: latestMessages[0],
            currentUser: AuthUser,
          });

          // Scroll to bottom after initial messages load
          if (pageNum === 1 && !initialLoadDone) {
            setInitialLoadDone(true);
            setTimeout(() => {
              scrollToBottom();
              console.log("Scrolled to bottom after initial load");

              // Debug the initial state after scroll
              setTimeout(() => {
                const container = messagesContainerRef.current;
                if (container) {
                  console.log("📊 Initial state after scroll:", {
                    scrollTop: container.scrollTop,
                    scrollHeight: container.scrollHeight,
                    clientHeight: container.clientHeight,
                    hasMore,
                    page,
                    messagesCount: latestMessages.length,
                  });
                }
              }, 100);
            }, 300);
          }
        }
        setHasMore(!!response.data.next);
        console.log("📄 Updated hasMore:", !!response.data.next, "Next URL:", response.data.next);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Handle scroll to load more messages
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) {
      console.log("No container reference");
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtTop = scrollTop === 0;
    const isNearTop = scrollTop < 100; // Also trigger if near the top

    // console.log("Scroll event:", {
    //   scrollTop: Math.round(scrollTop),
    //   scrollHeight,
    //   clientHeight,
    //   isAtTop,
    //   isNearTop,
    //   hasMore,
    //   loadingMore,
    //   page,
    //   messagesLength: messages.length,
    //   canLoadMore: (isAtTop || isNearTop) && hasMore && !loadingMore,
    // });

    // Load more (older) messages when scrolled to top or near top
    if ((isAtTop || isNearTop) && hasMore && !loadingMore) {
      console.log("✅ Loading older messages... Current page:", page);
      const nextPage = page + 1;
      setPage(nextPage);
      loadMessages(nextPage, true);
    } else if (!hasMore) {
      console.log("❌ No more messages to load");
    } else if (loadingMore) {
      console.log("⏳ Already loading more messages");
    }
  };

  // Connect to WebSocket
  const connectWebSocket = () => {
    console.log("connectWebSocket called", {
      secDelCode: sec_del_info?.code,
      hasToken: !!AuthUser?.token?.access,
      baseUrl: process.env.REACT_APP_BASE_URL,
    });

    if (!sec_del_info?.code || !AuthUser?.token?.access) {
      console.log("Missing required data:", {
        secDelCode: sec_del_info?.code,
        hasToken: !!AuthUser?.token?.access,
      });
      return;
    }

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${process.env.REACT_APP_BASE_URL}/ws/backnforth/${sec_del_info.code}/?token=${AuthUser.token.access}`;

    console.log("Connecting to WebSocket:", wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to BackNForth chat");
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket message:", data);

      switch (data.type) {
        case "chat_message":
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

        case "typing_status":
          if (data.is_typing) {
            setTypingUsers((prev) => [...prev.filter((u) => u !== data.user), data.user]);
          } else {
            setTypingUsers((prev) => prev.filter((u) => u !== data.user));
          }
          break;

        case "recent_messages":
          // Don't load recent messages from WebSocket - we handle pagination via REST API
          console.log(
            "Ignoring recent_messages from WebSocket - using REST API pagination instead"
          );
          break;

        default:
          console.log("Unknown message type:", data.type);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from BackNForth chat");
      setIsConnected(false);
      // Temporarily disabled auto-reconnection for debugging
      // setTimeout(() => {
      //   if (!websocket || websocket.readyState === WebSocket.CLOSED) {
      //     connectWebSocket();
      //   }
      // }, 3000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("Connection error. Retrying...");
    };

    setWebsocket(ws);
  };

  // Send message via WebSocket
  const sendMessage = (messageText, replyTo = null) => {
    if (websocket && websocket.readyState === WebSocket.OPEN && messageText.trim()) {
      websocket.send(
        JSON.stringify({
          type: "chat_message",
          message: messageText.trim(),
          reply_to: replyTo,
        })
      );
    }
  };

  // Send typing indicator
  const sendTyping = (isTyping) => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(
        JSON.stringify({
          type: "typing",
          is_typing: isTyping,
        })
      );
    }
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

  useEffect(() => {
    console.log("🚀 useEffect triggered - sec_del_info?.code:", sec_del_info?.code);
    if (sec_del_info?.code) {
      console.log("Loading messages and connecting WebSocket...");
      loadMessages();
      connectWebSocket();
    }

    return () => {
      if (websocket) {
        console.log("Cleaning up WebSocket connection");
        websocket.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sec_del_info?.code]);

  // Debug messages state changes
  useEffect(() => {
    console.log("📝 Messages state changed:", {
      count: messages.length,
      hasMore,
      page,
      loading,
      loadingMore,
      initialLoadDone,
    });
  }, [messages, hasMore, page, loading, loadingMore, initialLoadDone]);

  // Remove the complex useEffect for scrolling - handle it directly in functions

  if (!sec_del_info?.code) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4>No F-Link Found</h4>
          <p>You need to be a member of an F-Link to access the chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-3">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          <div className="card border-gray">
            {/* Header */}
            <div className="card-header bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  F-Link-{sec_del_info?.district?.code}-{sec_del_info?.code} BackNForth
                </h4>
                <div className="d-flex align-items-center">
                  <span className={`badge ${isConnected ? "bg-success" : "bg-danger"} me-2`}>
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                  <small>{sec_del_info?.member_count} members</small>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div
              className="card-body p-0"
              style={{ height: "50vh", overflowY: "auto" }} // Reduced height to force scrolling
              ref={messagesContainerRef}
              onScroll={handleScroll}>
              {error && <div className="alert alert-danger m-3">{error}</div>}

              {loadingMore && (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading more messages...</span>
                  </div>
                </div>
              )}

              {/* Show "No more messages" when reached the beginning */}
              {!hasMore && messages.length > 0 && (
                <div className="text-center py-3">
                  <small className="text-muted">
                    <i className="bi bi-check-circle me-1"></i>
                    Beginning of conversation
                  </small>
                </div>
              )}

              {loading && page === 1 ? (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading messages...</span>
                  </div>
                </div>
              ) : (
                <div className="p-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <h5>No messages yet</h5>
                      <p>Start the conversation by sending the first message!</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <MessageItem
                          key={message.id}
                          message={message}
                          currentUser={AuthUser}
                          onEdit={editMessage}
                          onDelete={deleteMessage}
                        />
                      ))}
                    </>
                  )}

                  {/* Typing indicator */}
                  {typingUsers.length > 0 && (
                    <div className="text-muted small ms-3 mb-2">
                      {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
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

export default FLinkBackNForth;
