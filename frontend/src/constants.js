/**
 * @author Lukas Pietzschmann, Johannes Schenker, Leon Schugk
 *
 * This File contains some 'Helpers'.
 */

import axios from 'axios';

/**
 * This creates a global Instance of axios, with some initial Settings.
 */
const axiosInstance = axios.create({
	baseURL: `http://${window.location.hostname}:5000`,
	timeout: 2000
});

/**
 * This adds an interceptor to the axios Instance.
 * This Interceptor gets called on every Response and checks for Timeouts and Network-Errors.
 */
axiosInstance.interceptors.response.use(config => config, err => {
	if (err.message === 'Network Error')
		alert('It looks like some service hasn\'t been started yet')
	else if (err.code === 'ECONNABORTED')
		alert('The Connection timed out')
	return Promise.reject(err);
})

/**
 * This function hashes a String.
 * @param str The input String.
 * @returns the Hash of the input String.
 */
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