// src/app/notifications/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { notificationService } from "@/api/services/notifications";
import { useAuth } from "@/context/AuthContext";

// --- STYLES ---
const colors = {
  primary: "#1976d2",
  secondary: "#2e7d32",
  background: "#100745",
  cardBackground: "#ffffff",
  unreadHighlight: "#e3f2fd",
  textPrimary: "#333333",
  textSecondary: "#757575",
  divider: "#e0e0e0",
};

// --- UI COMPONENTS ---
const Container = ({ children }) => (
  <div style={{ backgroundColor: colors.background, minHeight: "100vh", padding: "40px 0" }}>
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "24px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        backgroundColor: colors.cardBackground,
      }}
    >
      {children}
    </div>
  </div>
);

const Typography = ({ variant, children, style = {} }) => {
  switch (variant) {
    case "h1":
      return (
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "600",
            color: colors.textPrimary,
            marginBottom: "24px",
            borderBottom: `2px solid ${colors.divider}`,
            paddingBottom: "16px",
            ...style,
          }}
        >
          {children}
        </h1>
      );
    case "body1":
      return <p style={{ fontSize: "16px", color: colors.textPrimary, marginBottom: "4px", ...style }}>{children}</p>;
    case "caption":
      return <small style={{ fontSize: "12px", color: colors.textSecondary, display: "block", ...style }}>{children}</small>;
    default:
      return <div style={style}>{children}</div>;
  }
};

const Button = ({ onClick, children, style = {} }) => (
  <button
    onClick={onClick}
    style={{
      backgroundColor: colors.primary,
      color: "white",
      padding: "8px 16px",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "14px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
      transition: "background-color 0.3s",
      ...style,
    }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1565c0")}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.primary)}
  >
    {children}
  </button>
);

const CircularProgress = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
    <div
      style={{
        width: "40px",
        height: "40px",
        border: `4px solid ${colors.divider}`,
        borderTop: `4px solid ${colors.primary}`,
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    ></div>
  </div>
);

const Box = ({ children, style = {} }) => <div style={style}>{children}</div>;
const List = ({ children }) => <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>{children}</ul>;

// --- TYPES ---
interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

// --- MAIN PAGE ---
const NotificationsPage = () => {
  const params = useParams();
  const idParam = params.id;
  const auctioneerId = Array.isArray(idParam) ? idParam[0] : idParam;
  const userIdAsNumber = auctioneerId ? Number(auctioneerId) : undefined;

  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auctioneerId || isNaN(userIdAsNumber as number)) {
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getNotifications(userIdAsNumber as number);
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [auctioneerId, userIdAsNumber]);

  // 🔹 Mark ALL as read
  const handleMarkAsRead = async () => {
    if (!userIdAsNumber) return;

    try {
      await notificationService.markAsRead(userIdAsNumber);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // 🔹 Mark SINGLE as read
  const handleMarkSingleAsRead = async (id: number) => {
    if (!userIdAsNumber) return;

    try {
      // If you have a backend endpoint like /notifications/:id/mark-as-read/, call it here.
      // For now, simulate by marking in state:
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const isAuthorizedUser = user?.id === userIdAsNumber;

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Typography variant="h1">Notifications for Account: **{user?.username}**</Typography>

      {/* Mark All Button */}
      {isAuthorizedUser && notifications.some((n) => !n.is_read) && (
        <Box style={{ marginBottom: "24px", textAlign: "right" }}>
          <Button onClick={handleMarkAsRead} style={{ backgroundColor: colors.secondary }}>
            Mark All As Read
          </Button>
        </Box>
      )}

      {notifications.length === 0 ? (
        <Typography
          variant="body1"
          style={{ color: colors.textSecondary, textAlign: "center", padding: "40px", border: `1px dashed ${colors.divider}` }}
        >
          🎉 You're all caught up! No notifications available.
        </Typography>
      ) : (
        <List>
          {notifications.map((notification) => {
            const isUnread = !notification.is_read;
            return (
              <li
                key={notification.id}
                style={{
                  padding: "16px",
                  borderRadius: "6px",
                  backgroundColor: isUnread ? colors.unreadHighlight : colors.cardBackground,
                  borderLeft: isUnread ? "4px solid " + colors.primary : "none",
                  boxShadow: isUnread ? "0 1px 3px rgba(0, 0, 0, 0.1)" : "none",
                  transition: "all 0.3s ease",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Typography
                    variant="body1"
                    style={{
                      fontWeight: isUnread ? "600" : "normal",
                      color: isUnread ? colors.textPrimary : colors.textSecondary,
                    }}
                  >
                    {notification.message}
                  </Typography>
                  <Typography variant="caption">{new Date(notification.created_at).toLocaleString()}</Typography>
                </div>

                {/* Mark single button */}
                {isUnread && (
                  <Button onClick={() => handleMarkSingleAsRead(notification.id)} style={{ backgroundColor: colors.secondary }}>
                    Mark Read
                  </Button>
                )}
              </li>
            );
          })}
        </List>
      )}
    </Container>
  );
};

export default NotificationsPage;
