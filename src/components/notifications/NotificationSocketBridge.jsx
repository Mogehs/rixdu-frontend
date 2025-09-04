import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import socket from "../../utils/socket";
import { addNotification } from "../../features/notifications/notificationsSlice";

const NotificationSocketBridge = () => {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const joinedUserIdRef = useRef(null);
  const hasJoinedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) {
      // Reset state when user logs out
      joinedUserIdRef.current = null;
      hasJoinedRef.current = false;
      return;
    }

    // Avoid duplicate joins for the same user
    if (joinedUserIdRef.current === user.id && hasJoinedRef.current) {
      return;
    }

    const join = () => {
      if (!hasJoinedRef.current || joinedUserIdRef.current !== user.id) {
        socket.emit("join-user", user.id);
        joinedUserIdRef.current = user.id;
        hasJoinedRef.current = true;
        console.log(`Joined user room: user:${user.id}`);
      }
    };

    // Join immediately
    join();

    // Re-join on reconnection
    const handleConnect = () => {
      console.log("Socket reconnected, rejoining user room");
      hasJoinedRef.current = false; // Allow rejoin on reconnect
      join();
    };

    socket.on("connect", handleConnect);

    const handler = (notif) => {
      dispatch(addNotification(notif));

      // Only show toast for in-app notifications, not for push notifications
      // Push notifications are handled by FCM and should only appear in notification panel
      if (!notif.channels?.inApp) {
        console.log("Skipping toast for non-in-app notification");
        return;
      }

      // Build a pretty toast for in-app notifications only
      const title = notif?.title || "Notification";
      const message = notif?.message || notif?.body || "";
      const image = notif?.metadata?.image;
      const slug = notif?.metadata?.slug;
      const listingId = notif?.listingId;

      const onClick = () => {
        try {
          if (slug) navigate(`/ad/${slug}`);
          else if (listingId) navigate(`/ad/${listingId}`);
        } catch {
          // ignore navigation errors
        }
      };

      toast(
        ({ closeToast }) => (
          <button
            onClick={() => {
              onClick();
              closeToast && closeToast();
            }}
            className="flex w-full items-center gap-3 text-left"
          >
            {image ? (
              <img
                src={image}
                alt={title}
                className="h-10 w-10 rounded object-cover flex-shrink-0"
                loading="lazy"
              />
            ) : (
              <div className="h-10 w-10 rounded bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">R</span>
              </div>
            )}
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                {title}
              </div>
              <div className="text-xs text-gray-600 line-clamp-2">
                {message}
              </div>
            </div>
          </button>
        ),
        {
          closeOnClick: false,
          className: "!rounded-lg !p-3",
          progressClassName: "!bg-primary",
        }
      );
    };

    socket.on("notification:new", handler);

    return () => {
      socket.off("notification:new", handler);
      socket.off("connect", handleConnect);
    };
  }, [user?.id, dispatch, navigate]);

  return null;
};

export default NotificationSocketBridge;
