import { useState, useEffect, useRef } from "react";
import { Search, Bell, X, TrendingDown, TrendingUp } from "lucide-react";
import GreetingHeader from "../GreetingHeader";
import styles from "./dashboard-header.module.css";
import NotificationModal from "../NotificationModal";
import { useAuth } from "../../context/AuthContext";
import { notificationsApi } from "../../lib/api";
import { useSearch } from "../../hooks/useSearch";
import { formatNaira } from "../../lib/utils";
import AddIncome from "../AddIncome";



function DashboardHeader() {
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user }  = useAuth();

  const inputRef  = useRef(null);
  const wrapperRef = useRef(null);

  const { query, setQuery, results, loading, clear } = useSearch();

  const showResults = query.trim().length > 0;

  // ── Fetch unread count on mount ──
  useEffect(() => {
    notificationsApi.getAll()
      .then((data) => {
        const count = typeof data.unread_count !== "undefined"
          ? data.unread_count
          : (data.notifications?.filter((n) => !n.is_read).length || 0);
        setUnreadCount(count);
      })
      .catch(() => {});
  }, []);

  // ── Close search results on outside click ──
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSearchBar(false);
        clear();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [clear]);

  // ── Focus input when search bar opens ──
  useEffect(() => {
    if (showSearchBar) inputRef.current?.focus();
  }, [showSearchBar]);

  const handleNotificationClick = () => {
    setShowNotificationModal((v) => !v);
    if (!showNotificationModal) setUnreadCount(0);
  };

  const handleClose = () => {
    setShowSearchBar(false);
    clear();
  };

  return (
    <div
      className={`dashboard-header h-16 shrink-0 bg-white border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-50 ${styles.dashboardHeader}`}
    >
      {/* ── Mobile search toggle ── */}
      {!showSearchBar && (
        <button
          onClick={() => setShowSearchBar(true)}
          className="md:hidden p-1 text-gray-500 hover:text-black transition-colors"
        >
          <Search size={22} />
        </button>
      )}

      {/* ── Search bar + results ── */}
      <div
        ref={wrapperRef}
        className={`${showSearchBar ? "flex" : "hidden"} md:flex flex-col absolute md:static top-0 left-0 w-full md:w-80 md:h-auto bg-white z-10`}
        style={{ height: showSearchBar ? "auto" : undefined }}
      >
        {/* Input row */}
        <div className="flex items-center h-16 md:h-auto px-4 md:px-0">
          <div className="relative w-full flex items-center">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full max-w-[90%] md:max-w-full h-10 pl-3 pr-8 border border-gray-200 rounded-full md:rounded-l-lg md:rounded-r-none text-sm focus:outline-none focus:border-[var(--budgeet-primary)]"
              placeholder="Search expenses, income…"
            />
            {/* Clear button inside input */}
            {query && (
              <button
                type="button"
                onClick={clear}
                className="absolute right-14 md:right-2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
            {/* Mobile close */}
            {showSearchBar && (
              <button
                type="button"
                onClick={handleClose}
                className="md:hidden absolute right-6 text-gray-400"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.focus()}
            className="hidden md:flex bg-[var(--budgeet-primary-light)] w-12 h-10 justify-center items-center rounded-r-lg border border-l-0 border-gray-200 hover:bg-[var(--budgeet-primary)] hover:text-white transition-colors flex-shrink-0"
          >
            <Search size={18} />
          </button>
        </div>

        {/* ── Search results dropdown ── */}
        {showResults && (
          <div
            className="absolute top-16 left-0 md:left-auto w-full md:w-[420px] bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden"
            style={{ maxHeight: 380, overflowY: "auto", zIndex: 200 }}
          >
            {loading ? (
              <div className="flex items-center gap-2 px-4 py-5 text-sm text-gray-400">
                <Search size={14} className="animate-pulse" />
                Searching for &quot;{query}&quot;…
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                <Search size={28} className="mx-auto mb-2 opacity-20" />
                <p className="font-medium text-gray-600">
                  No results for &quot;{query}&quot;
                </p>
                <p className="text-xs mt-1">Try a different keyword</p>
              </div>
            ) : (
              <>
                {/* Result count header */}
                <div className="px-4 py-2.5 border-b border-gray-50 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    {results.length} result{results.length !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={clear}
                    className="text-[11px] text-[var(--budgeet-primary)] font-semibold hover:underline"
                  >
                    Clear
                  </button>
                </div>

                {/* Result rows */}
                {results.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                  >
                    {/* Icon */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          item.type === "expense" ? "#fff0f0" : "#f0fdf4",
                      }}
                    >
                      {item.type === "expense" ? (
                        <TrendingDown size={14} color="#ef4444" />
                      ) : (
                        <TrendingUp size={14} color="#22c55e" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {item.name || item.label || item.description}
                      </p>
                      <p className="text-[11px] text-gray-400 capitalize">
                        {item.category || item.income_type} · {item.date}
                      </p>
                    </div>

                    {/* Amount */}
                    <span
                      className="text-sm font-bold flex-shrink-0"
                      style={{
                        color: item.type === "expense" ? "#ef4444" : "#22c55e",
                      }}
                    >
                      {item.type === "expense" ? "−" : "+"}
                      {formatNaira(item.amount)}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Right side: Bell + Avatar ── */}
      <div className="flex gap-4">
        <div
          className={`flex items-center gap-4 h-full ${showSearchBar ? "hidden md:flex" : "flex"}`}
        >
          {/* Bell */}
          <div
            className="relative cursor-pointer"
            onClick={handleNotificationClick}
          >
            {unreadCount > 0 && (
              <span
                className={`notification-label bg-[var(--budgeet-danger)] text-[10px] text-white font-bold absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center z-10 ${styles.notificationLabel}`}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
            <Bell
              size={20}
              className="text-gray-500 hover:text-black transition-colors"
            />
          </div>

          <GreetingHeader name={user?.name || "Explorer"} />
        </div>
        <button 
          className={`add-income-btn hidden md:flex ${styles.addIncomeBtn}`} 
          onClick={() => setShowAddIncome(true)}
        >
          <span>+ Add Income</span>
        </button>
      </div>
      <NotificationModal
        isModalOpen={showNotificationModal}
        setIsModalOpen={setShowNotificationModal}
      />

      {showAddIncome && (
              <AddIncome
                onClose={() => {
                  setShowAddIncome(false);
                }}
              />
            )}
    </div>
  );
}

export default DashboardHeader;