// based on http://clintberry.com/2013/angular-js-websocket-service/
app.factory("scalaEval", ['$q', '$rootScope', "$location", function($q, $rootScope, $location) {
	var url;
	if($location.host() === "codebrew.io") {
		url = "wss://codebrew.io/eval";
	} else {
		url = "ws://localhost:9000/eval";
	}
	var socket = new WebSocket(url);
	var callbacks = {};
	var currentCallbackId = 0;
	var lastMessage = null;

	function getCallbackId() {
		currentCallbackId += 1;
		/* max: http://ecma262-5.com/ELS5_HTML.htm#Section_8.5*/
		if(currentCallbackId >= 9007199254740992 - 1) {
			currentCallbackId = 0;
		}
		return currentCallbackId;
	}

	function listener(data) {
		if(callbacks.hasOwnProperty(data.callback_id)) {
			$rootScope.$apply(callbacks[data.callback_id].resolve(data));
			delete callbacks[data.callback_id];
		}
    }

	socket.onmessage = function(message){
		listener(JSON.parse(message.data));
	};

	socket.onopen = function(){
		if(null !== lastMessage) {
			socket.send(lastMessage);
		}
	};

	function send(request, serviceName){
		var defer = $q.defer();
		var callbackId = getCallbackId();
		callbacks[callbackId] = defer;
		request[serviceName].callback_id = callbackId;

		if( socket.readyState === socket.CONNECTING ) {
			lastMessage = JSON.stringify(request)
		} else {
			socket.send(JSON.stringify(request));
		}
		
		return defer.promise;
	}

	return {
		"insight": function(code){
			return send({ "insight": {
				"code": code
			}}, "insight");
		},
		"autocomplete": function(code, position){
			return send({ "autocomplete": {
				"code": code,
				"position": position
			}}, "autocomplete");
		}
	};
}]);