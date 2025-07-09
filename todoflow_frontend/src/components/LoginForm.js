import AuthForm from "../pages/AuthForm";
import { useNavigate } from "react-router-dom";

const LoginForm =  () =>{
    const navigate = useNavigate();
    const handleLogin = async (formData) =>{
        try{
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                },
                body:JSON.stringify(
                    {   
                        email:formData.email,
                        password:formData.password,
                    }
                ),
            });
            if(!response.ok){
                throw new Error("Login failed");
            }
            const result = await response.json();
            localStorage.setItem("token", result.token);
            navigate("/dashboard");
            console.log(result);
        }catch(error){
            console.error("Login failed:",error);
        }
    }
    return(
        <AuthForm title="Login" buttonText="Login" onSubmit={handleLogin} />
    )
}

export default LoginForm;