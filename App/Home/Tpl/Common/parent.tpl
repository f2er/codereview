{%extends file="Common/base.tpl"%}

{%block name="body"%}
<body>
	<div {%block name="doc_attr"%} id="doc1" class="bb-l160"{%/block%}>
		<div id="hd">
			{%block name="header"%}			
				<div>
					{%if isset($_sys_name)%}
						<a class="logo" href='{%U("$_sys_name/index")%}' title="返回{%$_sys_name%}首页"><img src="{%#css_site_url#%}/mis/images/logo.png" /></a>
					{%else%}
						<a class="logo" href='{%U("/index")%}' title="返回首页"><img src="{%#css_site_url#%}/mis/images/logo.png" /></a>
					{%/if%}
					<ul class='home-header'>
						{%if $_user.login%}
						<li class='first'>欢迎你，{%$_user.username%}！</li>
						<li><a href="{%U('/index/index')%}">首页</a></li>
						<li><a href="{%U('/user/edit')%}">修改个人信息</a></li>
						<li><a href="{%U('/user/logout')%}">退出系统</a></li>
						{%/if%}
					</ul>
				</div>
			{%/block%}
		</div>
		<div {%block name="bd_attr"%} id="bd"{%/block%} class="pback">
			{%block name="content"%}
				{%*菜单*%}
				<div class="bb-c" id="sidebar">
					<div style='padding:0.5em;text-align:center;'>
						<span class="btn btn-t1">
							<span>
								<a id='ea_btn' href="#">+ 展开</a>
							</span>
						</span> &nbsp; 
						<span class="btn btn-t1">
							<span>
								<a id='ca_btn' href="#">- 折叠</a>
							</span>
						</span>
					</div>
					<div class="menu-group">
						<ul id='menu_nav'>
							{%foreach $_menu as $k1=>$v1%}
							{%$_len=$v1|@count%}
							{%if $_len gt 0%}
							<li>
								<h3><span>{%$k1%}</span></h3>
								{%if isset($_cur_url)%}
									{%$cur_url=$_cur_url%}
								{%else%}
									{%$cur_url=$_env.url%}
								{%/if%}

								<ul>
									{%foreach $v1 as $k2=>$v2%}
									{%$menu_url=$v2%}
									{%$selected=false%}
									{%if $cur_url eq $menu_url%}
										{%$selected=true%}
									{%/if%}
									{%if isset($_menu_map) and isset($_menu_map[$cur_url]) and $_menu_map[$cur_url] eq $menu_url%}
										{%$selected=true%}
									{%/if%}
									<li{%if $selected%} class="selected"{%/if%}>
										<a href="{%$v2%}"{%if isset($_open_in_new[$v2]) and $_open_in_new[$v2] eq 1%} target="_blank"{%/if%}>{%$k2%}</a>
									</li>
									{%/foreach%}
								</ul>
							</li>
							{%/if%}
							{%/foreach%}
						</ul>
					</div>
				</div>
				{%*页面内容*%}
				<div id="bb-main">
					<div class="bb-c">				
							<div class="pm-wrap">
								<div id="submitStatus" style="display:none" class="status-notice">正在提交数据...</div>
								{%block name="page"%}{%/block%}
							</div>
					</div>
				</div>
				
			{%/block%}
		</div>
		{%block name="footer"%}
			<div id="ft">&copy;{%$smarty.now|date_format:'Y'%}&nbsp; <a href="http://imququ.com">ImQuQu.com</a></div>
		{%/block%}
	</div>

	{%block name="page_js"%}{%/block%}
	<script type="text/javascript">
		Dom.ready(function(){
			var ul_wrapper = W('.menu-group')[0];
			if( ul_wrapper ){
				var uls = DomU.pluckWhiteNode(ul_wrapper.childNodes);
				var aim_uls = ul_wrapper.getElementsByTagName('ul');
				var prev_li = null;
				
				var menu = g('menu_nav');
				NodeH.show(menu);

				var titles = menu.getElementsByTagName('h3');
				ArrayH.forEach(titles,function(title){
					W(title).on('click',function(e){
						var li = title.parentNode;
						if(NodeH.hasClass(li,'close'))
							toggleItem(li,1,title);
						else
							toggleItem(li,0,title);
					})
				});

				function toggleAll(menu_id,status/*0:collapse;1:expand*/){			
					var menu = g(menu_id);
					if( !menu ) return;
					var titles = menu.getElementsByTagName('h3');
					ArrayH.forEach(titles,function(title){
						var li = title.parentNode;
						toggleItem(li,status);
					});
				}
				function toggleItem(el,status/*0:collapse;1:expand*/,elTitle){
					if(status){
						NodeH.removeClass(el,'close');
					}
					else{
						NodeH.addClass(el,'close');
					}
				}

				W('#ea_btn').on('click',function(e){
					toggleAll("menu_nav",1);
					e.preventDefault();
				});

				W('#ca_btn').on('click',function(e){
					toggleAll("menu_nav",0);
					e.preventDefault();
				});
			}
		});
	</script>
</body>
{%/block%}