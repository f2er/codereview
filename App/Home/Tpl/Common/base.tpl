{%config_load file="site.conf"%}
{%strip%}
{%*utils begin*%}
	{%function name=load_js file=""%}
		{%if $file != ''%}
			<script type="text/javascript" src="{%#js_site_url#%}{%$file%}{%#js_version#%}"></script>
		{%/if%}
	{%/function%}
	{%function name=load_css file=""%}
		{%if $file != ''%}
			<link href="{%#css_site_url#%}{%$file%}{%#css_version#%}" rel="stylesheet" type="text/css" media="screen">
		{%/if%}
	{%/function%}
	{%function name=build_query except=[]%}
		{%foreach name=m1 item=item key=key from=$_env.get%}
			{%if array_search($key, $except) === false%}
				{%if is_array($item)%}
					{%foreach $item as $val%}
					{%$val = html_entity_decode($val)%}
					{%assign var="val" value=$val|escape:"url"%}
					{%assign var="page_url" value="$page_url$key[]=$val&"%}
					{%/foreach%}
				{%else%}
					{%$item = html_entity_decode($item)%}
					{%assign var="item" value=$item|escape:"url"%}
					{%assign var="page_url" value="$page_url$key=$item&"%}
				{%/if%}
			{%/if%}
		{%/foreach%}
		{%$page_url%}
	{%/function%}
{%*utils end*%}
{%/strip%}
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>{%block name="title"%}奇舞团{%/block%}</title>
	{%block name="base_css"%}
		{%load_css file="/apps/bc-mis.css"%}
	{%/block%}

	{%block name="ex_css"%}

	{%/block%}
	
	{%block name="base_js"%}
		{%load_js file="/apps/qwrap.js"%}	
		{%load_js file="/components/ajax/ajax_all.combo.js"%}	
		{%load_js file="/components/panel/panel.js"%}	
		{%load_js file="/components/valid/valid.js"%}	
	{%/block%}
	
	{%block name="ex_js"%}
	{%/block%}
</head>

{%block name="body"%}
<body>
</body>
{%/block%}
</html>