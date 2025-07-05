const express = require('express');
const cors = require('cors');
const app = express();
const connectDB = require('./db/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const actionRoutes = require('./routes/actionRoutes');
connectDB();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());


app.use('/api/auth',authRoutes);
app.use('/api/tasks',taskRoutes);
app.use('/api/actions',actionRoutes);

app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})