import { useState, useEffect } from 'react';
import './TaskCreate.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const TaskEdit = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignee: '',
        status: 'Todo',
        priority: 'Medium',
        version: 0,
    });
    const [conflict, setConflict] = useState(null); // { currentTask: {...} }
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        fetchUsers();
        fetchTask();
        // eslint-disable-next-line
    }, [id]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/auth/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchTask = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login first');
                navigate('/login');
                return;
            }
            const response = await axios.get(`http://localhost:5000/api/tasks/${id}`, {
                headers: { 'Authorization': token }
            });
            const task = response.data;
            setFormData({
                title: task.title || '',
                description: task.description || '',
                assignee: task.assignee?._id || '',
                status: task.status || 'Todo',
                priority: task.priority || 'Medium',
                version: task.version || 0,
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching task:', error);
            alert('Failed to fetch task.');
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.trim().length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login first');
                navigate('/login');
                return;
            }
            const payload = { ...formData };
            if (!payload.assignee) {
                delete payload.assignee;
            }
            const { version, ...updatePayload } = payload;
            const response = await axios.put(`http://localhost:5000/api/tasks/${id}`, { ...updatePayload, version }, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });
            alert('Task updated successfully!');
            navigate('/dashboard');
        } catch (error) {
            if (error.response && error.response.status === 409) {
                // Conflict detected
                setConflict({ currentTask: error.response.data.currentTask });
            } else {
                console.error('Error updating task:', error);
                if (error.response) {
                    alert(`Error: ${error.response.data.message || 'Failed to update task'}`);
                } else {
                    alert('Network error. Please try again.');
                }
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Overwrite: force update with user's version
    const handleOverwrite = async () => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login first');
                navigate('/login');
                return;
            }
            const payload = { ...formData, version: conflict.currentTask.version };
            if (!payload.assignee) {
                delete payload.assignee;
            }
            const { version, ...updatePayload } = payload;
            await axios.put(`http://localhost:5000/api/tasks/${id}`, { ...updatePayload, version }, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });
            alert('Task overwritten and updated!');
            navigate('/dashboard');
        } catch (error) {
            alert('Failed to overwrite. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Merge: load server version into form for user to edit
    const handleMerge = () => {
        const t = conflict.currentTask;
        setFormData({
            title: t.title || '',
            description: t.description || '',
            assignee: t.assignee?._id || '',
            status: t.status || 'Todo',
            priority: t.priority || 'Medium',
            version: t.version || 0,
        });
        setConflict(null);
    };

    const handleCancel = () => {
        navigate('/dashboard');
    };

    if (loading) {
        return (
            <div className="task-create-container">
                <div className="spinner"></div>
                <p>Loading task...</p>
            </div>
        );
    }

    if (conflict) {
        const t = conflict.currentTask;
        return (
            <div className="task-create-container">
                <div className="task-create-header">
                    <h1>Conflict Detected</h1>
                    <p>This task was updated by someone else while you were editing. Please review both versions below.</p>
                </div>
                <div className="conflict-versions">
                    <div className="conflict-version">
                        <h3>Your Version</h3>
                        <ul>
                            <li><b>Title:</b> {formData.title}</li>
                            <li><b>Description:</b> {formData.description}</li>
                            <li><b>Assignee:</b> {users.find(u => u._id === formData.assignee)?.username || 'Unassigned'}</li>
                            <li><b>Status:</b> {formData.status}</li>
                            <li><b>Priority:</b> {formData.priority}</li>
                        </ul>
                    </div>
                    <div className="conflict-version">
                        <h3>Latest Version</h3>
                        <ul>
                            <li><b>Title:</b> {t.title}</li>
                            <li><b>Description:</b> {t.description}</li>
                            <li><b>Assignee:</b> {t.assignee?.username || 'Unassigned'}</li>
                            <li><b>Status:</b> {t.status}</li>
                            <li><b>Priority:</b> {t.priority}</li>
                        </ul>
                    </div>
                </div>
                <div className="conflict-actions">
                    <button className="submit-btn" onClick={handleMerge} disabled={submitting}>
                        Merge (Edit Latest)
                    </button>
                    <button className="edit-btn" onClick={handleOverwrite} disabled={submitting}>
                        Overwrite
                    </button>
                    <button className="cancel-btn" onClick={handleCancel} disabled={submitting}>
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="task-create-container">
            <div className="task-create-header">
                <h1>Edit Task</h1>
                <p>Update the details below and save changes</p>
            </div>
            <div className="task-create-form-container">
                <form onSubmit={handleSubmit} className="task-create-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="title">
                                Task Title <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter task title..."
                                className={errors.title ? 'error' : ''}
                            />
                            {errors.title && <span className="error-message">{errors.title}</span>}
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="description">
                                Description <span className="required">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the task in detail..."
                                rows="4"
                                className={errors.description ? 'error' : ''}
                            />
                            {errors.description && <span className="error-message">{errors.description}</span>}
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="assignee">
                                Assignee
                            </label>
                            <select
                                id="assignee"
                                name="assignee"
                                value={formData.assignee}
                                onChange={handleChange}
                                className={errors.assignee ? 'error' : ''}
                            >
                                <option value="">None (Unassigned)</option>
                                {users.map(user => (
                                    <option key={user._id} value={user._id}>
                                        {user.username} ({user.email})
                                    </option>
                                ))}
                            </select>
                            {errors.assignee && <span className="error-message">{errors.assignee}</span>}
                        </div>
                    </div>
                    <div className="form-row two-columns">
                        <div className="form-group">
                            <label htmlFor="status">Status</label>
                            <select id="status" name="status" value={formData.status} onChange={handleChange}>
                                <option value="Todo">Todo</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="priority">Priority</label>
                            <select id="priority" name="priority" value={formData.priority} onChange={handleChange}>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={handleCancel}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <span className="spinner"></span>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskEdit; 