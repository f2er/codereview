{%extends "Common/parent.tpl"%}

{%block "title" append%} - {%$title%}{%/block%}

{%block "ex_css"%}
{%load_css file="/highlighter/shCoreDefault.css"%}
<style type="text/css">
	#panel-comment-list h3 {padding:10px 0 0 10px;font-weight:bold;}
	#panel-comment-list-container {padding:10px 0 0 10px;height:380px;padding:10px;overflow-y:auto;}
	#panel-comment-add {background:#E8F0F2;border-radius:5px;margin:5px 0;}
	#panel-comment-add textarea {width:460px;height:135px;font-size:12px;}
	#panel-comment-add form {padding:10px;}

	#comment-list dl {padding:5px;}
	#comment-list dl.even {background:#E8F0F2;border-radius:5px;}
	#comment-list dt span {font-size:11px;color:#666;}
	#comment-list dt span.date {font-style:italic;}
	#comment-list dd {line-height:1.5;padding:0.5em 1em;}
	
	a.path {color:red;font-size:14px;}
	.panel-t1 .panel-content .hd h3 {cursor:move;}
	.drawline {position:absolute;font-size:1px;overflow:hidden;background:#6CE26C;}
	.corner {background:transparent;border-top:8px transparent solid;border-left:8px #6CE26C solid;border-bottom:8px transparent solid;border-right:0;}
	.proxy-dd {filter:alpha(opacity:30);opacity:0.3;zoom:1;background:#000;border:0;position:absolute;z-index:99999;}
</style>
{%/block%}

{%block name="ex_js"%}
	{%load_js file="/components/drag/drag_all.combo.js"%}
	{%load_js file="/highlighter/shCore.js"%}
	{%load_js file="/highlighter/shAutoloader.js"%}
{%/block%}

{%block "page"%}
	{%if !empty($file)%}
		{%$content = "点击行首的行号添加评论；行号高亮的行表示该行有评论数据。"%}
	{%else%}
		{%$content = "请先选择一个要Review的文件。"%}
	{%/if%}
	{%if !empty($favorite)%}
		{%$title = "`$title`&nbsp;&nbsp;<a href='#' class='act-favorite' data-flag='del'>[取消收藏]</a>"%}
	{%else%}
		{%$title = "`$title`&nbsp;&nbsp;<a href='#' class='act-favorite' data-flag='add'>[收藏]</a>"%}
	{%/if%}
	{%$more = "<form>创建于：{%$codereview.create_time%}</form>"%}
	{%include "Common/inc/title.inc"  content=$title more=$more%}
	{%include "Common/inc/notice.inc" content="`$content`&nbsp;&nbsp;<a href='{%U("codereview/codereview_cmt_lst?id={%$id%}")%}'>查看明细</a>"%}
	{%if !empty($file)%}
	<p class="desc">
		{%$file_sec = explode('/', $file)%}
		当前Review的文件： <a class="path btn_show_category_panel" href="#" title="点击选择新文件">根目录</a>
		{%foreach $file_sec as $sec%}
			{%if !empty($sec)%}
				{%if empty($cur_file_sec)%}
					{%$cur_file_sec = $sec%}
				{%else%}
					{%$cur_file_sec = "`$cur_file_sec`|`$sec`"%}
				{%/if%}
				 / <a data-vals="{%$cur_file_sec%}" class="path btn_show_category_panel" href="#" title="点击选择新文件">{%$sec%}</a>
			{%/if%}
		{%/foreach%} （点每一级路径都可以选择其它文件！）
		，<a target="_blank" href="/{%$_upload_dir%}/{%$id%}{%$file%}">在浏览器打开该文件</a>{%if !empty($codereview.zippath)%}，<a href="/{%$_upload_dir%}/_tmp/{%$codereview.zippath%}" target="_blank">源码包下载</a>{%/if%}
	</p>
	<p id="main_code">
		<button id="btn_toggle_lines">仅显示有评论的代码行</button>
		<textarea class="brush: {%$file_ext|default:'js'%}">{%$file_content|replace:'<':'&lt;'|default:'空文件'%}</textarea>
	</p>
	{%else%}
	<p>
		<button type="button" class="btn_show_category_panel">选择要Review的文件</button>
	</p>
	{%/if%}
{%/block%}

{%block "page_js"%}
<div style="display:none;">	
	<div id="panel-comment-list">
		<h3>第 <span class="highlight" id="panel-comment-list-line">10</span> 行共有 <span class="highlight" id="panel-comment-list-count">?</span> 条评论。<a href="#" class="comment-refresh">刷新评论列表？</a>&nbsp;&nbsp;<a href="#" class="comment-add">发表新的评论？</a></h3>
		<div id="panel-comment-list-container">
			<div id="panel-comment-list-content"></div>
			<div id="panel-comment-add">
				<form id="frmAddComment" action="{%U('codereview/comment_add')%}" method="post">
					<span><textarea id="comment-add-content" reqmsg="评论内容" name="content"></textarea></span><em>（1-2000字）</em>
					<input type="hidden" name="codereview_id" value="{%$id%}" />
					<input type="hidden" name="file" value="{%$file%}" />
					<input type="hidden" id="comment-add-line" name="line" value="" />
					<p><button id="panel-comment-add-ok">发表新评论</button></p>
				</form>
			</div>
		</div>
		<div class="ft"><button class="panel-close">&nbsp;关&nbsp;&nbsp;闭&nbsp;</button>（键盘ESC键也可以关闭哦~）</div>
	</div>
</div>

{%include "Common/inc/cascading_panel.inc" panel_title="请选择要Review的文件（文件加红表示已有Review数据）"%}

<script type="text/javascript">
var file = "{%$file%}", 
	id = "{%$id%}",
	default_lines = {%json_encode($lines)%},
	default_line = {%$default_line%},
	comment_url = "{%U('codereview/comment_list')%}",
	del_coment_url = "{%U('codereview/comment_delete')%}",
	favorite_act_url = "{%U('codereview/favorite_act')%}";

if(file.trim() == '') {
	W('.btn_show_category_panel').click();
}

function changeHighlight(arrLines, isAdd) {
	isAdd = isAdd === undefined ? true : isAdd;
	arrLines.forEach(function(line) {
		isAdd ? W('.gutter div.number' + line).addClass('highlighted') : W('.gutter div.number' + line).removeClass('highlighted');
	});
};

var panel_comment_list = new Dialog({
	modal : false,
	width : 660,
	caption : "查看评论",
	content : QW.g("panel-comment-list"),
	onbeforehide : function() {
		var line = W('#panel-comment-list-line').html();
		var count = W('#panel-comment-list-count').html() | 0;
		changeHighlight([line], count);	
		W('.drawline').hide();
	}
});
var panel_comment_list_drag = new QW.SimpleDrag({
		'oSrc' : panel_comment_list._panel,
		'oHdl' : panel_comment_list._header/*,
		'withProxy' : Browser.gecko*/
	});

function main() {
	function drawLine(line) {
		var el = W('.gutter div.number' + line),
			posDoc = Dom.getDocRect(),
			posNumber = el.getRect(),
			posPanel = W(panel_comment_list._panel).getRect();
		var drawlines = W('.drawline');
		if(!drawlines.length) {
			W(document.body).appendChild(Dom.create('<div class="drawline" id="dl1"></div><div class="drawline" id="dl2"></div><div class="drawline" id="dl3"></div><div class="drawline corner" id="dl4"></div>', true));
		}
		var distance = parseInt(posPanel.left - posNumber.right);
		setTimeout(function() {
			if(distance < 30) {
				drawlines.hide();
			} else {
				drawlines.show();
				var dl1 = W('#dl1'), dl2 = W('#dl2'), dl3 = W('#dl3'), dl4 = W('#dl4');
				var top1 = parseInt(posNumber.top + posNumber.height /2 - 2 ),
					top3 = parseInt(posPanel.top + posPanel.height /2 -14 ),
					top2 = Math.min(top1, top3);
				dl1.css('top', top1 + 'px')
					.css('left', parseInt(posNumber.right) + 'px')
					.css('width', '8px')
					.css('height', '4px');
				dl2.css('top', top2 + 'px')
					.css('left', parseInt(posNumber.right + 8) + 'px')
					.css('width', '4px')
					.css('height', Math.abs(top1 - top3) + 4 + 'px');
				dl3.css('top', top3 + 'px')
					.css('left', parseInt(posNumber.right + 8) + 'px')
					.css('width', distance - 13 + 'px')
					.css('height', '4px');
				dl4.css('top', parseInt(posPanel.top + posPanel.height /2 -20 ) + 'px')
					.css('left', parseInt(posPanel.left - 10) + 'px');
			}
		}, 1);
	};
	
	panel_comment_list_drag.ondrag = panel_comment_list_drag.ondragend = function() {
		var line = W('#panel-comment-list-line').html();
		drawLine(line);
	};

	var loadComments = function(scrollToEnd) {
		var line = W('#panel-comment-list-line').html();
		var el = W('#panel-comment-list-content').html('评论正在努力的加载中...');
		Ajax.post(comment_url, {'file' : file, 'id' : id, 'line' : line}, function(txt) {
			el.html(txt);
			var count = W('#comment-list').attr('data-count') | 0;
			W('#panel-comment-list-count').html(count);
			if(scrollToEnd) {
				var container = g('panel-comment-list-container');
				container.scrollTop = container.scrollHeight;
			}
		});
	};

	W('.gutter').delegate('.line', 'click', function(e) {
		e.preventDefault();
		if(panel_comment_list.isVisible()) {
			panel_comment_list.hide();
		}
		var el = W(this), line = el.html();
		el.addClass('highlighted');
		W('#panel-comment-list-line').html(line);
		W('#comment-add-line').val(line);
		panel_comment_list.show();
		loadComments();
		drawLine(line);
	});

	W('#panel-comment-list').delegate('.comment-refresh', 'click', function(e) {
		e.preventDefault();
		loadComments();
	}).delegate('.comment-add', 'click', function(e) {
		e.preventDefault();
		var container = g('panel-comment-list-container');
		container.scrollTop = container.scrollHeight;
		g('comment-add-content').focus();
	}).delegate('.comment-delete', 'click', function(e) {
		e.preventDefault();
		var comment_id = W(this).attr('data-id');
		MessageBox.confirm({ 
			caption : '提示', 
			content : '确定要删除这条评论？',
			onclose : function(e) {
				if(e.retVal == 1) {
					Ajax.post(del_coment_url, {'id' : comment_id}, function(txt) {
						loadComments();
					});
				}
			}
		});
	}).delegate('.panel-close', 'click', function(e) {
		e.preventDefault();
		panel_comment_list.hide();
	});

	W('#panel-comment-add-ok').click(function(e) {
		e.preventDefault();
		var frm = g('frmAddComment');
		if(Valid.checkAll(frm)) {
			Ajax.post(frm, function(txt) {
				var ret = Ajax.opResults(txt, false);
				if(ret.status == 1) {
					W('#comment-add-content').val('');
					loadComments(true);
				} else {
					if(!ret.isop) {
						MessageBox.alert({ 
							icon:MB_ICON.FAILURE, 
							caption:'添加失败',
							content:ret.info 
						});
					}
				}
			});
		}
	});

	W('#main_code').delegate('.line', 'mouseenter', function(e) {
		var number = this.className.replace(/.*number(\d+).*/, '$1');
		W('.code .number' + number).addClass('hover');
		W('.gutter .number' + number).addClass('hover');
		W(this).addClass('hover');
	}).delegate('.line', 'mouseleave', function(e) {
		var number = this.className.replace(/.*number(\d+).*/, '$1');
		W('.code .number' + number).removeClass('hover');
		W('.gutter .number' + number).removeClass('hover');
	});

	W('#btn_toggle_lines').click(function(e) {
		e.preventDefault();
		var btn = W(this);
		if(btn.html() == '仅显示有评论的代码行') {
			btn.html('显示所有代码行');
			var lines = [];
			W('.gutter .highlighted').forEach(function(el) {
				var number = el.className.replace(/.*number(\d+).*/, '$1') | 0;
				for(var i = number - 5; i < number + 5; i++) {
					lines.push(i);
				}
			});
			W('#main_code div.line').forEach(function(el) {
				var number = el.className.replace(/.*number(\d+).*/, '$1') | 0;
				if(!lines.contains(number)) {
					W.hide(el);
				}
			});
		} else {
			btn.html('仅显示有评论的代码行');
			W('#main_code div.line').show();
		}
	});

	if(default_line > 0) {
		W('.code .number' + default_line).addClass('hover');
		var doc = (Browser.firefox || Browser.ie) ? document.documentElement : document.body;
		W(doc).set('scrollTop', parseInt(W('.gutter .number' + default_line).getRect().top - 80));
	}
};

(function() {
	W('.act-favorite').click(function(e) {
		e.preventDefault();
		var el = W(this), 
			flag = el.attr('data-flag');
		Ajax.post(favorite_act_url, {'act' : flag, 'obj_id' : id}, function(txt) {
			var ret = Ajax.opResults(txt, false);
			if(ret.status == 1) {
				el.html(flag == 'add' ? '[取消收藏]' : '[收藏]').attr('data-flag', flag == 'add' ? 'del' : 'add');
			}
		});
	});

	W('.panel-cascading-ok').click(function(e) {
		e.preventDefault();
		if(!oCascading.isleaf) {
			MessageBox.alert({ 
				icon:MB_ICON.FAILURE, 
				caption:'请注意',
				content:'请选择一个 <span class="highlight">文件</span>，而 <span class="highlight">不是目录</span> 进行Review！'
			});
		} else {
			var url = '?file=' + oCascading.path;
			if(W(this).attr('data-f') == '1') {
				location.href = url;
			} else {
				window.open(url, '', '');
			}
		}
	});

	SyntaxHighlighter.config.tagName = 'textarea';
	SyntaxHighlighter.autoloader(
	  'actionscript3 as3		{%#js_site_url#%}/highlighter/shBrushAS3.js',
	  'bash shell				{%#js_site_url#%}/highlighter/shBrushBash.js',
	  'css						{%#js_site_url#%}/highlighter/shBrushCss.js',
	  'js jscript javascript	{%#js_site_url#%}/highlighter/shBrushJScript.js',
	  'php						{%#js_site_url#%}/highlighter/shBrushPhp.js',
	  'py python				{%#js_site_url#%}/highlighter/shBrushPython.js',
	  'c cpp					{%#js_site_url#%}/highlighter/shBrushCpp.js',
	  'java						{%#js_site_url#%}/highlighter/shBrushJava.js',
	  'properties conf ini log csv txt		{%#js_site_url#%}/highlighter/shBrushPlain.js',
	  'sql						{%#js_site_url#%}/highlighter/shBrushSql.js',
	  'xml xhtml xslt htm html tpl inc phtml	{%#js_site_url#%}/highlighter/shBrushXml.js'
	);
	SyntaxHighlighter.defaults['gutter'] = true;
	SyntaxHighlighter.defaults['toolbar'] = false;
	SyntaxHighlighter.defaults['quick-code'] = false;
	SyntaxHighlighter.defaults['auto-links'] = false;

	SyntaxHighlighter.all();

	var intId = setInterval(function() {
		if(W('.syntaxhighlighter').length) {
			clearInterval(intId);

			var lines = [];
			if(Object.isArray(default_lines)) {
				default_lines.forEach(function(item) {
					lines.push(item.line);
				});
			}
			changeHighlight(lines);
			main();
		}
	}, 100);
})();
</script>
{%/block%}