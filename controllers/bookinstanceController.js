

const { body,validationResult} = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const book = require('../models/book.js');
const bookinstance = require('../models/bookinstance.js');

// list all bookinstance
exports.bookinstance_list = function(req,res, next) {
	bookinstance.find()
		.populate('book')
		.exec(function (err, list_bookinstances){
			if (err) { return next(err); }
			// ok
			res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances});
		});
};

// display specific bookinstance
exports.bookinstance_detail = function(req,res, next) {

	bookinstance.findById(req.params.id)
		.populate('book')
		.exec(function(err, bookinstance){
			if (err) { return next(err);}
			if (bookinstance==null){
				const err = new Error('Book copy not found');
				err.status = 404;
				return next(err);
			}
			// ok
			res.render('bookinstance_detail', { title: 'Copy: '+ bookinstance.book.title, bookinstance: bookinstance});
		});
};

// bookinstance create form on get
exports.bookinstance_create_get= function(req,res, next) {
	
	// book title
	book.find({}, 'title') // column title
		.exec(function(err, books) {
			if (err) { return next(err); }
			// ok
			res.render('bookinstance_form', {title: 'Create Book Instance', book_list: books});
		});
};

// bookinstance create form on post
exports.bookinstance_create_post= [

	// validate fields
	body('book', 'Book must be specified').trim().isLength({min: 1}),
	body('imprint', 'Imprint must be specified').trim().isLength({min: 1}),
	body('due_back', 'Invalid Date').optional({ checkFalsy: true}).isISO8601(),
	
	// sanitize fields
	sanitizeBody('book').escape(),
	sanitizeBody('imprint').escape(),
	sanitizeBody('status').trim().escape(),
	sanitizeBody('due_back').toDate(),
	
	// proses after validation and sanitization
	(req, res, next) => {
		
		// extract validation error
		const errors = validationResult(req);
		
		// create book instanceof
		const rec_bookinstance = new bookinstance(
		{
			book: req.body.book,
			imprint: req.body.imprint,
			status: req.body.status,
			due_back: req.body.due_back
		});
		
		// error
		if (!errors.isEmpty()) {
			// render with error
			book.find({}, 'title')
				.exec(function(err, books) {
					if (err) { return next(err); }
					// ok
					res.render('bookinstance_form', { title: 'Create Book Instance', book_list: books, selected_book: rec_bookinstance.book._id, errors: errors.array(), bookinstance: rec_bookinstance });
				});
				return;
		}
		else {
			// data form valid
			rec_bookinstance.save(function(err) {
				if (err) { return next(err); }
				// ok
				res.redirect(rec_bookinstance.url);
			});
		}
	}
	
];


// bookinstance delete form on get
exports.bookinstance_delete_get= function(req,res) {
	res.send('not implemented: bookinstance delete get');
};

// bookinstance delete form on post
exports.bookinstance_delete_post= function(req,res) {
	res.send('not implemented: bookinstance delete post');
};

// bookinstance update form on get
exports.bookinstance_update_get= function(req,res) {
	res.send('not implemented: bookinstance update get');
};

// bookinstance update form on post
exports.bookinstance_update_post= function(req,res) {
	res.send('not implemented: bookinstance update post');
};



