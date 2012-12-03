if(!Ajax) {
	Ajax = {};
}
Ajax.Delay = 250;
Ajax.opResults = function(Results, url) {
	if(!Results) return false;
	
	if (typeof Results == "string") {
	
		if(Results.replace(/(\n|\r)+/g,"").trim().substr(0,1)!="{"){
			return Results;
		}
		else {
			try{
				eval("var ret=" + Results);
			}
			catch(e){
				alert("返回出错，返回的内容为：\n"+Results);
				return {"status":0, "info":"inter", "data" : null};
			}
		}
	}

	ret.isop = true;
	if(ret.status == 1) {
		if(url != false) {
			if(url){
				if(url === true) {
					setTimeout("window.location = window.location.href;window.location.reload(true);", Ajax.Delay);
				} else {
					setTimeout("window.location='"+url+"'",Ajax.Delay);
				}
			}
			else{
				if(ret.data == null || ret.data.retu == null){
					setTimeout("window.location = window.location.href;window.location.reload(true);", Ajax.Delay);
				}
				else{
					setTimeout("window.location='"+ret.data.retu+"'", Ajax.Delay);
				}
			}
		} else {
			ret.isop = false;
		}
	} else {
 		switch(ret.info){
			case "not_login":
				alert('保存失败！！！您需要登录后才能继续刚才的操作！');
			break; 		
			default:
				ret.isop = false;
		}
	}
  	return ret;
};