

const moment = require('moment');

const mongoose = require('mongoose');

const schema = mongoose.Schema;

let authorschema = new schema(
{
	first_name: {type: String, required: true, maxlength: 100},
	family_name: {type: String, required: true, maxlength: 100},
	date_of_birth: {type: Date},
	date_of_death: {type: Date}
}
);

// virtual author full name
authorschema
.virtual('name')
.get(function () {
	let fullname = '';
	if (this.first_name && this.family_name){
		fullname = this.family_name +', '+ this.first_name
	}
	
	if (!this.first_name || !this.family_name){
		fullname = '';
	}
	
	return fullname;
});


// virtual author lifespan
authorschema
.virtual('lifespan')
.get(function (){
	let idate_of_birth = this.date_of_birth;
	idate_of_birth = (idate_of_birth ? moment(idate_of_birth).format('YYYY-MM-DD') : '');
	
	let idate_of_death = this.date_of_death;
	idate_of_death = (idate_of_death ? moment(idate_of_death).format('YYYY-MM-DD') : '');
	return ( idate_of_birth +' - ' + idate_of_death);
	//return (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString();
});


// virtual for author url
authorschema
.virtual('url')
.get(function () {
	return '/catalog/author/' + this._id;
});

// export model
module.exports = mongoose.model('author', authorschema);

