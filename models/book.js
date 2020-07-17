

const mongoose = require('mongoose');

const schema = mongoose.Schema;

let bookschema = new schema({
	title: {type: String, required: true},
	author: {type: schema.Types.ObjectId, ref: 'author', required: true},
	summary: {type: String, required:  true},
	isbn: {type: String, required: true},
	genre: [{type: schema.Types.ObjectId, ref: 'genre'}]
});


// virtual book url
bookschema
.virtual('url')
.get(function (){
	return '/catalog/book/' + this._id;
});


module.exports = mongoose.model('book', bookschema);
