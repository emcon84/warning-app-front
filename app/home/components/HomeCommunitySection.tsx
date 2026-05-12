"use client";

import { useState, useEffect } from "react";
import ComercioPostCard from "../../components/ComercioPostCard";
import { useTheme } from "../../contexts/ThemeContext";
import type { ComercioPost } from "../../types";

import { API_URL } from "../../lib/api/client";

export function HomeCommunitySection() {
  const { isDark } = useTheme();
  const [posts, setPosts] = useState<ComercioPost[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/posts/recientes?limit=10`)
      .then(r => r.json())
      .then(data => Array.isArray(data) && setPosts(data))
      .catch(() => {});
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between px-0 mb-3">
        <div>
          <p className={`font-black text-base ${isDark ? "text-white" : "text-gray-900"}`}>
            En la comunidad
          </p>
          <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            Lo ultimo de los comercios locales
          </p>
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
        {posts.map(post => (
          <ComercioPostCard
            key={post.id}
            post={post}
            variant="slide"
            isDark={isDark}
          />
        ))}
      </div>
    </section>
  );
}
