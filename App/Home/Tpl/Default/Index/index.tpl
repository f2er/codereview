{%extends "Common/parent.tpl"%}

{%block "doc_attr"%} id="doc1" class="bb-l160 bb-index"{%/block%}

{%block "content"%}
	{%strip%}
		<div id="home-ico">
			<div class='box'>
				<div class='content'>
					<a href="{%U('/codereview/index')%}" title="Code Review" class="c1">Code Review</a>
				</div>
			</div>
			<!--
			<div class='box'>
				<div class='content'>
					<a href="#" title="***" class="c6">占位</a>
				</div>
			</div>
			-->
		</div>
	{%/strip%}
{%/block%}