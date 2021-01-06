const {promisify} = require("util");
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.isLoggedIn = async (req, res, next) => {
    console.log("Checking if user is logged in");

    // check on browser if have a cookie with the value of jwt.  
    // if it exists, try to decode the cookie
    
    if(req.cookies.jwt) {
        console.log('my token decoded')
        const decoded = await jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);

        // use promisify if not using async await
        // const decoded = promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

        console.log('my token decoded')
        console.log(decoded)

        // creates a property called userFound on the request body with a value of the user with the decoded it
        req.userFound = await User.findById(decoded.id)
    }
    next();
};

exports.logout = (req, res, next) => {
  
    res.cookie('jwt', 'logout', {
        expires: new Date(Date.now() + 2*1000),
        httpOnly: true
    })

    next();  
}

