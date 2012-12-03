{%extends "Common/parent.tpl"%}

{%block "title" append%} - CodeReview首页{%/block%}

{%block "page"%}
<p>这是CodeReview首页~</p>
<p>你可以 <a href="{%U('codereview/lst?t=star')%}">查看我收藏的CodeReview</a>，或者 <a href="{%U('codereview/add')%}">发起新的CodeReview</a>。</p>
{%/block%}