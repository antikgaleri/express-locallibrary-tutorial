
// catalog.js

const express = require('express');
const router  = express.Router();

// require controller module
const author_controller = require('../controllers/authorController');
const book_controller = require('../controllers/bookController');
const book_instance_controller = require('../controllers/bookinstanceController');
const genre_controller = require('../controllers/genreController');


// book route

// get catalog home page
router.get('/', book_controller.index);

// get request creating book. must come before routes that display book.
router.get('/book/create', book_controller.book_create_get);

// post reqesst for creating book
router.post('/book/create', book_controller.book_create_post);

// get request to delete book
router.get('/book/:id/delete', book_controller.book_delete_get);

// post request to delete book
router.post('/book/:id/delete', book_controller.book_delete_post);

// get request to update book
router.get('/book/:id/update', book_controller.book_update_get);

// post request to update book
router.post('/book/:id/update', book_controller.book_update_post);

// get request for one book
router.get('/book/:id', book_controller.book_detail);

// get request for list of all book item
router.get('/books', book_controller.book_list);


// author route

// get request creating author. must come before routes that display author.
router.get('/author/create', author_controller.author_create_get);

// post reqesst for creating author
router.post('/author/create', author_controller.author_create_post);

// get request to delete author
router.get('/author/:id/delete', author_controller.author_delete_get);

// post request to delete author
router.post('/author/:id/delete', author_controller.author_delete_post);

// get request to update author
router.get('/author/:id/update', author_controller.author_update_get);

// post request to update author
router.post('/author/:id/update', author_controller.author_update_post);

// get request for one author
router.get('/author/:id', author_controller.author_detail);

// get request for list of all author item
router.get('/authors', author_controller.author_list);


// genre route
// get request creating genre. must come before routes that display genre.
router.get('/genre/create', genre_controller.genre_create_get);

// post reqesst for creating genre
router.post('/genre/create', genre_controller.genre_create_post);

// get request to delete genre
router.get('/genre/:id/delete', genre_controller.genre_delete_get);

// post request to delete genre
router.post('/genre/:id/delete', genre_controller.genre_delete_post);

// get request to update genre
router.get('/genre/:id/update', genre_controller.genre_update_get);

// post request to update genre
router.post('/genre/:id/update', genre_controller.genre_update_post);

// get request for one genre
router.get('/genre/:id', genre_controller.genre_detail);

// get request for list of all genre item
router.get('/genres', genre_controller.genre_list);


// book instance
// get request creating bookinstance. must come before routes that display bookinstance.
router.get('/bookinstance/create', book_instance_controller.bookinstance_create_get);

// post reqesst for creating bookinstance
router.post('/bookinstance/create', book_instance_controller.bookinstance_create_post);

// get request to delete bookinstance
router.get('/bookinstance/:id/delete', book_instance_controller.bookinstance_delete_get);

// post request to delete bookinstance
router.post('/bookinstance/:id/delete', book_instance_controller.bookinstance_delete_post);

// get request to update bookinstance
router.get('/bookinstance/:id/update', book_instance_controller.bookinstance_update_get);

// post request to update bookinstance
router.post('/bookinstance/:id/update', book_instance_controller.bookinstance_update_post);

// get request for one bookinstance
router.get('/bookinstance/:id', book_instance_controller.bookinstance_detail);

// get request for list of all bookinstance item
router.get('/bookinstances', book_instance_controller.bookinstance_list);


module.exports = router;























