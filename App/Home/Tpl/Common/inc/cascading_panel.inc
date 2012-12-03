{%if !isset($panel_title)%}
	{%$panel_title = "选择一个文件"%}
{%/if%}

<div style="display:none">
	<div id="panel-cascading">
		<div id="panel-cascading-container" class="category-cascading-container">
			<ol class="category-cascading"></ol>
		</div>
		<div class="my-mantle-con-notice"><span class="icon">&nbsp;</span><span id="panel-cascading-result">请选择文件！</span></div>
		<div class="ft">
			<button data-f="1" class="panel-cascading-ok">本窗口打开</button>&nbsp;&nbsp;&nbsp;&nbsp;
			<button data-f="2" class="panel-cascading-ok">新窗口打开</button>&nbsp;&nbsp;&nbsp;&nbsp;
			<button class="panel-cascading-cancel">&nbsp;取&nbsp;&nbsp;消&nbsp;</button>
		</div>
	</div>
</div>
{%include file="Common/inc/cascading_js.inc"%}
<script type="text/javascript">
var dlgCascading = null, 
	oCascading = null, 
	oCascadingEl = null;

W('.btn_show_category_panel').click(function(e) {
	e.preventDefault();
	oCascadingEl = W(this);
	if(!dlgCascading) {
		dlgCascading = new Dialog({
			width:941,
			caption:"{%$panel_title%}",
			content:QW.g("panel-cascading")
		});
		new QW.SimpleDrag({oSrc:dlgCascading._panel,oHdl:dlgCascading._header});
	}
	var vals = W(this).attr('data-vals');
	if(!vals) { 
		vals = []; 
	} else {
		vals = vals.split('|');
	}
	oCascading = new CategoryCascading(W('#panel-cascading-container'), function() {
		var html = [], id = 0;
		html.push('已选择文件路径：');
		oCascading.selected.forEach(function(el) {
			html.push('&nbsp;/&nbsp;', el.name);
		});
		W('#panel-cascading-result').html(html.join(""));
	}, vals);
	dlgCascading.show();
});

W('.panel-cascading-cancel').click(function(e) {
	e.preventDefault();
	dlgCascading.hide();
});
</script>