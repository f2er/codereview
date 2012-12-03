<div id="comment-list" data-count="{%$data|count%}">
	{%foreach $data as $item%}
	<dl class="{%cycle values='even,'%}">
		<dt><span class="index">#{%$item@iteration%}</span> {%$item.User.username%} <span class="date">（{%$item.create_time%}）</span>：{%if $item.user_id == $_user.id%}<a href="#" class="comment-delete" data-id="{%$item.id%}" title="删除这条评论">x</a>{%/if%}</dt>
		<dd>{%$item.content|escape:'html'|nl2br%}</dd>
	</dl>
	{%foreachelse%}
	木有任何记录！
	{%/foreach%}
</div>