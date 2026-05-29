import { useState, useEffect, useRef } from "react";
import { LogOut, User, ChevronDown, Sun, Cloud, Sunset, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { profileApi } from "../lib/api";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5  && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
}

function getGreetingIcon() {
  const hour = new Date().getHours();
  if (hour >= 5  && hour < 12) return <Sun  size={12} color="#f59e0b" style={{ flexShrink: 0 }} />;
  if (hour >= 12 && hour < 17) return <Cloud size={12} color="#3b82f6" style={{ flexShrink: 0 }} />;
  if (hour >= 17 && hour < 21) return <Sunset size={12} color="#f97316" style={{ flexShrink: 0 }} />;
  return <Moon size={12} color="#6366f1" style={{ flexShrink: 0 }} />;
}

function GreetingHeader({ name }) {
  const [isOpen, setIsOpen]         = useState(false);
  const [avatarUrl, setAvatarUrl]   = useState(null);
  const { logout, user }            = useAuth();
  const dropdownRef                 = useRef(null);
  const navigate                    = useNavigate();

  const displayName = user?.full_name || user?.name || name || "Explorer";
  const firstName   = displayName.split(" ")[0];
  const initial     = displayName.charAt(0).toUpperCase();

  // Fetch avatar from backend
  useEffect(() => {
    profileApi.get()
      .then((data) => { if (data.avatar_url) setAvatarUrl(data.avatar_url); })
      .catch(() => {});
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const handleProfileClick = () => { setIsOpen(false); navigate("/dashboard/profile"); };
  const handleLogout        = () => { setIsOpen(false); logout(); navigate("/auth/signin"); };

  // ── Avatar component (reused in button + dropdown) ──
  const Avatar = ({ size = 32, textSize = "text-sm" }) => (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        flexShrink: 0, overflow: "hidden",
        background: avatarUrl ? "transparent" : "var(--budgeet-primary)",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "2px solid rgba(255,255,255,0.3)",
      }}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
      ) : (
        <span className={`text-white font-semibold font-poppins ${textSize}`}>{initial}</span>
      )}
    </div>
  );

  return (
    <div className="relative" ref={dropdownRef}>

      {/* ── Trigger button ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
        style={{ outline: "none" }}
      >
        <Avatar size={34} textSize="text-sm" />
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span style={{ fontSize: 10, color: "#78778B", fontWeight: 500, fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", gap: 3 }}>
            {getGreetingIcon()} {getGreeting()}
          </span>
          <span style={{ fontSize: 13, color: "#111", fontWeight: 700, fontFamily: "Poppins, sans-serif", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {firstName}
          </span>
        </div>
        <ChevronDown
          size={14}
          className="hidden sm:block text-gray-400 transition-transform"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
        />
      </button>

      {/* ── Dropdown ── */}
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div className="fixed inset-0 z-10 sm:hidden" onClick={() => setIsOpen(false)} />

          <div
            className="absolute right-0 top-full mt-2 z-[100]"
            style={{
              width: 240,
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
              border: "1px solid #f0f0f0",
              overflow: "hidden",
              animation: "dropdownIn 0.18s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <style>{`
              @keyframes dropdownIn {
                from { opacity: 0; transform: translateY(-8px) scale(0.97); }
                to   { opacity: 1; transform: translateY(0)   scale(1); }
              }
            `}</style>

            {/* ── User card ── */}
            <div
              style={{
                padding: "16px",
                background: "linear-gradient(135deg, #000AC2 0%, #2233e8 100%)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative orb */}
              <div style={{
                position: "absolute", top: -20, right: -20,
                width: 80, height: 80, borderRadius: "50%",
                background: "rgba(255,255,255,0.07)", pointerEvents: "none",
              }} />

              <div className="flex items-center gap-3" style={{ position: "relative", zIndex: 1 }}>
                <Avatar size={44} textSize="text-base" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 8, fontWeight: 600, color: "rgba(255,255,255,0.6)",
                    textTransform: "uppercase", letterSpacing: "0.8px",
                    fontFamily: "Poppins, sans-serif", marginBottom: 2,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    {getGreetingIcon()} {getGreeting()}
                  </p>
                  <p style={{
                    fontSize: 14, fontWeight: 700, color: "#fff",
                    fontFamily: "Poppins, sans-serif",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {displayName}
                  </p>
                  <p style={{
                    fontSize: 11, color: "rgba(255,255,255,0.6)",
                    fontFamily: "Poppins, sans-serif",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {user?.email || ""}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Menu items ── */}
            <div style={{ padding: "6px 0" }}>
              <button
                onClick={handleProfileClick}
                className="w-full flex items-center gap-3 transition-colors"
                style={{
                  padding: "10px 16px", fontSize: 13, fontWeight: 500,
                  color: "#333", background: "none", border: "none",
                  cursor: "pointer", fontFamily: "Poppins, sans-serif",
                  textAlign: "left",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8f8f8"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: "#f0f0f0", display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <User size={14} color="#555" />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0 }}>My Profile</p>
                  <p style={{ fontSize: 11, color: "#78778B", margin: 0 }}>Edit your details</p>
                </div>
              </button>
            </div>

            {/* ── Divider ── */}
            <div style={{ height: 1, background: "#f5f5f5", margin: "0 12px" }} />

            {/* ── Logout ── */}
            <div style={{ padding: "6px 0" }}>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 transition-colors"
                style={{
                  padding: "10px 16px", fontSize: 13, fontWeight: 500,
                  color: "#ef4444", background: "none", border: "none",
                  cursor: "pointer", fontFamily: "Poppins, sans-serif",
                  textAlign: "left",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#fff5f5"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: "#fff0f0", display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <LogOut size={14} color="#ef4444" />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#ef4444", margin: 0 }}>Logout</p>
                  <p style={{ fontSize: 11, color: "#f87171", margin: 0 }}>Sign out of your account</p>
                </div>
              </button>
            </div>

          </div>
        </>
      )}
    </div>
  );
}

export default GreetingHeader;