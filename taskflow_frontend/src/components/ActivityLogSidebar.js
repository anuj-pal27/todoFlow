import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './ActivityLogSidebar.css';

const MAX_LOGS = 20;

function formatDetails(details) {
  if (!details) return 'No details';
  if (typeof details === 'string') return details;
  if (typeof details === 'object') {
    const detailItems = [];
    for (const [key, value] of Object.entries(details)) {
      if (value !== null && value !== undefined) {
        detailItems.push(`${key}: ${value}`);
      }
    }
    return detailItems.join(', ');
  }
  return 'No details';
}

function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString();
}

const ActivityLogSidebar = ({ ws }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/action', {
          headers: { Authorization: token },
        });
        setLogs(response.data.slice(0, MAX_LOGS));
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch activity log');
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  useEffect(() => {
    if (!ws) return;
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ACTION_LOG') {
          if (data.actionLog && data.actionLog.type === 'CLEAR') {
            setLogs([]);
          } else if (data.actionLog) {
            setLogs((prev) => [data.actionLog, ...prev].slice(0, MAX_LOGS));
          }
        }
      } catch (e) {}
    };
    ws.addEventListener('message', handleMessage);
    return () => ws.removeEventListener('message', handleMessage);
  }, [ws]);

  return (
    <div className="activity-log-sidebar">
      <h2>Activity Log</h2>
      {loading ? (
        <div className="activity-log-loading"><div className="spinner"></div>Loading...</div>
      ) : error ? (
        <div className="activity-log-error">{error}</div>
      ) : logs.length === 0 ? (
        <div className="activity-log-empty">No recent activity.</div>
      ) : (
        <table className="activity-log-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>User</th>
              <th>Time</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id || Math.random()}>
                <td className="type">{log.actionType}</td>
                <td className="user">{log.performedBy?.username || 'Unknown'}</td>
                <td className="time">{formatTimestamp(log.timestamp)}</td>
                <td className="details">{formatDetails(log.details)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ActivityLogSidebar; 