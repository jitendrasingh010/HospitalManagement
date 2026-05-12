const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URL)
.then(() => {
    console.log('Connected to MongoDB Atlas');
})
.catch((err) => {
    console.log('Database connection error:', err);
});

const userController = require('./routes/userRoute');
app.use('/hospital', userController);

const stateController = require('./routes/StateRoute');
app.use('/state', stateController);
 
const districtController = require('./routes/districtRoute');
app.use('/district', districtController);

const cityController = require('./routes/cityRoute');
app.use('/city', cityController);

const hospitalController = require('./routes/hospitalRoute');
app.use('/hospitalmanagement', hospitalController);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

