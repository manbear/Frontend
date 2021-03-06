app.controller('header', function header($scope, $rootScope, user, snippets, scaladoc) {
	'use strict';

	$scope.user = user.get();
	$scope.loggedIn = user.loggedIn;

	$scope.profileOpen = false;
	$scope.outProfile = function(){
		$scope.profileOpen = false;
	}
	$scope.toogleProfile = function(){
		$scope.profileOpen = !$scope.profileOpen;
	}

	$scope.codemirrorOptions = {
		mode: 'text/x-scala',
		theme: 'solarizedsearch light',
		readOnly: 'true'
	};
	$scope.docs = [];
	$scope.snippets = [];
	$scope.all = [];

	$scope.search = function(term){
		if(term == '') {
			$scope.docs = [];
			$scope.snippets = [];
			$scope.all = [];
		} else {
			snippets.query({terms: term}, function(data){
				$scope.snippets = data;
				scaladoc.query(term).then(function(data){
					$scope.docs = data;
					$scope.all = $scope.snippets.concat($scope.docs);
				});
			});
		}
	};

	$scope.hasDocs = function(){
		return $scope.docs.length > 0;
	};

	$scope.hasSnippets = function(){
		return $scope.snippets.length > 0;
	};

	$scope.select = function(code){
		$scope.term = "";
		if(code){
			$rootScope.$emit('selectedCode', code);
		}
	};
});	