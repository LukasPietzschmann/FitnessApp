'''
Authors: Leon Schugk
'''

﻿# FIXME Behebe möglichen fehler mit Flask:
# https://github.com/flask-restful/flask-restful/pull/913
# import flask.scaffold
# flask.helpers._endpoint_from_view_func = flask.scaffold._endpoint_from_view_func
from flask import Flask, request as req
from flask_restful import Api, Resource
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient, errors
from os import environ as env
import re

app = Flask(__name__)
CORS(app, supports_credentials=True)
api = Api(app)

client = MongoClient(env.get("MONGODB_CON_STR"))
items = client.Shopping.Items


# This Class wraps all stored Items. The Resource is accessible under /shoppingsearch/<query>
class ShoppingItemSearch(Resource):
    # GET returns a List of all Items matching the Query.
    def get(self, query):
        tags = list(items.find({"tags": {"$regex": f".*{query}.*","$options": "-i"}}))
        names = list(items.find({"name": {"$regex": f".*{query}.*","$options": "-i"}}))
        res = []
        for i in tags:
            res.append(i)
        for z in names:
            if z not in res:
                res.append(z)
        return res, 200

api.add_resource(ShoppingItemSearch, '/shoppingsearch/<string:query>')

if __name__ == '__main__':
    load_dotenv()
    app.run(debug=True, port=env.get("SHOPPING_PORT"))