import {useState, useEffect} from 'react';
import './AuthForm.css';
import { Link } from 'react-router-dom';

const AuthForm = ({title,buttonText,onSubmit,error}) =>{
    const [formData,setFormData] = useState({
        username:"",
        email:"",
        password:"",
    });

    const handleChange = (e) =>{
        const {name,value} = e.target;
        setFormData({...formData,[name]:value});
    }
    const handleSubmit = (e)=>{
        e.preventDefault();
        try{
            onSubmit(formData);
        }catch(error){
            console.error("Error:",error.message);
        }
    }

    return(
        <div className="auth-form-container">
            <div className="auth-form">
                <h1>{title === "Sign Up" ? "Create an Account" : "Welcome Back"} </h1>
                <form onSubmit={handleSubmit} >
                    <div className="auth-form-input-container">
                    {title === "Sign Up" && (
                    <label className="auth-form-label">
                        <input type="text" placeholder="Username" name="username" value={formData.username} onChange={handleChange} required/>
                    </label>
                    )}
                        <label className="auth-form-label">
                            <input type="email" placeholder="Email" name="email" value={formData.email} onChange={handleChange} required/>
                        </label>
                    
                    <label className="auth-form-label">
                        <input type="password" placeholder="Password" name="password" value={formData.password} onChange={handleChange} required/>
                    </label>
                    </div>
                    <button type="submit" className="auth-form-button">{buttonText}</button>
                    {title === "Sign Up" && (
                        <p>Already have an account? <Link to="/login" className="auth-form-link">Login</Link></p>
                    )}
                    {title === "Login" && (
                        <p>Don't have an account? <Link to="/signup" className="auth-form-link">Sign Up</Link></p>
                    )}
                    <div className="auth-form-error-container">
                    {error && <p className="auth-form-error">{error}</p>}
                </div>
                </form>
              
            </div>
        </div>
    )
}

export default AuthForm;