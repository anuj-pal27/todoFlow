import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import './Dashboard.css';
import DeleteButton from '../components/DeleteButton';
import ActivityLogSidebar from '../components/ActivityLogSidebar';

const statusColumns = ["Todo", "In Progress", "Done"];

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ws, setWs] = useState(null);

    useEffect(() => {
        const socket = new window.WebSocket(`${process.env.REACT_APP_WS_URL}`);
        
        socket.onopen = () => {
            console.log('WebSocket connected');
        };
        
        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        
        socket.onclose = () => {
            console.log('WebSocket disconnected');
        };
        
        setWs(socket);
        return () => {
            socket.close();
        };
    }, []);

    useEffect(() => {
        const fetchTasks = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login first');
                navigate('/login');
                return;
            }
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/tasks`, {
                    headers: {
                        'Authorization': token,
                    }
                });
                setTasks(response.data);
                setError(null);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                setError('Failed to fetch tasks. Please try again.');
                if (error.response?.status === 401) {
                    alert('Session expired. Please login again.');
                    navigate('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchTasks();
    }, [navigate]);

    // WebSocket message handling for real-time updates
    useEffect(() => {
        if (!ws) return;

        const handleMessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                switch (data.type) {
                    case 'TASK_CREATE':
                        if (data.task) {
                            setTasks(prev => [...prev, data.task]);
                        }
                        break;
                    
                    case 'TASK_UPDATE':
                        if (data.task) {
                            setTasks(prev => 
                                prev.map(task => 
                                    task._id === data.task._id ? data.task : task
                                )
                            );
                        }
                        break;
                    
                    case 'TASK_DELETE':
                        if (data.task && data.task._id) {
                            setTasks(prev => 
                                prev.filter(task => task._id !== data.task._id)
                            );
                        }
                        break;
                    
                    case 'TASK_SMART_ASSIGN':
                        if (data.task) {
                            setTasks(prev => 
                                prev.map(task => 
                                    task._id === data.task._id ? data.task : task
                                )
                            );
                        }
                        break;
                    
                    default:
                        break;
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        ws.addEventListener('message', handleMessage);
        
        return () => {
            ws.removeEventListener('message', handleMessage);
        };
    }, [ws]);
    
    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;
        if (!destination || destination.droppableId === source.droppableId) return;

        const movedTask = tasks.find(t => t._id === draggableId);
        if (!movedTask) return;

        const updateTask = {
            ...movedTask,
            status: destination.droppableId,
        };

        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/tasks/${draggableId}`, 
                { ...updateTask, version: movedTask.version },
                {
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    }
                }
            );
            setTasks(prev =>
                prev.map(t => (t._id === draggableId ? res.data.task : t))
            );
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Failed to update task. Please try again.');
        }
    };

    const handleCreateTask = () => {
        navigate('/create');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleActionLog = () =>{
        navigate('/action');
    };

    const handleSmartAssign = () =>{
        navigate('/smart-assign');
    };
        
    if (isLoading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading tasks...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    return (
        <div className="dashboard dashboard-root">
            <div className="dashboard-main">
                <div className="dashboard-header">
                    <h1>Task Dashboard</h1>
                    <div className="dashboard-actions">
                        <button className= "smart-assign-btn" onClick = {handleSmartAssign}>Smart Assign</button>
                        <button className="action-log-btn" onClick={handleActionLog}>Action Log</button>
                        <button className="create-task-btn" onClick={handleCreateTask}>
                            + Create Task
                        </button>
                        <button className="logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="kanban-board">
                        {statusColumns.map(status => (
                            <Droppable droppableId={status} key={status}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="kanban-column"
                                    >
                                        <h3 className="column-header">{status}</h3>
                                        <div className="column-content">
                                            {tasks
                                                .filter(task => task.status === status)
                                                .map((task, index) => (
                                                    <Draggable key={task._id} draggableId={task._id} index={index}>
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="task-card"
                                                                style={provided.draggableProps.style}
                                                            >
                                                                <h4 className="task-title">{task.title}</h4>
                                                                <p className="task-description">{task.description}</p>
                                                                <div className="task-footer">
                                                                    <span className="task-assignee">
                                                                        <span role="img" aria-label="assignee">👤</span> {task.assignee?.username || 'Unassigned'}
                                                                    </span>
                                                                    <span className={`task-priority ${task.priority}`}>{task.priority}</span>
                                                                </div>
                                                                <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                                                                    <button
                                                                        className="edit-btn"
                                                                        aria-label="Edit Task"
                                                                        title="Edit Task"
                                                                        onClick={() => navigate(`/tasks/${task._id}/edit`)}
                                                                    >
                                                                        ✏️ Edit
                                                                    </button>
                                                                    <DeleteButton taskId={task._id} onDelete={() => {
                                                                        setTasks(prev => prev.filter(t => t._id !== task._id));
                                                                    }} />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </DragDropContext>
            </div>
            <ActivityLogSidebar ws={ws} />
        </div>
    );
};

export default Dashboard;