'''
Authors: Lukas Pietzschmann
'''

# import flask.scaffold
# flask.helpers._endpoint_from_view_func = flask.scaffold._endpoint_from_view_func
from flask import Flask, request as req
from flask_restful import Api, Resource
from flask_cors import CORS
from dotenv import load_dotenv
from os import environ as env
from LibWH import wikihow


app = Flask(__name__)
CORS(app, supports_credentials=True)
api = Api(app)


# This Class provides easy Access to the WikiHow Data.
class WikiHow(Resource):
	# GET returns a WikiHow Article matching the Query parsed into its single steps.
	def get(self, query):
		if len(obj := wikihow.search(query, max_results=1)) < 1:
			return None, 404
		obj = obj[0]
		steps = wikihow.parse_steps(obj["id"])
		return steps, 200


api.add_resource(WikiHow, '/wikiHow/<string:query>')


if __name__ == '__main__':
	load_dotenv()
	app.run(debug=True, port=env.get("WIKI_HOW_PORT"))