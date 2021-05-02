from flask import Flask, request as req
from flask.helpers import make_response
from flask_restful import Api, Resource
from flask_cors import CORS
from pymongo import MongoClient, errors
from hashlib import sha1
import json
import secrets
import string


app = Flask(__name__)
CORS(app, supports_credentials=True)
api = Api(app)


client = MongoClient("mongodb+srv://Lukas:thasSKfdalJHL@cluster0.si7sf.mongodb.net/Users?retryWrites=true&w=majority")
users = client.CDCTeamC.Users


def needs_authentication(func):
	def authenticate(user_id, token) -> bool:
		res = users.find_one({"_id": user_id})
		if res and "tokens" in res and str(token) in res["tokens"]:
			return True
		return False

	def wrapper(*args, **kw):
		if (token := req.headers.get("token")) == None:
			return "No Token was spezified", 401
		if (uid := kw['user_id']) == None and (uid := args[1]) == None:
			return "No uid was spezified", 401
		if not authenticate(uid, token):
			return "No valid Token for the given uid", 401
		else:
			return func(*args, **kw)
	return wrapper


class User(Resource):
	@needs_authentication
	def get(self, user_id):
		res = users.find_one({"_id": user_id})
		if not res:
			return "No valid UserID", 404
		return res, 200


	@needs_authentication
	def put(self, user_id):
		if not users.find_one({"_id": user_id}):
			return "No valid UserID", 404
		body = req.get_json() if req.content_type == "application/json" else json.loads(req.get_data().decode("utf-8"))
		if "uname" in body:
			return "Username (uname) can't be updated", 400
		users.update_one({"_id": user_id}, {"$set": body})
		return self.get(user_id)


	@needs_authentication
	def delete(self, user_id):
		res = users.find_one({"_id": user_id})
		if res == 0:
			return "No Valid UserID", 404
		else:
			users.delete_one({"_id": user_id})
			return res, 200


class Register(Resource):
	def post(self):
		body = req.get_json() if req.content_type == "application/json" else json.loads(req.get_data().decode("utf-8"))
		print(type(body))
		if not "uname" in body or body["uname"] == "":
			return "A Username (uname) is required", 400
		if not "password" in body or body["password"] == "":
			return "A Password (passord) is required", 400

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
		body = req.get_json() if req.content_type == "application/json" else json.loads(req.get_data().decode("utf-8"))
		if not ("password" in body and "uname" in body):
			return "Password (password) and Username (uname) are required", 400
		uname = body["uname"]
		password = body["password"]
		res = users.find_one({"uname": uname})
		if not res:
			return "No valid Username", 400
		if not res["password"] == password:
			return "Wrong Password", 400
		token = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(10))
		users.update_one({"uname": uname}, {"$addToSet": {"tokens": token}})

		response = make_response({}, 200)
		response.set_cookie(key="Token", value=token, secure=False)
		response.set_cookie(key="UID", value=res["_id"], secure=False)
		return response


class Logout(Resource):
	@needs_authentication
	def post(self, user_id):
		res = users.find_one({"_id": user_id})
		if not res:
			return "No valid UserID", 404
		token = req.headers.get("token")
		users.update_one({"_id": user_id}, {"$pull": {"tokens": token}})
		return None, 200


api.add_resource(User, '/user/<string:user_id>')
api.add_resource(Register, '/user')
api.add_resource(Login, '/login')
api.add_resource(Logout, '/logout/<string:user_id>')


if __name__ == '__main__':
	app.run(debug=True)