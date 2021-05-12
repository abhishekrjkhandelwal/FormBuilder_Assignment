const schema = require('../Models/FormBuilderData');
const multer = require('multer');
const fs = require("fs");
const path = require("path");
const _ = require("underscore");
const async = require("async");

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

var storage = multer.memoryStorage();

var upload = multer({storage: storage});

var imagePath;
var url;
var sendUrl;

const sendFile =  (upload.array('file', 2), async (req, res) =>  {
           if(req.files) {
           url = req.protocol + '://' + req.get('host');              
           sendUrl  = url + "/images/" + req.files[0].originalname;
           imagePath = path.join(__dirname , `../images/${req.files[0].originalname}`)   
           var writableStream = fs.createWriteStream(imagePath);
           writableStream.write(req.files[0].buffer);
          } else {
              res.satus(400).json({
                  message: "file is missing",
              })
          }
         res.status(200).json(imagePath); 
})


/** Post fromData */
const postData = async (req, res) => {
    var user = new schema.User({
        name: req.body.formData.name,
        email: req.body.formData.email,
        gender: req.body.formData.gender,
        createdAt: req.body.formData.createdAt,
        userdetails: "fid",
    });
    var userDetails = new schema.userDetails({    
        fid: "fid",
        birthDate: req.body.formData.birthDate,
        email: req.body.formData.email,
        adhaarNumber: req.body.formData.adhaarNumber,
        address: req.body.formData.address,
        mobileno: req.body.formData.mobileno,
        country: req.body.formData.country,
        imagePath: sendUrl,
        imageUrl: imagePath,
    });


    (async.parallel([
        function (callback) {
                user.save().then((user) => {
                callback(null, user);       
          })      
        },

        function (callback) {    
                userDetails.save().then((userDetails) => {
                callback(null, userDetails)      
            })
           },
        ],
        function (err, result) {           
            if(err) {
                res.status(400).json({
                    message: "user not created",
                })
            }
            res.status(200).json({
                message: result
            })
            console.log(result);
        }
    ))
}

/** fetch formData */
const getData = async (req, res) => {
    var pageSize = +req.query.pageSize;
    var currentPage = +req.query.page;
    await schema.User.aggregate([
        {
            $lookup:
            {
                from: "userDetails",
                localField: "userdetails",
                foreignField: "fid",
                as: "creators"
            }
        },
        {
            $skip:  (pageSize * (currentPage - 1))
        },

        {
            $limit: (pageSize)  
        }
    ]).then(
        documents => {
        const response = {
            count: documents.length,
            formdata: documents.map(doc => {
                return {
                    message: "fetch form data",
                    name: doc.name,
                    email: doc.email,
                    gender: doc.gender,
                    creators: doc.creators,
                    createdAt: doc.createdAt,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/get-form-data/' + doc._id,
                    },
                }
            })
        }
        res.status(200).json(response);
    })
    .catch(err => {
        res.status(500).json({
            error: err,
            errorhandler: {
                request: {
                    message: 'data not found in database',
                    type: 'GET',
                    url: 'http://localhost:3000/get-form-data/',
                }
            }
        })
    });
}

/** Update formData */
const updateData = async (req, res) => {
    
    const adhaarNumber = req.body.adhaarNumber;
    const email = req.body.email;

        setUserData = {
           name: req.body.formData.name,
           email: req.body.formData.email,
           gender: req.body.formData.gender, 
        },

        setUserDetails = {
            adhaarNumber: req.body.formData.adhaarNumber,
            address: req.body.formData.address,
            mobileno: req.body.formData.mobileno,
            birthDate: req.body.formData.birthDate,
            country: req.body.formData.country, 
        }
        
            await schema.User.findOneAndUpdate({ email: email},
            {$set: setUserData},
            {new : true},
            (err, doc) => {
                 if(err) {
                     console.log("wrong when data updating");
                 }
              })

            await schema.userDetails.findOneAndUpdate({adhaarNumber: adhaarNumber},
                {$set: setUserDetails},
                {new : true},
                (err, doc) => {
                     if(err) {
                         console.log("wrong when data updating");
                     }
             })
            
            await schema.User.aggregate([
                    {
                        $lookup:
                        {
                            from: "userDetails",
                            localField: "userdetails",
                            foreignField: "fid",
                            as: "creators"
                        }
                    },
                ]) 
                .then(documents => {
                    const response = {
                        formdata: documents.map(doc => {
                            return {
                                message: "update form data",
                                name: doc.name,
                                email: doc.email,
                                gender: doc.gender,
                                creators: doc.creators,
                                createdAt: doc.createdAt,
                                request: {
                                    type: 'PUT',
                                    url: 'http://localhost:3000//update-form-data/' + doc._id,
                                },
                            }
                        })
                    }
                    res.status(200).json(response);
                }).catch(err => {err});
}

/** Delete fromData */
const deleteData = async (req, res) => {
    var user = new schema.User({
        name: req.body.name,
    });   
    var userDetails = new schema.userDetails({
        mobileno: Number(req.body.mobileno),
        imagePath: req.body.deleteImage
    })

    console.log("outside async");
    (async.parallel([
        function (callback) {
            schema.User.deleteOne({name: user.name}, function(err, results) {
                if(err) {
                    console.log("err", err);
                }
                callback(null, results);
            })
        },

        function (callback) {    
            schema.userDetails.deleteOne({mobileno: userDetails.mobileno}, function(err, results) {
                
                console.log("mobileno", userDetails.mobileno);
                console.log("imagePath", imagePath);

                try {
                    console.log("imagePath", imagePath);
                    fs.unlink(imagePath, (err) => err);
                    console.log("Successfully deleted the file from server") 
                    callback(null, results);           
                  } catch(err) {               
                    throw err;
                  }
               })
           },
        ],

        function (err, result) {
            res.status(200).json({
                message: result
            })
            console.log(result);
        }
    ))
}

module.exports = {
    postData: postData,
    getData: getData,
    updateData: updateData,
    deleteData: deleteData,
    sendFile: sendFile,
}