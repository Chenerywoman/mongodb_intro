const mongoose = require('mongoose');

const user = new mongoose.Schema({
    name: { 
        type: String,
        required:true
    },
    email: {
        type:String, 
        required: true
    },
    password: {
        type:String, 
        required: true
    },
    admin: {
        type:Boolean, 
        default:false
    }

});

// export the Schema - first param is name on the database pf the collection; second param is the schema/model
// n.b. mongoDb will convert the first param to a plural
module.exports = mongoose.model('user', user);