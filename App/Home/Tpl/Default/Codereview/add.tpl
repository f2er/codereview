{%extends "Common/parent.tpl"%}

{%block "title" append%} - {%$title%}{%/block%}

{%block "ex_css"%}
<style type="text/css">
	input {padding:3px 10px; font-size:14px;}
	p {margin:1em;}
</style>
{%/block%}

{%block "page"%}
<div>
	{%include "Common/inc/title.inc" content=$title%}
	<div>
		<form enctype="multipart/form-data" action="?" method="post">
			<p>标　题：<br /><span><span class="nstar"></span><input name="title" size="35" reqmsg="标题" maxlength="255"  /></span>&nbsp;&nbsp;&nbsp;&nbsp;<em></em></p>
			<p>文　件：<br /><span><span class="nstar"></span><input type="file" name="file" reqmsg="文件" size="35" /></span>&nbsp;&nbsp;&nbsp;&nbsp;<em>（目前只支持zip包上传）</em></p>
			<p>描　述：<br /><textarea name="content" rows="5" cols="28"></textarea></p>
			<input type="submit" value="提　交" /></p>
		</form>
	</div>
</div>
{%/block%}

{%block "page_js"%}
<script type="text/javascript">
W('form').submit(function(e) {
	e.preventDefault();
	if(Valid.checkAll(this)) {
		this.submit();
	}
});
</script>
{%/block%}