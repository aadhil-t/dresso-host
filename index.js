 
//----------connecting  database-----------//
const mongoose = require('mongoose');

const session=require('express-session')
// const morgan = require('morgan');

// --------- ENV------------//
const env = require("dotenv")
env.config()
mongoose.connect(process.env.mongo);


const path = require('path')
const express = require('express');
const app  = express();
const nocache = require('nocache')
const errorHandler = require('./middleware/errorHandller')
const publicpath = path.join(__dirname,"public")
app.use(express.static(publicpath))
const config = require('./configuration/configuration.js')
app.use(session({
    secret:config.sessionSecret,
    resave:false,
    saveUninitialized:true
  }));


app.use(nocache())

// ----------User route----------//
const userRoutes = require('./routes/userRoutes')
app.use('/',userRoutes);

// app.use(morgan('tiny'));

app.use(errorHandler)
//---------- Admin route -----------//
const adminRoutes = require('./routes/adminRoutes')
app.use('/admin',adminRoutes);



app.listen(process.env.port,()=>{
    console.log('server is running');
})

