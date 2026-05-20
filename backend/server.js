const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

mongoose.connect(process.env.MONGO_URL)
.then(() => {
    console.log('Connected to MongoDB Atlas');
})
.catch((err) => {
    console.log('Database connection error:', err);
});

const userRoute = require('./routes/userRoute');
app.use('/hospital', userRoute );

const stateRoute  = require('./routes/StateRoute');
app.use('/state', stateRoute );
 
const districtRoute  = require('./routes/districtRoute');
app.use('/district', districtRoute );

const cityRoute  = require('./routes/cityRoute');
app.use('/city', cityRoute );

const hospitalRoute = require('./routes/hospitalRoute');
app.use('/hospitalmanagement', hospitalRoute );
const PORT = process.env.PORT || 5000;

const departmentRoute = require('./routes/departmentRoute');
app.use('/department', departmentRoute );

const subDepartmentRoute  = require('./routes/subdepartmentRoute');
app.use('/subdepartment', subDepartmentRoute );

const doctorRoute  = require('./routes/doctorRoute');
app.use('/doctor', doctorRoute );

const appointmentRoute  = require('./routes/appointmentRoute');
app.use('/appointment', appointmentRoute );

const medicineRoute  = require('./routes/medicineRoute');
app.use('/medicine', medicineRoute );

const LabRoute=require('./routes/labRoute');
app.use('/lab',LabRoute )

const testRoute=require('./routes/testRoute');
app.use('/test',testRoute )

const testreportRoute=require('./routes/testreportRoute')
app.use('/testReport',testreportRoute)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

