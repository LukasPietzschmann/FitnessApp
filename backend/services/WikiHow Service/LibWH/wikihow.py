from LibWH import errors
import requests
import bs4


WH_URL_BASE = "https://www.wikihow.com/api.php?format=json&action="


def get_id(url):
	url = url.replace("https://www.wikihow.com/", "")
	r = requests.get(f"{WH_URL_BASE}query&prop=info&titles={url}")
	data = r.json()
	pages = data["query"]["pages"]
	for key in pages.keys():
		article_id = pages[key]["pageid"]
	return article_id


def return_details(id):
	article_details = {}
	r = requests.get(f"{WH_URL_BASE}query&prop=info|templates|categories&inprop=url&pageids={id}")
	data = r.json()
	article_details["url"] = data["query"]["pages"][str(id)]["fullurl"]
	article_details["title"] = data["query"]["pages"][str(id)]["title"]
	if "templates" not in data["query"]["pages"][str(id)]:
		article_details["is_stub"] = False
	else:
		templates = data["query"]["pages"][str(id)]["templates"]
		if not any(d["title"] == "Template:Stub" for d in templates):
			article_details["is_stub"] = False
		else:
			article_details["is_stub"] = True
	if "categories" not in data["query"]["pages"][str(id)]:
		article_details["low_quality"] = True
	else:
		categories = data["query"]["pages"][str(id)]["categories"]
		if not any (d["title"] == "Category:Articles in Quality Review" for d in categories):
			article_details["low_quality"] = False
		else:
			article_details["low_quality"] = True
	return article_details


def search(query, max_results=10):
	search_results = []
	r = requests.get(f"{WH_URL_BASE}query&format=json&utf8=&list=search&srsearch={query}&srlimit={max_results}")
	data = r.json()
	if not data:
		raise errors.ParseError
	else:
		data = data["query"]["search"]
		search_results = [{"id": result["pageid"], "title": result["title"]} for result in data]
	return search_results


def get_images(id):
	images = []
	r = requests.get(f"{WH_URL_BASE}parse&prop=images&pageid={id}")
	data = r.json()
	image_list = data["parse"]["images"]
	if not image_list:
		raise errors.ParseError
	else:
		for i in image_list:
			im_data = requests.get(f"{WH_URL_BASE}query&titles=File:{i}&prop=imageinfo&iiprop=url")
			image_info = im_data.json()
			pages = image_info["query"]["pages"]
			for key in pages.keys():
				 image_url = pages[key]["imageinfo"][0]["url"]
			images.append(image_url)
	return images


def get_html(id):
	r = requests.get(f"{WH_URL_BASE}parse&prop=text&mobileformat&pageid={id}")
	data = r.json()
	html = data["parse"]["text"]["*"]
	return html


def parse_intro(id):
	html = get_html(id)
	soup = bs4.BeautifulSoup(html, "html.parser")
	intro_html = soup.find("div", {"class": "mf-section-0"})
	if not intro_html:
		raise errors.ParseError
	else:
		super = intro_html.find("sup")
		if super != None:
			for sup in intro_html.findAll("sup"):
				sup.decompose()
				intro = intro_html.text
				intro = intro.strip()
		else:
			intro = intro_html.text
			intro = intro.strip()
	return intro


def parse_steps(id):
	html = get_html(id)
	steps = []
	count = 1
	soup = bs4.BeautifulSoup(html, "html.parser")
	step_html = soup.find("div", {"class": "mf-section-1"})
	if not step_html:
		raise errors.ParseError
	else:
		super = step_html.find("sup")
		mwimage = step_html.find("div", {"class": "mwimg"})
		ul = step_html.find("ul")
		if super != None:
			for sup in step_html.findAll("sup"):
				sup.decompose()
		if mwimage != None:
			for div in step_html.findAll("div", {"class": "mwimg"}):
				div.decompose()
		if ul != None:
			for ul in step_html.findAll("ul"):
				ul.decompose()
		step_list = step_html.find("ol")
		if not step_list:
			raise errors.ParseError
		else:
			for li in step_list.findAll("li"):
				step_info = {}
				li = li.text
				step = li.split(".", 1)
				summary = step[0]
				summary = summary.strip()
				description = step[1]
				description = description.strip()
				step_info["summary"] = summary
				step_info["description"] = description
				steps.append(step_info)
				count += 1
	return steps