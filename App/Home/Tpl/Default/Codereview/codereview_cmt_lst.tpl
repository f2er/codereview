{%extends "Common/parent.tpl"%}

{%block "title" append%} - {%$title%}{%/block%}

{%block "page"%}
<div>
	{%$type_desc = ['star' => '我收藏的', 'my' => '我发起的', 'all' => '全部的']%}
	{%include "Common/inc/title.inc" content=$title%}
	{%include "Common/inc/notice.inc" content="共<span class='highlight'>`$comments_count.line`</span>处，<span class='highlight'>`$comments_count.comment`</span>个评论。&nbsp;&nbsp;<a href='{%U("codereview/codereview?id={%$codereview.id%}")%}'>查看详情</a>"%}
	<table class="data-table">
		<thead>
			<tr>
				<th style="width:6%">行号</th>
				<th>内容</th>
				<th style="width:10%">用户</th>
				<th style="width:10%">时间</th>
				<th style="width:6%">操作</th>
			</tr>
		</thead>
		<tbody>
		{%strip%}
		{%foreach $comments as $file => $item_file%}
			<tr style="background:#cbe5f2;">
				<td colspan="5" class="var-text">针对文件 <a target="_blank" href='{%U("codereview/codereview?id={%$codereview.id%}")%}?file={%$item_file.base64_file%}' class="highlight">{%$file%}</a> 的评论：</td>
			</tr>
			{%foreach $item_file.list as $item%}
			<tr>
				<td class="var-text"><a target="_blank" href='{%U("codereview/codereview?id={%$codereview.id%}")%}?file={%$item_file.base64_file%}&line={%$item.line%}'>第{%$item.line%}行</a></td>
				<td class="var-text">{%$item.content|escape:'html'%}</td>
				<td class="var-text">{%$item.User.username%}</td>
				<td class="var-text">{%$item.create_time%}</td>
				<td class="var-text"><a target="_blank" href='{%U("codereview/codereview?id={%$codereview.id%}")%}?file={%$item_file.base64_file%}&line={%$item.line%}'>查看</a></td>
			</tr>
			{%/foreach%}
		{%/foreach%}
		{%/strip%}
		</tbody>
	</table>
</div>
{%/block%}

{%block "page_js"%}
<script type="text/javascript">
W('.data-table').delegate('.delete', 'click', function(e) {
	e.preventDefault();
	var id = W(this).attr('data-id');
	MessageBox.confirm({ 
		caption : '提示', 
		content : '确定要删除这条记录？',
		onclose : function(e) {
			if(e.retVal == 1) {
				Ajax.post('{%U("codereview/codereview_delete")%}', {'id' : id}, function(txt) {
					var ret = Ajax.opResults(txt);
				});
			}
		}
	});
}).delegate('.favorite', 'click', function(e) {
	e.preventDefault();
	var el = W(this);
	var flag = el.attr('data-flag'),
		id = el.attr('data-id');
	Ajax.post('{%U("codereview/favorite_act")%}', {'act' : flag, 'obj_id' : id}, function(txt) {
		var ret = Ajax.opResults(txt, false);
		if(ret.status == 1) {
			el.html(flag == 'add' ? '取消收藏' : '收藏').attr('data-flag', flag == 'add' ? 'del' : 'add');
		}
	});
});
</script>
{%/block%}