

const validator = require('express-validator');

const async = require('async');

const book = require('../models/book.js');

const genre = require('../models/genre.js');

// list all genre
exports.genre_list = function(req,res,next) {
	genre
	.find()
	.populate('genre')
	.sort([['name', 'ascending']])
	.exec(function (err, list_genres){
		if (err) { return next(err); }
		// ok
		res.render('genre_list', { title: 'Genre List', genre_list: list_genres});
	});
};

// display specific genre
exports.genre_detail = function(req,res, next) {
	async.parallel({
		
		genre: function(callback) {
				genre.findById(req.params.id)
					.exec(callback);
		},
		
		genre_books: function(callback) {
			book.find({ 'genre': req.params.id })
				.sort([['_id', 'ascending']])
				.exec(callback);
		}
	}, function(err, results){
		if (err) { return next(err); }
		if (results.genre==null) {
			const err = new Error('genre not found');
			err.status = 404;
			return next(err);
		}
		// ok
		res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books});
	}
	
	);
};

// genre create form on get
exports.genre_create_get= function(req,res,next) {
	res.render('genre_form', { title: 'Create Genre' });
};

// genre create form on post
exports.genre_create_post= [

	// validate name not empty
	validator.body('name', 'Genre name required').trim().isLength({ min: 3}),
	
	// sanitize (escape) name field
	validator.sanitizeBody('name').escape(),
	
	// proses request
	(req, res, next) => {
		// extract validation error from request
		const errors = validator.validationResult(req);
		
		// create genre object with escaped and trim data
		var igenre = new genre(
		{ name: req.body.name }
		);
		
		if (!errors.isEmpty()){
			// error
			res.render('genre_form', { title: 'Create Genre', genre: igenre, errors: errors.array()});
			return;
		}
		else {
			// data valid
			// genre already in data ?
			genre.findOne( {'name': req.body.name})
				.exec(function(err, found_genre){
					if (err) { return next(err); }
					
					// found
					if (found_genre) {
						// genre exists, redirect to its detail pageX
						res.redirect(found_genre.url);
					}
					else {
						igenre.save(function (err) {
							if (err) { return next(err); }
							// genre save. redirect to genre detail page.
							res.redirect(igenre.url);
						});
					}
				});
		}
	}
];



// genre delete form on get
exports.genre_delete_get= function(req,res) {
	res.send('not implemented: genre delete get');
};

// genre delete form on post
exports.genre_delete_post= function(req,res) {
	res.send('not implemented: genre delete post');
};

// genre update form on get
exports.genre_update_get= function(req,res) {
	res.send('not implemented: genre update get');
};

// genre update form on post
exports.genre_update_post= function(req,res) {
	res.send('not implemented: genre update post');
};



