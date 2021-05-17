from hashlib import sha1
from flask import Flask, request as req
from flask_restful import Api, Resource
from pymongo import MongoClient
from flask_cors import CORS
from dotenv import load_dotenv
from os import environ as env

app = Flask(__name__)
CORS(app, supports_credentials=True)
api = Api(app)

client = MongoClient(env.get("MONGODB_CON_STR"))
units = client.Training.TrainingUnits
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
 
    
class TrainingUnit(Resource):
    @needs_authentication
    def get(self, unit_id):
        res_trainingunit = units.find_one({"_id": unit_id})
        if not res_trainingunit:
            return "No Valid ID", 404
        return res_trainingunit, 200
    

api.add_resource(TrainingUnit, '/trainingUnits/<string:unit_id>')

if __name__ == '__main__':
    load_dotenv()
    app.run(debug=True)