const schema = require('../Models/FormBuilderData');
const multer = require('multer');

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: (req , file, cb) => {
        const isValid  = MIME_TYPE_MAP(file.mimetype);
        let error = new Error("Invalid mime type");
        if(isValid) {
            error = null;
        }
        cb(null, "../images");
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const ext = MIME_TYPE_MAP(file.mimetype);
        cb(null, name + '-', + Date.now() + '.' + ext);
    }
});

var upload = multer({storage: storage});

const sendFile = (upload.single("file"), (req, res) =>  {
    //console.log("sendFIle")
    //const promise =  new Promise((resolve, reject) => {
       //console.log("inside Promise");
    //    if(!req.file) {
    //        throw Error("FILE_MISSING");
    //    } else {
//        console.log('imageaajaa', req.body)
 //          resolve("done");
       //   });
     //  console.log("outside promise");
//       return promise;        
})


/** Post fromData */
const postData = async (req, res) => {
   // await sendFile().then(data => console.log('File Uploaded Successfully'));

   // console.log("file upload ho gaye hi")

    const user = new schema.User({
        name: req.body.formData.name,
        email: req.body.formData.email,
        gender: req.body.formData.gender,
        createdAt: req.body.formData.createdAt,
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
          res.status(200).json(user)      
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

/** fetch fromData */
const getData = async (req, res) => {
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
    .then(
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
                    console.log("documents", documents);
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
    });   
    const userDetails = new schema.userDetails({
        mobileno: Number(req.body.mobileno),
    })

    
   await schema.User.deleteOne({name: user.name}, function(err) {
        if(err) {
            throw err;
        } else {
            console.log("deleted");
        }
    }).then(
        await schema.userDetails.deleteOne({mobileno: userDetails.mobileno}, function(err, result) {
            if(err) {
                throw err;
            } else {
                res.status(200).json(result);
            }
        })
        .catch((e) => {
            console.log('error', error);
        })
    )
}

module.exports = {
    postData: postData,
    getData: getData,
    updateData: updateData,
    deleteData: deleteData,
    sendFile: sendFile,
}
