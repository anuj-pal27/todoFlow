import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ActionLog.css';
import axios from 'axios';

const ActionLog = () => {
    const [actionLogs, setActionLogs] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchActionLogs = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login first');
                navigate('/login');
                return;
            }
            try {
                const response = await fetch('http://localhost:5000/api/action', {
                    headers: {
                        'Authorization': token,
                    }
                });
                const data = await response.json();
                setActionLogs(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching action logs:', error);
                setError('Failed to fetch action logs');
                setLoading(false);
            }
        }
        fetchActionLogs();
    }, [navigate]);

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login first');
                navigate('/login');
                return;
            }
            const response = await axios.delete('http://localhost:5000/api/action', {
                headers: {
                    'Authorization': token,
                },
            });
            setActionLogs([]);
            alert('Action logs deleted successfully');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error deleting action logs:', error);
            alert('Failed to delete action logs');
        }
    };

    const formatDetails = (details) => {
        if (!details) return 'No details';
        
        if (typeof details === 'string') {
            return details;
        }
        
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
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleString();
    };

    if (loading) {
        return (
            <div className="action-log-loading">
                <div className="spinner"></div>
                <p>Loading action logs...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="action-log-error">
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    return (
        <div className="action-log-container">
            <div className="action-log-header">
                <h1>Action Log</h1>
                <button className="delete-btn" onClick={handleDelete}>Delete All Logs</button>
                <button className="back-btn" onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                </button>
            </div>
            
            <div className="action-log-content">
                {actionLogs.length === 0 ? (
                    <div className="no-logs">
                        <p>No action logs found.</p>
                    </div>
                ) : (
                    <table className="action-log-table">
                        <thead>
                            <tr>
                                <th>Action Type</th>
                                <th>Task ID</th>
                                <th>Performed By</th>
                                <th>Timestamp</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {actionLogs.map((log) => (
                                <tr key={log._id}>
                                    <td className="action-type">{log.actionType}</td>
                                    <td className="task-id">{log.taskId}</td>
                                    <td className="performed-by">{log.performedBy?.username || 'Unknown'}</td>
                                    <td className="timestamp">{formatTimestamp(log.timestamp)}</td>
                                    <td className="details">{formatDetails(log.details)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ActionLog;