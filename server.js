const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth');

const User = require('./models/userModel');
const Blogpost = require('./models/blogpostModel');

const app = express();
dotenv.config({path: './.env'});

mongoose.connect(process.env.DB_URL,{ 
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true 
}).then(()=> console.log('MongoDB is connected'));


const viewsPath = path.join(__dirname, '/views');
const publicDirectory = path.join(__dirname, '/public');

app.set('views', viewsPath);
app.set('view engine', 'hbs');
app.use(express.static(publicDirectory));
app.use(cookieParser())

// allows passing of data 
app.use(express.urlencoded({extended: false}));
app.use(express.json({extended: false}));

app.get('/', auth.isLoggedIn, async (req, res) => {

    // checks if the logged in user has 'true' as value of admin
    if (req.userFound && req.userFound.admin){
        console.log("user is logged in")
        const usersDB = await User.find();

        res.render('index', {
        users: usersDB
    });

    } else {
        res.send("welcome to the homepage")
    }
    // state the model - User then the method - find()
    
});

app.get('/register', (req, res) => {
    res.render('register')
});

app.post('/register', async (req, res) => {

    const hashedPassword = await bcrypt.hash(req.body.userPassword, 8);
    console.log(hashedPassword)

    await User.create({
        name: req.body.userName, 
        email: req.body.userEmail,
        password: hashedPassword
    });

    res.send("user registered")
});

app.get('/profile', auth.isLoggedIn, async (req, res) => {
    // can only display your user profile if logged in 
    try {

        // getting user from middleware
        if(req.userFound){
            const userDB = req.userFound
            console.log("got username from auth middleware")
            console.log(userDB)
    
            res.render("profile", {
                user: userDB
            })

        } else {
            res.send("you are not logged in")
        }

    } catch (error) {
        res.send("user not found")
    }

});

app.get("/profile/update/:id", async (req, res) => {
    // *****do a post method when add a from on the frontend***
    // get values from form on front end
    // hardcoded here to practise update
    const userName = "Helen";
    const userEmail = "helen@email.com";
    const userPassword = "friday";

    try {
        await User.findByIdAndUpdate(req.params.id, {
            name: userName, 
            email: userEmail, 
            password: userPassword
        });
    
        res.send("user has been updated")

    } catch (error) {
        console.log(error)
        res.send(`Error: ${error.reason}`)

    }
   
});

app.post("/delete/:id", async (req, res) => {
       
    try {
        console.log(res)
        await User.findByIdAndDelete(req.params.id);
        res.send("User was deleted");
    } catch (error){
        console.log(error)
        res.send("unable to delete")
    }
   
});

app.get("/blogpost/:id", (req, res) => {
    console.log(req.params.id)
    res.render("blogpost", {
        userId: req.params.id
    });
});

app.post("/blogpost/:id", async (req, res) => {
    console.log(req.params.id)
    try {
        await Blogpost.create({
            title: req.body.postTitle,
            body: req.body.postBody,
            user: req.params.id
        });

        res.send("post created")

    } catch (error) {

        res.send(error)

    }

});

app.get("/allPosts/:id", async (req, res) => {

    const allPosts = await Blogpost.find({user:req.params.id}).populate('user', 'name email')
    const user = await User.find({_id: req.params.id})
 
    console.log(allPosts)
    console.log(user)
    res.render("userBlogPosts", {
        allPosts: allPosts,
        user: user

    });
});

app.get("/login", (req, res) => {
    res.render('login');
});

app.post("/login", async (req, res) => {
    const user = await User.findOne({email:req.body.userEmail});

    const isMatch = await bcrypt.compare(req.body.userPassword, user.password );

    if (isMatch) {
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPRESS_IN});

        const cookieOptions = {
            expires: new Date(
                // converts no. of days to milliseconds
                Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
            ),
            httpOnly:true
        }

        // save cookie on the browser
        res.cookie('jwt', token, cookieOptions)

        console.log(token)
        res.send("You are logged in")
    } else {
        res.send("your login details are incorrect")
    }
});

// delete cookie on logout
app.get("/logout", auth.logout, (req, res) => {
    res.send("You are logged out");
});

app.get('/*', (req, res) => {
    res.send("page not found")
});

app.listen(5000, () => {
    console.log("server running on port 5000")
});