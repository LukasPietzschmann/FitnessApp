from bson.py3compat import b
from flask import Flask, request as req
from flask_restful import Api, Resource
from pymongo import MongoClient, errors
from hashlib import sha1
import json


app = Flask(__name__)
api = Api(app)


client = MongoClient("mongodb+srv://Lukas:thasSKfdalJHL@cluster0.si7sf.mongodb.net/Users?retryWrites=true&w=majority")
users = client.CDCTeamC.Users


def needs_authentication(func):
	def wrapper(*args, **kw):
		if (token := req.headers.get("token")) == None:
			return "No Token was spezified", 401
		print(f"Token: {token}")
		# TODO authenticate
		return func(*args, **kw)
	return wrapper


class User(Resource):
	@needs_authentication
	def get(self, user_id):
		res = users.find_one({"_id": user_id})
		if not res:
			return "No valid ID", 404
		return res, 200


	@needs_authentication
	def put(self, user_id):
		if not users.find_one({"_id": user_id}):
			return "No valid ID", 404
		body = req.get_json() if req.content_type == "application/json" else json.loads(req.get_data().decode("utf-8"))
		if hasattr(body, "uname") or "uname" in body:
			return "Username (uname) can't be updated", 400
		users.update_one({"_id": user_id}, {"$set": body})
		return self.get(user_id)



	@needs_authentication
	def delete(self, user_id):
		res = users.find_one({"_id": user_id})
		if res == 0:
			return "No Valid ID", 404
		else:
			users.delete_one({"_id": user_id})
			return res, 200



class Register(Resource):
	def post(self):
		body = req.get_json() if req.content_type == "application/json" else json.loads(req.get_data().decode("utf-8"))
		if not (hasattr(body, "uname") or "uname" in body):
			return "Missing Fields: A Username (uname) is required", 400

		uid = str(int(sha1(body["uname"].encode("utf-8")).hexdigest(), 16) % (10 ** 10))
		try:
			users.insert_one({
				"_id": uid,
				**body
			})
		except errors.DuplicateKeyError:
			return "Duplicate ID: Account name is already in Use", 400
		return {"uid": uid}, 200


class Login(Resource):
	def post(self):
		pass


class Logout(Resource):
	def post(self):
		pass


api.add_resource(User, '/user/<string:user_id>')
api.add_resource(Register, '/user')
api.add_resource(Login, '/login')


if __name__ == '__main__':
	app.run(debug=True)