app.controller('code', function code($scope, $rootScope, $timeout, insight, fullscreen, snippets, user, throttle, errormessage) {
	'use strict';
	$scope.code = "// Welcome to Code Brew. Search for tutorial >>";
	var compilationInfo = [];
	var cmLeft, cmRight = null;
	$scope.mySnippets = [];

	$scope.init = function(){
		$scope.mySnippets = snippets.queryUser();
	}

	$rootScope.$on('selectedCode', function(event, code){
		if(code){
			$scope.code = [$scope.code, code].join('\n\n').trim();
		}
	});

	$scope.loggedIn = user.loggedIn;

	$scope.fullscreen = function(){
		fullscreen.apply(true);
	}

	// for the pending of the insight
	$scope.editorSending = {
		canShowInsight: true,
		numberOfChanges: 0
	};

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
		$scope.editorSending.canShowInsight = false;

		updateMirrors(cm, function(data){
			$scope.insight = data.insight;
			$scope.editorSending.canShowInsight = true;

			CodeMirror.showHint(cm, function(cm, options){
				var curFrom = cm.getCursor();
				var curTo = cm.getCursor();
				var lines = $scope.code.split("\n");
				//We need to find the boundaries of the word to replace once
				//we use the auto complete. Boundaries are set by finding the first
				//caracters on both side that isnt alphanumerical or '_'
				for (var i = curFrom.ch-1; i >= 0 
					&& /^[a-zA-Z0-9\_]$/.test(lines[curFrom.line][i]); i--){
					curFrom.ch = i;
				}
				for (var i = curTo.ch; i < lines[curTo.line].length
					&& /^[a-zA-Z0-9\_]$/.test(lines[curTo.line][i]); i++ ){
					curTo.ch = i + 1;
				}
				var inner = {from: curFrom, to: curTo, list: data.completions};
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
			$scope.editorSending.canShowInsight = false;

			throttle.event(function() {
				updateMirrors(cm, function(data) {
					$scope.insight = data.insight;
					compilationInfo = data.CompilationInfo;
					$scope.editorSending.canShowInsight = true;
				});
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

	$scope.hasSnippets = function(){
		return $scope.mySnippets.length > 0;
	}
	$scope.viewingMySnippets = false;
	$scope.toogleMySnippets = function(){
		$scope.viewingMySnippets = !$scope.viewingMySnippets;
	}

	$scope.insertSnippet = function(snippet){
		$scope.code = $scope.code + '\n' + snippet.code;
	};

	$scope.editSnippet = function(snippet){
		// save current ?
	};

	$scope.deleteSnippet = function(snippet){
		snippets.delete({id: snippet.id});
		$scope.mySnippets = $scope.mySnippets.filter(function(s){
			return s != snippet;
		})
	};

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

 	/* Make the squiggly line in the code editor for error message */    
    function SetErrorSquigglyLines(lineNumber, positionInit, rangeCharacters) {
      errormessage.waitingCodeMirror().then(function(codeMirror) {
      var markedText = codeMirror.markText({line: lineNumber, ch: positionInit}, {line: lineNumber, ch: rangeCharacters + positionInit });
      markedText.className = "error";
    });
  }
});