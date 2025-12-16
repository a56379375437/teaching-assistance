
// export default function Home() {
//   return (
//     <p>Home</p>
//   )
// }
import { useState, useEffect } from "react";

const CACHE_KEY = "learningInsightHtml";
const CACHE_DURATION = 30 * 60 * 1000; // 半小时

export default function Home() {
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 尝试从缓存读取
    const cachedData = localStorage.getItem(CACHE_KEY);

    if (cachedData) {
      try {
        const { html, timestamp } = JSON.parse(cachedData);
        const age = Date.now() - timestamp;

        if (age < CACHE_DURATION) {
          setHtmlContent(html);
          setLoading(false);
          return; // 使用缓存数据，不发起新请求
        }
      } catch (err) {
        console.warn("Failed to parse cache:", err);
      }
    }

    // 缓存过期或不存在，发起新请求
    const fetchHtml = async () => {
      try {
        const response = await fetch("/api/README");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const html = await response.text();
        setHtmlContent(html);

        // 保存到缓存
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            html,
            timestamp: Date.now(),
          })
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchHtml();
  }, []);

  return (
    <div className="learning-insight-container">
      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading content...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <div
          className="html-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      )}
    </div>
  );
}
