import axios from 'axios';

const axiosInstance = axios.create({
	baseURL: process.env.REACT_APP_API_BASE,
	timeout: 20000
});

export { axiosInstance };