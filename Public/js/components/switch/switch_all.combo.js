/*import from ./components/switch/switch.js,(by build.py)*/

void function () {
	var O = QW.ObjectH, C = QW.ClassH, E = QW.CustEvent, ETH = QW.EventTargetH, EH = QW.EventH, DU = QW.DomU, NH = QW.NodeH;

	/**
	 * @class Switch	切换类
	 * @namespace	Switch
	 */
	var Switch = function () {
		
		/**
		 * @property list	列表
		 * @type	{Array}
		 */
		this.list = [];

		/**
		 * @property index	当前下标
		 * @type	{int}
		 */
		this.index = -1;
		this.initialize.apply(this, arguments);
	};

	/**
	 * @event beforeswitch	切换前
	 * @param	{CustEvent}	e	事件实例<br>
		e.from			切换前元素<br>
		e.to			切换后元素
	 */

	/**
	 * @event afterswitch	切换后
	 * @param	{CustEvent}	e	事件实例<br>
		e.from			切换前元素<br>
		e.to			切换后元素
	 */
	Switch.EVENTS = { beforeswitch : 'beforeswitch', afterswitch : 'afterswitch', beforerepeatswitch : 'beforerepeatswitch', afterrepeatswitch : 'afterrepeatswitch' };

	O.mix(Switch.prototype, function () {
		return {
			initialize : function (options) {
				var events = [];
				for (var i in Switch.EVENTS) events.push(Switch.EVENTS[i]);
				E.createEvents(this, events);

				O.mix(this, options || {}, true);
			},

			/**
			 * @method insert 插入元素
			 * @override
			 * @param	{item}	item	元素
			 * @param	{int}	index	下标
			 * @return	{item}
			 */
			insert : function (item, index) {
				//index = index % (this.list.length + 1);
				index = Math.max(Math.min(this.list.length), 0);
				if (index < this.index) {
					++ this.index;
				}
				this.list.splice(index, 0, item);
				return item;
			},

			/**
			 * @method remove 移除元素
			 * @override
			 * @param	{int}	index	下标
			 * @return	{item}
			 */
			remove : function (index) {
				if (!this.list.length) return null;
				//index = index % this.list.length;
				index = Math.max(Math.min(this.list.length - 1), 0);

				var result = this.list[this.index];
				if (index < this.index) {
					-- this.index;
				} else if (index == this.index) {
					this.index = -1;
				}
				this.list.splice(index, 1);
				return result;
			},


			/**
			 * @method switchTo 切换到
			 * @param	{int}	index	下标
			 * @return	{void}
			 */
			switchTo : function (index) {
				if (!(this.list.length && index < this.list.length)) return;

				this.index = index;
			},

			/**
			 * @method indexOf 根据元素查找下标
			 * @param	{item}	item	元素
			 * @return	{int}
			 */
			indexOf : function (item) {
				for (var i = 0, l = this.list.length ; i < l ; ++ i) {
					if (this.list[i] == item) return i;
				}
				return -1;
			},

			/**
			 * @method item 根据下表找到元素
			 * @param	{int}	index	下标
			 * @return	{item}
			 */
			item : function (index) {
				if (this.list.length == 0 || index < 0) return null;
				return this.list[index % this.list.length] || null;
			},

			/**
			 * @method getCurrent 获取当前选中元素
			 * @return	{item}
			 */
			getCurrent : function () {
				return this.item(this.index);
			},

			/**
			 * @method getLast 获取最后的元素
			 * @return	{item}
			 */
			getLast : function () {
				return this.item(this.list.length - 1);
			},

			/**
			 * @method getFirst 获取开头的元素
			 * @return	{item}
			 */
			getFirst : function () {
				return this.item(0);
			},

			/**
			 * @method _dispatch 派发事件
			 * @private
			 * @param	{string}	type	事件名
			 * @param	{int}		from	上次选中的下标
			 * @param	{int}		to		当前下标
			 * @return	{bool}	事件执行结果
			 */
			_dispatch : function (type, from, to) {
				var _e = new E(this, type);
				
				O.mix(_e, {
					from : this.item(from),
					to : this.item(to)
				});

				return this.fire(_e);
			},

			/**
			 * @method dispatchBeforeSwitch 派发切换前事件
			 * @param	{int}	from		上次选中的下标
			 * @param	{int}	to			当前下标
			 * @return	{bool}	事件执行结果
			 */
			dispatchBeforeSwitch : function (from, to) {
				return this._dispatch(Switch.EVENTS.beforeswitch, from, to);
			},

			/**
			 * @method dispatchAfterSwitch 派发切换后事件
			 * @param	{int}	from		上次选中的下标
			 * @param	{int}	to			当前下标
			 * @return	{bool}	事件执行结果
			 */
			dispatchAfterSwitch : function (from, to) {
				return this._dispatch(Switch.EVENTS.afterswitch, from, to);
			},

			/**
			 * @method dispatchBeforeRepeatSwitch 派发重复切换前事件
			 * @param	{int}	from		上次选中的下标
			 * @param	{int}	to			当前下标
			 * @return	{bool}	事件执行结果
			 */
			dispatchBeforeRepeatSwitch : function (from, to) {
				return this._dispatch(Switch.EVENTS.beforerepeatswitch, from, to);
			},
			
			/**
			 * @method dispatchAfterRepeatSwitch 派发重复切换后事件
			 * @param	{int}	from		上次选中的下标
			 * @param	{int}	to			当前下标
			 * @return	{bool}	事件执行结果
			 */
			dispatchAfterRepeatSwitch : function (from, to) {
				return this._dispatch(Switch.EVENTS.afterrepeatswitch, from, to);
			}
		};
	}());

	/**
	 * @class ElementSwitchItemEntity	实体类
	 * @namespace	Switch
	 */
	var ElementSwitchItemEntity = function () {
		
		/**
		 * @property	nav		标题
		 * @type		{HTMLElement}
		 */
		this.nav = null;

		/**
		 * @property	content		内容
		 * @type		{HTMLElement}
		 */
		this.content = null;

		/**
		 * @property	disabled		禁止
		 * @type		{bool}
		 */
		this.disabled = false;

		/**
		 * @property	events		触发切换的事件列表
		 * @type		{Array}
		 */
		this.events = [];

		/**
		 * @property	cancelDelayEvents		有延迟时的取消触发切换事件
		 * @type		{Array}
		 */
		this.cancelDelayEvents = [];

		/**
		 * @property	immediateEvents		立即触发切换的事件列表
		 * @type		{Array}
		 */
		this.immediateEvents = [];

		/**
		 * @property	handlers		事件委托缓存(组建维护)
		 * @type		{Hashtable}
		 */
		this.handlers = {};
		/**
		 * 注:虽然没有用程序保证,不过这两组事件里不允许有交集
		 */
		this.initialize.apply(this, arguments);
	};

	O.mix(ElementSwitchItemEntity.prototype, function () {
		return {
			initialize : function (options) {
				O.mix(this, options, true);
			}
		};
	}());

	/**
	 * @method parse	转化json为实例
	 * @static
	 */
	ElementSwitchItemEntity.parse = function (options) {
		return options.nav && new this(options) || null;
	};

	/**
	 * @class	ElementSwitch	元素切换
	 * @namespace	Switch
	 * @extends		Switch
	 */
	var ElementSwitch = C.extend(function () {
		
		/**
		 * @property	events		触发切换的事件列表
		 * @type		{Array}
		 */
		this.events = ['click'];

		/**
		 * @property	cancelDelayEvents		有延迟时的取消触发切换事件
		 * @type		{Array}
		 */
		this.cancelDelayEvents = [];

		/**
		 * @property	immediateEvents		立即触发切换的事件列表
		 * @type		{Array}
		 */
		this.immediateEvents = [];
		/**
		 * 注:虽然没有用程序保证,不过这两组事件里不允许有交集
		 */
		
		/**
		 * @property	behavior		切换行为实例
		 * @type		{ISwitchBehavior}
		 */
		this.behavior = null;

		/**
		 * @property	host			总容器
		 * @type		{HTMLElement}
		 */
		this.host = null;

		/**
		 * @property	nav				标题容器
		 * @type		{HTMLElement}
		 */
		this.nav = null;

		/**
		 * @property	content			内容容器
		 * @type		{ISwitchBehavior}
		 */
		this.content = null;


		/**
		 * @property	selector		选择器<br>
			nav			选择器
			content		选择器
		 * @type		{json}
		 */
		this.selector = { nav : null, content : null };//{ nav : '>:first-child>*', content : '>:nth-child(2)>*' };

		/**
		 * @property	className		切换行为实例<br>
			host<br>
			nav<br>
			content<br>
			navItemSelected<br>
			navItemUnSelected<br>
			contentItemSelected<br>
			contentItemUnSelected
		 * @type		{json}
		 */
		this.className = { host : null, nav : null, content : null, navItemSelected : null, navItemUnSelected : null, contentItemSelected : null, contentItemUnSelected : null };//{ host : 'switch', nav : 'switch-nav', content : 'switch-content', navItemSelected : 'selected', navItemUnSelected : 'unselected', contentItemSelected : 'selected', contentItemUnSelected : 'unselected' };

		/**
		 * @property	preventDefault		是否阻止默认行为
		 * @type		{bool}
		 */
		this.preventDefault = true;

		/**
		 * @property	stopPropagation		是否阻止冒泡
		 * @type		{bool}
		 */
		this.stopPropagation = false;

		/**
		 * @property	delayTime		切换延迟时间
		 * @type		{int}
		 */
		this.delayTime = 0;

		/**
		 * @property	step		每次切换间隔
		 * @type		{int}
		 */
		this.step = 1;

		/**
		 * @property	interval		自动播放间隔
		 * @type		{int}
		 */
		this.interval = 3000;

		/**
		 * @property	autoPlay		是否自动切换
		 * @type		{bool}
		 */
		this.autoPlay = false;
		

		this._handlers = { preventdefault : null, mouseenter : null, mouseleave : null };
		this._playTimer = null;
		this._delayTimer = null;
		this._playing = false;

		this._super = arguments.callee.$super;
		this._proto = this._super.prototype;
		this._super.apply(this, arguments);

	}, Switch, false);

	ElementSwitch.EVENTS = { afterrender : 'afterrender', afterdispose : 'afterdispose' };

	O.mix(ElementSwitch.prototype, function () {
		return {
			initialize : function (host, options) {
				var _self = this;

				var events = [];
				for (var i in ElementSwitch.EVENTS) events.push(ElementSwitch.EVENTS[i]);
				E.createEvents(this, events);

				this._handlers.preventdefault = function (e) { EH.preventDefault(e); };
				this._handlers.mouseenter = function (e) { _self.pause(); };
				this._handlers.mouseleave = function (e) { _self.resume(); };

				this._proto.initialize.call(this, options);

				this.host = host;
				this.nav = this.nav || DU.query('.' + this.className.nav, this.host)[0],
				this.content = this.content || DU.query('.' + this.className.content, this.host)[0];
				//this.nav = this.nav || this.host;
				//this.content = this.content || this.host;

				//NH.addClass(this.host, this.className.host);
				//NH.addClass(this.nav, this.className.nav);
				//NH.addClass(this.content, this.className.content);

				ETH.on(this.host, 'mouseenter', this._handlers.mouseenter);
				ETH.on(this.host, 'mouseleave', this._handlers.mouseleave);

			},

			/**
			 * @method render 渲染
			 * @param	{json}	options	参数
			 * @return	{void}
			 */
			render : function (options) {
				O.mix(this, options || {}, true);

				var navs = DU.query(this.selector.nav, this.nav),
					contents = DU.query(this.selector.content, this.content),
					l = navs.length,
					i = 0,
					currentIndex = null;
							
				for (; i < l ; ++ i) {
					this.add({ nav : navs[i], content : contents[i] || null });
					if (NH.hasClass(navs[i], this.className.navItemSelected)) currentIndex = i;
				}

				this.fire(ElementSwitch.EVENTS.afterrender);

				if (currentIndex != null) this.to(currentIndex);

				if (this.autoPlay) {
					this.play();
				}
			},

			/**
			 * @method dispose 销毁
			 * @return	{void}
			 */
			dispose : function () {
				ETH.un(this.host, 'mouseenter', this._handlers.mouseenter);
				ETH.un(this.host, 'mouseleave', this._handlers.mouseleave);
				
				if (this.autoPlay) {
					this.stop();
				}
				while (this.list.length) this.remove(this.list.length - 1);

				this.fire(ElementSwitch.EVENTS.afterdispose);
			},

			/**
			 * @method insert 插入项
			 * @override
			 * @param	{json}	item	范实体
			 * @param	{int}	index	下标
			 * @return	{ElementSwitchItemEntity}	实体
			 */
			insert : function (item, index) {
				if (!(item = ElementSwitchItemEntity.parse(item))) return null;
				this._proto.insert.apply(this, arguments);
				this._addListener(item);
				return item;
			},

			/**
			 * @method render 添加项
			 * @param	{json}	item	范实体
			 * @return	{ElementSwitchItemEntity} 实体
			 */
			add : function (item) {
				return this.insert(item, this.list.length);
			},

			/**
			 * @method render 移除项
			 * @param	{int}	index	下标
			 * @return	{ElementSwitchItemEntity} 实体
			 */
			remove : function (index) {
				var item = this._proto.remove.apply(this, arguments);
				if (!item) return null;
				this._unListener(item);
				return item;
			},

			/**
			 * @method _addListener 添加事件观察
			 * @private
			 * @param	{ElementSwitchItemEntity}	item	实体
			 * @return	{void}
			 */
			_addListener : function (item) {
				var _self = this, events = item.events.length ? item.events : this.events;

				if (this.preventDefault) { ETH.on(item.nav, 'click', this._handlers.preventdefault); }

				for (var l = events.length, i = 0 ; i < l ; ++ i) {

					void function (type) {
						ETH.on(item.nav, type, item.handlers[type] = function (e) {
							if (_self.preventdefault) EH.preventdefault(e);
							if (_self.stopPropagation) EH.stopPropagation(e);
							if (_self.delayTime) {
								if (_self._delayTimer) clearTimeout(_self._delayTimer);
								_self._delayTimer = setTimeout(function () {
									_self._delayTimer = null;
									_self.to(_self.indexOf(item), type);
								}, _self.delayTime);
							} else {
								_self.to(_self.indexOf(item), type);
							}
						});
					}(events[i]);

				}

				if (this.delayTime) {

					events = item.cancelDelayEvents.length ? item.cancelDelayEvents : this.cancelDelayEvents;

					for (var l = events.length, i = 0 ; i < l ; ++ i) {

						void function (type) {
							ETH.on(item.nav, type, item.handlers['delay.' + type] = function (e) {
								if (_self.delayTime) {
									if (_self._delayTimer) {
										clearTimeout(_self._delayTimer);
										_self._delayTimer = null;
									}
								}
							});
						}(events[i]);

					}
				}

				events = item.immediateEvents.length ? item.immediateEvents : this.immediateEvents;

				for (var l = events.length, i = 0 ; i < l ; ++ i) {
					
					void function (type) {
						ETH.on(item.nav, type, item.handlers[type] = function (e) {
							if (_self.preventdefault) EH.preventdefault(e);
							if (_self.stopPropagation) EH.stopPropagation(e);
							if (_self.delayTime && _self._delayTimer) {
								clearTimeout(_self._delayTimer);
								_self._delayTimer = null;
							}
							_self.to(_self.indexOf(item), type);
						});
					}(events[i]);

				}
			},

			/**
			 * @method _unListener 移除事件观察
			 * @private
			 * @param	{ElementSwitchItemEntity}	item	实体
			 * @return	{void}
			 */
			_unListener : function (item) {
				var l = this.events.length, i = 0;

				if (this.preventDefault) { ETH.un(item.nav, 'click', this._handlers.preventdefault); }

				for (var l = events.length, i = 0 ; i < l ; ++ i) {

					ETH.un(item.nav, events[i], item.handlers[events[i]]);

				}

				events = item.cancelDelayEvents.length ? item.cancelDelayEvents : this.cancelDelayEvents;

				for (var l = events.length, i = 0 ; i < l ; ++ i) {

					ETH.un(item.nav, events[i], item.handlers['delay.' + events[i]]);

				}

				events = item.immediateEvents.length ? item.immediateEvents : this.immediateEvents;

				for (var l = events.length, i = 0 ; i < l ; ++ i) {

					ETH.un(item.nav, events[i], item.handlers[events[i]]);

				}
			},

			/**
			 * @method to 触发切换
			 * @param	{int}	index	下标
			 * @param	{string} type (Optional)触发切换的事件
			 * @return	{void}
			 */
			to : function (index, type) {
				if (!(this.list.length && index < this.list.length)) return;

				return this.behavior.trigger({
					type : type || 'call',
					context : this,
					index : index
				});
			},

			/**
			 * @method prev 触发向前切换
			 * @param	{string} type (Optional)触发切换的事件
			 * @return	{void}
			 */
			prev : function (type) {
				this.to((this.list.length + this.index - this.step) % this.list.length, type);
			},

			/**
			 * @method next 触发向后切换
			 * @param	{string} type (Optional)触发切换的事件
			 * @return	{void}
			 */
			next : function (type) {
				this.to((this.list.length + this.index + this.step) % this.list.length, type);
			},

			/**
			 * @method play 开始自动切换
			 * @return	{void}
			 */
			play : function () {
				this._playing = true;
				this.resume();
			},

			/**
			 * @method stop 停止自动切换
			 * @return	{void}
			 */
			stop : function () {
				this.pause();
				this._playing = false;
			},

			/**
			 * @method resume 继续自动切换
			 * @return	{void}
			 */
			resume : function () {
				if (!this._playing || this._playTimer) return;
				var _self = this;
				this._playTimer = setInterval(function () { _self.next('autoplay'); }, this.interval);
			},

			/**
			 * @method pause 暂停自动切换
			 * @return	{void}
			 */
			pause : function () {
				if (!this._playing || !this._playTimer) return;
				clearInterval(this._playTimer);
				this._playTimer = null;
			},

			/**
			 * @method reset 重置当前的选中状态
			 * @return	{void}
			 */
			reset : function () {
				if (this._delayTimer) clearTimeout(this._delayTimer);
				this.behavior.reset(this);
			},

			/**
			 * @method setClass 选中某个实体样式
			 * @param	{int}		index	下标
			 * @param	{string}	type	类型（标题：nav，内容：content）
			 * @return	{void}
			 */
			setClass : function (index, type) {
				var item = this.item(index), selected, unselected, property;

				if (type == 'content') {
					selected = this.className.contentItemSelected, unselected = this.className.contentItemUnSelected, property = 'content';
				} else {
					selected = this.className.navItemSelected, unselected = this.className.navItemUnSelected, property = 'nav';
				}

				if (item[property]) {
					NH.replaceClass(item[property], unselected, selected);
				}
			},
			
			/**
			 * @method clearClass 清理所有实体样式
			 * @param	{string}	type	类型（标题：nav，内容：content）
			 * @return	{void}
			 */
			clearClass : function (type) {
				var l = this.list.length, i = 0, selected, unselected, property;

				if (type == 'content') {
					selected = this.className.contentItemSelected, unselected = this.className.contentItemUnSelected, property = 'content';
				} else {
					selected = this.className.navItemSelected, unselected = this.className.navItemUnSelected, property = 'nav';
				}

				for (; i < l ; ++ i) {
					if (this.list[i][property]) {
						NH.replaceClass(this.list[i][property], selected, unselected);
					}
				}
			},
			
			/**
			 * @method before 多投before事件
			 * @param	{string}	type	事件类型
			 * @param	{function}	handler	事件委托
			 * @return	{void}
			 */
			before : function (type, handler) {
				this.on('before' + type, handler);
			},

			/**
			 * @method before 多投after事件
			 * @param	{string}	type	事件类型
			 * @param	{function}	handler	事件委托
			 * @return	{void}
			 */
			after : function (type, handler) {
				this.on('after' + type, handler);
			}
		};
	}(), true);

	/**
	 * @class SwitchBehavior	切换行为命名空间
	 * @namespace	Switch
	 * @static
	 */
	var SwitchBehavior = {};

	QW.provide('Switch', {
		Switch : Switch,
		ElementSwitchItemEntity : ElementSwitchItemEntity,
		ElementSwitch : ElementSwitch,
		SwitchBehavior : SwitchBehavior
	});

}();/*import from ./components/switch/tabview.js,(by build.py)*/

void function () {
	
	var O = QW.ObjectH, SW = QW.Switch;
	

	/**
	 * @class Tabs	直接切换类
	 * @namespace	SwitchBehavior
	 */
	SW.SwitchBehavior.Tabs = function () {
		
		this.initialize.apply(this, arguments);
	};

	O.mix(SW.SwitchBehavior.Tabs.prototype, function () {
		return {
			initialize : function (options) {
				O.mix(this, options || {}, true);
			},

			_change : function (context, from, to) {
				if (!context.dispatchBeforeSwitch(from, to)) return;

				context.clearClass('nav');
				context.setClass(to, 'nav');

				context.clearClass('content');
				context.setClass(to, 'content');

				context.switchTo(to);
				context.dispatchAfterSwitch(from, to);
			},

			_repeat : function (context, from, to) {
				if (!context.dispatchBeforeRepeatSwitch(from, to)) return;

				context.clearClass('nav');
				context.setClass(to, 'nav');

				context.clearClass('content');
				context.setClass(to, 'content');
				
				context.switchTo(to);
				context.dispatchAfterRepeatSwitch(from, to);
			},

			/**
			 * @method trigger	触发函数
			 * @param	{json}	param 参数<br>
				type	触发类型<br>
				index	触发的下标<br>
				context	上下文:ElementSwitch实例<br>
			 */
			trigger : function (param) {

				var context = param.context,
					from = context.index,
					to = param.index;

				if (from == to) {
					this._repeat(context, from, to);
				} else {
					this._change(context, from, to);
				}
			},

			/**
			 * @method reset	重置函数
			 * @param	{ElementSwitch实例}	context 上下文
			 */
			reset : function (context) {
				context.clearClass('nav');
				context.clearClass('content');
				context.switchTo(-1);
			}
		};
	}());

	/**
	 * @class TabView		直接切换类
	 * @namespace	Switch
	 */
	SW.TabView = function (host, options) {
		
		options = O.mix(O.mix({}, options || {}), { selector : SW.TabView.Config.TABS_SELECTOR, className : SW.TabView.Config.TABS_CLASS_NAME });

		options.behavior = new SW.SwitchBehavior.Tabs;

		return new SW.ElementSwitch(host, options);
	};

	/**
	 * @property	Config		配置
	 * @type	{json}
	 */
	SW.TabView.Config = {
		TABS_SELECTOR : { nav : '>*', content : '>*' },
		TABS_CLASS_NAME : { host : 'switch-tabs', nav : 'switch-nav', content : 'switch-content', navItemSelected : 'selected', navItemUnSelected : 'unselected', contentItemSelected : 'selected', contentItemUnSelected : 'unselected' }
	};
}();/*import from ./components/switch/slide.js,(by build.py)*/

void function () {

	var O = QW.ObjectH, NH = QW.NodeH, A = QW.ElAnim, SA = QW.ElAnim, SW = QW.Switch;
	

	/**
	 * @class Fade	淡入淡出切换算子类
	 * @namespace	SwitchBehavior
	 */
	SW.SwitchBehavior.Fade = function () {
		
		/**
		 * @property	easing	切换动画算子
		 * @type	{Anim.Easing}
		 */
		this.easing = null;

		/**
		 * @property	animInterval	切换动画持续时间
		 * @type	{Anim.Easing}
		 */
		this.animInterval = 500;

		this._cache = { from : null };

		this.initialize.apply(this, arguments);
	};

	O.mix(SW.SwitchBehavior.Fade.prototype, function () {
		return {
			initialize : function (options) {
				O.mix(this, options || {}, true);
			},
			
			_play : function (to, suspend) {

				var cache = this._cache, from = cache.from, step = null;

				if (from == to) {
					suspend();
					return;
				}

				if (from) {

					if (from.__fadeAnim) {
						from.__fadeAnim.cancel();
					}

					NH.setStyle(from.content, { zIndex : 9 });

					from.__fadeAnim = new A(
						from.content,
						{ opacity : { from : 1, to : 0 } },
						this.animInterval,
						this.easing
					);

					from.__fadeAnim.on('end', function () {
						NH.setStyle(from.content, { zIndex : 0 });
					});
					
					from.__fadeAnim.start();
					

				}

				cache.from = to;

				if (to.__fadeAnim) {
					to.__fadeAnim.cancel();
				}

				NH.setStyle(to.content, { zIndex : 0 });

				to.__fadeAnim = new A(
					to.content,
					{ opacity : { from : 0, to : 1 } },
					this.animInterval,
					this.easing
				);
				to.__fadeAnim.on('end', function () {
					NH.setStyle(to.content, { zIndex : 9 });
					suspend();
				});
				to.__fadeAnim.start();

				if (step != null) {
					to.__fadeAnim.step(step);
				}
			},

			_change : function (context, from, to) {
				if (!context.dispatchBeforeSwitch(from, to)) return;

				context.clearClass('nav');
				context.setClass(to, 'nav');

				this._play(context.item(to), function () {
					context.clearClass('content');
					context.setClass(to, 'content');

					context.switchTo(to);
					context.dispatchAfterSwitch(from, to);
				});
			},

			_repeat : function (context, from, to) {
				if (!context.dispatchBeforeRepeatSwitch(from, to)) return;

				context.clearClass('nav');
				context.setClass(to, 'nav');

				this._play(context.item(to), function () {
					context.clearClass('content');
					context.setClass(to, 'content');
					
					context.switchTo(to);
					context.dispatchAfterRepeatSwitch(from, to);
				});
			},

			/**
			 * @method trigger	触发函数
			 * @param	{json}	param 参数<br>
				type	触发类型<br>
				index	触发的下标<br>
				context	上下文:ElementSwitch实例<br>
			 */
			trigger : function (param) {
				var context = param.context,
					from = context.index,
					to = param.index;

				if (from == to) {
					this._repeat(context, from, to);
				} else {
					this._change(context, from, to);
				}
			},

			/**
			 * @method reset	重置函数
			 * @param	{ElementSwitch实例}	context 上下文
			 */
			reset : function (context) {
				var cache = this._cache;
				if (cache.from) {
					if (cache.from.__fadeAnim) {
						cache.from.__fadeAnim.cancel();
					}
					NH.setStyle(cache.from.content, { opacity : 0 });
					cache.from = null;
				}

				context.clearClass('nav');
				context.clearClass('content');
				context.switchTo(-1);
			}
		};
	}());

	/**
	 * @class Fade	滚动切换算子类
	 * @namespace	SwitchBehavior
	 */
	SW.SwitchBehavior.Scroll = function () {

		this.config = { top : 'scrollTop', left : 'scrollLeft' };

		this.configProperty = { top : 'height', left : 'width' };

		/**
		 * @property	direction	切换方向：top垂直切换，left：水平切换
		 * @type	{string}
		 */
		this.direction = 'top';

		/**
		 * @property	easing	切换动画算子
		 * @type	{Anim.Easing}
		 */
		this.easing = null;

		/**
		 * @property	animInterval	切换动画持续时间
		 * @type	{Anim.Easing}
		 */
		this.animInterval = 500;

		this._cache = { from : null, anim : null };

		this.initialize.apply(this, arguments);
	};

	O.mix(SW.SwitchBehavior.Scroll.prototype, function () {
		return {
			initialize : function (options) {
				O.mix(this, options || {}, true);
			},

			_play : function (index, to, content, suspend) {

				var cache = this._cache, options = {};

				options[this.config[this.direction]] = { to : NH.getSize(to.content)[this.configProperty[this.direction]] * index };

				if (cache.anim) {
					cache.anim.cancel();
				}

				cache.anim = new SA(
					content,
					options,
					this.animInterval,
					this.easing
				);

				cache.anim.on('end', function () {
					suspend();
				});
				
				cache.anim.start();
			},
			
			_change : function (context, from, to) {
				if (!context.dispatchBeforeSwitch(from, to)) return;

				context.clearClass('nav');
				context.setClass(to, 'nav');

				this._play(to, context.item(to), context.content, function () {
					context.clearClass('content');
					context.setClass(to, 'content');

					context.switchTo(to);
					context.dispatchAfterSwitch(from, to);
				});
			},

			_repeat : function (context, from, to) {
				if (!context.dispatchBeforeRepeatSwitch(from, to)) return;

				context.clearClass('nav');
				context.setClass(to, 'nav');

				this._play(to, context.item(to), context.content, function () {
					context.clearClass('content');
					context.setClass(to, 'content');
					
					context.switchTo(to);
					context.dispatchAfterRepeatSwitch(from, to);
				});
			},

			/**
			 * @method trigger	触发函数
			 * @param	{json}	param 参数<br>
				type	触发类型<br>
				index	触发的下标<br>
				context	上下文:ElementSwitch实例<br>
			 */
			trigger : function (param) {
				var context = param.context,
					from = context.index,
					to = param.index;

				if (from == to) {
					this._repeat(context, from, to);
				} else {
					this._change(context, from, to);
				}
			},

			/**
			 * @method reset	重置函数
			 * @param	{ElementSwitch实例}	context 上下文
			 */
			reset : function (context) {
				var cache = this._cache;

				if (cache.from) {
					if (cache.anim) {
						cache.anim.cancel();
					}
					cache.from = cache.anim = null;
				}
				context.content[this.config[this.direction]] = 0;

				context.clearClass('nav');
				context.clearClass('content');
				context.switchTo(-1);
			}
		};
	}());

	/**
	 * @class Slide		动画切换类
	 * @namespace	Switch
	 */
	SW.Slide = function (host, options) {

		options = O.mix(O.mix({}, options || {}), { autoPlay : true });

		if (options.effect == 'scroll') {
			options.behavior = new SW.SwitchBehavior.Scroll(options);

			options = O.mix(options, { selector : SW.Slide.Config.SCROLL_SELECTOR, className : SW.Slide.Config.SCROLL_CLASS_NAME });
		} else {
			options.behavior = new SW.SwitchBehavior.Fade(options);

			options = O.mix(options, { selector : SW.Slide.Config.FADE_SELECTOR, className : SW.Slide.Config.FADE_CLASS_NAME });
		}

		return new SW.ElementSwitch(host, options);
	};

	/**
	 * @property	Config		配置
	 * @type	{json}
	 */
	SW.Slide.Config = {
		FADE_SELECTOR : { nav : '>*', content : '>*' },
		FADE_CLASS_NAME : { host : 'switch-fade', nav : 'switch-nav', content : 'switch-content', navItemSelected : 'selected', navItemUnSelected : 'unselected', contentItemSelected : 'selected', contentItemUnSelected : 'unselected' },
		SCROLL_SELECTOR : { nav : '>*', content : '>*' },
		SCROLL_CLASS_NAME : { host : 'switch-scroll', nav : 'switch-nav', content : 'switch-content', navItemSelected : 'selected', navItemUnSelected : 'unselected', contentItemSelected : 'selected', contentItemUnSelected : 'unselected' }
	};

}();/*import from ./components/switch/scroll.js,(by build.py)*/

void function () {
	var O = QW.ObjectH, NH = QW.NodeH, E = QW.CustEvent, ETH = QW.EventTargetH, EH = QW.EventH, DU = QW.DomU, SW = QW.Switch, SA = QW.ElAnim;

	SW.Scroll = function () {
		this._switch = null;
		this.panel = null;
		this.prev = null;
		this.next = null;
		this.vertical = false;
		this.autoWidth = true;
		this.preventDefault = true;
		this.easing = null;
		this.interval = 200;
		this.events = { 'in' : 'mousedown', out : 'mouseup' };
		this.className = { scroll : 'switch-scroll', scrolled : 'switch-scrolled', active : 'switch-scroll-active', panel : 'switch-scroll-panel', prev : 'switch-scroll-prev', next : 'switch-scroll-next' };

		this._handlers = { render : null, dispose : null, _switch : null, prev : null, next : null, previn : null, prevout : null, nextin : null, nextout : null };
		this._anim = null;
		this._timer = null;

		this.initialize.apply(this, arguments);
		return this._switch;
	};

	O.mix(SW.Scroll.prototype, function () {
		return {
			initialize : function (_switch, options) {
				this._switch = _switch;
				this._switch.scroll = this;
				
				O.mix(this, options || {}, true);
				
				this._addListener();
			},

			dispose : function () {
				this._unListener();
				this._unTriggerHandler();
				delete this._switch.scroll;
			},

			render : function (options) {
				options = options || {};
				this.panel = options.panel || NH.ancestorNode(this._switch.nav, '.' + this.className.panel);
				this.prev = options.prev || DU.query('.' + this.className.prev, this._switch.host)[0];
				this.next = options.next || DU.query('.' + this.className.next, this._switch.host)[0];

				this._addTriggerHandler();

				this._autoWidth();
				this.refresh();
			},

			_autoWidth : function () {
				if (!this.vertical && this.autoWidth) {
					var list = this._switch.list, l = list.length, width = 0, i = 0;
					for (; i < l ; ++ i) {
						width += list[i].nav.offsetWidth;
					}
					NH.setInnerSize(this._switch.nav, width);
				}
			},

			_addListener : function () {
				var _self = this;

				this._switch.after('render', this._handlers.render = function () {
					_self.render();
				});


				this._switch.after('dispose', this._handlers.dispose = function () {
					_self.dispose();
				});

				this._switch.after('switch', this._handlers._switch = function (e) {
					//_self.move(e.to.nav);
				});
			},

			_unListener : function () {
				this._switch.un('afterrender', this._handlers.render);
				this._switch.un('afterdispose', this._handlers.dispose);
				this._switch.un('afterswitch', this._handlers._switch);
			},

			_addTriggerHandler : function () {
				var _self = this;
				ETH.on(this.prev, 'click', this._handlers.prev = function (e) {
					if (_self.preventDefault) {
						EH.preventDefault(e);
					}
				});
				ETH.on(this.next, 'click', this._handlers.next = function (e) {
					if (_self.preventDefault) {
						EH.preventDefault(e);
					}
				});

				ETH.on(this.prev, this.events['in'], this._handlers.previn = function (e) {
					_self.intoView(-1);
					if (_self._timer) {
						clearInterval(_self._timer);
					}
					_self._timer = setInterval(function () {
						_self.intoView(-1);
					}, _self.interval + 100);
				});

				ETH.on(this.prev, this.events.out, this._handlers.prevout = function (e) {
					if (_self._timer) {
						clearInterval(_self._timer);
						_self._timer = null;
					}
				});

				ETH.on(this.next, this.events['in'], this._handlers.nextin = function (e) {
					_self.intoView(1);
					if (_self._timer) {
						clearInterval(_self._timer);
					}
					_self._timer = setInterval(function () {
						_self.intoView(1);
					}, _self.interval + 100);
				});

				ETH.on(this.next, this.events.out, this._handlers.nextout = function (e) {
					if (_self._timer) {
						clearInterval(_self._timer);
						_self._timer = null;
					}
				});
			},

			_unTriggerHandler : function () {
				ETH.un(this.prev, 'click', this._handlers.prev);
				ETH.un(this.next, 'click', this._handlers.next);
				ETH.un(this.prev, this.events['in'], this._handlers.previn);
				ETH.un(this.next, this.events.out, this._handlers.nextin);
				ETH.un(this.prev, this.events['in'], this._handlers.prevout);
				ETH.un(this.next, this.events.out, this._handlers.nextout);
			},

			intoView : function (n) {
				if (this._switch.index == -1) {
					return;
				}

				var scroll = NH.getRect(this.panel), moveNav = null, i = 0, l = this._switch.list.length, nav;

				/*获取当前可见元素*/
				for (; i < l ; ++ i) {
					nav = NH.getRect(this._switch.list[i].nav);

					if (this.vertical) {
						if (scroll.top <=  nav.top && scroll.top + scroll.height >= nav.top + nav.height) {
							break;
						}
					} else {
						if (scroll.left <=  nav.left && scroll.left + scroll.width >= nav.left + nav.width) {
							break;
						}
					}
				}
				
				for ( ; i < l && i >= 0 ; i += n) {

					nav = NH.getRect(this._switch.list[i].nav);

					if (this.vertical) {
						if (scroll.top >  nav.top || scroll.top + scroll.height < nav.top + nav.height) {
							moveNav = this._switch.list[i].nav;
							//if (scroll.top >=  nav.top + nav.height || scroll.top + scroll.height <= nav.top) {
								break;
							//}
						}
					} else {
						if (scroll.left >  nav.left || scroll.left + scroll.width < nav.left + nav.width) {
							moveNav = this._switch.list[i].nav;
							//if (scroll.left >=  nav.left + nav.width || scroll.left + scroll.width <= nav.left) {
								break;
							//}
						}
					}

				}

				if (moveNav) {
					this.move(moveNav);
				}
				
			},

			moveTo : function (e) {
				var _self = this;

				if (this._anim) {
					this._anim.cancel();
				}

				var options = {};

				if (this.vertical) {
					options['scrollTop'] = { to : e };
					//this.panel.scrollTop = e;
				} else {
					options['scrollLeft'] = { to : e };
					//this.panel.scrollLeft = e;
				}

				this._anim = new SA(
					this.panel,
					options,
					this.interval,
					this.easing
				);

				this._anim.on('end', function () {
					_self.refresh();
				});

				this._anim.start();
			},

			move : function (e) {
				var scroll = NH.getRect(this.panel), nav = NH.getRect(e);
				nav.top += this.panel.scrollTop;

				var offset;

				if (this.vertical) {
					if (scroll.top >  nav.top) {
						offset = this.panel.scrollTop + nav.top - scroll.top;
					} else if (scroll.top + scroll.height < nav.top + nav.height) {
						offset = this.panel.scrollTop + nav.top + nav.height - scroll.top - scroll.height;
					}
				} else {
					if (scroll.left >  nav.left) {
						offset = this.panel.scrollLeft + nav.left - scroll.left;
					} else if (scroll.left + scroll.width < nav.left + nav.width) {
						offset = this.panel.scrollLeft + nav.left + nav.width - scroll.left - scroll.width;
					}
				}

				this.moveTo(offset);
			},

			refresh : function () {
				if (this.vertical) {
					if (this._switch.nav.offsetHeight > this.panel.offsetHeight) {
						NH.addClass(this.panel, this.className.active);
						if (this.panel.scrollTop == 0) {
							NH.replaceClass(this.prev, this.className.scroll, this.className.scrolled);
						} else {
							NH.replaceClass(this.prev, this.className.scrolled, this.className.scroll);
						}

						if (this.panel.scrollTop + this.panel.offsetHeight == this.panel.scrollHeight) {
							NH.replaceClass(this.next, this.className.scroll, this.className.scrolled);
						} else {
							NH.replaceClass(this.next, this.className.scrolled, this.className.scroll);
						}
					}
				} else {
					if (this._switch.nav.offsetWidth > this.panel.offsetWidth) {
						NH.addClass(this.panel, this.className.active);
						if (this.panel.scrollLeft == 0) {
							NH.replaceClass(this.prev, this.className.scroll, this.className.scrolled);
						} else {
							NH.replaceClass(this.prev, this.className.scrolled, this.className.scroll);
						}

						if (this.panel.scrollLeft + this.panel.offsetWidth == this.panel.scrollWidth) {
							NH.replaceClass(this.next, this.className.scroll, this.className.scrolled);
						} else {
							NH.replaceClass(this.next, this.className.scrolled, this.className.scroll);
						}
					}
				}
			}
		};
	}(), true);


}();