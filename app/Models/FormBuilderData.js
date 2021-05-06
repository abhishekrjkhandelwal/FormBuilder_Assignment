const mongoose =  require('mongoose');

const userSchema =  mongoose.Schema({
    name: {type: String, required: true },
    email: {type: String, required: true},
    gender: {type: String,  required: true},
    createdAt: { }
});

const formBuilderSchema = mongoose.Schema({

    birthDate: { type: String, required: true },    
    adhaarNumber: {type: String, required: true},
    address: {type: String, required: true },
    mobileno: {type: String, requird: true},
    country: {type: String, requird: true},
});

const User =  mongoose.model('User', userSchema, 'user');
const userDetails =  mongoose.model('FormBuilder', formBuilderSchema, 'userDetails');

module.exports = {
    User: User,
    userDetails: userDetails
}
