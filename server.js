const express = require('express');
let formBuilderRoute = require('./app/Routes/formbuilderRoutes');
const mongoose  = require('mongoose');
var config = require('./config/dbConfig');

const app = express();

    server = require('http').Server(app),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    http = require('http'),
    path = require('path');

    app.use(cors());

    const password = encodeURIComponent('abhishek');;

    mongoose.connect(config.dbUrl);
    mongoose.connection.on('connected', () => {
      console.log('connected to mongo database');
    },
    );
    mongoose.connection.on('error', err => {
      console.log('Error at MongoDB: ' + err);
    });
   
    mongoose.Promise = global.Promise;

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    app.use('/api', formBuilderRoute);

    app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Origin, X-Requested-With, Content-Type, Accept"
        );
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET, POST, PATCH, PUT, DELETE, OPTIONS"
        );
        next();
      });

    //server listens to port 3000 
    app.listen(3000, (err)=>{ 
      if(err) 
      throw err; 
    });   