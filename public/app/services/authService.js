angular.module('authService', [])
	.factory('Auth', function($http, $q, AuthToken) {
		var authFactory = {};

		authFactory.login = function(username, password) {
			console.log('auth login')
			return $http.post('/api/login', {
				username: username,
				password: password
			})
			.success(function(data) {
				console.log('success!???')
				AuthToken.setToken(data.token);
				return data;
			})
			.error(function(err) {
				console.log(err);
				return null;
			})
		}
		authFactory.logout = function() {
			AuthToken.setToken();
		}

		authFactory.isLoggedIn = function() {
			if (AuthToken.getToken()) {
				return true;
			} else {
				return false;
			}
		}

		authFactory.getUser = function() {
			if (AuthToken.getToken()) {
				// var config = {};
				// config.headers = [];
				// config = AuthInterceptor.request(config);
				console.log(AuthToken.getToken());
				return $http.get('/api/me'); 
			} else {
				return $q.reject({
					message: 'user has no token'
				})
			}
		}
		return authFactory;
	})
	.factory('AuthToken', function($window) {
		var authTokenFactory = {};
		authTokenFactory.getToken = function() {
			return $window.localStorage.getItem('token');
		}
		authTokenFactory.setToken = function(token) {
			if (token) {
				$window.localStorage.setItem('token', token);
			} else {
				$window.localStorage.removeItem('token');
			}
		}
		return authTokenFactory;
	})

	.factory("AuthInterceptor", function($q, $location, AuthToken) {
		var interceptorFactory = {};
		interceptorFactory.request = function(config) {
			var token = AuthToken.getToken();
			if (token) {
				config.headers['x-access-token'] = token;
			} 
			// else {
			// 	config.headers['x-access-token'] = 'dummy token';
			// }
			console.log('proba dodania tokena, token: ' + token);
			return config;
		}
		interceptorFactory.responseError = function(response) {
			console.log('tuuuuuuuuuuu');
			if (response.status == 403) {
				$location.path('/');
			}
			return $q.reject(response);
		}
		return interceptorFactory;
	})

// angular.module('authService').config(function($httpProvider) {
// 		$httpProvider.interceptors.push('AuthInterceptor');
// 	})