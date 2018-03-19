let express = require("express");
	app = express();
	path = require('path');
	session = require('express-session');
	bodyparser = require('body-parser');
	mongoose = require("mongoose");
	Schema = mongoose.Schema;
	PeopleSchema = new mongoose.Schema({
		name: {type: String, required: true, minlength: 2, maxlength: 25},
	}, {timestamps: true});


app.use(bodyparser.json());
app.use(express.static(path.join(__dirname + "/static")));
app.use(session({
	secret: 'hushdonttell',
	proxy: true,
	resave: false,
	saveUninitialized: true
}));

app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost/people");
mongoose.model('People', PeopleSchema);
mongoose.Promise = global.Promise;

var People = mongoose.model('People');

//Global vars here:

//app. functions here:

app.get('/', function(req, res) {
	People.find({}, (err, all_ppl)=> {
		if(err){
			console.log("Load all Error", err);
			res.json({message: "Error", errors: err});
		}
		else{
			console.log("Load all Success");
			res.json({data: all_ppl});
		}
	});
});

app.get("/new/:name", (req, res)=>{
	let new_person = new People({name: req.params.name}); 
	new_person.save((err, person)=>{
		if(err){
			console.log("New Error", err);
			res.json({message: "Error on new person", errors: err});
		}
		else{
			console.log(person);
			res.redirect("/");
		}
	});
});

app.get("/delete/:name", (req, res)=>{
	Poeple.findOneAndRemove({name: req.params.name}, (err,person)=>{
		if(err){
			console.log("New Error", err);
			res.json({message: "Error on new person", errors: err});
		}
		else{
			console.log(person);
			res.redirect("/");
		}
	});
});
app.get("/:name", (req,res)=>{
	People.findOne({name: req.params.name}, (err,person)=>{
		if(err){
			res.json({message: "Error with get name"}, {errors: err});
		res.json(person);
		}
	});
});

app.use(function(req, res) {
  res.status(404).send({url: req.originalUrl + ' not found'})
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