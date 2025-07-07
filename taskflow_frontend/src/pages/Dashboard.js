import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import './Dashboard.css';
import DeleteButton from '../components/DeleteButton';

const statusColumns = ["Todo", "In Progress", "Done"];

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
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
                `http://localhost:5000/api/tasks/${draggableId}`, 
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
        <div className="dashboard">
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
                                                                    Assigned to: {task.assignee?.username || 'Unassigned'}
                                                                </span>
                                                                <span className="task-priority">{task.priority}</span>
                                                            </div>
                                                            <DeleteButton taskId={task._id} onDelete={() => {
                                                                setTasks(prev => prev.filter(t => t._id !== task._id));
                                                            }} />
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
    );
};

export default Dashboard;