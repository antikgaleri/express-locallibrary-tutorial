

const mongoose = require('mongoose');

const schema = mongoose.Schema;

const genreschema = new schema({
	name: {type: String, required: true, minlength: 3, maxlength: 100}
});

// virtual genre url
genreschema
.virtual('url')
.get(function () {
	return '/catalog/genre/' + this._id;
});


module.exports = mongoose.model('genre', genreschema);
