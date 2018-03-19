let express = require("express");
	app = express();
	path = require('path');
	session = require('express-session');
	bodyparser = require('body-parser');
	mongoose = require("mongoose");
	Schema = mongoose.Schema;
	MessageSchema = new mongoose.Schema({
		name: {type: String, required: true, minlength: 2, maxlength: 25},
		text: {type: String, required: true, minlength: 2, maxlength: 255},
		comments: [{type: Schema.Types.ObjectId, ref: "Comment"}]
	}, {timestamps: true});
	CommentSchema = new mongoose.Schema({
		_message: {type: Schema.Types.ObjectId, ref: "Message"},
		name: {type: String, required: true, minlength: 2, maxlength: 25},
		text: {type: String, required: true, minlength: 2, maxlength: 255},
	}, {timestamps: true});


app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname + "/static")));
app.use(session({
	secret: 'hushdonttell',
	proxy: true,
	resave: false,
	saveUninitialized: true
}));

app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost/messages");
mongoose.model('Message', MessageSchema);
mongoose.model('Comment', CommentSchema);
mongoose.Promise = global.Promise;

var Message = mongoose.model('Message');
var Comment = mongoose.model('Comment');

//Global vars here:

//app. functions here:

app.get('/', function(req, res) {
	Message.find({}).populate("comments").exec((err, messages)=> {
		if(err){
			console.log("Load all Error");
			res.render("index", {errors: errors});
		}
		else{
			console.log("Load all Success");
			res.render("index", {messages: messages});
		}
	});
});

app.post("/postmessage", (req, res)=>{
	let new_message = new Message({name: req.body.name, text: req.body.message}); 
	new_message.save((err)=>{
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

app.post("/postcomment/:id", (req,res)=>{
	Message.findOne({_id: req.params.id}, (err, thismessage)=>{
		let new_comment = new Comment({name: req.body.name, text: req.body.comment});
		new_comment._message = thismessage._id;
		new_comment.save((err)=>{
			if(err){
				console.log("Save Error");
				res.render('index', {errors: errors});
			}
			else{
				thismessage.comments.push(new_comment);
				thismessage.save((err)=>{
					if(err){
						console.log("Error saving message after saving comment");
					}
					else{
						console.log("Save msg and comment Success");
						res.redirect("/");
					}
				});
				
			}
		});
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