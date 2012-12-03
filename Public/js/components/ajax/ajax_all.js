/*
 *	Copyright (c) 2010, Baidu Inc. All rights reserved.
 *	http://www.youa.com
 *	version: $version$ $release$ released
 *	author: quguangyu@baidu.com
 *  description: 为新平台定制的ajax
*/

(function() {
	var els=document.getElementsByTagName('script'), srcPath = '';
	for (var i = 0; i < els.length; i++) {
		var src = els[i].src.split(/components[\\\/]/g);
		if (src[1]) {
			srcPath = src[0];
			break;
		}
	}

	document.write(
		  '<script type="text/javascript" src="'+srcPath+'components/ajax/ajax.js"></script>'
		, '<script type="text/javascript" src="'+srcPath+'components/ajax/ajax.opresult.js"></script>'
	);
})();