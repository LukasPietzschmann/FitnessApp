import axios from 'axios';

const axiosInstance = axios.create({
	baseURL: 'http://localhost:5000/',
	timeout: 2000
});

export { axiosInstance };