
import './App.css';
import {Routes,Route} from 'react-router-dom';

import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import TaskCreate from './pages/TaskCreate';
import Dashboard from './pages/Dashboard';
import ActionLog from './pages/ActionLog';
import SmartAssign from './components/SmartAssign';

function App() {
  return (

        <Routes>
          <Route path='/login' element={<LoginForm />} />
          <Route path='/signup' element={<SignupForm />} />
          <Route path='/create' element={<TaskCreate />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/action' element={<ActionLog />} />
          <Route path='/smart-assign' element={<SmartAssign />} />
        </Routes>

  );
}

export default App;
