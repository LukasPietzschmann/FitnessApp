from hashlib import sha1
from flask import Flask, request as req
from flask_restful import Api, Resource
from pymongo import MongoClient, errors
from flask_cors import CORS
from os import environ as env
from dotenv import load_dotenv
import json

app = Flask(__name__)
CORS(app, supports_credentials=True)
api = Api(app)

client = MongoClient(env.get("MONGODB_CON_STR"))
units = client.Training.TrainingUnits
plans = client.Training.TrainingPlans
categories = client.Training.Category
users = client.GroupAndUser.User

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


class MakeWorkoutPlan(Resource):
    @needs_authentication
    def post(self):
        body = req.get_json() if req.content_type == "application/json" else json.loads(req.get_data().decode("utf-8"))
        if not "planname" in body or body["planname"] == "":
             return "A WorkoutPlanname (planname) is required", 400

        pid = str(int(sha1(body["planname"].encode("utf-8")).hexdigest(), 16) % (10 ** 10))
        try:
              plans.insert_one({
                "_id": pid,
                   **body
             })
        except errors.DuplicateKeyError:
             return "Duplicate ID: WorkoutPlanname is already in Use", 400
        return {"pid": pid}, 200

class WorkoutPlan(Resource):
    @needs_authentication
    def get(self, plan_id):
        res = plans.find_one({"_id": plan_id})
        if not res:
            return "No valid WorkoutPlanID", 404
        new_units = []
        for unit in res["units"]:
            udata = units.find_one({"_id": unit["_id"]})
            if(not udata):
                break
            new_units.append({**unit, **udata})
        res["units"] = new_units
        return res, 200

    @needs_authentication
    def put(self, plan_id):
        if not plans.find_one({"_id": plan_id}):
            return "No valid WorkoutPlanID", 404
        body = req.get_json() if req.content_type == "application/json" else json.loads(req.get_data().decode("utf-8"))
        plans.update_one({"_id": plan_id}, {"$set": body})
        return self.get(plan_id)

api.add_resource(WorkoutPlan, '/workoutPlan/<string:plan_id>')


class Categories(Resource):
    @needs_authentication
    def get(self):
        return list(categories.find())


class PlansInCategory(Resource):
    @needs_authentication
    def get(self, category_id):
        return list(plans.find({"category": category_id}))


api.add_resource(Categories, "/category")
api.add_resource(PlansInCategory, "/category/<string:category_id>")


if __name__ == '__main__':
    load_dotenv()
    app.run(debug=True, port=env.get("WORKOUT_PORT"))