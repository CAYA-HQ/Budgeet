import {
  X,
  Bell,
  Trash2,
  CheckCheck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Sparkles,
} from "lucide-react";

import { useState, useEffect, useRef } from "react";
import { notificationsApi } from "../lib/api";
import styles from "./notification.module.css";

/* ── Type → icon + colour mapping ── */
const TYPE_CONFIG = {
  budget_alert: {
    icon: AlertTriangle,
    color: "#f59e0b",
    bg: "#fffbeb",
  },

  budget_exceeded: {
    icon: TrendingDown,
    color: "#ef4444",
    bg: "#fff5f5",
  },

  on_track: {
    icon: CheckCircle,
    color: "#22c55e",
    bg: "#f0fdf4",
  },

  weekly_summary: {
    icon: Sparkles,
    color: "#3b82f6",
    bg: "#eff6ff",
  },

  expense_added: {
    icon: TrendingDown,
    color: "#6366f1",
    bg: "#f5f3ff",
  },

  income_added: {
    icon: TrendingUp,
    color: "#10b981",
    bg: "#ecfdf5",
  },

  welcome: {
    icon: Sparkles,
    color: "#000AC2",
    bg: "#eff1ff",
  },
};

const DEFAULT_CONFIG = {
  icon: Bell,
  color: "#78778B",
  bg: "#f5f5f5",
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

  return `${Math.floor(diff / 86400)}d ago`;
}

function NotificationModal({ isModalOpen, setIsModalOpen }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const modalRef = useRef(null);

  useEffect(() => {
    if (!isModalOpen) return;

    setLoading(true);
    setError("");

    notificationsApi
      .getAll()
      .then((data) => {
        setNotifications(data.notifications || []);
      })
      .catch(() => {
        setError("Could not load notifications.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isModalOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target)
      ) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [isModalOpen, setIsModalOpen]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();

    try {
      await notificationsApi.delete(id);

      setNotifications((prev) =>
        prev.filter((n) => n.id !== id)
      );
    } catch {}
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markRead(id);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, is_read: true }
            : n
        )
      );
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          is_read: true,
        }))
      );
    } catch {}
  };

  const filtered =
    activeFilter === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  const unreadCount = notifications.filter(
    (n) => !n.is_read
  ).length;

  return (
    <>
      {isModalOpen && (
        <div className={styles.notification}>
          <div ref={modalRef}>

            {/* HEADER */}
            <header>

              <div className={styles.top}>
                <h2>
                  Notifications

                  {unreadCount > 0 && (
                    <span>{unreadCount} new</span>
                  )}
                </h2>

                <X
                  size={20}
                  onClick={() => setIsModalOpen(false)}
                />
              </div>

              {/* FILTERS */}
              <div
                className={
                  styles["notifification-filter"]
                }
              >
                <div className={styles.left}>
                  {["all", "unread"].map((f) => (
                    <button
                      key={f}
                      onClick={() =>
                        setActiveFilter(f)
                      }
                      style={{
                        fontWeight:
                          activeFilter === f
                            ? "600"
                            : "500",

                        textDecoration:
                          activeFilter === f
                            ? "underline"
                            : "none",
                      }}
                    >
                      {f === "all"
                        ? "All"
                        : `Unread${
                            unreadCount > 0
                              ? ` (${unreadCount})`
                              : ""
                          }`}
                    </button>
                  ))}
                </div>

                {unreadCount > 0 && (
                  <button
                    className={styles["mark-read"]}
                    onClick={handleMarkAllRead}
                  >
                    <CheckCheck size={13} />
                    Mark all read
                  </button>
                )}
              </div>
            </header>

            {/* BODY */}
            <div
              className={
                styles["notification-content"]
              }
            >
              <div
                className={styles["notification-body"]}
              >

                {/* LOADING */}
                {loading && (
                  <div
                    className={
                      styles["notification-empty"]
                    }
                  >
                    <Bell size={36} />
                    <p>Loading notifications...</p>
                  </div>
                )}

                {/* ERROR */}
                {error && (
                  <div
                    className={
                      styles["notification-empty"]
                    }
                  >
                    <AlertTriangle
                      size={32}
                      style={{
                        color: "#ef4444",
                      }}
                    />

                    <p
                      style={{
                        color: "#ef4444",
                      }}
                    >
                      {error}
                    </p>
                  </div>
                )}

                {/* EMPTY */}
                {!loading &&
                  !error &&
                  filtered.length === 0 && (
                    <div
                      className={
                        styles["notification-empty"]
                      }
                    >
                      <Bell size={40} />

                      <p
                        style={{
                          fontWeight: 600,
                          color: "#111",
                          fontSize: 14,
                        }}
                      >
                        {activeFilter === "unread"
                          ? "No unread notifications"
                          : "You're all caught up!"}
                      </p>

                      <p
                        style={{
                          fontSize: 12,
                        }}
                      >
                        {activeFilter === "unread"
                          ? "Switch to All to see your history"
                          : "Notifications will appear here as you use Budgeet"}
                      </p>
                    </div>
                  )}

                {/* ITEMS */}
                {!loading &&
                  !error &&
                  filtered
                    .slice(0, 20)
                    .map((n) => {
                      const config =
                        TYPE_CONFIG[n.type] ||
                        DEFAULT_CONFIG;

                      const IconComponent =
                        config.icon;

                      return (
                        <div
                          key={n.id}
                          className={`${
                            styles[
                              "notification-item"
                            ]
                          } ${
                            !n.is_read
                              ? styles.unread
                              : ""
                          }`}
                          onClick={() =>
                            !n.is_read &&
                            handleMarkRead(n.id)
                          }
                        >

                          {/* ICON */}
                          <div
                            className={
                              styles[
                                "notification-dot"
                              ]
                            }
                            style={{
                              backgroundColor:
                                config.bg,

                              color:
                                config.color,
                            }}
                          >
                            <IconComponent
                              size={16}
                              style={{
                                color:
                                  config.color,

                                position:
                                  "relative",

                                zIndex: 1,
                              }}
                            />
                          </div>

                          {/* TEXT */}
                          <div
                            className={
                              styles[
                                "notification-info"
                              ]
                            }
                          >
                            <p
                              className={
                                styles[
                                  "notification-title"
                                ]
                              }
                            >
                              {n.title}
                            </p>

                            <p
                              className={
                                styles[
                                  "notification-message"
                                ]
                              }
                            >
                              {n.message}
                            </p>

                            <p
                              className={
                                styles[
                                  "notification-date"
                                ]
                              }
                            >
                              {timeAgo(
                                n.created_at
                              )}
                            </p>
                          </div>

                          {/* DELETE */}
                          <button
                            className={
                              styles[
                                "notification-delete-btn"
                              ]
                            }
                            onClick={(e) =>
                              handleDelete(
                                n.id,
                                e
                              )
                            }
                            title="Dismiss"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}

                {/* VIEW ALL */}
                {!loading &&
                  filtered.length > 20 && (
                    <button
                      className={
                        styles[
                          "notification-view-all"
                        ]
                      }
                    >
                      View all{" "}
                      {filtered.length} notifications
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NotificationModal;