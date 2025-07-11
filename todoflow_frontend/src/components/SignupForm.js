import AuthForm from "../pages/AuthForm";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
const SignupForm = () =>{
    const [error,setError] = useState(null);
    const navigate = useNavigate();
    const handleSignup = async(formData)  =>{
        try{
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/signup`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                },
                body:JSON.stringify({
                    username:formData.username,
                    email:formData.email,
                    password:formData.password,
                }),
            });
            if(!response.ok){
                const errorData = await response.json();
                throw new Error(errorData.message || "Signup failed");
            }
            const result = await response.json();
            localStorage.setItem("token", result.token);
            navigate("/dashboard");
            console.log(result);
        }catch(error){
            console.error("Signup failed:",error.message);
            setError(error.message);
        }
    }
    return(
        <AuthForm title="Sign Up" buttonText="Sign Up" onSubmit={handleSignup} error={error} />
    )
}

export default SignupForm;