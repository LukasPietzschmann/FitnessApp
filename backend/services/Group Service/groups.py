from hashlib import sha1
from flask import Flask, request as req
from flask_restful import Api, Resource
from pymongo import MongoClient, errors
import json

app = Flask(__name__)
api = Api(app)

client = MongoClient("mongodb+srv://User1:1234@cdcteamc.oon82.mongodb.net/Benutzer?retryWrites=true&w=majority")
groups = client.Benutzer.Gruppen

class MakeGroup(Resource):
    def post(self):
        body = req.get_json() if req.content_type == "application/json" else json.loads(req.get_data().decode("utf-8"))
        if not "gname" in body:
            return "A Groupname (gname) is required", 400

        gid = str(int(sha1(body["gname"].encode("utf-8")).hexdigest(), 16) % (10 ** 10))

        try:
            groups.insert_one({
                "_id": gid,
                **body
            })
        except errors.DuplicateKeyError:
            return "Duplicate ID: Group name is already in Use", 400
        return {"uid": gid}, 200

class Group(Resource):

    def get(self, group_id):
        res_group = groups.find_one({"_id": group_id})
        if not res_group:
            return "No Valid ID", 404
        return res_group, 200

    def put(self, group_id):
        if not groups.find_one({"_id": group_id}):
            return "No valid GroupID", 404
        body = req.get_json() if req.content_type == "application/json" else json.loads(req.get_data().decode("utf-8"))
        if "gname" in body:
            return "Groupname (gname) can't be updated", 400
        groups.update_one({"_id": group_id}, {"$set": body})
        return self.get(group_id)

    def delete(self, group_id):
        res_group = groups.find_one({"_id": group_id})
        if res_group == 0:
            return "No Valid GroupID", 404
        else:
            groups.delete_one({"_id": group_id})
            return res_group, 200

api.add_resource(Group, '/group/<string:group_id>')
api.add_resource(MakeGroup, '/group')

if __name__ == '__main__':
    app.run(debug=True)