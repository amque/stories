var User = require('../models/user');
var Story = require('../models/story');

var config = require('../../config');

var secretKey=  config.secretKey;

var jsonwebtoken = require('jsonwebtoken');

function createToken(user) {
	var token = jsonwebtoken.sign({
		id: user._id,
		name: user.name,
		username: user.username
	}, secretKey, {
		expiresInMinute: 1440
	});

	return token;
}

module.exports = function(app, express, io) {

	var api = express.Router();

	api.get('/all_stories', function(req, res) {
		console.log('get all_stories')
		Story.find({}, function(err, stories) {
			if (err) {
				console.log('jest blad ' + err);
				res.send(err);
				return;
			}
			console.log('stories: ' + stories);
			res.json(stories);
		})
	})

	api.post('/signup', function(req, res) {
		console.log('signupaaa ' + req.body.name);
		var user = new User({
			name: req.body.name,
			username: req.body.username,
			password: req.body.password
		});
		var token = createToken(user);
		// console.log(req.body);
		// console.log('name: ' + req.body.name);
		// console.log('uname: ' + req.body.username);
		// console.log('pass: ' + req.body.password);

		user.save(function(err) {
			if (err) {
				res.send(err);
				return;
			}

			res.json({
				success: true,
				message: 'user has been created',
				token: token
			})
		});
	});

	api.get('/users', function(req, res) {
		User.find({

		}, function(err, users) {
			if (err) {
				res.send(err);
				return;
			}
			res.json(users);
		})
	})

	api.post('/login', function(req, res) {
		User.findOne({
			username: req.body.username
		}).select('password user username').exec(function(err, user) {
			if (err) {
				throw err;
			}
			if (!user) {
				res.status(401).send({
					message: 'user doest exists'
				}) 
			} else if (user) {
				var validPassword = user.comparePasswords(req.body.password);
				if (!validPassword) {
					res.send({
						message: 'invalid password'
					})
				} else {
					var token = createToken(user);
					res.json({
						success: true,
						message: 'succ!',
						token: token
					})
				}
			}
		})
	})

	api.use(function(req, res, next) {
		console.log('something ' + req.headers['x-access-token']);

		//eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NjdlOGE1MzlkNmFiNzQ2MzdkNTQ0MjYiLCJpYXQiOjE0NTExNDQwNjZ9.mQXclFdcqiAryr7nkkDMQaLjLcQUS4y2rxdjeBmv08E

		var token = req.body.token || req.param('token') || req.headers['x-access-token'];
		if (token) {
			jsonwebtoken.verify(token, secretKey, function(err, decoded) {
				console.log('decoded: '+ decoded);
				if (err) {
					console.log('err11111');
					res.status(403)
						.send({
							success: false,
							message: 'failed to auth'
						})
				} else {
					console.log('token ok, dec: ' + decoded);
					req.decoded = decoded;
					next();
				}
			}) 
		} else {
			res.status(403).send({
				success: false,
				message: 'no token provided'
			})
		}
	});

	// destination b // provide legitimate token
	// api.get('/', function(req, res) {
	// 	res.json('hello world!');
	// })

	api.route('/')
		.post(function(req, res) {
			var story = new Story({
				creator: req.decoded.id,
				content: req.body.content
			});

			story.save(function(err, newStory) {
				if (err) {
					res.send(err);
					return;
				}
				io.emit('story', newStory);
				res.json({
					message: 'new story created'
				})
			})
		})
		.get(function(req, res) {
			Story.find({
				creator: req.decoded.id
			}, function(err, stories) {
				if (err) {
					res.send(err);
					return;
				} 
				res.json(stories);
			})
		})

	api.get('/me', function(req, res) {
		console.log('me: ' + req.headers['x-access-token'])
		// console.log('req: ' + req.decoded);
		// console.log('res: ' + res.decoded);
		// console.log(req.decoded.id);
		// console.log(req.decoded._id);
		// if (req.decoded && req.decoded.id) {
		// 	User.find({
		// 		_id: req.decoded.id
		// 	}, function(err, User) {
		// 		if (err) {
		// 			res.send(err);
		// 			return;
		// 		} else {
		// 			res.json(User);
		// 		}
		// 	})
		// } else {
		res.json(req.decoded);
		// }
	})

	return api;

}