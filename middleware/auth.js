const {promisify} = require("util");
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.isLoggedIn = async (req, res, next) => {
    console.log("Checking if user is logged in");

    if(req.cookies.jwt) {
        console.log('my token decoded')
        const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
        console.log('my token decoded')
        console.log(decoded)

        // creates a property called userFound on the request body
        req.userFound = await User.findById(decoded.id)
    }
    next();
};