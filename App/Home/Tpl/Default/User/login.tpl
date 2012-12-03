{%extends "Common/parent.tpl"%}

{%block "doc_attr"%} id="doc1" class="bb-l160 bb-index"{%/block%}

{%block "title" append%} - 登录{%/block%}

{%block "content"%}
<div id='nav'>
	<form class="form" action="?" method="post">
		<div>
			<h2>请先登录</h2>
			<p>邮　箱：<br /><span><input name="email" size="35" reqmsg="邮箱" datatype="email" maxlength="255"  /></span>&nbsp;&nbsp;&nbsp;&nbsp;<em>（请输入你的邮箱）</em></p>
			<p>密　码：<br /><span><input type="password" name="password" size="35" reqmsg="密码" maxlength="255" /></span>&nbsp;&nbsp;&nbsp;&nbsp;<em>（请输入你的密码）</em></p>
			<p><input type="hidden" name="retu" value="{%$_env.get.retu|escape:'html'%}" />
			<input type="submit" value="提　交" />&nbsp;&nbsp;<a href="{%U('/user/reg')%}">注册新账号？</a></p>
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
					caption:'登录失败',
					content:ret.info 
				});
			}
		});
	}
});
</script>
{%/block%}