// angular.module("MyApp", ['mainCtrl', 'authService', 'appRoutes']);
angular.module("MyApp", ['appRoutes', 'authService', 'mainCtrl', 'userCtrl', 'userService', 'storyService', 'storyCtrl', 'reverseDirective'])

.config(function($httpProvider) {
	$httpProvider.interceptors.push('AuthInterceptor')
})

// angular.module("mainCtrl")
// 	.controller('test123', function() {
		
// 	})