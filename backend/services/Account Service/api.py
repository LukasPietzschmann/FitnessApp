# FIXME Behebe möglichen fehler mit Flask:
# https://github.com/flask-restful/flask-restful/pull/913
# import flask.scaffold
# flask.helpers._endpoint_from_view_func = flask.scaffold._endpoint_from_view_func
import datetime
from flask import Flask, request as req
from flask.globals import request
from flask.helpers import make_response
from flask_restful import Api, Resource
from flask_cors import CORS
from pymongo import MongoClient, errors
from hashlib import sha1
from dotenv import load_dotenv
from os import environ as env
from azure.storage.blob import BlobServiceClient
import base64
import datetime
import json
import secrets
import string
import requests


app = Flask(__name__)
CORS(app, supports_credentials=True)
api = Api(app)


client = MongoClient(env.get("MONGODB_CON_STR"))
users = client.GroupAndUser.User
groups = client.GroupAndUser.Group
events = client.Events.Events

# Function to authenticate the logged in user, if required.
# authenticate checks if the submitted token of the user matched their user_id and returns true if it does and false if not. It's called by the wrapper.
# wrapper first checks if a token was given, then if a valid user_id was given. If both are true, it uses authenticate. If the user is successfully authenticated,
# the calling function will be executed and the result returned.
# If any of the checks returns false, a corresponding error code is returned to the caller. (Author: LP)
def needs_authentication(func):
	def authenticate(user_id, token) -> bool:
		res = users.find_one({"_id": user_id})
		if res and "tokens" in res and str(token) in res["tokens"]:
			return True
		return False

	def wrapper(*args, **kw):
		if (token := req.headers.get("token")) == None:
			return "No Token was spezified", 401
		uid = kw["user_id"] if "user_id" in kw else req.headers.get("uid")
		if uid == None:
			return "No uid was spezified", 401
		if not authenticate(uid, token):
			return "No valid Token for the given uid", 401
		else:
			return func(*args, **kw)
	return wrapper


def uploadBlob(image, name):
	blob_service_client = BlobServiceClient(env.get("BLOB_CON_STRING"))
	blob_client = blob_service_client.get_blob_client(container="images", blob=name)
	blob_client.upload_blob(base64.b64decode(image), overwrite=True)
	return f"https://fitnessappblob.blob.core.windows.net/images/{name}"


# Class containing a get function. Returns the Username belonging to a given user-id.
class UserName(Resource):
	def get(self, user_id):
		res = users.find_one({"_id": user_id})
		if not res:
			return "No valid UserID", 404
		return res["uname"], 200
	
# Class providing the get, put, and delete functionality for the User objects.
class User(Resource):
	# Uses needs_authentication and returns all data belonging to the specified user.
	# The list of groups and associated training plans are provided as links to the respecitve calls to save space in the reply.
	@needs_authentication
	def get(self, user_id): 
		res = users.find_one({"_id": user_id})
		if not res:
			return "No valid UserID", 404
		del res["tokens"]
		return {**res, "groups" : "user/{user_id}/groups","plans" : "user/<string:user_id>/plans"}, 200

	# Uses needs_authentication and updates the data of the specified user.
	@needs_authentication
	def put(self, user_id):
		if not users.find_one({"_id": user_id}):
			return "No valid UserID", 404
		body = req.get_json() if req.content_type == "application/json" else json.loads(req.get_data().decode("utf-8"))
		if "uname" in body:
			return "Username (uname) can't be updated", 400
		if "rawImg" in body:
			body["img"] = uploadBlob(body["rawImg"], f"{user_id}-user.png")
			del body["rawImg"]
		users.update_one({"_id": user_id}, {"$set": body})
		return self.get(user_id)

	# Uses needs_authentication and deletes the specified user.
	@needs_authentication
	def delete(self, user_id):
		res = users.find_one({"_id": user_id})
		if res == 0:
			return "No Valid UserID", 404
		else:
			groups = GroupsWithUser().get(user_id=user_id)[0]
			for group in groups:
				print(group)
			for gid in [group["_id"] for group in groups]:
				AddUserToGroup().delete(group_id=gid, user_id=user_id)
			users.delete_one({"_id": user_id})
			return res, 200

# Class used to register a new User.
# First reads out the body of the request and saves it into the variable body.
# Then it checks if the body contains both a Username and a Password. If either is missing, it respondes with an error and stops.
# If both are provided, it trys to create a new User in the database with the data from the request. 
# If the user-id is already in use, the function returns an error and stops. If no error is given, it returns the user_id.
class Register(Resource):
	def post(self):
		body = req.get_json() if req.content_type == "application/json" else json.loads(req.get_data().decode("utf-8"))
		if not "uname" in body or body["uname"] == "":
			return "A Username (uname) is required", 400
		if not "password" in body or body["password"] == "":
			return "A Password (passord) is required", 400

		uid = str(int(sha1(body["uname"].encode("utf-8")).hexdigest(), 16) % (10 ** 10))
		if "rawImg" in body:
			body["img"] = uploadBlob(body["rawImg"], f"{uid}-user.png")
			del body["rawImg"]
		try:
			users.insert_one({
				"_id": uid,
				**body
			})
		except errors.DuplicateKeyError:
			return "Duplicate ID: Account name is already in Use", 400
		return {"uid": uid}, 200

# This class handels logging in. 
# After loading the request body into the variable body, it first checks if it contains a Username and a Password, throwing an error if either or both are missing. 
# Then it loads the value of uname and password into variables of the same name. 
# Then it tries to load the user of the given name from the database. If the user doesn't exist, it throws an error.
# Then it checks if the submitted password matches the password in the database. If it doesn't, it throws an error.
# If the password is correct, the function creates a new token and adds it to the database. 
# It then creates the request to the caller, setting two cookies used for authoriation. These cookies are set to expire after around a year.
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

# This class handels the logout. 
# After checking that the caller has the right authorisation, it deletes the token of the current session from the list in the database.
class Logout(Resource):
	@needs_authentication
	def post(self, user_id):
		res = users.find_one({"_id": user_id})
		if not res:
			return "No valid UserID", 404
		token = req.headers.get("token")
		users.update_one({"_id": user_id}, {"$pull": {"tokens": token}})
		return None, 200

# This class returns a list of the groups a given user is a member of.
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


class UserPlan(Resource):
	@needs_authentication
	def get(self, user_id):
		if not (res := users.find_one({"_id": user_id})):
			return "No valid UserID", 404
		if not "plan" in res:
			return None, 200
		return res["plan"], 200

	@needs_authentication
	def post(self, user_id):
		if not (res := users.find_one({"_id": user_id})):
			return "No valid UserID", 404
		body = req.get_json() if req.content_type == "application/json" else json.loads(req.get_data().decode("utf-8"))
		if not "pid" in body:
			return "A PlanID (pid) id required", 400
		if "plan" in res:
			return "Plan could not be added, as there is already a plan", 428
		plan = requests.get(f"{env.get('API_BASE')}:5000/workoutPlan/{body['pid']}", headers={"uid": user_id, "Token": req.headers.get("Token")})
		if plan.status_code != 200: #TODO genauere Fehlerabfrage der Response. Bei 404 wollen wir auch 404 zurückgeben
			return "/user/<id>/plans konnte /workoutPlan/<id> nicht erreichen, oder es wurde ein unerwartetes Ergebnis zurück gegeben", 500
		plan = plan.json()
		plan["units"] = [{**unit, "finished": False} for unit in plan["units"]]
		users.update_one({"_id": user_id}, {"$set": {"plan": plan}})
		return None, 200

	@needs_authentication
	def put(self, user_id):
		if not (res := users.find_one({"_id": user_id})):
			return "No valid UserID", 404
		if not "plan" in res:
			return "No current Plan", 404

		body = req.get_json() if req.content_type == "application/json" else json.loads(req.get_data().decode("utf-8"))
		if not "unit_id" in body:
			return "A unitID (unit_id) id required", 400
		if not "finished" in body:
			return "The finished Field is required", 400
		users.update_one(
			{"_id": user_id},
			{"$set": {"plan.units.$[unit].finished": body["finished"]}},
			array_filters=[{"unit._id": body["unit_id"]}]
		)
		return users.find_one({"_id": user_id}), 200

	@needs_authentication
	def delete(self, user_id):
		if not (res := users.find_one({"_id": user_id})):
			return "No valid UserID", 404
		if not "plan" in res:
			return "No current Plan", 404
		users.update_one({"_id": user_id}, {"$unset": {"plan": ""}})


# Adds the paths to the API
api.add_resource(User, '/user/<string:user_id>')
api.add_resource(GroupsWithUser, '/user/<string:user_id>/groups') #FIXME hier vielleicht nen Post hinzufügen um den Benutzer zur Gruppe hinzuzufügen. Wie in /user/<id>/plans
api.add_resource(UserPlan, '/user/<string:user_id>/plan')
api.add_resource(UserName, '/user/<string:user_id>/name')
api.add_resource(Register, '/user')
api.add_resource(Login, '/login')
api.add_resource(Logout, '/logout/<string:user_id>')

# Wrapper that makes sure that the caller is a member of the given group.
def needs_to_be_in_group(func):
	def wrapper(*args, **kw):
		gid = kw["group_id"] if "group_id" in kw else (args[1] if len(args) >= 2 else None)
		uid = kw["user_id"] if "user_id" in kw else req.headers.get("uid")
		res = groups.find_one({"_id": gid})
		if res == None:
			return "No valid GroupID", 404
		if "members" in res and uid in res["members"]:
			return func(*args, **kw)
		return "The given User is no Member of the given Group", 400
	return wrapper

# This class handels groups.
class Group(Resource):
	# Function used to get the data of a group. Uses needs_authentication and needs_to_be_in_group.
	# First checks if the group_id from the request body is valid, returning an error if it isn't.
	# If it passes the checks, the functions returns the entry of the given group to the caller.
	@needs_authentication
	@needs_to_be_in_group
	def get(self, group_id):
		res = groups.find_one({"_id": group_id})
		if not res:
			return "No valid GroupID", 404
		return {**res, "groups" : "group/<string:group_id>/plans"}, 200

	# Function used to update the data of a group. Uses needs_authentication and needs_to_be_in_group.
	# First checks if the group_id from the request body is valid, returning an error it it isn't. 
	# Then it checks if the request body contains the group name, returning an error if it does. The reason for that is that the group name can't be changed.
	# If it doesn't contain the group name, it updates the entry of the group with the provided data and returns the group_id to the caller.
	@needs_authentication
	@needs_to_be_in_group
	def put(self, group_id):
		if not groups.find_one({"_id": group_id}):
			return "No valid GroupID", 404
		body = req.get_json() if req.content_type == "application/json" else json.loads(req.get_data().decode("utf-8"))
		if "gname" in body:
			return "Groupname (gname) can't be updated", 400
		if "rawImg" in body:
			body["img"] = uploadBlob(body["rawImg"], f"{group_id}-group.png")
			del body["rawImg"]
		groups.update_one({"_id": group_id}, {"$set": body})
		return self.get(group_id)

# This class handels the creation of new groups. Uses need_authentication. Loads the request body into a new variable. 
# Then it checks if the body contains a group name, returning an error if not. 
# If it does, it creates a group_id using the group name and then tries to insert the new group into the database.
# If the group_id is already in use, the function returns an error. Otherwise, it retunrs the group_id.
class MakeGroup(Resource):
	@needs_authentication
	def post(self):
		body = req.get_json() if req.content_type == "application/json" else json.loads(req.get_data().decode("utf-8"))
		if not "gname" in body or body["gname"] == "":
			return "A Groupname (gname) is required", 400

		gid = str(int(sha1(body["gname"].encode("utf-8")).hexdigest(), 16) % (10 ** 10))
		if "rawImg" in body:
			body["img"] = uploadBlob(body["rawImg"], f"{gid}-group.png")
			del body["rawImg"]
		try:
			groups.insert_one({
				"_id": gid,
				**body,
				"members": [request.headers.get("uid")] #FIXME das wirkt irgendwie nicht optimal die uid so zu bekommen
			})
		except errors.DuplicateKeyError:
			return "Duplicate ID: Groupname is already in Use", 400
		return {"gid": gid}, 200

# This class handels adding and removing users from groups.
class AddUserToGroup(Resource):
	# Function used to add a user to a group. Uses needs_authentication. 
	# First checks if the group_id and the user_id from the request body are valid, throwing corresponding errors if either aren't valid. 
	# If it passes the checks, the given user is added to the group.
	@needs_authentication
	def post(self, group_id, user_id):
		if not (group := groups.find_one({"_id": group_id})):
			return "No valid GroupID", 404
		if not users.find_one({"_id": user_id}):
			return "No valid UserID", 404
		groups.update_one({"_id": group_id}, {"$addToSet": {"members": user_id}})
		if("plan" in group):
			groups.update_one({"_id": group_id}, {"$addToSet": {"plan.units.$[unit].finished": {"uid": user_id, "finished": False}}}, array_filters=[{"unit._id": {"$regex": ".*"}}])
		events.insert_one({"_id": str(datetime.datetime.now()), "target": "group.members.add", "body": {"member": user_id, "group": group_id}})
		return None, 200
    
	# Function used to add a user to a group. Uses needs_authentication and needs_to_be_in_group.
	# First checks if the group_id and the user_id from the request body are valid, throwing corresponding errors if either aren't valid. 
	# If it passes the checks, the given user is removed to the group. 
	# After removing the user, the function tests how many people were in the group when the function was called. 
	# If there was only one member, the group would be empty at this point. In which case the group will be deleted. (Authors: and JS)
	@needs_authentication
	@needs_to_be_in_group
	def delete(self, group_id, user_id):
		if not (group := groups.find_one({"_id": group_id})):
			return "No valid GroupID", 404
		if not users.find_one({"_id": user_id}):
			return "No valid UserID", 404

		groups.update({"_id": group_id}, {"$pull": {"members": user_id}})
		if("plan" in group):
			groups.update_one({"_id": group_id}, {"$pull": {"plan.units.$[unit].finished": {"uid": user_id}}}, array_filters=[{"unit._id": {"$regex": ".*"}}])
		events.insert_one({"_id": str(datetime.datetime.now()), "target": "group.members.remove", "body": {"member": user_id, "group": group_id}})
		test = group["members"]
		DeleteFlag = len(test)
		if(DeleteFlag == 1):
			groups.delete_one({"_id": group_id})

		return None, 200

# Returns the name of the group with the specified group_id. (Author: JS)
class GroupName(Resource):
	def get(self, group_id):
		res = groups.find_one({"_id": group_id})
		if not res:
			return "No valid GroupID", 404
		return res["gname"], 200

# Enables the Front End to access the picture of a group. (Author: JS)
class GroupPicture(Resource):
	def get(self, group_id):
		res = groups.find_one({"_id": group_id})
		if not res:
			return "No valid GroupID", 404
		return res["img"], 200

class GroupPlan(Resource):
	@needs_authentication
	def get(self, group_id):
		if not (res := groups.find_one({"_id": group_id})):
			return "No valid GroupID", 404
		if not "plan" in res:
			return None, 200
		return res["plan"], 200

	@needs_authentication
	def post(self, group_id):
		if not (res := groups.find_one({"_id": group_id})):
			return "No valid GroupID", 404
		body = req.get_json() if req.content_type == "application/json" else json.loads(req.get_data().decode("utf-8"))
		if not "pid" in body:
			return "A PlanID (pid) id required", 400
		if "plan" in res:
			return "Plan could not be added, as there is already a plan", 428
		plan = requests.get(f"{env.get('API_BASE')}:5000/workoutPlan/{body['pid']}", headers={"uid": req.headers.get("uid"), "Token": req.headers.get("Token")})
		if plan.status_code != 200: #TODO genauere Fehlerabfrage der Response. Bei 404 wollen wir auch 404 zurückgeben
			return "/group/<id>/plans konnte /workoutPlan/<id> nicht erreichen, oder es wurde ein unerwartetes Ergebnis zurück gegeben", 500
		plan = plan.json()
		plan["units"] = [{**unit, "finished": [{"uid": member, "finished": False} for member in res["members"]]} for unit in plan["units"]]
		groups.update_one({"_id": group_id}, {"$set": {"plan": plan}})
		events.insert_one({"_id": str(datetime.datetime.now()), "target": "group.plan.add", "body": {"group": group_id}})
		return None, 200

	@needs_authentication
	def put(self, group_id):
		if not (res := groups.find_one({"_id": group_id})):
			return "No valid GroupID", 404
		if not "plan" in res:
			return "No current Plan", 404

		body = req.get_json() if req.content_type == "application/json" else json.loads(req.get_data().decode("utf-8"))
		if not "unit_id" in body:
			return "A unitID (unit_id) id required", 400
		if not "finished" in body:
			return "The finished Field is required", 400
		groups.update_one(
			{"_id": group_id},
			{"$set": {"plan.units.$[unit].finished.$[user].finished": body["finished"]}},
			array_filters=[{"unit._id": body["unit_id"]}, {"user.uid": (uid := req.headers.get("uid"))}] #TODO uid nicht aus dem header sondern body nehmen
		)
		events.insert_one({"_id": str(datetime.datetime.now()), "target": f"group.plan.finished.{'add' if body['finished'] else 'remove'}", "body": {"member": uid, "group": group_id, "unit": body["unit_id"]}})
		return groups.find_one({"_id": group_id}), 200

	@needs_authentication
	def delete(self, group_id):
		if not (res := groups.find_one({"_id": group_id})):
			return "No valid GroupID", 404
		if not "plan" in res:
			return "No current Plan", 404
		groups.update_one({"_id": group_id}, {"$unset": {"plan": ""}})
		events.insert_one({"_id": str(datetime.datetime.now()), "target": "group.plan.remove", "body": {"group": group_id}})

# Adds the paths to the API
api.add_resource(Group, '/group/<string:group_id>')
api.add_resource(MakeGroup, '/group')
api.add_resource(AddUserToGroup, '/group/<string:group_id>/<string:user_id>')
api.add_resource(GroupName, '/group/<string:group_id>/name')
api.add_resource(GroupPicture, '/group/<string:group_id>/img')
api.add_resource(GroupPlan, '/group/<string:group_id>/plan')



if __name__ == '__main__':
	load_dotenv()
	app.run(debug=True, port=env.get("USER_GROUP_PORT"))