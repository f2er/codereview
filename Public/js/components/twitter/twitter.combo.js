/*import from ./components/twitter/tweet.h.js,(by build.py)*/

/*
 * @fileoverview send events like twitter
 * @author　Akira
 * @version $version
 */
(function(){

	var EventTarget = QW.CustEventTarget,
		mix = QW.ObjectH.mix,
		g = QW.Dom.g;

	var eventTarget = CustEvent.createEvents({},[]);
	//var timeout = 200; //default timeout
	var receiveMap = {};
	
	eventTarget.on("*", function(evt){
		var type = evt.type;
		var sender = evt.sender;
		var receiveList = receiveMap[type] || [];

		for (var i = 0, len = receiveList.length; i < len; i++){
			var r = receiveList[i];
			mix(evt, {target:r.receiver, receiver:r.receiver}, true);
			r.callback.call(r.receiver, evt);
		}
	});

	var TweetH = {
		tweet : function(target, type, data){
			data = data || {};

			eventTarget.createEvents([type]);	//如果有需要，创建对应类型的事件
			eventTarget.fire(type, mix(data, {sender:target, type:type}));
		},
		receive : function(target, type, callback){

			var list = receiveMap[type] = receiveMap[type] || []; //创建对应事件的hash表
			list.push({receiver:target, callback:callback}); //将接收者存入列表
		}
	}

	QW.provide("TweetH",TweetH);
})();/*import from ./components/twitter/tweet_retouch.js,(by build.py)*/

(function(){
	var TweetH = QW.TweetH;

	QW.NodeW.pluginHelper(TweetH, 'operator');
})();