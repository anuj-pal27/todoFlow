import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SmartAssign.css';

const SmartAssign = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [assigning, setAssigning] = useState(false);
    const [assignmentResult, setAssignmentResult] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login first');
            navigate('/login');
            return;
        }

        try {
            const response = await axios.get('http://localhost:5000/api/tasks', {
                headers: {
                    'Authorization': token,
                }
            });
            
            // Filter for unassigned tasks
            const unassignedTasks = response.data.filter(task => !task.assignee);
            setTasks(unassignedTasks);
            setError(null);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setError('Failed to fetch tasks. Please try again.');
            if (error.response?.status === 401) {
                alert('Session expired. Please login again.');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSmartAssign = async (taskId) => {
        const token = localStorage.getItem('token');
        setAssigning(true);
        setAssignmentResult(null);

        try {
            const response = await axios.get(`http://localhost:5000/api/tasks/${taskId}/smart-assign`, {
                headers: {
                    'Authorization': token,
                }
            });

            setAssignmentResult({
                success: true,
                message: response.data.message,
                details: response.data.assignmentDetails,
                task: response.data.task
            });

            // Refresh the task list
            fetchTasks();
        } catch (error) {
            console.error('Error smart assigning task:', error);
            setAssignmentResult({
                success: false,
                message: error.response?.data?.message || 'Failed to smart assign task'
            });
        } finally {
            setAssigning(false);
        }
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    if (loading) {
        return (
            <div className="smart-assign-loading">
                <div className="spinner"></div>
                <p>Loading unassigned tasks...</p>
            </div>
        );
    }

    return (
        <div className="smart-assign">
            <div className="smart-assign-header">
                <h1>Smart Assign</h1>
                <button className="back-btn" onClick={handleBackToDashboard}>
                    ← Back to Dashboard
                </button>
            </div>

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={fetchTasks}>Retry</button>
                </div>
            )}

            {assignmentResult && (
                <div className={`assignment-result ${assignmentResult.success ? 'success' : 'error'}`}>
                    <h3>{assignmentResult.success ? '✅ Assignment Successful' : '❌ Assignment Failed'}</h3>
                    <p>{assignmentResult.message}</p>
                    {assignmentResult.success && assignmentResult.details && (
                        <div className="assignment-details">
                            <p><strong>Assigned to:</strong> {assignmentResult.details.assignedTo}</p>
                            <p><strong>Active tasks:</strong> {assignmentResult.details.activeTaskCount}</p>
                            <div className="user-counts">
                                <h4>All Users Task Counts:</h4>
                                <ul>
                                    {assignmentResult.details.allUserCounts.map((user, index) => (
                                        <li key={index} className={user.username === assignmentResult.details.assignedTo ? 'selected' : ''}>
                                            {user.username}: {user.taskCount} active tasks
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    <button onClick={() => setAssignmentResult(null)}>Close</button>
                </div>
            )}

            <div className="smart-assign-content">
                <div className="info-section">
                    <h2>Unassigned Tasks</h2>
                    <p>Smart Assign automatically assigns tasks to the user with the fewest active tasks.</p>
                </div>

                {tasks.length === 0 ? (
                    <div className="no-tasks">
                        <h3>No Unassigned Tasks</h3>
                        <p>All tasks are currently assigned to users.</p>
                        <button onClick={handleBackToDashboard}>Go to Dashboard</button>
                    </div>
                ) : (
                    <div className="tasks-grid">
                        {tasks.map(task => (
                            <div key={task._id} className="task-card">
                                <div className="task-header">
                                    <h3 className="task-title">{task.title}</h3>
                                    <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                                        {task.priority}
                                    </span>
                                </div>
                                <p className="task-description">{task.description}</p>
                                <div className="task-footer">
                                    <span className="task-status">{task.status}</span>
                                    <button 
                                        className="smart-assign-btn"
                                        onClick={() => handleSmartAssign(task._id)}
                                        disabled={assigning}
                                    >
                                        {assigning ? 'Assigning...' : 'Smart Assign'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartAssign;