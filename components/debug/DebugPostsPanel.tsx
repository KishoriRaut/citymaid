/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { debugPostsTable, insertTestData } from "@/lib/debug-posts";
import { debugProductionDatabase, insertProductionTestData } from "@/lib/debug-production";
import { setupProductionDatabase, quickFixProductionData } from "@/lib/setup-production";
import { emergencyProductionFix } from "@/lib/emergency-fix";

export default function DebugPostsPanel() {
  const [debugResults, setDebugResults] = useState<any>(null);
  const [productionResults, setProductionResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [isProduction, setIsProduction] = useState(false);

  // Check if we're in production
  useEffect(() => {
    setIsProduction(
      typeof window !== "undefined" && 
      (window.location.hostname.includes("vercel.app") || 
       window.location.hostname !== "localhost")
    );
  }, []);

  const runProductionDebug = async () => {
    setIsLoading(true);
    try {
      const results = await debugProductionDatabase();
      setProductionResults(results);
    } catch (error) {
      console.error("Production debug failed:", error);
      setProductionResults({ issues: [`Production debug failed: ${error instanceof Error ? error.message : 'Unknown error'}`] });
    } finally {
      setIsLoading(false);
    }
  };

  const insertProductionTestPosts = async () => {
    setIsLoading(true);
    try {
      const result = await insertProductionTestData();
      if (result.success) {
        alert("Production test data inserted successfully! Refresh the page to see posts.");
        setTimeout(runProductionDebug, 1000);
      } else {
        alert(`Failed to insert production test data: ${result.error}`);
      }
    } catch (error) {
      alert(`Failed to insert production test data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const setupProduction = async () => {
    setIsLoading(true);
    try {
      const result = await setupProductionDatabase();
      if (result.success) {
        alert(`🎉 Production setup complete! Inserted ${result.postsInserted} posts. Refresh the page to see posts.`);
        setTimeout(runProductionDebug, 1000);
      } else {
        alert(`Production setup failed: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      alert(`Production setup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const quickFixProduction = async () => {
    setIsLoading(true);
    try {
      const result = await quickFixProductionData();
      if (result.success) {
        alert(`⚡ Quick fix complete! ${result.message}`);
        setTimeout(runProductionDebug, 1000);
      } else {
        alert(`Quick fix failed: ${result.error}`);
      }
    } catch (error) {
      alert(`Quick fix error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const emergencyFix = async () => {
    setIsLoading(true);
    try {
      const result = await emergencyProductionFix();
      
      let message = `🚨 EMERGENCY FIX RESULTS:\n\n`;
      message += `✅ Connection: ${result.step1_connection ? 'PASS' : 'FAIL'}\n`;
      message += `✅ Table Exists: ${result.step2_tableExists ? 'PASS' : 'FAIL'}\n`;
      message += `✅ Permissions: ${result.step3_permissions ? 'PASS' : 'FAIL'}\n`;
      message += `✅ Insertion: ${result.step4_insertion ? 'PASS' : 'FAIL'}\n`;
      message += `✅ Verification: ${result.step5_verification ? 'PASS' : 'FAIL'}\n\n`;
      message += `📊 Final Post Count: ${result.finalPostCount}\n\n`;
      message += `🔍 Diagnosis: ${result.diagnosis}\n\n`;
      
      if (result.errors.length > 0) {
        message += `❌ Errors:\n${result.errors.join('\n')}`;
      }
      
      if (result.success) {
        message += `\n\n🎉 SUCCESS! Refresh the page to see posts!`;
      } else {
        message += `\n\n⚠️ Issues found. Check the diagnosis above.`;
      }
      
      alert(message);
      
      if (result.success) {
        setTimeout(runProductionDebug, 1000);
      }
    } catch (error) {
      alert(`Emergency fix error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

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
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
          🔍 Posts Debug Panel {isProduction && "🌐 PRODUCTION"}
        </h3>
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

      {isProduction && (
        <div style={{ marginBottom: "12px", padding: "8px", background: "#fef3c7", borderRadius: "4px", fontSize: "12px" }}>
          <strong>🌐 Production Environment Detected</strong>
          <div>• URL: {typeof window !== "undefined" ? window.location.hostname : "Unknown"}</div>
          <div>• Using production Supabase instance</div>
          <div><strong>🚨 EMERGENCY:</strong> Click the red &quot;🚨 EMERGENCY FIX&quot; button - it diagnoses and fixes everything!</div>
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
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
        
        {isProduction && (
          <>
            <button
              onClick={runProductionDebug}
              disabled={isLoading}
              style={{
                background: isLoading ? "#9ca3af" : "#3b82f6",
                color: "white",
                padding: "8px 12px",
                borderRadius: "4px",
                border: "none",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontSize: "12px"
              }}
            >
              {isLoading ? "Running..." : "🌐 Production Debug"}
            </button>
            
            <button
              onClick={emergencyFix}
              disabled={isLoading}
              style={{
                background: isLoading ? "#9ca3af" : "#dc2626",
                color: "white",
                padding: "8px 12px",
                borderRadius: "4px",
                border: "none",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontSize: "12px",
                fontWeight: "bold",
                animation: "pulse 2s infinite"
              }}
            >
              {isLoading ? "Emergency..." : "🚨 EMERGENCY FIX"}
            </button>
            
            <button
              onClick={quickFixProduction}
              disabled={isLoading}
              style={{
                background: isLoading ? "#9ca3af" : "#ef4444",
                color: "white",
                padding: "8px 12px",
                borderRadius: "4px",
                border: "none",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontSize: "12px",
                fontWeight: "bold"
              }}
            >
              {isLoading ? "Fixing..." : "⚡ QUICK FIX"}
            </button>
            
            <button
              onClick={setupProduction}
              disabled={isLoading}
              style={{
                background: isLoading ? "#9ca3af" : "#8b5cf6",
                color: "white",
                padding: "8px 12px",
                borderRadius: "4px",
                border: "none",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontSize: "12px"
              }}
            >
              {isLoading ? "Setting..." : "🚀 Full Setup"}
            </button>
          </>
        )}
        
        <button
          onClick={isProduction ? insertProductionTestPosts : insertTestPosts}
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
          {isLoading ? "Inserting..." : `📝 Insert ${isProduction ? "Production " : ""}Test Data`}
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

      {productionResults && (
        <div style={{ fontSize: "12px", lineHeight: "1.4", marginTop: "16px" }}>
          <div style={{ marginBottom: "12px", padding: "8px", background: "#dbeafe", borderRadius: "4px" }}>
            <strong>🌐 Production Database Results:</strong>
            <div>• Supabase URL: {productionResults.environment?.supabaseUrl || "Unknown"}</div>
            <div>• Is Production: {productionResults.environment?.isProduction ? "✅ Yes" : "❌ No"}</div>
            <div>• Table exists: {productionResults.database?.tableExists ? "✅ Yes" : "❌ No"}</div>
            <div>• Total rows: {productionResults.database?.totalRows}</div>
            <div>• Can select: {productionResults.database?.canSelect ? "✅ Yes" : "❌ No"}</div>
            <div>• RLS blocking: {productionResults.database?.hasRLS ? "⚠️ Yes" : "✅ No"}</div>
          </div>

          {/* Production Status Distribution */}
          {Object.keys(productionResults.database?.statusDistribution || {}).length > 0 && (
            <div style={{ marginBottom: "12px", padding: "8px", background: "#fef3c7", borderRadius: "4px" }}>
              <strong>📈 Production Status Distribution:</strong>
              {Object.entries(productionResults.database.statusDistribution).map(([status, count]) => (
                <div key={status}>• {status}: {String(count)}</div>
              ))}
            </div>
          )}

          {/* Production Issues */}
          {productionResults.issues && productionResults.issues.length > 0 && (
            <div style={{ marginBottom: "12px", padding: "8px", background: "#fee2e2", borderRadius: "4px" }}>
              <strong>❌ Production Issues:</strong>
              {productionResults.issues.map((issue: string, index: number) => (
                <div key={index}>• {issue}</div>
              ))}
            </div>
          )}

          {/* Production Recommendations */}
          {productionResults.recommendations && productionResults.recommendations.length > 0 && (
            <div style={{ padding: "8px", background: "#e0e7ff", borderRadius: "4px" }}>
              <strong>💡 Production Recommendations:</strong>
              {productionResults.recommendations.map((rec: string, index: number) => (
                <div key={index} style={{ marginTop: "4px" }}>• {rec}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
