const schema = require('../Models/FormBuilderData');
const multer = require('multer');
const fs = require("fs");
const path = require("path");

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

    sendFile().then(data => console.log('File Uploaded Successfully'));
    const user = new schema.User({
        name: req.body.formData.name,
        email: req.body.formData.email,
        gender: req.body.formData.gender,
        createdAt: req.body.formData.createdAt,
        imagePath: sendUrl,
        userdetails: "fid",
    });
    const userDetails = new schema.userDetails({    
        fid: "fid",
        birthDate: req.body.formData.birthDate,
        email: req.body.formData.email,
        adhaarNumber: req.body.formData.adhaarNumber,
        address: req.body.formData.address,
        mobileno: req.body.formData.mobileno,
        country: req.body.formData.country
    });

    await user.save().then((user) => {
          res.status(200).json({
              message: "user created successfully",
              user: {
                  ...user,
                  imagePath: user.sendUrl,
              }
          })      
    })
    .catch((error) => {
          res.status(400).json({error: error});
     })


    await userDetails.save().then((userDetails) => {
        res.status(200).json(userDetails)      
    })
    .catch((error) => {
        res.status(400).json({error: error});
    })
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
                    imagePath: doc.imagePath,
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
            {useFindAndModify: false},
            {new : true},
            (err, doc) => {
                 if(err) {
                     console.log("wrong when data updating");
                 }
              })

            await schema.userDetails.findOneAndUpdate({adhaarNumber: adhaarNumber},
                {$set: setUserDetails},
                {useFindAndModify: false},
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
    const user = new schema.User({
        name: req.body.name,
        imagePath: req.body.deleteImage
    });   
    const userDetails = new schema.userDetails({
        mobileno: Number(req.body.mobileno),
    })

    
   await schema.User.deleteOne({name: user.name, imagePath: user.imagePath}, function(err) {
        try {
            console.log("imagedata", imagePath);
            fs.unlinkSync(imagePath)
            console.log("Successfully deleted the file from server")
            delete imagePath;
            res.status(200).json({
                message: "user is deleted"
            })
          } catch(err) {
            res.status(400).json({
                message: "user not deleted"
            })   
            throw err
          }
    }) 
    await schema.userDetails.deleteOne({mobileno: userDetails.mobileno}, function(err, result) {
            if(err) {
                throw err;
            } else {
                res.status(200).json(result);
            }
    })
}

module.exports = {
    postData: postData,
    getData: getData,
    updateData: updateData,
    deleteData: deleteData,
    sendFile: sendFile,
}