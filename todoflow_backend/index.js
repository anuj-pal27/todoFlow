const express = require('express');
const cors = require('cors');
const app = express();
const connectDB = require('./db/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const actionRoutes = require('./routes/actionRoutes');
const dotenv = require('dotenv');
dotenv.config();

connectDB();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true,
}));

app.use('/api/auth',authRoutes);
app.use('/api/tasks',taskRoutes);
app.use('/api/action',actionRoutes);

app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})