/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { debugPostsTable, insertTestData } from "@/lib/debug-posts";

export default function DebugPostsPanel() {
  const [debugResults, setDebugResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  const runDebug = async () => {
    setIsLoading(true);
    try {
      const results = await debugPostsTable();
      setDebugResults(results);
    } catch (error) {
      console.error("Debug failed:", error);
      setDebugResults({ errors: [`Debug failed: ${error instanceof Error ? error.message : 'Unknown error'}`] });
    } finally {
      setIsLoading(false);
    }
  };

  const insertTestPosts = async () => {
    setIsLoading(true);
    try {
      const result = await insertTestData();
      if (result.success) {
        alert("Test data inserted successfully! Refresh the page to see posts.");
        // Run debug again to show updated results
        setTimeout(runDebug, 1000);
      } else {
        alert(`Failed to insert test data: ${result.error}`);
      }
    } catch (error) {
      alert(`Failed to insert test data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showPanel) {
    return (
      <div style={{ position: "fixed", top: "10px", right: "10px", zIndex: 9999 }}>
        <button
          onClick={() => setShowPanel(true)}
          style={{
            background: "#3b82f6",
            color: "white",
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          🔍 Debug Posts
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed",
      top: "10px",
      right: "10px",
      width: "400px",
      maxHeight: "80vh",
      overflow: "auto",
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      padding: "16px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      zIndex: 9999
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>🔍 Posts Debug Panel</h3>
        <button
          onClick={() => setShowPanel(false)}
          style={{
            background: "none",
            border: "none",
            fontSize: "18px",
            cursor: "pointer",
            padding: "0"
          }}
        >
          ×
        </button>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button
          onClick={runDebug}
          disabled={isLoading}
          style={{
            background: isLoading ? "#9ca3af" : "#10b981",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            border: "none",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: "12px"
          }}
        >
          {isLoading ? "Running..." : "🔍 Run Debug"}
        </button>
        <button
          onClick={insertTestPosts}
          disabled={isLoading}
          style={{
            background: isLoading ? "#9ca3af" : "#f59e0b",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            border: "none",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: "12px"
          }}
        >
          {isLoading ? "Inserting..." : "📝 Insert Test Data"}
        </button>
      </div>

      {debugResults && (
        <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
          {/* Summary */}
          <div style={{ marginBottom: "12px", padding: "8px", background: "#f3f4f6", borderRadius: "4px" }}>
            <strong>📊 Summary:</strong>
            <div>• Table exists: {debugResults.tableExists ? "✅ Yes" : "❌ No"}</div>
            <div>• Total rows: {debugResults.totalRows}</div>
            <div>• Can select: {debugResults.canSelect ? "✅ Yes" : "❌ No"}</div>
            <div>• RLS blocking: {debugResults.hasRLS ? "⚠️ Yes" : "✅ No"}</div>
          </div>

          {/* Status Distribution */}
          {Object.keys(debugResults.statusDistribution).length > 0 && (
            <div style={{ marginBottom: "12px", padding: "8px", background: "#fef3c7", borderRadius: "4px" }}>
              <strong>📈 Status Distribution:</strong>
              {Object.entries(debugResults.statusDistribution).map(([status, count]) => (
                <div key={status}>• {status}: {String(count)}</div>
              ))}
            </div>
          )}

          {/* Post Type Distribution */}
          {Object.keys(debugResults.postTypeDistribution).length > 0 && (
            <div style={{ marginBottom: "12px", padding: "8px", background: "#dbeafe", borderRadius: "4px" }}>
              <strong>📈 Post Type Distribution:</strong>
              {Object.entries(debugResults.postTypeDistribution).map(([type, count]) => (
                <div key={type}>• {type}: {String(count)}</div>
              ))}
            </div>
          )}

          {/* Sample Data */}
          {debugResults.sampleRows.length > 0 && (
            <div style={{ marginBottom: "12px", padding: "8px", background: "#f0fdf4", borderRadius: "4px" }}>
              <strong>📋 Sample Data (first 2 rows):</strong>
              {debugResults.sampleRows.slice(0, 2).map((row: any, index: number) => (
                <div key={index} style={{ fontSize: "11px", marginTop: "4px", padding: "4px", background: "white", borderRadius: "2px" }}>
                  <div><strong>ID:</strong> {String(row.id)}</div>
                  <div><strong>Status:</strong> {String(row.status)}</div>
                  <div><strong>Type:</strong> {String(row.post_type)}</div>
                  <div><strong>Work:</strong> {String(row.work)}</div>
                </div>
              ))}
            </div>
          )}

          {/* Errors */}
          {debugResults.errors.length > 0 && (
            <div style={{ marginBottom: "12px", padding: "8px", background: "#fee2e2", borderRadius: "4px" }}>
              <strong>❌ Errors:</strong>
              {debugResults.errors.map((error: string, index: number) => (
                <div key={index}>• {error}</div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {debugResults.recommendations.length > 0 && (
            <div style={{ padding: "8px", background: "#e0e7ff", borderRadius: "4px" }}>
              <strong>💡 Recommendations:</strong>
              {debugResults.recommendations.map((rec: string, index: number) => (
                <div key={index} style={{ marginTop: "4px" }}>• {rec}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
