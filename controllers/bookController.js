

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const book = require('../models/book.js');
const author = require('../models/author.js');
const genre = require('../models/genre.js');
const bookinstance = require('../models/bookinstance.js');

const async = require('async');


// index book
exports.index = function(req, res) {
	  async.parallel({
		  book_count: function(callback){
			  book.countDocuments({}, callback);
		  },
		  book_instance_count: function(callback){
			  bookinstance.countDocuments({},callback);
		  },
		  book_instance_available_count: function(callback){
			  bookinstance.countDocuments({status: 'Available'}, callback);
		  },
		  author_count: function(callback){
			  author.countDocuments({}, callback);
		  },
		  genre_count: function(callback){
			  genre.countDocuments({}, callback);		
		  }
	  }, function(err, results){
		     res.render('index', { title: 'Local Library Home', error: err, data: results});
	  });
	  
};

// list all book
exports.book_list = function(req,res, next) {
	book.find({}, 'title author') // search, select fields
		.populate('author')
		.exec(function (err, list_books){
			if (err) { return next(err); }
			// ok
			res.render('book_list', { title: 'Book List', book_list: list_books});
		});
};

// display specific book
exports.book_detail = function(req,res, next) {
	
	async.parallel({
		book: function(callback) {
			book.findById(req.params.id)
				.populate('author')
				.populate('genre')
				.exec(callback);
		},
		book_instance: function(callback) {
			bookinstance.find({ 'book': req.params.id })
				.exec(callback);
		}
		}, function(err, results) {
			if (err) { return next(err); }
			if (results.book==null) {
				const err = new Error('Book not found');
				err.status = 404;
				return next(err);
			}
		
			// ok
			res.render('book_detail', { title: results.book.title, book: results.book, book_instances: results.book_instance });
		});
};

// book create form on get
exports.book_create_get= function(req,res, next) {
	
	// get all author and genre, which we can use for adding to our book.
	async.parallel(
	{
		authors: function(callback){
			author.find(callback);
		},
		genres: function(callback) {
			genre.find(callback);
		},
	}, function(err, results) {
		if (err) { return next(err); }
		// ok
		res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres});
	});
	
	
};

// book create form on post
exports.book_create_post= [

	// convert the genre to an array
	(req, res, next) => {
		if (!(req.body.genre instanceof Array)){
			if(typeof req.body.genre==='undefined')
				req.body.genre=[];
			else
				req.body.genre=new Array(req.body.genre);
		}
		next();
	},
	
	// validation fields
	body('title', 'Title must not be empty.').trim().isLength({min: 1}),
	body('author', 'Author must not be empty.').trim().isLength({min: 1}),
	body('summary', 'Summary must not be empty.').trim().isLength({min: 1}),
	body('isbn', 'ISBN must not be empty.').trim().isLength({min: 1}),
	
	// sanitize fields using wildcard
	sanitizeBody('*').escape(),
	
	// process request after validation and sanitization
	(req, res, next) => {
		
		// extract the validation errors from a request
		const errors = validationResult(req);
		
		// create book
		const rec_book = new book(
		{
			title: req.body.title,
			author: req.body.author,
			summary: req.body.summary,
			isbn: req.body.isbn,
			genre: req.body.genre
		});
		
		// error
		if (!errors.isEmpty()) {
			// render with error
			
			// get all author and genres for form
			async.parallel(
			{
				authors: function(callback){
					author.find(callback);
				},
				genres: function(callback) {
					genre.find(callback);
				},
			}, function(err, results){
				if (err) { return next(err); }
				
				// mark our selected genres as checked.
				for (let i = 0; i < results.genres.length; i++) {
					if (book.genre.indexOf(results.genres[i]._id) > -1) {
						results.genres[i].checked='true';
					}
				}
				res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres, book: book, errors: errors.array()});
			});
			return;
		}
		else {
			// data valid
			rec_book.save(function(err) {
				if (err) { return next(err); }
				// ok
				res.redirect(rec_book.url);
			});
		}
	}

];

// book delete form on get
exports.book_delete_get= function(req,res, next) {
	
	//
	async.parallel(
	{
		book: function(callback) {
			book.findById(req.params.id)
			.exec(callback);
		},
	}, function(err, results) {
		if (err) { return next(err); }
		if (results.book==null) {
			res.redirect('/catalog/books');
		}
		// ok
		res.render('book_delete', { title: 'Delete Book: ' + results.book.title , book: results.book });
	});
};

// book delete form on post
exports.book_delete_post= function(req,res,next) {
	
	//
	async.parallel(
	{
		book: function(callback) {
			book.findById(req.body.bookid)
			.exec(callback);
		},
	}, function(err, results) {
		if (err) { return next(err); }
		// ok
		// delete book instance firstChild
		bookinstance.deleteMany( { 'book': req.body.bookid},
			function deleteBookinstance(err) {
				if (err) { return next(err); }
				
				// delete book
				book.findByIdAndRemove(req.body.bookid,
					function deleteBook(err) {
						if (err) { return next(err); }
						// ok
						res.redirect('/catalog/books');
					})
			});
	});
			
};

// book update form on get
exports.book_update_get= function(req,res,next) {
	
	// get book, author and genre for form
	async.parallel(
	{
		book: function(callback) {
			book.findById(req.params.id)
			.populate('author')
			.populate('genre')
			.exec(callback);
		},
		authors: function(callback) {
			author.find(callback);
		},
		genres: function(callback) {
			genre.find(callback);
		},
	}, function(err, results) {
		if (err) { return next(err); }
		if (results.book==null) {
			const err = new Error('Book not found');
			err.status = 404;
			return next(err);
		}
		// ok
		// mark genres as checked
		for (let all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
			for (let book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
				if (results.genres[all_g_iter]._id.toString()==results.book.genre[book_g_iter]._id.toString()) {
					results.genres[all_g_iter].checked='true';
				}
			}
		}
		res.render('book_form', { title: 'Update Book', authors: results.authors, genres: results.genres, book: results.book});
	});
			
};

// book update form on post
exports.book_update_post= [
	
	// convert the genre to an array
	(req, res, next) => {
		if (!(req.body.genre instanceof Array)){
			if(typeof req.body.genre==='undefined')
				req.body.genre=[];
			else
				req.body.genre = new Array(req.body.genre);
		}
		next();
	},
	
	// validate fields
	// validation fields
	body('title', 'Title must not be empty.').trim().isLength({min: 1}),
	body('author', 'Author must not be empty.').trim().isLength({min: 1}),
	body('summary', 'Summary must not be empty.').trim().isLength({min: 1}),
	body('isbn', 'ISBN must not be empty.').trim().isLength({min: 1}),
	
	// sanitize fields
	sanitizeBody('title').escape(),
	sanitizeBody('author').escape(),
	sanitizeBody('summary').escape(),
	sanitizeBody('isbn').escape(),
	sanitizeBody('genre.*').escape(),
	
	// proses request after validation and sanitization
	(req, res, next) => {
		
		// extract the validation erros from a request
		const errors = validationResult(req);
		
		// create book object
		const rec_book = new book(
		{
			title: req.body.title,
			author: req.body.author,
			summary: req.body.summary,
			isbn: req.body.isbn,
			genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
			_id: req.params.id // this required, if not the new id will be added
		});
		
		// error
		if (!errors.isEmpty()) {
			// render again with sanitized or error messages
			
			// get all author and genres for form
			async.parallel(
			{
				authors: function(callback) {
					author.find(callback);
				},
				genres: function(callback) {
					genre.find(callback);
				},
			}, function(err, results) {
				if (err) { return next(err); }
				
				// mark selected genres as checked
				for (let i=0; i< results.genres.length; i++){
					if (rec_book.genre.indexOf(results.genres[i]._id) > -1) {
						results.genres[i].checked='true';
					}
				}
				res.render('book_form', { title: 'Update Book', authors: results.authors, genres: results.genres, book: rec_book, errors: errors.array()});
			});
			return;
		}
		else {
			// data valid, update.
			book.findByIdAndUpdate(req.params.id, rec_book, {}, function(err, thebook) {
				if (err) { return next(err); }
				// ok
				res.redirect(thebook.url);
			});
		}
	}

];



