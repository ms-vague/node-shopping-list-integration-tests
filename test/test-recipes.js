const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, closeServer, runServer} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('Recipes', function() {
	// activate server
	// returns a promise, return the promise with return runServer()
	// if no return promise, tests start running before server is started
	before(function() {
		return runServer();
	});

	// close server at the end of tests
	// error will occur if other tests still running
	after(function() {
		return closeServer();
	});

	it('should list recipes on GET', function() {
		// adding recipes from 'recipesRouter.js'
		return chai.request(app)
		.get('/recipes')
		.then(function(res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('array');

			res.body.length.should.be.at.least(1);

			// like shopping-list, recipes has key/value pairs
			// id, name, and ingredients
			const expectedKeys = ['id', 'name', 'ingredients'];
			res.body.forEach(function(item) {
				item.should.be.a('object');
				item.should.include.keys(expectedKeys);
			});
		});
	});

	it('should add an item on POST', function() {
		const newRecipe = {name: 'gumbo', ingredients: ['roux', 'rice', 'trinity', 'sausage', 'crabs', 'shrimp']};
		return chai.request(app)
		.post('/recipes')
		.send(newRecipe)
		.then(function(res) {
			res.should.status(201);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.include.keys('id', 'name', 'ingredients');
			res.body.name.should.equal(newRecipe.name);
			res.body.ingredients.should.be.a('array');
			res.body.ingredients.should.include.members(newRecipe.ingredients);
		});
	});

	it('should update recipes on PUT', function() {
		const updateData = {
			name: 'foo',
			ingredients: ['bizz', 'bang']
		};

		return chai.request(app)
		// get recipes see it can update the id
		.get('/recipes')
		.then(function(res) {
			updateData.id = res.body[0].id;

			return chai.request(app)
			.put(`/recipes/${updateData.id}`)
			.send(updateData)
		})
		.then(function(res) {
			res.should.have.status(200);
			res.should.be.a('object');
			res.body.should.include.keys('id', 'name', 'ingredients');
			res.body.name.should.equal(updateData.name);
			res.body.id.should.equal(updateData.id);
			res.body.ingredients.should.include.members(updateData.ingredients);
		});
	});

	it('should delete recipes on DELETE', function() {
		return chai.request(app)

		// get the recipes for the 'id' we want to delete
		.get('/recipes')
		.then(function(res) {
			return chai.request(app)
			.delete(`/recipes/${res.body[0].id}`)
		})
		.then(function(res) {
			res.should.have.status(204);
		});
	});
});