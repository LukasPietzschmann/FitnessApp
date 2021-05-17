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

export { axiosInstance };