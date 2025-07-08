import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './DeleteButton.css';

const DeleteButton = ({taskId,onDelete}) =>{
    const navigate = useNavigate();
    const handleDelete = async ()=>{
        try{
            const token = localStorage.getItem('token');
            if(!token){
                alert('Please login first');
                navigate('/login');
                return;
            }
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/tasks/${taskId}`,{
                headers:{
                    'Authorization':token,
                },
            });
            onDelete();
        }catch(error){
            console.error('Error deleting task:',error);
        }
        
    }
    return(
        <button className="delete-button" onClick={handleDelete}>Delete</button>
    )
}


export default DeleteButton;