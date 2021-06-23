/**
 * @author Lukas Pietzschmann
 */

function getBase64ImageData(url) {
	var img = new Image();
	img.setAttribute('crossOrigin', 'anonymous');
	let p = new Promise(resolve => {
		img.onload = function () {
			var canvas = document.createElement("canvas");
			canvas.width = this.width;
			canvas.height = this.height;
			var ctx = canvas.getContext("2d");
			ctx.drawImage(this, 0, 0);
			var dataURL = canvas.toDataURL("image/jpg");
			resolve(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
		}
	})
	img.src = url;
	return p;
}

export default getBase64ImageData;