//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require('path');
const mongoose = require('mongoose');
const _ = require("lodash");
//to use a particular module of lodash use this 
// const toLowerCase = require("lodash/lowerCase");

const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

const port = process.env.PORT || 3000;

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";


const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

// setting up engine to use EJS
app.set('view engine', 'ejs');
app.set(path.join(__dirname), "views")


//!------------------connecting to DB------------------------------------
// connection URL
const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@mongodb-demo.k0ejzwo.mongodb.net/BlogAppDB?retryWrites=true&w=majority`;

// connecting to DB
mongoose.connect(url)
.then(() => console.log("Connected to DB successfully."))
.catch((error) => console.log(error.message));
//!------------------end of connecting to DB------------------------------------


//! ----------------- creating posts Schema ----------------------------- 
// defining posts schema
const postsSchema = new mongoose.Schema({
    postTitle:{
        type: String,
        required: true
    },
    postBody:{
        type: String,
        required:true
    }
});

// creating post model
const Post = mongoose.model("Post", postsSchema);

//! ----------------- ending posts Schema ----------------------------- 


//! ----------------- Routes ----------------------------- 
// home route
app.get("/", async (req, res) => {
    try {
        const posts = await Post.find();
        res.render("home", {homeHeading:homeStartingContent, posts:posts});
    } catch (error) {
        console.log(error.message);
    }
});

// about route
app.get("/about", (req, res) => {
    res.render("about", {aboutHeading:aboutContent});
});

// contact route
app.get("/contact", (req, res) => {
    res.render("contact", {contactHeading: contactContent});
});

// compose route
app.get("/compose", (req, res) => {
    res.render("compose");
});

// specific post route
app.get("/posts/:postID", async (req, res) => {

    const requestedPostID = req.params.postID;

    const post = await Post.findById(requestedPostID);

    if(post){
        res.render("post", {postTitle:post.postTitle, postBody: post.postBody});
    }
    else{
        res.render("notfound");
    }
});

// compose - post route
app.post("/compose", async (req, res) => {
    const createPost = new Post({
        postTitle:req.body.postTitle,
        postBody:req.body.postBody
    });

    try {
        await createPost.save();
        res.redirect("/");
    } catch (error) {
        console.log(error.message);
    }
});

// get route - delete post
app.get("/delete", async (req, res) => {
    try {
        const posts = await Post.find();
        res.render("delete", {posts:posts});
    } catch (error) {
        console.log(error.message);
    }
})

// post delete route - delete post route
app.post("/delete", async (req, res) => {
    try {
        const postID = req.body.checkbox;
        const deletedpost = await Post.findByIdAndRemove(postID);
        if(deletedpost){
            console.log("post delete successfully.");
            res.redirect("/");
        }
        else{
            res.render("delete_err");
        }
    } catch (error) {
        console.log(error.message);
    }
})
//! ----------------- end of Routes ----------------------------- 


app.listen(port, function(error) {
    if (error) {
        console.log(error);
    }
    else{
        console.log(`Server started on port: ${port}`);
    }
});
