import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Bell, X } from "lucide-react";
import GreetingHeader from "../GreetingHeader";
import styles from "./dashboard-header.module.css";
import NotificationModal from "../NotificationModal";
import { useAuth } from "../../context/AuthContext";

/**
 THE NOTIFICATION OBJECT LOOKS SOMETHING LIKE THE BELOW:

 {
  "id": "notif_92hd82",
  "type": "NEW_MESSAGE",
  "title": "New Message",
  "message": "John sent you a message.",
  "recipientId": "user_123",
  "sender": {
    "id": "user_456",
    "name": "John Doe",
    "avatar": "https://example.com/avatar.jpg"
  },
  "isRead": false,
  "createdAt": "2026-05-16T10:45:00Z",
  "actionUrl": "/messages/user_456",
  "metadata": {
    "conversationId": "conv_789"
  }
}

 */

function DashboardHeader() {
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showNotificationModal, setshowNotificationModal] = useState(false);
  const { user } = useAuth();

  const allMockData = {
    user: { name: user?.name || "Explorer" },
  };

  const handleShowSearchBar = () => {
    setShowSearchBar(!showSearchBar);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSearchBar(false);
  };

  const handlenotificationModal = () => {
    setshowNotificationModal(!showNotificationModal);
  };

  return (
    <div
      className={`dashboard-header h-16 shrink-0 bg-white border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-50 ${styles.dashboardHeader}`}
    >
      {/* Mobile Toggle Button */}
      {!showSearchBar && (
        <button
          onClick={handleShowSearchBar}
          className="md:hidden p-1 text-gray-500 hover:text-black transition-colors"
        >
          <Search size={22} />
        </button>
      )}

      {/* Search Bar - Hidden on mobile unless toggled, always visible on desktop */}
      <form
        onSubmit={handleSearch}
        className={`${showSearchBar ? "flex" : "hidden"} md:flex items-center absolute md:static top-0 left-0 w-full md:w-80 h-full md:h-auto bg-white px-4 md:px-0 z-10 transition-all`}
      >
        <div className="relative w-full flex items-center justify-center">
          <input
            type="search"
            className="w-full max-w-[90%] md:max-w-full h-10 border border-gray-200 rounded-full md:rounded-l-lg md:rounded-r-none focus:outline-none focus:border-[var(--budgeet-primary)]"
            placeholder="Search expenses..."
            autoFocus={showSearchBar}
          />
          {showSearchBar && (
            <button
              type="button"
              onClick={() => setShowSearchBar(false)}
              className="md:hidden absolute right-7 text-gray-400"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="hidden md:flex bg-[var(--budgeet-primary-light)] w-12 h-10 justify-center items-center rounded-r-lg border border-l-0 border-gray-200 hover:bg-[var(--budgeet-primary)] hover:text-white transition-colors"
        >
          <Search size={20} />
        </button>
      </form>

      <div
        className={`left h-full flex items-center gap-4 ${showSearchBar ? "hidden md:flex" : "flex"}`}
      >
        <Bell
          size={20}
          className="text-gray-500 cursor-pointer hover:text-black transition-colors"
          onClick={handlenotificationModal}
        />
        <GreetingHeader name={allMockData.user.name} />
      </div>
      <NotificationModal
        isModalOpen={showNotificationModal}
        setIsModalOpen={setshowNotificationModal}
      />
    </div>
  );
}

export default DashboardHeader;
