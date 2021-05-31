import axios from 'axios';

const axiosInstance = axios.create({
	baseURL: process.env.REACT_APP_API_BASE,
	timeout: 2000
});

axiosInstance.interceptors.response.use(config => config, err => {
	if (err.code === 'ECONNABORTED')
		alert('The Connection timed out')
	return Promise.reject(err);
})

function hash(str) {
	var hash = 0, i, chr;
	if (str === 0)
		return "" + hash;
	for (i = 0; i < str.length; i++) {
		chr = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0;
	}
	return "" + hash;
}

export { axiosInstance, hash };