'''
Authors: Lukas Pietzschmann, Johannes Schenker, Vincent Ugrai, Leon Schugk
'''

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

# Decorater to authenticate a user.
# The function looks for a Token and UID in the Requests Header and checks if they are valid
# If this check doesn't pass an Error is returned to Request-Sender. Otherwise the Request gets executed.
def needs_authentication(func):
	def authenticate(user_id, token) -> bool:
		res = users.find_one({"_id": user_id})
		if res and "tokens" in res and str(token) in res["tokens"]:
			return True
		return False

	def wrapper(*args, **kw):
		if (token := req.headers.get("token")) == None:
			return "No Token was specified", 401
		uid = kw["user_id"] if "user_id" in kw else req.headers.get("uid")
		if uid == None:
			return "No uid was specified", 401
		if not authenticate(uid, token):
			return "No valid Token for the given uid", 401
		else:
			return func(*args, **kw)
	return wrapper

# This function is used to upload Images to the MS Azure Blob Storage. If this succeeds the Image-URL is returned.
def uploadBlob(image, name):
	blob_service_client = BlobServiceClient(env.get("BLOB_CON_STRING"))
	blob_client = blob_service_client.get_blob_client(container="images", blob=name)
	blob_client.upload_blob(base64.b64decode(image), overwrite=True)
	return f"https://fitnessappblob.blob.core.windows.net/images/{name}"


# This Class wraps the Users Name. The Resource is accessible under /user/<id>/name
class UserName(Resource):
	# GET returns the Users Name. This Req. doesn't need to be authenticated, as everybody should be able to resolve a UID to a Name.
	def get(self, user_id):
		res = users.find_one({"_id": user_id})
		if not res:
			return "No valid UserID", 404
		return res["uname"], 200

# This Class wraps the generall Users Info. The Resource is accessible under /user/<id>
# Every Request accessing this Resource has to be authenticated.
class User(Resource):
	# GET returns the ID, Username, Profilepicture, real Name, EMail, Adress, and Password
	# Also a GET returns the URL to other User related Resources.
	@needs_authentication
	def get(self, user_id):
		res = users.find_one({"_id": user_id})
		if not res:
			return "No valid UserID", 404
		del res["tokens"]
		return {**res, "groups" : "user/{user_id}/groups","plans" : "user/<string:user_id>/plans"}, 200

	# PUT lets you update everything GET returns, except the ID and Username.
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

	# DELETE deletes the User.
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


# This Class is used to register a new User. The Resource is accessible under /register
class Register(Resource):
	# POST registers a new User. It needs at minimum a uname (Username) and a Password.
	# If the Username is already taken, an Error is returned.
	# As a Profilepicture either a URL (img filed) or a Base64 encoded Image (rawImg filed) can be provided.
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

# This Class is used to login a User. The Resource is accessible under /login
class Login(Resource):
	# POST requires a uname (Username) and Password.
	# If both are valid, a token is generated and sent back together with the UID as a Cookie.
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

# This Class is used to logout a User. The Resource is accessible under /logout
class Logout(Resource):
	# POST needs to be authenticated. This operation invalidates the used Token.
	@needs_authentication
	def post(self, user_id):
		res = users.find_one({"_id": user_id})
		if not res:
			return "No valid UserID", 404
		token = req.headers.get("token")
		users.update_one({"_id": user_id}, {"$pull": {"tokens": token}})
		return None, 200

# This Class provides access to all Groups a User is a member of. The Resource is accessible under /user/<id>/groups
class GroupsWithUser(Resource):
	# GET needs to be authenticated and returns a list of all Groups the User is a member of.
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


# This Class provides access to all Workout-Plans a User works on. The Resource is accessible under /user/<id>/plan
# All Methods must be authenticated.
class UserPlanPack(Resource):
	# GET returns a List of all Workout-Plans a User works on.
	@needs_authentication
	def get(self, user_id):
		if not (res := users.find_one({"_id": user_id})):
			return "No valid UserID", 404
		if not "planPack" in res:
			return [], 200
		return res["planPack"], 200

	# POST adds a new Workout-Plan to the List. Therefor a valid pid (PlanID) has to be provided.
	@needs_authentication
	def post(self, user_id):
		if not (res := users.find_one({"_id": user_id})):
			return "No valid UserID", 404
		body = req.get_json() if req.content_type == "application/json" else json.loads(req.get_data().decode("utf-8"))
		if not "pid" in body:
			return "A PlanID (pid) id required", 400
		plan = requests.get(f"{env.get('API_BASE')}:5000/workoutPlan/{body['pid']}", headers={"uid": user_id, "Token": req.headers.get("Token")})
		if plan.status_code != 200: #TODO genauere Fehlerabfrage der Response. Bei 404 wollen wir auch 404 zurückgeben
			return "/user/<id>/plans konnte /workoutPlan/<id> nicht erreichen, oder es wurde ein unerwartetes Ergebnis zurück gegeben", 500
		plan = plan.json()
		plan["units"] = [{**unit, "finished": False} for unit in plan["units"]]
		users.update_one({"_id": user_id}, {"$addToSet": {"planPack": plan}})
		return None, 200


# This Class provides access to a specific Workout-Plan a User works on. The Resource is accessible under /user/<id>/plan/<id>
# All Methods must be authenticated.
class UserPlan(Resource):
	# GET retrieves Information about this specific Workout-Plan.
	@needs_authentication
	def get(self, user_id, plan_id):
		if not (res := users.find_one({"_id": user_id})):
			return "No valid UserID", 404
		if not "planPack" in res:
			return "No valid PlanID", 404
		for plan in res["planPack"]:
			if (p := plan["_id"]) == plan_id:
				return p
		return "No valid PlanID", 404

	# PUT can mark a specific Workout-Plan-Unit as done. A unit_id and finished field has to be provided.
	@needs_authentication
	def put(self, user_id, plan_id):
		if not (res := users.find_one({"_id": user_id})):
			return "No valid UserID", 404
		if not "planPack" in res:
			return "No valid PlanID", 404

		body = req.get_json() if req.content_type == "application/json" else json.loads(req.get_data().decode("utf-8"))
		if not "unit_id" in body:
			return "A unitID (unit_id) id required", 400
		if not "finished" in body:
			return "The finished Field is required", 400
		users.update_one(
			{"_id": user_id},
			{"$set": {"planPack.$[plan].units.$[unit].finished": body["finished"]}},
			array_filters=[{"unit._id": body["unit_id"]}, {"plan._id": plan_id}]
		)
		return users.find_one({"_id": user_id}), 200

	# DELETE deletes the Workout-Plan from the Users PlanPack.
	@needs_authentication
	def delete(self, user_id, plan_id):
		if not (res := users.find_one({"_id": user_id})):
			return "No valid UserID", 404
		if not "planPack" in res:
			return "No valid PlanID", 404
		users.update_one({"_id": user_id}, {"$pull": {"planPack": {"_id": plan_id}}})
		return None, 200


# Adds the paths to the API
api.add_resource(User, '/user/<string:user_id>')
api.add_resource(GroupsWithUser, '/user/<string:user_id>/groups') #FIXME hier vielleicht nen Post hinzufügen um den Benutzer zur Gruppe hinzuzufügen. Wie in /user/<id>/plans
api.add_resource(UserPlanPack, '/user/<string:user_id>/plan')
api.add_resource(UserPlan, '/user/<string:user_id>/plan/<string:plan_id>')
api.add_resource(UserName, '/user/<string:user_id>/name')
api.add_resource(Register, '/user')
api.add_resource(Login, '/login')
api.add_resource(Logout, '/logout/<string:user_id>')

# Decorater to check if the requesting User is a member of the desired Group.
# The function looks for a GroupID and UID in Functions Parameters and checks if they are valid.
# If this check doesn't pass an Error is returned to Request-Sender. Otherwise the Request gets executed.
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

# This Class wraps the generall Group Info. The Resource is accessible under /group/<id>
# Every Request accessing this Resource has to be authenticated and the requesting User has to be a Member of the Group.
class Group(Resource):
	# GET returns the ID, Groupname, Grouppicture and Members.
	# Also a GET returns the URL to other Group related Resources.
	@needs_authentication
	@needs_to_be_in_group
	def get(self, group_id):
		res = groups.find_one({"_id": group_id})
		if not res:
			return "No valid GroupID", 404
		if "planPack" in res:
			del res["planPack"]
		return {**res, "plans" : "group/<string:group_id>/plans"}, 200

	# PUT lets you update everything GET returns, except the ID and GroupName.
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

# This Class is responsible for creating new Groups. The Resource is accessible under /group
class MakeGroup(Resource):
	# POST is only accessible for an authenticated User. It expects at least a gname (Groupname).
	# If the Groupname is already taken, an Error is returned.
	# An Group Image can either be provided by a URL (img field) or a Base64 encoded Image (rawImg field).
	# The User creating the Group automatically gets added as a Member to it.
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
				"members": [request.headers.get("uid")]
			})
		except errors.DuplicateKeyError:
			return "Duplicate ID: Groupname is already in Use", 400
		return {"gid": gid}, 200

# This Class handels adding and removing users from groups. The Resource is accessible under /group/<string:group_id>/<user_id>
# All Methods require an authenticated User.
class AddUserToGroup(Resource):
	# POST adds the User to the Group.
	# Once a user is added, an Event is triggered, that can be received from a Webhook-Client.
	@needs_authentication
	def post(self, group_id, user_id):
		if not (group := groups.find_one({"_id": group_id})):
			return "No valid GroupID", 404
		if not users.find_one({"_id": user_id}):
			return "No valid UserID", 404
		groups.update_one({"_id": group_id}, {"$addToSet": {"members": user_id}})
		if("planPack" in group):
			groups.update_one({"_id": group_id}, {"$addToSet": {"planPack.$[].units.$[unit].finished": {"uid": user_id, "finished": False}}}, array_filters=[{"unit._id": {"$regex": ".*"}}])
		events.insert_one({"_id": str(datetime.datetime.now()), "target": "group.members.add", "body": {"member": user_id, "group": group_id}})
		return None, 200

	# DELETE removes the User from the Group.
	# If, after this Operation, theres no Member left in the Group, the Group gets deleted.
	# Once a User is removed, an Event is triggered, that can be received from a Webhook-Client.
	# To be able to leave a Group, the User has to be in the Group.
	@needs_authentication
	@needs_to_be_in_group
	def delete(self, group_id, user_id):
		if not (group := groups.find_one({"_id": group_id})):
			return "No valid GroupID", 404
		if not users.find_one({"_id": user_id}):
			return "No valid UserID", 404

		groups.update({"_id": group_id}, {"$pull": {"members": user_id}})
		if("planPack" in group):
			groups.update_one({"_id": group_id}, {"$pull": {"planPack.$[].units.$[unit].finished": {"uid": user_id}}}, array_filters=[{"unit._id": {"$regex": ".*"}}])
		events.insert_one({"_id": str(datetime.datetime.now()), "target": "group.members.remove", "body": {"member": user_id, "group": group_id}})
		test = group["members"]
		DeleteFlag = len(test)
		if(DeleteFlag == 1):
			groups.delete_one({"_id": group_id})

		return None, 200

# This Class wraps the Groups Name. The Resource is accessible under /group/<id>/name
class GroupName(Resource):
	# GET returns the Group Name. This Req. doesn't need to be authenticated, as everybody should be able to resolve a GID to a Name.
	def get(self, group_id):
		res = groups.find_one({"_id": group_id})
		if not res:
			return "No valid GroupID", 404
		return res["gname"], 200

# This Class wraps the Groups Picture. The Resource is accessible under /group/<id>/img
class GroupPicture(Resource):
	# GET returns the Group Picture. This Req. doesn't need to be authenticated, as everybody should be able to resolve a GID to a Picture.
	def get(self, group_id):
		res = groups.find_one({"_id": group_id})
		if not res:
			return "No valid GroupID", 404
		return res["img"], 200

# This Class provides access to all Workout-Plans a Group works on. The Resource is accessible under /group/<id>/plan
# All Methods must be authenticated and the User as to ne in the Group.
class GroupPlanPack(Resource):
	# GET returns a List of all Workout-Plans a Group works on.
	@needs_authentication
	@needs_to_be_in_group
	def get(self, group_id):
		if not (res := groups.find_one({"_id": group_id})):
			return "No valid GroupID", 404
		if not "planPack" in res:
			return [], 200
		return res["planPack"], 200

	# POST adds a new Workout-Plan to the List. Therefor a valid pid (PlanID) has to be provided.
	# This creates an Event that can be received by a WebSocket Client.
	@needs_authentication
	@needs_to_be_in_group
	def post(self, group_id):
		if not (res := groups.find_one({"_id": group_id})):
			return "No valid GroupID", 404
		body = req.get_json() if req.content_type == "application/json" else json.loads(req.get_data().decode("utf-8"))
		if not "pid" in body:
			return "A PlanID (pid) id required", 400
		plan = requests.get(f"{env.get('API_BASE')}:5000/workoutPlan/{body['pid']}", headers={"uid": req.headers.get("uid"), "Token": req.headers.get("Token")})
		if plan.status_code != 200: #TODO genauere Fehlerabfrage der Response. Bei 404 wollen wir auch 404 zurückgeben
			return "/group/<id>/plans konnte /workoutPlan/<id> nicht erreichen, oder es wurde ein unerwartetes Ergebnis zurück gegeben", 500
		plan = plan.json()
		plan["units"] = [{**unit, "finished": [{"uid": member, "finished": False} for member in res["members"]]} for unit in plan["units"]]
		groups.update_one({"_id": group_id}, {"$addToSet": {"planPack": plan}})
		events.insert_one({"_id": str(datetime.datetime.now()), "target": "group.plan.add", "body": {"group": group_id}})
		return None, 200


# This Class provides access to a specific Workout-Plan a Group works on. The Resource is accessible under /group/<id>/plan/<id>
# All Methods must be authenticated and the User has to be a member of the Group.
class GroupPlan(Resource):
	# GET retrieves Information about this specific Workout-Plan.
	@needs_authentication
	@needs_to_be_in_group
	def get(self, group_id, plan_id):
		if not (res := groups.find_one({"_id": group_id})):
			return "No valid GroupID", 404
		if not "planPack" in res:
			return "No valid PlanID", 404
		for plan in res["planPack"]:
			if plan["_id"] == plan_id:
				return plan
		return "No valid PlanID", 404

	# PUT can mark a specific Workout-Plan-Unit as done. A unit_id and finished field has to be provided.
	# This creates an Event that can be received by a WebSocket Client.
	@needs_authentication
	@needs_to_be_in_group
	def put(self, group_id, plan_id):
		if not (res := groups.find_one({"_id": group_id})):
			return "No valid GroupID", 404
		if not "planPack" in res:
			return "No valid PlanID", 404

		body = req.get_json() if req.content_type == "application/json" else json.loads(req.get_data().decode("utf-8"))
		if not "unit_id" in body:
			return "A unitID (unit_id) id required", 400
		if not "finished" in body:
			return "The finished Field is required", 400

		groups.update_one(
			{"_id": group_id},
			{"$set": {"planPack.$[plan].units.$[unit].finished.$[user].finished": body["finished"], "planPack.$[plan].units.$[unit].finished.$[user].timestamp": str(datetime.datetime.now())}},
			array_filters=[{"plan._id": plan_id}, {"unit._id": body["unit_id"]}, {"user.uid": (uid := req.headers.get("uid"))}] #TODO uid nicht aus dem header sondern body nehmen
		)
		events.insert_one({"_id": str(datetime.datetime.now()), "target": f"group.plan.finished.{'add' if body['finished'] else 'remove'}", "body": {"member": uid, "group": group_id, "plan": plan_id, "unit": body["unit_id"]}})
		return groups.find_one({"_id": group_id}), 200

	# DELETE deletes the Workout-Plan from the Groups PlanPack.
	# This creates an Event that can be received by a WebSocket Client.
	@needs_authentication
	@needs_to_be_in_group
	def delete(self, group_id, plan_id):
		if not (res := groups.find_one({"_id": group_id})):
			return "No valid GroupID", 404
		if not "planPack" in res:
			return "No valid PlanID", 404
		groups.update_one({"_id": group_id}, {"$pull": {"planPack": {"_id": plan_id}}})
		events.insert_one({"_id": str(datetime.datetime.now()), "target": "group.plan.remove", "body": {"group": group_id}})
		return None, 200


# Adds the paths to the API
api.add_resource(Group, '/group/<string:group_id>')
api.add_resource(MakeGroup, '/group')
api.add_resource(AddUserToGroup, '/group/<string:group_id>/<string:user_id>')
api.add_resource(GroupName, '/group/<string:group_id>/name')
api.add_resource(GroupPicture, '/group/<string:group_id>/img')
api.add_resource(GroupPlanPack, '/group/<string:group_id>/plan')
api.add_resource(GroupPlan, '/group/<string:group_id>/plan/<string:plan_id>')



if __name__ == '__main__':
	load_dotenv()
	app.run(host="0.0.0.0", debug=True, port=env.get("USER_GROUP_PORT"))