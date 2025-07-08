
import './App.css';
import {Routes,Route,Navigate} from 'react-router-dom';

import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import TaskCreate from './pages/TaskCreate';
import Dashboard from './pages/Dashboard';
import ActionLog from './pages/ActionLog';
import SmartAssign from './components/SmartAssign';
import TaskEdit from './pages/TaskEdit';

function App() {
  return (

        <Routes>
          <Route path="/" element={
            localStorage.getItem('token')
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/login" replace />
          } />
          <Route path='/login' element={<LoginForm />} />
          <Route path='/signup' element={<SignupForm />} />
          <Route path='/create' element={<TaskCreate />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/action' element={<ActionLog />} />
          <Route path='/smart-assign' element={<SmartAssign />} />
          <Route path='/tasks/:id/edit' element={<TaskEdit />} />
        </Routes>

  );
}

export default App;
