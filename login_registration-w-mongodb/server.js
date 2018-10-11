let express = require("express");
	app = express();
	path = require('path');
	session = require('express-session');
	bodyparser = require('body-parser');
	mongoose = require("mongoose");
	bcrypt = require("bcryptjs");
	Schema = mongoose.Schema;
	UsersSchema = new mongoose.Schema({
		email: {type: String, required: true, unique: [true, "Email has already been taken. Please select a new email"]},
		first_name: {type: String, required: [true,"Please enter First Name"], minlength: 2, maxlength: 25},
		last_name: {type: String, required: [true,"Please enter Last Name"], minlength: 2, maxlength: 25},
		birthday: {type: Date, required: [true,"Please enter Birthdate"]},
		password: {type: String, required: true, minlength: 8, validate: {validator: (value)=>{return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,32}/.test( value );},message: " Password failed validation; you must have atleast 1 number, 1 upercase letter and 1 special character"}}
	}, {timestamps: true});



app.use(bodyparser.urlencoded({ extended: true })); //app.use(bodyparser.json()); //We are parsing json data.
app.use(express.static(path.join(__dirname + "/static")));
app.use(session({
	secret: 'hushdonttell',
	proxy: true,
	resave: false,
	saveUninitialized: true
}));

app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost/tasks");
mongoose.model('Users', UsersSchema); //set up our schema
mongoose.Promise = global.Promise; //make empty promises

var User = mongoose.model('Users'); //set up our variables to use our model

//Global vars here:

//app. functions here:

app.get('/', function(req, res) {
	res.render('index');
});

app.get('/success', function(req, res) {
	res.render('success');
});

app.post("/register", (req, res)=>{
	if(req.body.password != req.body.confirmpassword){
		res.render("index",{errors: "passwords are not the same"});
	}
	else{
		let new_user = new User(req.body);
		let salt = bcrypt.genSaltSync(10);
		bcrypt.hash(req.body.password, salt, (error, hash)=>{
			if(error){
				console.log("user password hash error", error);
			}
			else{
				new_user.password = hash;
				new_user.save((err)=>{
					if(err){
						console.log(new_user.errors);
						res.render("index", {errors: new_user.errors});
					}
					else{
						res.redirect("/success");
					}
				});
			}
		});
	}
});

app.post("/login", (req,res)=>{
	let user = User.findOne({email: req.body.email}, (err, user)=>{
		if(err){
			res.render("index", {errors: user.errors});
		}
		else{
			bcrypt.compare(req.body.password, user.password, (err,response)=>{
				if(response == true){
					res.redirect("/success");
				}
				else{
					res.render("index",{errors: user.errors});
				}
			});
		}
	});
});

// app.delete("/users/:id", (req, res)=>{
// 	let done_task = Tasks.findOneAndRemove({_id: req.params.id});
// 	done_task.remove((err,task)=>{
// 		if(err){
// 		console.log("New Error", err);
// 		res.json({message: "Error on deletion", errors: err});
// 		}
// 		else{
// 			res.redirect("/");
// 		}
// 	});
// });

// app.get("/tasks/:id", (req,res)=>{
// 	Tasks.findOne({_id: req.params.id}, (err,task)=>{
// 		if(err){
// 			res.json({message: "Error with get name"}, {errors: err});
// 		}
// 		else{
// 			res.json({data:task});
// 		}
// 	});
// });

// app.put("/tasks/:id", (req,res)=>{
// 	let ud_task = Tasks.findOne({_id:req.params.id});
// 	ud_task.update({title: req.body.title, description: req.body.description, completed: req.body.completed}, (err,task)=>{
// 		if(err){
// 			res.json({message:"we done goofed", error: err});
// 		}
// 		else{
// 			res.redirect("/");
// 		}
// 	});
// });

// app.use(function(req, res) {
// 	res.status(404).send({url: req.originalUrl + ' not found'})
// });



// Our server:
var server = app.listen(1337, () => {
	console.log("listening on port 1337");
});
// Socket logic:
var io = require("socket.io").listen(server);
io.sockets.on('connection', (socket)=> {
	console.log("Client/socket is connected!");
	console.log("Client/socket id is: ", socket.id);
	//Socket code here:
});