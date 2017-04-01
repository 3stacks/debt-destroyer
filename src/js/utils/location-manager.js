import queryString from 'query-string';

export default {
	hash(key, value) {
		const hashQueryString = queryString.parse(window.location.hash);

		// as a getter
		if (value === undefined) {
			return hashQueryString[key];
		}

		// as a setter
		else {
			window.location.hash = queryString.stringify({
				...hashQueryString,
				[key]: value
			});
		}
	}
};