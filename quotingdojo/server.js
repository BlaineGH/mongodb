// Require the Express Module
var express = require('express');
// Create an Express App
var app = express();
// require the mongoose module
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/quotingdojo');
// to make a model, you can first define a schema, which is just the BLUEPRINT for a model
var UserSchema = new mongoose.Schema({
    name:  { type: String, required: true, minlength: 3},
    quote: { type: String, required: true, maxlength: 100 },
}, {timestamps: true });
mongoose.model('User', UserSchema); // We are setting this Schema in our Models as 'User'
var User = mongoose.model('User') // We are retrieving this Schema from our Models, named 'User'
// Use native promises
mongoose.Promise = global.Promise;
// Require body-parser (to receive post data from clients)
var bodyParser = require('body-parser');
// Integrate body-parser with our App
app.use(bodyParser.urlencoded({ extended: true }));
// Require path
var path = require('path');
// Setting our Static Folder Directory
app.post('/quote', function(req, res) {
  console.log("POST DATA", req.body);
  // create a new User with the name and age corresponding to those from req.body
  var user = new User({name: req.body.name, quote: req.body.quote});
  // Try to save that new user to the database (this is the method that actually inserts into the db) and run a callback function with an error (if any) from the operation.
  user.save(function(err) {
    // if there is an error console.log that something went wrong!
    if(err) {
      console.log('something went wrong');
    } else { // else console.log that we did well and then redirect to the root route
      console.log('successfully added a user!');
      res.redirect('/quote');
    }
  })
})

app.use(express.static(path.join(__dirname, './static')));
// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');
// Routes
// Root Request
app.get('/', (req, res) =>{
	res.render("index");
});

app.get('/quote', function(req, res) {
    // This is where we will retrieve the users from the database and include them in the view page we will be rendering.
  	User.find({}, function(err, users) {
  		if(err){
  			console.log("nope");
  		}
		else{
			console.log("yup");
			res.render("quotes", {users: users});
		}
    // This is the method that finds all of the users from the database
    // Notice how the first parameter is the options for what to find and the second is the
    //   callback function that has an error (if any) and all of the users
    // Keep in mind that everything you want to do AFTER you get the users from the database must
    //   happen inside of this callback for it to be synchronous 
    // Make sure you handle the case when there is an error, as well as the case when there is no error
	})
})
// Setting our Server to Listen on Port: 8000
app.listen(1337, function() {
    console.log("listening on port 1337");
})
