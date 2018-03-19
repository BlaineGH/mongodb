let express = require("express"),
	app = express(),
	path = require('path'),
	session = require('express-session'),
	bodyparser = require('body-parser'),
	mongoose = require("mongoose");
	AnimalsSchema = new mongoose.Schema({
		name: {type: String, required: true, minlength: 3, maxlength: 25},
	}, {timestamps: true});

mongoose.connect("mongodb://localhost/animals");
mongoose.model('Animal', AnimalsSchema);
mongoose.Promise = global.Promise;

app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname + "/static")));
app.use(session({
	secret: 'SecretIsASecret',
	proxy: true,
	resave: false,
	saveUninitialized: true
}));

app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'ejs');

var Animal = mongoose.model('Animal');

//Global vars here:

//app. functions here:

app.get('/', function(req, res) {
	Animal.find({}, function(err, animals) {
		if(err){
			console.log("Load Error");
			res.render("index", {errors: errors});
		}
		else{
			console.log("Load Success");
			res.render("index", {animals: animals});
		}
	});
});

app.get("/animals/:id", (req, res)=>{
	Animal.find({_id: req.params.id}, (err, animal)=>{
		if(err){
			console.log("Find Error");
			res.render("index", {errors: errors});
		}
		else{
			console.log("Find Success");
			res.render("info", {animal: animal});
		}
	});
});
app.get("/animals/editinfo/:id", (req, res)=>{
	Animal.find({_id: req.params.id}, (err, animal)=>{
		if(err){
			console.log("Edit Error");
			res.render("index", {errors: errors});
		}
		else{
			console.log("Edit load Success");
			res.render("editinfo", {animal: animal})
		}
	})
})

app.get('/new', (req,res)=>{
	res.render("new");
});
app.post("/update/:id", (req, res)=>{
	Animal.update({_id: req.params.id}, {name: req.body.newname}, (err)=>{
		if(err){
			console.log("Updating Error");
			res.render("index", {errors: errors});
		}
		else{
			console.log("Update Success");
			res.redirect("/");
		}
	});
});

app.post("/newanimal", (req,res)=>{
	let new_animal = new Animal({name: req.body.newthingname});
	new_animal.save((err)=>{
		if(err){
			console.log("Save Error");
			res.render('index', {errors: errors});
		}
		else{
			console.log("Save Success");
			res.redirect("/");
		}
	});
});
app.get("/delete/:id", (req, res)=>{
	Animal.remove({_id: req.params.id}, (err)=>{
		if(err){
			console.log("Deletion Error");
			res.render("index", {errors: errors});
		}
		else{
			console.log("Deletion Success");
			res.redirect("/");
		}
	});
});


var server = app.listen(1337, () => {
	console.log("listening on port 1337");
});
var io = require("socket.io").listen(server);
io.sockets.on('connection', (socket)=> {
	console.log("Client/socket is connected!");
	console.log("Client/socket id is: ", socket.id);
	//Socket code here:
});