{%extends "Common/parent.tpl"%}

{%block "title" append%} - {%$title%}{%/block%}

{%block "page"%}
<div>
	{%$type_desc = ['star' => '我收藏的', 'my' => '我发起的', 'all' => '全部的']%}
	{%include "Common/inc/title.inc" content=$title%}
	{%include "Common/inc/notice.inc" content="`$type_desc[$type]`CodeReview共有 <span class='highlight'>`$data|count`</span> 条记录。<a href='{%U("codereview/add")%}'>发起新的CodeReview？</a>"%}
	<table class="data-table">
		<thead>
			<tr>
				<th style="width:5%">编号</th>
				<th style="width:15%">标题</th>
				<th>描述</th>
				<th style="width:10%">创建者</th>
				<th style="width:8%">统计</th>
				<th style="width:12%">操作</th>
			</tr>
		</thead>
		<tbody>
		{%strip%}
		{%foreach $data as $item%}
			<tr>
				<td class="var-text">{%$item.id%}</td>
				<td class="var-text"><a target="_blank" href='{%U("codereview/codereview?id={%$item.id%}")%}'>{%$item.title%}</a></td>
				<td class="var-text">{%$item.content%}</td>
				<td class="var-text">{%$item.User.username%}</td>
				<td class="var-text"><span class="highlight" title="Review点">{%$item.count.line%}</span> / <span class="highlight" title="Review总数">{%$item.count.comment%}</span></td>
				<td class="var-text">
					<a target="_blank" href='{%U("codereview/codereview?id={%$item.id%}")%}'>详情</a>&nbsp;&nbsp;
					<a target="_blank" href='{%U("codereview/codereview_cmt_lst?id={%$item.id%}")%}'>明细</a>
					<br />
					{%if !empty($item.zippath)%}
						<a href="/{%$_upload_dir%}/_tmp/{%$item.zippath%}" target="_blank">源码包</a><br />
					{%/if%}
					{%if !empty($item.favorite)%}
						<a href="#" data-flag="del" data-id="{%$item.id%}" class="favorite">取消收藏</a>&nbsp;&nbsp;
					{%else%}
						<a href="#" data-flag="add" data-id="{%$item.id%}" class="favorite">收藏</a>&nbsp;&nbsp;
					{%/if%}
					{%if $item.user_id == $_user.id%}
						<a href="#" data-id="{%$item.id%}" class="delete">删除</a>
					{%/if%}
				</td>
			</tr>			
		{%foreachelse%}
			<tr>
				<td colspan="6"><span class="highlight">木有任何记录！！！</span></td>
			</tr>
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