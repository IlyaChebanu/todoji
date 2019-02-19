/*
  This code processes and formats data
  And talks to the models

  -> Take in and process/validate request body, querystring, etc
  -> Call the models to get some data from the DB
  -> Format and send that data back as a response
*/
const http_errors = require('http-errors');
const post_user_schema = require('../helpers/validators/post-user');
const patch_user_schema = require('../helpers/validators/patch-user');
const user_model = require('../models/user');

module.exports = {
  async createUser(req, res, next) {
    try {
      // -> Validate request body
      const schema_errors = post_user_schema(req.body);
      if (schema_errors) {
        throw http_errors(400, schema_errors);
      }
      // -> Call the model
      await user_model.createUser(req.body);
      // -> End the request responding with a status 200
      res.status(200).end();
    } catch (error) {
      next(error);
    }
  },

  async getUser(req, res, next) {
    try {
      const userId = parseInt(req.query.id, 10);
      if (userId < 0) {
        throw http_errors(400, 'invalid user id');
      }
      const user = await user_model.getUser(userId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async getUsers(req, res, next) {
    try {
      const users = await user_model.getUsers();
      res.json({
        items: users
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req, res, next) {
    try {
      const userId = parseInt(req.query.id, 10);
      if (userId < 0) {
        throw http_errors(400, 'invalid user id');
      }
      await user_model.deleteUser(userId);
      res.status(200).end();
    } catch (error) {
      next(error);
    }
  },

  async patchUser(req, res, next) {
    try {
      const schema_errors = patch_user_schema(req.body);
      if (schema_errors) {
        throw http_errors(400, schema_errors);
      }
      const userId = parseInt(req.query.id, 10);
      if (userId < 0 ) {
        throw http_errors(400, 'invalid user id');
      }
      await user_model.patchUser(req.body, userId);
      res.status(200).end();
    } catch (error) {
      next(error);
    }
  }
}
