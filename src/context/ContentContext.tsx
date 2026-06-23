import React, { createContext, useContext, useState, useEffect } from "react";
import { SiteContent } from "../types";
import defaultContent from "../data/site_content.json";

interface ContentContextType {
  content: SiteContent;
  isLoading: boolean;
  isAdmin: boolean;
  adminToken: string | null;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  updateContent: (newContent: SiteContent) => Promise<boolean>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(defaultContent as SiteContent);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem("sneha_admin_token"));
  const [isAdmin, setIsAdmin] = useState<boolean>(!!localStorage.getItem("sneha_admin_token"));

  // Fetch from Express API
  const fetchContent = async (isBackground = false) => {
    try {
      if (!isBackground) {
        setIsLoading(true);
      }
      const res = await fetch(`${API_BASE_URL}/api/content?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setContent(data);
      }
    } catch (error) {
      console.warn("Could not fetch site content from API, using default JSON fallback:", error);
    } finally {
      if (!isBackground) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchContent();

    // High performance background real-time sync (polls every 5 seconds)
    // Ensures multiple devices viewing/editing the site have immediate consistency
    const intervalId = setInterval(() => {
      fetchContent(true);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Login handler
  const login = async (password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("sneha_admin_token", data.token);
        setAdminToken(data.token);
        setIsAdmin(true);
        return true;
      }
    } catch (error) {
      console.error("Login process failed", error);
    }
    return false;
  };

  // Logout handler
  const logout = () => {
    if (adminToken) {
      fetch(`${API_BASE_URL}/api/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
      }).catch(() => {});
    }
    localStorage.removeItem("sneha_admin_token");
    setAdminToken(null);
    setIsAdmin(false);
  };

  // Update handler
  const updateContent = async (newContent: SiteContent): Promise<boolean> => {
    if (!adminToken) return false;

    // Optimistically update UI
    setContent(newContent);

    try {
      const res = await fetch(`${API_BASE_URL}/api/content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(newContent),
      });

      if (res.ok) {
        return true;
      } else {
        // Revert on failure
        fetchContent();
        return false;
      }
    } catch (error) {
      console.error("Could not persist new content to Express API:", error);
      fetchContent();
      return false;
    }
  };

  return (
    <ContentContext.Provider value={{ content, isLoading, isAdmin, adminToken, login, logout, updateContent }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
};
