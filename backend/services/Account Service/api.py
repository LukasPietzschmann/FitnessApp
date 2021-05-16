from flask import Flask, request as req
from flask.globals import request
from flask.helpers import make_response
from flask_restful import Api, Resource
from flask_cors import CORS
from pymongo import MongoClient, errors
from hashlib import sha1
from dotenv import load_dotenv
from os import environ as env
import json
import secrets
import string


app = Flask(__name__)
CORS(app, supports_credentials=True)
api = Api(app)


client = MongoClient(env.get("MONGODB_CON_STR"))
users = client.GroupAndUser.User
groups = client.GroupAndUser.Group


def needs_authentication(func):
	def authenticate(user_id, token) -> bool:
		res = users.find_one({"_id": user_id})
		if res and "tokens" in res and str(token) in res["tokens"]:
			return True
		return False

	def wrapper(*args, **kw):
		if (token := req.headers.get("token")) == None:
			return "No Token was spezified", 401
		uid = req.headers.get("uid") or (kw["user_id"] if "user_id" in kw else (args[1] if len(args) > 2 else None))
		if uid == None:
			return "No uid was spezified", 401
		if not authenticate(uid, token):
			return "No valid Token for the given uid", 401
		else:
			return func(*args, **kw)
	return wrapper


class UserName(Resource):
	def get(self, user_id):
		res = users.find_one({"_id": user_id})
		if not res:
			return "No valid UserID", 404
		return res["uname"], 200


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
		response.set_cookie(key="Token", value=token, secure=False, max_age=360 * 60 * 60 * 24)
		response.set_cookie(key="UID", value=res["_id"], secure=False, max_age=360 * 60 * 60 * 24)
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


class GroupsWithUser(Resource):
	@needs_authentication
	# FIXME Wenn im Header eine uid angegeben ist (mit dem korrekten Token) dann
	# lässt sich eine andere uid im Pfad angeben und somit lassen sich die
	# Gruppen anderer Benutzer abfragen
	def get(self, user_id):
		res = users.find_one({"_id": user_id})
		if not res:
			return "No valid UserID", 404
		gres = groups.find({"members": {"$elemMatch": {"$eq": user_id}}})
		return list(gres), 200


api.add_resource(User, '/user/<string:user_id>')
api.add_resource(GroupsWithUser, '/user/<string:user_id>/groups')
api.add_resource(UserName, '/user/<string:user_id>/name')
api.add_resource(Register, '/user')
api.add_resource(Login, '/login')
api.add_resource(Logout, '/logout/<string:user_id>')


def needs_to_be_in_group(func):
	def wrapper(*args, **kw):
		gid = kw["group_id"] if "group_id" in kw else (args[1] if len(args) > 2 else None)
		uid = req.headers.get("uid") or (kw["user_id"] if "user_id" in kw else (args[2] if len(args) > 3 else None))
		res = groups.find_one({"_id": gid})
		if res == None:
			return "No valid GroupID", 404
		if "members" in res and uid in res["members"]:
			return func(*args, **kw)
		return "The given User is no Member of the given Group", 400
	return wrapper


class Group(Resource):
	@needs_authentication
	@needs_to_be_in_group
	def get(self, group_id):
		res = groups.find_one({"_id": group_id})
		if not res:
			return "No valid GroupID", 404
		return res, 200


	@needs_authentication
	@needs_to_be_in_group
	def put(self, group_id):
		if not groups.find_one({"_id": group_id}):
			return "No valid GroupID", 404
		body = req.get_json() if req.content_type == "application/json" else json.loads(req.get_data().decode("utf-8"))
		if "gname" in body:
			return "Groupname (gname) can't be updated", 400
		groups.update_one({"_id": group_id}, {"$set": body})
		return self.get(group_id)


class MakeGroup(Resource):
	@needs_authentication
	def post(self):
		body = req.get_json() if req.content_type == "application/json" else json.loads(req.get_data().decode("utf-8"))
		if not "gname" in body or body["gname"] == "":
			return "A Groupname (gname) is required", 400

		gid = str(int(sha1(body["gname"].encode("utf-8")).hexdigest(), 16) % (10 ** 10))
		try:
			groups.insert_one({
				"_id": gid,
				**body,
				"members": [request.headers.get("uid")] #FIXME das wirkt irgendwie nicht optimal die uid so zu bekommen
			})
		except errors.DuplicateKeyError:
			return "Duplicate ID: Groupname is already in Use", 400
		return {"gid": gid}, 200


class AddUserToGroup(Resource):
	@needs_authentication
	def post(self, group_id, user_id):
		if not (group := groups.find_one({"_id": group_id})):
			return "No valid GroupID", 404
		if not users.find_one({"_id": user_id}):
			return "No valid UserID", 404
		groups.update_one({"_id": group_id}, {"$addToSet": {"members": user_id}})
		return None, 200

	@needs_authentication
	@needs_to_be_in_group
	def delete(self, group_id, user_id):
		if not (group := groups.find_one({"_id": group_id})):
			return "No valid GroupID", 404
		if not users.find_one({"_id": user_id}):
			return "No valid UserID", 404
	
		groups.update({"_id": group_id}, {"$pull": {"members": user_id}})
		test = group["members"]
		DeleteFlag = len(test)
		if(DeleteFlag == 1):
			groups.delete_one({"_id": group_id})
		#TODO wenn keine Benutzer mehr drin sind -> Gruppe löschen
		
		return None, 200


class GroupName(Resource):
	def get(self, group_id):
		res = groups.find_one({"_id": group_id})
		if not res:
			return "No valid GroupID", 404
		return res["gname"], 200

#Enables the Front End to access the picture of a group
class GroupPicture(Resource):
	def get(self, group_id):
		res = groups.find_one({"_id": group_id})
		if not res:
			return "No valid GroupID", 404
		return res["img"], 200

api.add_resource(Group, '/group/<string:group_id>')
api.add_resource(MakeGroup, '/group')
api.add_resource(AddUserToGroup, '/group/<string:group_id>/<string:user_id>')
api.add_resource(GroupName, '/group/<string:group_id>/name')
api.add_resource(GroupPicture, '/group/<string:group_id>/img')



if __name__ == '__main__':
	load_dotenv()
	app.run(debug=True, port=env.get("USER_GROUP_PORT"))