{%extends "Common/parent.tpl"%}

{%block "doc_attr"%} id="doc1" class="bb-l160 bb-index"{%/block%}

{%block "title" append%} - 修改账户信息{%/block%}

{%block "content"%}
<div id='nav'>
	<form class="form" action="?" method="post">
		<div>
			<h2>修改账户信息</h2>
			<p>昵　称：<br /><span><span class="nstar"></span><input name="username" size="35" reqmsg="昵称" value="{%$_user.username%}" maxlength="255" /></span>&nbsp;&nbsp;&nbsp;&nbsp;<em>（任何可以代表你的昵称）</em></p>
			<p>原密码：<br /><span><input name="oldpass" type="password" size="35" maxlength="255" /></span>&nbsp;&nbsp;&nbsp;&nbsp;<em>（不修改请留空）</em></p>
			<p>新密码：<br /><span><input id="txt_password" type="password" name="password" size="35" maxlength="255" /></span>&nbsp;&nbsp;&nbsp;&nbsp;<em>（请牢记修改后填写的密码）</em></p>
			<p>重复新密码：<br /><span><input type="password" reconfirmfor="txt_password" datatype="reconfirm" size="35" maxlength="255" /></span>&nbsp;&nbsp;&nbsp;&nbsp;<em>（请牢记修改后填写的密码）</em></p>
			<p><input type="submit" value="提　交" />&nbsp;&nbsp;<a href="javascript:history.back();">不改了？</a></p>
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
					caption:'提交失败',
					content:ret.info 
				});
			}
		});
	}
});
</script>
{%/block%}