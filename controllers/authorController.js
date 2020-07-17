
const {body,validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');
const async = require('async');
const book   = require('../models/book.js');
const author = require('../models/author.js');

// list all author
exports.author_list = function(req,res,next) {
	author.find()
		.populate('author')
		.sort([['family_name', 'ascending']])
		.exec(function (err, list_authors){
			if (err) { return next(err); }
			// ok
			res.render('author_list', { title: 'Author List', author_list: list_authors});
		});
};

// display specific author
exports.author_detail = function(req,res,next) {
	
	async.parallel({
		author: function(callback){
			author.findById(req.params.id)
				.exec(callback);
		},
		authors_books: function(callback){
			book.find({ 'author': req.params.id}, 'title summary')
			.exec(callback)
		},
	},		function(err, results) {
			if (err) { return next(err); }
			if (results.author==null) {
				const err = new Error('Author not found');
				err.status = 404;
				return next(err);
			}
			// ok
			res.render('author_detail', { title: 'Author Detail', author: results.author, author_books: results.authors_books});
	});	
};

// author create form on get
exports.author_create_get= function(req,res,next) {
	res.render('author_form', { title: 'Create Author' });
};

// author create form on post
exports.author_create_post= [

	// validate fields
	body('first_name').isLength({min: 1}).trim().withMessage('First Name must specified.')
		.isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
	body('family_name').isLength({min: 1}).trim().withMessage('Family Name must specified.')
		.isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
	body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true}).isISO8601(),
	body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true}).isISO8601(),
	
	// sanitize fields
	sanitizeBody('first_name').escape(),
	sanitizeBody('family_name').escape(),
	sanitizeBody('date_of_birth').toDate(),
	sanitizeBody('date_of_death').toDate(),
	
	// process request after validation and sanitization
	(req, res, next) => {
		// extract the validation error from request
		const errors = validationResult(req);
		
		// error
		if (!errors.isEmpty()) {
			// error, render form with error message
			res.render('author_form', { title: 'Create Author', author: req.body, errors: errors.array() });
			return;
		}
		else {
			// data form valid
			
			// create author object with escape and trim data
			let rec_author = new author(
			{
				first_name: req.body.first_name,
				family_name: req.body.family_name,
				date_of_birth: req.body.date_of_birth,
				date_of_death: req.body.date_of_death
			});
			
			rec_author.save(function(err) {
				if (err) { return next(err); }
				// ok
				res.redirect(rec_author.url);
			});
		}
	}
				
];


// author delete form on get
exports.author_delete_get= function(req,res, next) {
	
	async.parallel(
	{
		author: function(callback) {
			author.findById(req.params.id).exec(callback)
		},
		authors_books: function(callback) {
			book.find({ 'author': req.params.id }).exec(callback)
		},
	}, function(err, results) {
		if (err) { return next(err); }
		if (results.author==null) {
			res.redirect('/catalog/authors');
		}
		// ok
		res.render('author_delete', {title: 'Delete Author', author: results.author, author_books: results.authors_books });
	});
};

// author delete form on post
exports.author_delete_post= function(req,res,next) {
	
	async.parallel(
	{
		author: function(callback) {
			author.findById(req.body.authorid).exec(callback)
		},
		authors_books: function(callback) {
			book.find({ 'author': req.body.authorid }).exec(callback)
		},
	}, function(err, results) {
		if (err) { return next(err); }
		// ok
		if (results.authors_books.length > 0) {
			// authos has book
			res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
			return;
		}
		else {
			// author has no book. delete it
			author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
				if (err) { return next(err); }
				// ok
				res.redirect('/catalog/authors')
			})
		}
	});
};

// author update form on get
exports.author_update_get= function(req,res) {
	res.send('not implemented: author update get');
};

// author update form on post
exports.author_update_post= function(req,res) {
	res.send('not implemented: author update post');
};



