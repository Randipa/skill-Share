import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuthentication } from "../../features/authentication/contexts/AuthenticationContextProvider";
import { INotification } from "../../features/feed/pages/Notifications/Notifications";
import { IConversation } from "../../features/messaging/components/Conversations/Conversations";
import { IConnection } from "../../features/networking/components/Connection/Connection";
import { useWebSocket } from "../../features/ws/WebSocketContextProvider";
import { request } from "../../utils/api";
import classes from "./Header.module.scss";
import { Profile } from "./components/Profile/Profile";

export function Header() {
  const { user } = useAuthentication();
  const webSocketClient = useWebSocket();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNavigationMenu, setShowNavigationMenu] = useState(
    window.innerWidth > 1080 ? true : false
  );

  const [notifications, setNotifications] = useState<INotification[]>([]);
  const nonReadNotificationCount = notifications.filter(
    (notification) => !notification.read
  ).length;
  const location = useLocation();
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const nonReadMessagesCount = conversations.reduce(
    (acc, conversation) =>
      acc +
      conversation.messages.filter((message) => message.sender.id !== user?.id && !message.isRead)
        .length,
    0
  );
  const [invitations, setInvitations] = useState<IConnection[]>([]);
  
  useEffect(() => {
    const handleResize = () => {
      setShowNavigationMenu(window.innerWidth > 1080);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    request<IConversation[]>({
      endpoint: "/api/v1/messaging/conversations",
      onSuccess: (data) => setConversations(data),
      onFailure: (error) => console.log(error),
    });
  }, [location.pathname]);

  useEffect(() => {
    request<INotification[]>({
      endpoint: "/api/v1/notifications",
      onSuccess: setNotifications,
      onFailure: (error) => console.log(error),
    });
  }, []);

  useEffect(() => {
    const subscription = webSocketClient?.subscribe(
      `/topic/users/${user?.id}/conversations`,
      (message) => {
        const conversation = JSON.parse(message.body);
        setConversations((prevConversations) => {
          const index = prevConversations.findIndex((c) => c.id === conversation.id);
          if (index === -1) {
            if (conversation.author.id === user?.id) return prevConversations;
            return [conversation, ...prevConversations];
          }
          return prevConversations.map((c) => (c.id === conversation.id ? conversation : c));
        });
      }
    );
    return () => subscription?.unsubscribe();
  }, [user?.id, webSocketClient]);

  useEffect(() => {
    const subscribtion = webSocketClient?.subscribe(
      `/topic/users/${user?.id}/notifications`,
      (message) => {
        const notification = JSON.parse(message.body);
        setNotifications((prev) => {
          const index = prev.findIndex((n) => n.id === notification.id);
          if (index === -1) {
            return [notification, ...prev];
          }
          return prev.map((n) => (n.id === notification.id ? notification : n));
        });
      }
    );
    return () => subscribtion?.unsubscribe();
  }, [user?.id, webSocketClient]);

  useEffect(() => {
    request<IConnection[]>({
      endpoint: "/api/v1/networking/connections?status=PENDING",
      onSuccess: (data) =>
        setInvitations(data.filter((c) => !c.seen && c.recipient.id === user?.id)),
      onFailure: (error) => console.log(error),
    });
  }, [user?.id]);

  useEffect(() => {
    const subscription = webSocketClient?.subscribe(
      "/topic/users/" + user?.id + "/connections/new",
      (data) => {
        const connection = JSON.parse(data.body);
        setInvitations((connections) =>
          connection.recipient.id === user?.id ? [connection, ...connections] : connections
        );
      }
    );

    return () => subscription?.unsubscribe();
  }, [user?.id, webSocketClient]);

  useEffect(() => {
    const subscription = webSocketClient?.subscribe(
      "/topic/users/" + user?.id + "/connections/accepted",
      (data) => {
        const connection = JSON.parse(data.body);
        setInvitations((invitations) => invitations.filter((c) => c.id !== connection.id));
      }
    );

    return () => subscription?.unsubscribe();
  }, [user?.id, webSocketClient]);

  useEffect(() => {
    const subscription = webSocketClient?.subscribe(
      "/topic/users/" + user?.id + "/connections/remove",
      (data) => {
        const connection = JSON.parse(data.body);
        setInvitations((invitations) => invitations.filter((c) => c.id !== connection.id));
      }
    );

    return () => subscription?.unsubscribe();
  }, [user?.id, webSocketClient]);

  useEffect(() => {
    const subscription = webSocketClient?.subscribe(
      "/topic/users/" + user?.id + "/connections/seen",
      (data) => {
        const connection = JSON.parse(data.body);
        setInvitations((invitations) => invitations.filter((c) => c.id !== connection.id));
      }
    );

    return () => subscription?.unsubscribe();
  }, [user?.id, webSocketClient]);

  return (
    <header className={classes.root}>
      <div className={classes.container}>
        <div className={classes.left}>
          <NavLink to="/" className={classes.brandLink}>
            <span className={classes.logo}>MasteryHub</span>
          </NavLink>
          
          <div className={classes.searchContainer}>
            <input
              type="text"
              placeholder="Search updates, plans, users..."
              className={classes.searchInput}
            />
            <button className={classes.searchButton}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className={classes.right}>
          {showNavigationMenu ? (
            <ul className={classes.navigation}>
              <li>
                <NavLink
                  to="/post"
                  className={({ isActive }) => (isActive ? classes.active : "")}
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (window.innerWidth <= 1080) {
                      setShowNavigationMenu(false);
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                  </svg>
                  <span>Post</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/plans"
                  className={({ isActive }) => (isActive ? classes.active : "")}
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (window.innerWidth <= 1080) {
                      setShowNavigationMenu(false);
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                  </svg>
                  <span>Plans</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/explore"
                  className={({ isActive }) => (isActive ? classes.active : "")}
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (window.innerWidth <= 1080) {
                      setShowNavigationMenu(false);
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z" />
                  </svg>
                  <span>Explore</span>
                </NavLink>
              </li>
              <li className={classes.alerts}>
                <NavLink
                  to="/notifications"
                  className={({ isActive }) => (isActive ? classes.active : "")}
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (window.innerWidth <= 1080) {
                      setShowNavigationMenu(false);
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                  </svg>
                  {nonReadNotificationCount > 0 ? (
                    <span className={classes.badge}>{nonReadNotificationCount}</span>
                  ) : null}
                  <span>Alerts</span>
                </NavLink>
              </li>
              
            </ul>
          ) : null}

          <button
            className={classes.toggle}
            onClick={() => {
              setShowNavigationMenu((prev) => !prev);
              setShowProfileMenu(false);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor">
              <path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z" />
            </svg>
          </button>
          
          {user ? (
            <Profile
              setShowNavigationMenu={setShowNavigationMenu}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}