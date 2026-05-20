import { X, Bell, Check, Trash2, CheckIcon, CheckCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { notificationsApi } from "../lib/api";
import styles from "./notification.module.css";

const TYPE_COLORS = {
  budget_alert: "#f59e0b",
  budget_exceeded: "#ef4444",
  on_track: "#22c55e",
  weekly_summary: "#3b82f6",
  expense_added: "#6366f1",
  income_added: "#10b981",
  welcome: "#000000",
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// const notifications = [
//   {
//     id: 1,
//     title: "New message",
//     message: "You have a new message from Emmanuel Faremi.",
//     is_read: false,
//   },
//     {
//     id: 2,
//     title: "New message",
//     message: "You have a new message from Oluwatosin.",
//     is_read: false,
//   },
//     {
//     id: 3,
//     title: "New message",
//     message: "You have a new message from Suru Immanuel.",
//     is_read: false,
//   },
//     {
//     id: 4,
//     title: "New message",
//     message: "You have a new message from Omooga Samuel.",
//     is_read: false,
//   },
//   {
//     id: 4,
//     title: "New message",
//     message: "You have a new message from Emmanuel Okon.",
//     is_read: false,
//   },
// ]

function NotificationModal({ isModalOpen, setIsModalOpen }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Fetch notifications whenever modal opens
  useEffect(() => {
    if (!isModalOpen) return;
    setLoading(true);
    setError("");
    notificationsApi
      .getAll()
      .then((data) => {
        setNotifications(data.notifications || []);
        // Mark all as read when user opens the modal
        if (data.unread_count > 0) {
          notificationsApi.markAllRead();
        }
      })
      .catch(() => setError("Could not load notifications."))
      .finally(() => setLoading(false));
  }, [isModalOpen]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationsApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // silently ignore
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    } catch {
      // silently ignore
    }
  };

  const filteredNotifications = activeFilter === "unread"
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  return (
    <>
      {isModalOpen && (
        <div
          className={`notification-modal bg-[var(--budgeet-primary-light)] w-full h-screen absolute inset-0 flex flex-col items-center justify-between z-50 ${styles.notification}`}
          onClick={() => setIsModalOpen(false)}
        >
          <header
            className="notification-header bg-white px-10 w-full h-[5rem] text-[var(--budgeet-text-primary)] flex flex-col justify-between items-center border-b border-[var(--budgeet-text-secondary)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="top flex items-center justify-between w-full">
              <h2 className="notification-header text-xl font-semibold ">
                Notifications
              </h2>
              <X
                className="text-red-600 cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              />
            </div>
            <div className="notifification-filter w-full text-[var(--budgeet-text-secondary)] flex justify-between gap-4 self-start">
              <div className="left flex gap-6">
                <button
                  className="all cursor-pointer"
                  onClick={() => setActiveFilter("all")}
                  style={{
                    fontWeight: activeFilter === "all" ? "500" : "normal",
                    textDecoration: activeFilter === "all" ? "underline" : "none",
                    textDecorationThickness: activeFilter === "all" ? "2px" : "auto",
                    textUnderlineOffset: "6px",
                    color: activeFilter === "all" ? "var(--budgeet-text-primary)" : "inherit"
                  }}
                >
                  All Notifications
                </button>
                <button
                  className="unread cursor-pointer"
                  onClick={() => setActiveFilter("unread")}
                  style={{
                    fontWeight: activeFilter === "unread" ? "500" : "normal",
                    textDecoration: activeFilter === "unread" ? "underline" : "none",
                    textDecorationThickness: activeFilter === "unread" ? "2px" : "auto",
                    textUnderlineOffset: "6px",
                    color: activeFilter === "unread" ? "var(--budgeet-text-primary)" : "inherit"
                  }}
                >
                  Unread
                </button>
              </div>
              <button className="mark-read flex items-center gap-2">< CheckCheck size={14} className="flex"/> Read</button>
            </div>
          </header>

          <div
            className="notification-content w-full h-full flex"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="notification-body w-full flex justify-center items-center">
              {loading && (
                <p className="notification-empty text-[var(--budgeet-primary)]">Loading…</p>
              )}

              {error && (
                <p className="notification-empty" style={{ color: "#ef4444" }}>
                  {error}
                </p>
              )}

              {!loading && !error && filteredNotifications.length === 0 && (
                <div className="notification-empty">
                  <Bell
                    size={32}
                    style={{ opacity: 0.3, margin: "0 auto 8px" }}
                  />
                  <p>You're all caught up!</p>
                </div>
              )}

              {!loading &&
                filteredNotifications.slice(0, 7).map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.is_read ? "unread" : ""}`}
                    onClick={() =>
                      !notification.is_read && handleMarkRead(notification.id)
                    }
                  >
                    {/* Colour dot for notification type */}
                    <div
                      className="notification-dot"
                      style={{
                        backgroundColor:
                          TYPE_COLORS[notification.type] || "#6b7280",
                      }}
                    />

                    <div className="notification-info">
                      <p className="notification-title">{notification.title}</p>
                      <p className="notification-message">
                        {notification.message}
                      </p>
                      <p className="notification-date">
                        {timeAgo(notification.created_at)}
                      </p>
                    </div>

                    {/* Delete button */}
                    <button
                      className="notification-delete-btn"
                      onClick={(e) => handleDelete(notification.id, e)}
                      title="Dismiss"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

              {!loading && filteredNotifications.length > 7 && (
                <button
                  className="notification-view-all"
                  onClick={() => {
                    /* can route to a full notifications page later */
                  }}
                >
                  View all {filteredNotifications.length} notifications
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NotificationModal;
