import { useState, useEffect } from 'react';
import './TaskCreate.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TaskCreate = () => {
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
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/auth/users');
            setUsers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
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
        // No assignee validation
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
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

            // Only include assignee if not blank
            const payload = { ...formData };
            if (!payload.assignee) {
                delete payload.assignee;
            }

            const response = await axios.post('http://localhost:5000/api/tasks', payload, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(response.data);
            alert('Task created successfully!');
            
            // Reset form
            setFormData({
                title: '',
                description: '',
                assignee: '',
                status: 'Todo',
                priority: 'Medium',
            });
            setErrors({});
            
            // Navigate back to home or dashboard
            navigate('/dashboard');
            
        } catch (error) {
            console.error('Error creating task:', error);
            if (error.response) {
                alert(`Error: ${error.response.data.message || 'Failed to create task'}`);
            } else {
                alert('Network error. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/dashboard');
    };

    return (
        <div className="task-create-container">
            <div className="task-create-header">
                <h1>Create New Task</h1>
                <p>Fill in the details below to create a new task</p>
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
                                {loading ? (
                                    <option value="" disabled>Loading users...</option>
                                ) : (
                                    users.map(user => (
                                        <option key={user._id} value={user._id}>
                                            {user.username} ({user.email})
                                        </option>
                                    ))
                                )}
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
                                    Creating...
                                </>
                            ) : (
                                'Create Task'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskCreate;