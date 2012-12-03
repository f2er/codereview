<script type="text/javascript">
function CategoryCascading() {
	this._init.apply(this, arguments);
};
CategoryCascading.url = "{%U('codereview/file_list')%}";

CategoryCascading.prototype = (function() {
	return {
		_init : function(container, callback, values) {
			this.container = container;
			this.callback = callback || function() {};
			this.values = values || [];
			this.loadding = false;
			this.selected = [];
			this.isleaf = 0;
			this.path = '';
			this.id = 0;
			this._intId = null;
			this._bindEvent();
			this._render("{%$id%}", 0);
			
			container.query('ol').html("");
			var newEl = Dom.create('<li class="item"><span class="loading">loading...</span></li>');
			container.query('ol').appendChild(newEl);
		},
		_itemClick : function(li) {
			var container = this.container, me = this;
			if(me.loadding) {
				MessageBox.alert({
						'caption' : '提示',
						'content' : '加载中，请稍后。。。',
						'icon': MB_ICON.WARNING
					});
				return false;
			}
			if(li.hasClass('selected')) {
				li.removeClass('selected');
				var step = parseInt(li.attr('data-step'));
				container.query('li.item').forEach(function(el, i) {
					if(step< i) {
						W(el).removeNode();
					}
				});
				if(step > 0) {
					var previous = me.selected[step - 1];
					me.selected = me.selected.slice(0, step);
					me.isleaf = previous.isleaf;
					me.id = previous.id;
					me.path = previous.path;
				} else {
					me.isleaf = 0;
					me.id = 0;
					me.selected = [];
					me.path = '';
				}
			} else {
				var ul = li.parentNode('ul');
				ul.query('.i_' + ul.attr('data-id')).removeClass('selected');
				var id = li.attr('data-id'),
					path = li.attr('data-path'),
					isleaf = parseInt(li.attr('data-isleaf')),
					step = parseInt(li.attr('data-step'));
				ul.attr('data-id', id);
				li.addClass('selected');
				container.query('li.item').forEach(function(el, i) {
					if(step< i) {
						W(el).removeNode();
					}
				});
				me.selected[step] = {id:id, path:path, name:W(li.query('span')[0]).html().stripTags()};
				me.isleaf = isleaf;
				me.path = path;
				me.id = id;
				me.selected = me.selected.slice(0, step+1);
				if(!isleaf) {
					me._render(path, step + 1);
				}
			}
			me.callback();
			return false;
		},
		_searchClick : function(li) {
			var me = this,
				text = li.query('input');
			if(text.val() == '输入关键字查询...') {
				text.val('');
			} else {
				text[0].select();
			}
			me._intId = setInterval(function() {
				var last = text.attr('data-last'),
					value = text.val();
					if(last != value) {
						text.attr('data-last', value);
						if(value.trim() == '') {
							li.parentNode('ul').query('li.i span').forEach(function(el) {
								W(el).parentNode('li').show();
							});
						} else {
							li.parentNode('ul').query('li.i span').forEach(function(el) {
								var el = W(el);
								if(el.html().stripTags().toLowerCase().indexOf(value.toLowerCase()) > -1) {
									W(el).parentNode('li').show();
								} else {
									W(el).parentNode('li').hide();
								}
							});
						}
					}
			}, 200);
		},
		_bindEvent : function() {
			var container = this.container, me = this;
			container.un('click');
			container.click(function(e) {
				e.preventDefault();
				if(me.values.length > 0) {return false;}
				var target = e.target;
				var li = W(target).parentNode('li');
				if(!li.length) {return false;}
				if(li.hasClass('i')) {
					me._itemClick(li);
				} else if(li.hasClass('s')) {
					me._searchClick(li);
				}
			});
		},
		_render : function(cid, step) {
			var container = this.container, me = this;

			if(step > 0) {
				var newEl = Dom.create('<li class="item"><span class="loading">loading...</span></li>');
				W(container.query('ol')[0]).appendChild(newEl);
			}

			var url = CategoryCascading.url + '?id={%$id%}&path=' + cid;
			this.loadding = true;
			Ajax.get(url, function(txt) {
				me.loadding = false;
				var ret = Ajax.opResults(txt, false),
					d = ret.data,
					html = [];
				html.push('<ul><li class="s"><input value="输入关键字查询..." /></li>');
				d.forEach(function(el) {
					var id = el['id'], 
						name = el['name'],
						path = el['path'],
						ext  = el['ext'],
						isleaf = el['isleaf'] ? 1 : 0,
						hascomment = el['comments'] | 0 ? 1 : 0;
					html.push('<li class="',isleaf ? (hascomment ? 'hascomment' : '') : "parent",' i i_',id,'" data-step="',step ,'" data-id="',id ,'" data-isleaf="',isleaf,'" data-path="',path ,'" >');

					var icon = 'folder';
					if(isleaf) {
						switch(ext) {
							case "tpl":
							case "inc":
							case "conf":
								icon = 'tpl';
								break;
							case "html":
							case "htm":
								icon = 'htm';
								break;
							case "js":
							case "xml":
							case "php":
								icon = ext;
								break;
							default:
								icon = 'file';
						}
					}
					html.push('<span title="',name,'"><nobr><em class="', icon ,'"></em>');
					html.push(name);
					html.push('</nobr></span></li>');
				});
				html.push('</ul>');
				var ul = W(container.query('li.item')[step]);
				ul.html(html.join(''));
				
				if(me.values && me.values[step]) {
					var el = null, val = me.values[step].trim();
					ul.query('.i').forEach(function(li) {
						li = W(li);
						if(li.query('span').html().stripTags().trim() == val) {
							el = li;
						}
					});
					if(!el) return false;
					setTimeout(function() {
						ul.set('scrollTop', el.get('offsetTop') - 50);
					}, 0);
					
					me._itemClick(el);
					if(me.values.length == step+1) {
						me.values = [];
					}
				}
			});
		}
	};
})();
</script>