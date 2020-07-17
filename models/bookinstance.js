

const moment = require('moment');

const mongoose = require('mongoose');

const schema = mongoose.Schema;

const bookinstanceschema = new schema({
	book: { type: schema.Types.ObjectId, ref: 'book', required: true },
	imprint: {type: String, required: true},
	status: {type: String, required: true, enum: ['Available','Maintenance','Loaned','Reserved'], default: 'Maintenance'},
	due_back: {type: Date, default: Date.now}
});

// virtual bookinstance url
bookinstanceschema
.virtual('url')
.get(function () {
	return '/catalog/bookinstance/' + this._id;
});


// virtual due back formatted
bookinstanceschema
.virtual('due_back_formatted')
.get(function(){
	return moment(this.due_back).format('MMMM Do, YYYY');
});


module.exports = mongoose.model('bookinstance', bookinstanceschema);
