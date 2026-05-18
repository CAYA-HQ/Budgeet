import { X, Bell, Check, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { notificationsApi } from "../lib/api";

// Maps notification type to a colour for the dot indicator
const TYPE_COLORS = {
  budget_alert:    "#f59e0b",
  budget_exceeded: "#ef4444",
  on_track:        "#22c55e",
  weekly_summary:  "#3b82f6",
  expense_added:   "#6366f1",
  income_added:    "#10b981",
  welcome:         "#000000",
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)         return "Just now";
  if (diff < 3600)       return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)      return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotificationModal({ isModalOpen, setIsModalOpen }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch notifications whenever modal opens
  useEffect(() => {
    if (!isModalOpen) return;
    setLoading(true);
    setError("");
    notificationsApi.getAll()
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
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      // silently ignore
    }
  };

  return (
    <>
      {isModalOpen && (
        <div
          className="notification-modal bg-[#000000f5] w-full h-screen absolute inset-0 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <X
            className="text-red-600 absolute top-10 right-10 cursor-pointer"
            onClick={() => setIsModalOpen(false)}
          />

          <div
            className="notification-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="notification-header">Notifications</h2>

            <div className="notification-body">
              {loading && (
                <p className="notification-empty text-white">Loading…</p>
              )}

              {error && (
                <p className="notification-empty" style={{ color: "#ef4444" }}>
                  {error}
                </p>
              )}

              {!loading && !error && notifications.length === 0 && (
                <div className="notification-empty">
                  <Bell size={32} style={{ opacity: 0.3, margin: "0 auto 8px" }} />
                  <p>You're all caught up!</p>
                </div>
              )}

              {!loading && notifications.slice(0, 7).map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.is_read ? "unread" : ""}`}
                  onClick={() => !notification.is_read && handleMarkRead(notification.id)}
                >
                  {/* Colour dot for notification type */}
                  <div
                    className="notification-dot"
                    style={{
                      backgroundColor: TYPE_COLORS[notification.type] || "#6b7280",
                    }}
                  />

                  <div className="notification-info">
                    <p className="notification-title">{notification.title}</p>
                    <p className="notification-message">{notification.message}</p>
                    <p className="notification-date">{timeAgo(notification.created_at)}</p>
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

              {!loading && notifications.length > 7 && (
                <button
                  className="notification-view-all"
                  onClick={() => {/* can route to a full notifications page later */}}
                >
                  View all {notifications.length} notifications
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