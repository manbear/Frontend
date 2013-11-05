app.controller('code', function code($scope, $timeout, insight, fullscreen, snippets) {
	'use strict';
	$scope.code = "";
	var compilationInfo = [];
	var cmLeft, cmRight = null;


	$scope.fullscreen = function(){
		fullscreen.apply(true);
	}

	function updateMirrors(cm, f){
		var cur = cm.getCursor();
		var lines = $scope.code.split("\n");
		var pos = cur.ch;
		for (var i = 0; i < cur.line; i++){
			pos += lines[i].length + 1;
		}
		insight($scope.code, pos).then(f);        
	}

	CodeMirror.commands.autocomplete = function(cm) {
		updateMirrors(cm, function(data){
			$scope.insight = data.insight;
			CodeMirror.showHint(cm, function(cm, options){
				var inner = {from: cm.getCursor(), to: cm.getCursor(), list: data.completions};
				return inner;
			});                
		});
	};

	$scope.optionsCode = {
		extraKeys: {"Ctrl-Space": "autocomplete"},
		fixedGutter: false,
		lineNumbers: true,
		mode: 'text/x-scala',
		theme: 'solarized light',
		smartIndent: false,
		autofocus: true,
		autoCloseBrackets: true,
		onChange: function(cm) {
			updateMirrors(cm, function(data){
				$scope.insight = data.insight;
				compilationInfo = data.CompilationInfo;
			});
		},
		onScroll: function(cm) {
			if ($scope.cmLeft === null) {
				$scope.cmLeft = cm;
			}

			var scrollLeftInfo = cm.getScrollInfo();
			if ($scope.cmRight !== null) {
				$scope.cmRight.scrollTo(null, scrollLeftInfo['top']);
			}
		},
		onLoad: function(cm) {
			$scope.cmLeft = cm;
		}
	};
	$scope.optionsInsight = {
		fixedGutter: false,
		lineNumbers: true,
		mode: 'text/x-scala',
		theme: 'solarized light',
		readOnly: 'nocursor',
		onScroll: function(cm) {
			if($scope.cmRight === null) {
				$scope.cmRight = cm;
			}
			var scrollRightInfo = cm.getScrollInfo();
			if ($scope.cmLeft !== null) {
				$scope.cmLeft.scrollTo(null, scrollRightInfo['top']);
			}
		},
		onLoad: function(cm) {
			$scope.cmRight = cm;
		}
	};

	$scope.withInsight = true;
	$scope.toogleInsight = function() {
		$scope.withInsight = !$scope.withInsight;
	}

	$scope.publish = function(){
		snippets.save({code: $scope.code});
	}

	// (function() { /* The pace of the keyboard before sending data to the server */
	// 	$scope.isEditorPending = false;
	// 	$scope.editorPendingPromise = null;

	// 	function sendDataToServer() {
	// 		$scope.isEditorPending = false;
	// 		$scope.editorPendingPromise = null;
	// 	}

	// 	$scope.onEditorCodeChange = function() {
	// 		if ($scope.isEditorPending && $scope.editorPendingPromise != null) {
	// 			$timeout.cancel($scope.editorPendingPromise);
	// 			$scope.editorPendingPromise = $timeout(sendDataToServer, 2000);
	// 		} else {
	// 			$scope.isEditorPending = true;
	// 			$scope.editorPendingPromise = $timeout(sendDataToServer, 2000);
	// 		}
	// 		$scope.insightCode = "";
	// 	}
	// })();
});