angular.module('mainCtrl', [])
.controller('TestC', function($scope) {
	$scope.testV =  5;

})
.controller('MainController', function($rootScope, $location, Auth, $scope){

	var vm = this;
	vm.loggedIn=  Auth.isLoggedIn();
	console.log('cos tu musi sie dziac');
	$rootScope.$on('$routeChangeStart', function(event, next, current) {
		console.log('routeChangeStart');
		vm.loggedIn = Auth.isLoggedIn();
		Auth.getUser()
			.then(function(data) {
				// console.log('data: ' + data);
				vm.user = data.data;//[0];
			})
	})
	vm.doLogin=  function() {
		console.log('ctrl login')
		vm.processing = true;
		vm.error = '';
		Auth.login(vm.loginData.username, vm.loginData.password).then(function(data) {
			console.log('in auth')
			vm.processing = false;
			Auth.getUser()
				.then(function(data) {
					console.log('tesss ' + data.data);
					vm.user = data.data;
					if (data.success == false) {
						console.log('nie ma sukcesu')
						vm.err = data.message;
					} else {
						console.log('niech przejdzie')
						$location.path('/');
						
					}
				});
			
		})
	}

	vm.doLogout = function() {
		Auth.logout();
		$location.path('/logout');
	}

})


console.log('sssssss');