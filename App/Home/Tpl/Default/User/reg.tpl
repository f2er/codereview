{%extends "Common/parent.tpl"%}

{%block "doc_attr"%} id="doc1" class="bb-l160 bb-index"{%/block%}

{%block "title" append%} - 注册新用户{%/block%}

{%block "content"%}
<div id='nav'>
	<form class="form" action="?" method="post">
		<div>
			<h2>注册新账号</h2>
			<p>邮　箱：<br /><span><span class="nstar"></span><input name="email" size="35" reqmsg="邮箱" datatype="email" maxlength="255"  /></span>&nbsp;&nbsp;&nbsp;&nbsp;<em>（请输入你的邮箱）</em></p>
			<p>密　码：<br /><span><span class="nstar"></span><input id="txt_password" type="password" name="password" size="35" reqmsg="密码" maxlength="255" /></span>&nbsp;&nbsp;&nbsp;&nbsp;<em>（请牢记注册时填写的密码）</em></p>
			<p>重复密码：<br /><span><span class="nstar"></span><input type="password" reconfirmfor="txt_password" datatype="reconfirm" size="35" maxlength="255" /></span>&nbsp;&nbsp;&nbsp;&nbsp;<em>（请牢记注册时填写的密码）</em></p>
			<p>昵　称：<br /><span><span class="nstar"></span><input name="username" size="35" reqmsg="昵称" maxlength="255" /></span>&nbsp;&nbsp;&nbsp;&nbsp;<em>（任何可以代表你的昵称）</em></p>
			<p><input type="submit" value="提　交" />&nbsp;&nbsp;<a href="{%U('/user/login')%}">已经有账号，去登录？</a></p>
		</div>
	</form>
</div>
{%/block%}

{%block "page_js"%}
<script type="text/javascript">
W('form').submit(function(e) {
	e.preventDefault();
	if(Valid.checkAll(this)) {
		Ajax.post(this, function(txt) {
			var ret = Ajax.opResults(txt);
			if(!ret.isop) {
				MessageBox.alert({ 
					icon:MB_ICON.FAILURE, 
					caption:'注册失败',
					content:ret.info 
				});
			}
		});
	}
});
</script>
{%/block%}