/*import from ./components/editor/editor_base.js,(by build.py)*/

/*
Editor改版说明(2008-12-03)：
1.添加对Safari,Opera,Chrome的支持
2.强化tab的配置，强化toobaritem的配置
3.调整editor的html dom结构，修改部分className
4.去掉popupLayer，改用Panel.js里的LayerPopup
5.部分代码调整
6.其它
*/




(function() {
	var Browser = QW.Browser,
		DomU = QW.DomU,
		getDocRect = DomU.getDocRect,
		createElement = DomU.createElement,
		NodeH = QW.NodeH,
		on = QW.EventTargetH.addEventListener,
		un = QW.EventTargetH.removeEventListener,
		fire = QW.EventTargetH.fire,
		getElementsByClass = NodeH.getElementsByClass,
		hasClass = NodeH.hasClass,
		addClass = NodeH.addClass,
		removeClass = NodeH.removeClass,
		hide = NodeH.hide,
		show = NodeH.show,
		contains = NodeH.contains,
		getRect = NodeH.getRect,
		EventH = QW.EventH,
		target = EventH.getTarget,
		preventDefault = EventH.preventDefault,
		keyCode = EventH.getKeyCode;

	/**
	 * @class Editor 编辑器
	 * @constructor
	 * @namespace QW
	 * @param  {Json} opts, 编辑器的其它配置属性，目前只支持：
	 container: {HTMLElement}, 编辑器的外部容器
	 textarea: {Textarea HTMLElement} 编辑器的源文件textarea, 用来初始化／显示编辑内容的源代码
	 height: {int} 高度px值.
	 insertImgUrl,指定添加图片的对话框URL，默认为空，为空时只能外链图片;
	 tiConfig,数组或字符串，用于配置编辑器的功能按钮。如果是字符串，则把它当key，来从Editor.tiConfigs里取对应的tiConfig的数组;
	 * @return {Editor} 返回Editor实例
	 */

	function Editor(options) {
		this.options = options;
		if (!this.lazyRender) this.render();
	}
	/**
	 *@static activeInstance: 当前活跃的实例。
	 */
	Editor.activeInstance = null;
	Editor.editorPath = QW.PATH + 'components/editor/';

	var _enable = function(el) {
		removeClass(el, 'disabled');
	},
		_disable = function(el) {
			removeClass(el, 'active');
			removeClass(el, 'mouseover');
			addClass(el, 'disabled');
		},
		_activate = function(el) {
			addClass(el, 'active');
		},
		_deactivate = function(el) {
			removeClass(el, 'active');
		},
		_tiUp = function(e, el) {
			el = el || this;
			removeClass(el, 'mousedown');
		},
		_tiDown = function(e, el) {
			el = el || this;
			if (!hasClass(el, 'disabled')) addClass(el, 'mousedown');
		},
		_tiOut = function(e, el) {
			el = el || this;
			removeClass(el, 'mouseover');
			removeClass(el, 'mousedown');
		},
		_tiOver = function(e, el) {
			el = el || this;
			if (!hasClass(el, 'disabled')) addClass(el, 'mouseover');
		},
		_tiClick = function(e, el, editor) {
			Editor.activeInstance = editor;
			if (!hasClass(el, 'disabled')) {
				var tiKey = el.getAttribute('tiKey');
				Editor.EditorCmd['ti' + tiKey](e, el, editor);
			}
		};
	/**
	 *TiConfigs: 一些常用ToolbarItem配置
	 */
	Editor.TiConfigs = {
		full: 'Undo,Redo,,Bold,Italic,Underline,FontName,FontSize,ForeColor,BackColor,RemoveFormat,,JustifyLeft,JustifyCenter,JustifyRight,,OrderedList,UnorderedList,,Link,UnLink,Image,Face,Character',
		youa: 'Undo,Redo,,Bold,Italic,Underline,FontName,FontSize,ForeColor,BackColor,RemoveFormat,,JustifyLeft,JustifyCenter,JustifyRight,,OrderedList,UnorderedList,,Image,Face,Character',
		jk: 'Undo,Redo,,Bold,Italic,Underline,FontName,FontSize,ForeColor,BackColor,RemoveFormat,,Face,Character'
	};

	/**
	 *_editorHeadHtml: 编辑器里面的header.
	 */
	Editor._editorHeadHtml = '<head><style type="text/css">body{background-color:#FFFFFF; font:16px Geneva,Arial,sans-serif; margin:2px;} p{margin:0px;}</style></head>';

	/**
	 *ToolbarItems: {Json} ToolbarItem数组
	 */
	Editor.ToolbarItems = {
		//['className','title',disabled,'innerHTML',accessKey,needCtrlStatus]
		Undo: ['Undo', '撤消', 1, , 'z', 1],
		Redo: ['Redo', '重做', 1, , 'y', 1],
		Bold: ['Bold', '加粗', , , 'b', 1],
		Italic: ['Italic', '斜体', , , 'i', 1],
		Underline: ['Underline', '下划线', , , 'u', 1],
		FontName: ['FontName', '字体', , '<span class=img>字体</span>', , 1],
		FontSize: ['FontSize', '字号', , '<div class=img>字号</div>', , 1],
		ForeColor: ['ForeColor', '文本颜色'],
		BackColor: ['BackColor', '背景颜色'],
		RemoveFormat: ['RemoveFormat', '清除格式'],
		JustifyLeft: ['AlignLeft', '左对齐', , , , 1],
		JustifyCenter: ['AlignCenter', '居中对齐', , , , 1],
		JustifyRight: ['AlignRight', '右对齐', , , , 1],
		OrderedList: ['NList', '编号列表', , , , 1],
		UnorderedList: ['BList', '符号列表', , , , 1],
		Link: ['Link', '添加/修改超链接'],
		UnLink: ['UnLink', '删除超链接', 1, , , 1],
		Image: ['Image', '插入/编辑图片'],
		Face: ['Face', '插入表情'],
		Character: ['Character', '插入特殊字符']
	};
	var _tiHtml = function(key) {
		if (!key) return '<div class="divider"><div class="img">&nbsp;</div></div>';
		var ti = Editor.ToolbarItems[key];
		return '<div title="' + ti[1] + '" class="ti ' + ti[0] + (ti[2] ? ' disabled' : '') + '" tiKey="' + key + '" >' + (ti[3] || '<div class="img">&nbsp;</div>') + '</div>';
	};

	Editor.prototype = {
		oCtn: null,
		oTxt: null,
		oIfm: null,
		oTabCtn: null,
		oSrcCtn: null,
		oDsnCtn: null,
		oToolbarCtn: null,
		tiMap: {},
		//记录当前Editor实例支持哪些tiKey。
		accessKeyMap: {},
		//记录accessKeyMap，事实上可以通过遍历得到，但是为效率考考虑，单独加一个map。
		statusTis: [],
		//记录哪些toolbarItem需要状态控制。
		_curMode: 'design',
		/**
		 * @method _switchMode: 切换编辑状态
		 * @return void 
		 */
		_switchMode: function(mode) {
			var me = this,
				doc = me.doc;
			if (mode == me._curMode) return;
			var tabs = this.oTabCtn.childNodes;
			if (mode == 'design') {
				doc.body.innerHTML = me.oTxt.value || Browser.firefox && '<br/>' || '';
				hide(me.oSrcCtn);
				show(me.oDsnCtn);
				addClass(tabs[0], 'selected');
				removeClass(tabs[1], 'selected');
			} else {
				var val = doc.body.innerHTML;
				if ((/^(((<p|<\/p|<br)[^>]*>)*(&nbsp;)*)*$/).test(val.replace(/&nbsp;\s*/, ''))) val = '';
				me.oTxt.value = val;
				hide(me.oDsnCtn);
				show(me.oSrcCtn);
				addClass(tabs[1], 'selected');
				removeClass(tabs[0], 'selected');
			}
			window.setTimeout(function() {
				me._focus();
			}, 10);
			me._curMode = mode;
		},
		/**
		 * @method _preview: 预览
		 * @return void 
		 */
		_preview: function() {
			var me = this;
			me.prepare4Submit();
			var win = window.open('about:blank');
			var doc = win.document;
			doc.open();
			var html = '<html>' + Editor._editorHeadHtml + '<body>' + me.oTxt.value + '</body></html>';
			doc.write(html);
			doc.close();
		},
		/**
		 * @method render: render
		 * @return void 
		 */
		render: function() {
			var me = this;
			var opts = me.options;
			if (me._rendered) return;
			//render editor structure
			{
				var oCtn = me.oCtn = g(opts.container);
				var oTxt = me.oTxt = g(opts.textarea);
				if (contains(oCtn, oTxt)) oCtn.parentNode.insertBefore(oTxt, oCtn); //如果ctn包含txt，则先把txt移到外面去;
				var html = ['<div class="js-editor">', '<div class="ctn-tab">', '<div class="tab-design tab selected">编辑文本</div>', '<div class="tab-source tab">编辑源文件</div>', '<div class="tab-preview">预览</div>', '</div>', '<div class="ctn-src" style="display:none">', '<div class="hd">', '<a class="back">返回编辑文本</a>', '</div>', '<div class="bd">', '</div>', '</div>', '<div class="ctn-dsn">', '<div class="hd">', '</div>', '<div class="bd">', '</div>', '</div>', '</div>'].join('').replace(/(<\w+)/ig, '$1  unselectable="on"');
				oCtn.innerHTML = html;
				me.oWrap = oCtn.childNodes[0];
				var els = me.oWrap.childNodes;
				me.oTabCtn = els[0];
				me.oSrcCtn = els[1];
				me.oDsnCtn = els[2];
			}
			//初始化iframe和textarea
			{
				me.oIfm = createElement('iframe', {
					frameBorder: 'no'
				});
				me.oDsnCtn.childNodes[1].appendChild(me.oIfm);
				me.win = me.oIfm.contentWindow;
				var doc = me.doc = me.win.document;
				doc.designMode = 'on';
				doc.write('<html>' + Editor._editorHeadHtml + '<body ></body></html>');
				doc.close();
				me.oSrcCtn.childNodes[1].appendChild(me.oTxt);
				show(me.oTxt);
				me.oIfm.style.height = me.oTxt.style.height = (me.options.width || 300) + 'px';
				doc.body.innerHTML = me.oTxt.value || (Browser.firefox && '<br/>') || ''; //解决FF下光标初始位置不正确的bug;
				me.prepare4Submit();
				me.defaultEditorHtml = me.oTxt.value; //记下初始值。
			}
			//初始化 tabs
			{
				var tabs = me.oTabCtn.childNodes;
				tabs[0].onclick = function(e) {
					me._switchMode('design');
				};
				tabs[1].onclick = function(e) {
					me._switchMode('source');
				};
				tabs[2].onclick = function(e) {
					me._preview();
				};
				getElementsByClass(me.oSrcCtn, 'back')[0].onclick = function(e) {
					me._switchMode('design');
				};
			}
			//初始化ToolbarItems
			{
				var tiKeys = (me.options.tiConfig || Editor.TiConfigs.full).split(',');
				var html = ['<div class="js-editor-toolbar">'];
				for (var i = 0; i < tiKeys.length; i++) {
					html.push(_tiHtml(tiKeys[i]));
				}
				html.push('</div>');
				me.oDsnCtn.childNodes[0].innerHTML = html.join('').replace(/(<\w+)/ig, '$1  unselectable="on"');
				var tiEls = getElementsByClass(me.oDsnCtn, 'ti');
				me.tiMap = {};
				me.accessKeyMap = {};
				me.statusTis = [];
				for (var i = 0; i < tiEls.length; i++) {
					var el = tiEls[i];
					el.onmousedown = _tiDown;
					el.onmouseup = _tiUp;
					el.onmouseover = _tiOver;
					el.onmouseout = _tiOut;
					el.onclick = function(e) {
						_tiClick(e, this, me);
					};
					var tiKey = el.getAttribute('tiKey');
					var ti = Editor.ToolbarItems[tiKey];
					if (ti[4]) me.accessKeyMap[ti[4]] = tiKey;
					if (ti[5]) me.statusTis.push(tiKey);
					me.tiMap[tiKey] = {
						tiKey: tiKey,
						tiEl: el
					};
				}
			}
			//初始化History,KeyDown事件等
			{
				me.editorHistory = new Editor.EditorHistory(me);
				me.editorHistory.saveUndoStep();
				initDomEvents(me);
			}
			me._rendered = true;
		},
		fireSelectionChange: function() {
			fire(this.doc, 'mouseup');
		},
		_focus: function() {
			//try{
			var me = this;
			if (me._curMode == 'design') me.win.focus();
			else me.oTxt.focus();
			//}
			//catch(e){};
		},
		focus: function() {
			//try{
			var me = this;
			me._focus();
			var p = getRect(me.oWrap);
			var rect = getDocRect();
			if (p.top < rect.scrollTop || p.bottom > rect.height + rect.scrollTop) {
				this.oWrap.scrollIntoView();
			}
			//}
			//catch(e){}
		},
		/**
		 * @method prepareToSubmit - 为提交作准备
		 * @return void 
		 */
		prepare4Submit: function() {
			var me = this;
			if (me._curMode != 'design') {
				me.doc.body.innerHTML = me.oTxt.value;
			}
			var val = me.doc.body.innerHTML;
			if ((/^((<p|<\/p|<br)[^>]*>)*$/).test(val.replace(/&nbsp;\s*/, ''))) val = '';
			me.oTxt.value = val;
		},
		setInnerHTML: function(s) {
			this.oTxt.value = s;
			this.doc.body.innerHTML = s;
		},
		isChanged: function(s) {
			this.prepare4Submit();
			return this.defaultEditorHtml != this.oTxt.value;
		},
		/**
		 * @method exec - 执行编辑器execCommand
		 * @param {string} sCommand - 命令名。
		 * @param {string} vValue - 命令值。
		 * @param {boolean} ignoreBeginHistory - 是否忽略执行命令前一刻的历史。（有时命令是由几个组合而成时会用到）
		 * @param {boolean} ignoreEndHistory - 是否忽略执行命令后一刻的历史。
		 * @return void 
		 */
		exec: function(sCommand, vValue, ignoreBeginHistory, ignoreEndHistory) {
			this._focus();
			if (!ignoreBeginHistory) this.editorHistory.saveUndoStep();
			if (sCommand) this.doc.execCommand(sCommand, false, vValue);
			if (!ignoreEndHistory) this.editorHistory.saveUndoStep();
			this.fireSelectionChange();
		},
		/**
		 * @method pasteHTML - 往编辑器里贴一段HTML
		 * @param {string} htmlStr - HTML字符串。
		 * @param {boolean} ignoreBeginHistory - 是否忽略执行命令前一刻的历史。（有时命令是由几个组合而成时会用到）
		 * @param {boolean} ignoreEndHistory - 是否忽略执行命令后一刻的历史。
		 * @return void 
		 */
		pasteHTML: function(htmlStr, ignoreBeginHistory, ignoreEndHistory) {
			this._focus();
			if (!ignoreBeginHistory) this.editorHistory.saveUndoStep();
			var doc = this.doc;
			if (Browser.ie) {
				var range = doc.selection.createRange(); //将选中文本赋值给SelTxt；
				if (doc.selection.type == 'Control') { //JK: controlRange不能执行pasteHTML
					var range2 = doc.body.createTextRange();
					range2.moveToElementText(range.item(0));
					range2.select();
					range = range2;
				}
				range.pasteHTML(htmlStr);
			} else {
				doc.execCommand('insertHTML', false, htmlStr);
			}
			if (!ignoreEndHistory) this.editorHistory.saveUndoStep();
			this.fireSelectionChange();
		}
	};


/*
	*监控Editor里的键盘/鼠标事件
	*/
	var initDomEvents = (function() {
		var CTRL = 1000,
			CTRL_X = CTRL + 88,
			CTRL_C = CTRL + 67,
			CTRL_A = CTRL + 65,
			KEY_TAB = 9,
			KEY_BACKSPACE = 8,
			KEY_ENTER = 13;

		var _keyDown = function(e, editor) {
			e = e || editor.win.event;
			// Get the key code.
			var keyCombination = keyCode(e);
			var ctrlKey = e.ctrlKey || e.metaKey;
			if (ctrlKey) {
				var sKey = String.fromCharCode(keyCombination).toLowerCase();
				var tiKey = editor.accessKeyMap[sKey];
				if (tiKey) {
					Editor.EditorCmd["ti" + tiKey](e, editor.tiMap[tiKey].tiEl, editor);
					preventDefault(e);
					return;
				}
				keyCombination += CTRL;
			}
			switch (keyCombination) {
			case KEY_TAB:
				editor.pasteHTML("&nbsp;&nbsp;&nbsp;&nbsp;");
				preventDefault(e);
				return;
			case KEY_BACKSPACE:
				if (Browser.ie) { //JK：IE下，用backspace不能删除control选中状态下的img。
					var oImg = Editor.EditorSelection.getCtrlElement(editor);
					if (oImg && oImg.tagName) {
						editor.exec('Delete');
						preventDefault(e);
					}
				}
				break;
			case KEY_ENTER:
			case CTRL_X:
			case CTRL_C:
			case CTRL_A:
			case KEY_ENTER:
				if (Browser.ie) {
					editor.editorHistory.saveUndoStep();
					editor.fireSelectionChange();
				}
				break;
			default:
				if (Browser.ie) {
					var ti = editor.tiMap["Undo"];
					if (ti) _rc(ti.tiEl, "disabled");
				}
			}
		};
		var _selectionChange = function(e, editor) {
			var tiMap = editor.tiMap,
				statusTis = editor.statusTis;
			oCtrl = Editor.EditorSelection.getCtrlElement(editor);
			for (var i = 0; i < statusTis.length; i++) {
				var tiKey = statusTis[i];
				Editor.EditorCmd["tistatus" + tiKey](e, tiMap[tiKey].tiEl, editor, oCtrl)
			}
			fire(document.body, "keyup"); //JK：触发外部document的事件，以使popup关闭。opera下，用mousedown会影响外部的以后的mousedown，所以用keyup.
		};

/*
		* 初始化Editor实例的dom对象的事件
		*/
		return function(editor) {
			var doc = editor.doc;
			var keydownHdl = function(e) {
				_keyDown(e, editor);
			};
			var selectionChangeHdl = function(e) {
				Editor.activeInstance = editor;
				_selectionChange(e, editor);
			};
			on(doc, "keydown", keydownHdl);
			on(doc, "keyup", selectionChangeHdl);
			on(doc, "mouseup", selectionChangeHdl);
			if (Browser.ie) {
				var beforedeactivateHdl = function(e) {
					var el = target(e);
					if (el && el.tagName == "MARQUEE") return; //防止IE下的死循环:<marquee><marquee>a</marquee></marquee><marquee><marquee>a</marquee></marquee>
					var selection = doc.selection;
					var range = selection.createRange();
					var selectionType = selection.type.toLowerCase();
					if ("control" == selectionType) {
						doc.ieSelectionControl = range(0);
					} else {
						doc.ieSelectionBookmark = range.getBookmark();
					}
					doc.ieSelectionType = selectionType;
				};
				on(doc, "beforedeactivate", beforedeactivateHdl);
				var activateHdl = function(e) {
					var range;
					try {
						if ("control" == doc.ieSelectionType) {
							range = doc.body.createControlRange();
							range.add(doc.ieSelectionControl);
						} else {
							range = doc.body.createTextRange();
							range.moveToBookmark(doc.ieSelectionBookmark);
						}
						range.select();
						doc.ieSelectionControl = doc.ieSelectionBookmark = null;
					} catch (ex) {}
				};
				on(doc, "activate", activateHdl);
				var unloadHdl = function() { //去除事件，以解决IE下的内存泄漏问题
					un(doc, "keydown", keydownHdl);
					un(doc, "mouseup", selectionChangeHdl);
					un(doc, "keyup", selectionChangeHdl);
					un(doc, "beforedeactivate", beforedeactivateHdl);
					un(doc, "activate", activateHdl);
					un(window, "unload", unloadHdl);
					doc = null;
				};
				on(window, "unload", unloadHdl);
			}
		};
	}());

	QW.provide('Editor', Editor);
}());/*import from ./components/editor/editor_assist.js,(by build.py)*/

/*本文件是以下几个文件的综合，以方便页面调用。
*EditorHistory.js
*EditorCommand.js
*EditorEvent.js


*/

(function() {
	var mix = QW.ObjectH.mix,
		arrContains = QW.ArrayH.contains,
		Browser = QW.Browser,
		NodeH = QW.NodeH,
		getRect = NodeH.getRect,
		addClass = NodeH.addClass,
		removeClass = NodeH.removeClass,
		hasClass = NodeH.hasClass,
		EventH = QW.EventH,
		Editor = QW.Editor,
		lazyApply = QW.FunctionH.lazyApply;


	/**
	 * @class EditorSelection Editor的Selection Helper
	 * @singleton
	 * @namespace QW.Editor
	 */
	var EditorSelection = {
		/** 
		 * 获取Control元素: 获取富文本iframe里选中的ctrl对象，例如img，如果当前不是ctrl状态，则返回空
		 * @method getCtrlElement
		 * @param {Editor} editor Editor实例
		 * @return {Element}
		 */
		getCtrlElement: function(editor) {
			if (Browser.ie) {
				var selection = editor.doc.selection;
				if ("Control" == selection.type) {
					var range = selection.createRange();
					return range(0);
				}
			} else {
				selection = editor.win.getSelection();
				range = selection.getRangeAt(0);
				var nodes = range.cloneContents().childNodes;
				if (nodes.length == 1 && nodes[0].nodeType == 1) {
					var oAnc = selection.anchorNode;
					//JK：加Math.min的原因:safari没有点击选中img的功能，而只能扫中选中，所以要取最小的offset.
					//JK：另外，safari下，如果img一旦设为float:left，便很难选中它，以进行其它的操作，晕。
					var el = oAnc.childNodes[Math.min(selection.anchorOffset, selection.focusOffset)];
					if (el && el.nodeType == 1) return el;
				}
			}
			return null;
		},

		/** 
		 * 获取选中范围内的第一个某tagName的元素
		 * @method get1stSelectedNode
		 * @param {Editor} editor Editor实例
		 * @param {string} tagName tagName
		 * @return {Element}
		 */
		get1stSelectedNode: function(editor, tagName) {
			var node, doc = editor.doc, range, els;
			if (Browser.ie) {
				range = doc.selection.createRange();
				if (range.type == "Control") {
					node = range[0];
					if (node.tagName == tagName) return node;
				} else {
					node = range.parentElement();
					els = node.getElementsByTagName(tagName);
					var range2 = doc.body.createTextRange();
					try { //JK:IE下有时会抛异常
						for (var i = 0; i < els.length; i++) {
							range2.moveToElementText(els[i]);
							if (range2.inRange(range)) return els[i];
						}
					} catch (ex) {}
				}
			} else {
				var selection = editor.win.getSelection();
				range = selection.getRangeAt(0);
				node = range.commonAncestorContainer;
				if (node.nodeType == 3) node = node.parentNode;
				els = node.getElementsByTagName(tagName);
				for (var i = 0; i < els.length; i++) {
					if (selection.containsNode(els[i], true)) return els[i];
				}
			}
			return null;
		},
		// 获取选中的tagName=A的元素
		getAncestorNode: function(editor, tagName) {
			var node, range, doc = editor.doc,
				win = editor.win;
			if (Browser.ie) {
				range = doc.selection.createRange();
				if (doc.selection.type == "Control") {
					node = range[0];
				} else {
					node = range.parentElement();
				}
			} else {
				node = EditorSelection.getCtrlElement(editor) || win.getSelection().getRangeAt(0).startContainer;
			}
			while (node) {
				if (node.tagName == tagName) return node;
				node = node.parentNode;
			}
			return null;
		},
		/** 
		 * 完善选中区域至某tagName的元素
		 * @method moveToAncestorNode
		 * @param {Editor} editor Editor实例
		 * @param {string} tagName tagName
		 * @return {Element}
		 */
		moveToAncestorNode: function(editor, tagName) {
			var el = EditorSelection.getAncestorNode(editor, tagName);
			if (el) {
				if (Browser.ie) {
					var range = editor.doc.body.createTextRange();
					range.moveToElementText(el);
					range.select();
				} else {
					var selection = editor.win.getSelection();
					selection.selectAllChildren(el)
				}
			}
		}

	};


	//---------------EditorHistory.js

	//---------------EditorHistory.js

	/**
	 * @class EditorHistory 接管undo/redo功能，返回一个EditorHistory的实例
	 * @namespace QW.Editor
	 * @param {Editor} editor Editor实例
	 */

	function EditorHistory(editor) {
		this.editor = editor;
		this.saveData = [];
		this.currentIndex = 0;
	}

	(function() {

		EditorHistory.prototype = {
			/** 
			 * undo到上一个状态
			 * @method undo
			 * @return {boolean} 如果已经是第一个状态，则返回false
			 */
			undo: function() {
				if (!Browser.ie) return false;
				// 已经回退到最开始保存的数据了
				if (this.currentIndex == 0) return true;
				// 如果当前位置是数组的最后一个，CTRL_Z的时候，应该回退到
				// 数组的倒数第二个位置，但是有可能编辑器中的内容已经和数组最后存储的内容
				// 也就是currentIndex指向的内容不相符合了
				// 所以需要调用一下saveUndoStep()
				// 如果编辑器中的内容和数组最后的内容相符合的话，saveUndoStep其实并没有什么作用
				var scene = this.saveData[--this.currentIndex];
				if (scene) {
					this.editor.doc.body.innerHTML = scene.innerHTML;
					this.restoreScene(scene);
					return true;
				} else {
					return false;
				}
			},

			/** 
			 * redo到下一个状态
			 * @method redo
			 * @return {boolean} 如果已经是最后一个状态，则返回false
			 */
			redo: function() {
				if (!Browser.ie) return false;

				// 已经前进到最后保存的数据了
				if (this.currentIndex == this.saveData.length - 1) return true;

				// 没有数据
				if (this.saveData.length == 0) return true;

				var scene = this.saveData[++this.currentIndex];
				if (scene) {
					this.editor.doc.body.innerHTML = scene.innerHTML;
					this.restoreScene(scene);
					return true;
				} else {
					return false;
				}
			},

			/** 
			 * 存一个状态至状态堆栈
			 * @method saveUndoStep
			 * @return {void}
			 */
			saveUndoStep: function() {
				if (!Browser.ie) return;
				if (this.saveData[this.currentIndex] && this.saveData[this.currentIndex].innerHTML == this.editor.doc.body.innerHTML) return;
				// 如果this.currentIndex == this.saveData.length - 1, saveData并不发生变化
				this.saveData = this.saveData.slice(0, this.currentIndex + 1);

				var scene = this.getScene();
				scene.innerHTML = this.editor.doc.body.innerHTML;

				var old = this.saveData[this.saveData.length - 1];
				if (old && old.innerHTML == scene.innerHTML) return;

				this.saveData.push(scene);

				var len = this.saveData.length;
				if (len > 2000) this.saveData = this.saveData.slice(len - 2000, len);
				this.currentIndex = this.saveData.length - 1;
			},

			/** 
			 * 得到当前编辑器的场景
			 * @method getScene
			 * @return {Scene}
			 */
			getScene: function() {
				var selection = this.editor.doc.selection;
				var range = selection.createRange();
				var scene = {
					type: selection.type.toLowerCase()
				};
				if ("control" == scene.type) {
					scene.control = range(0);
				} else {
					scene.bookmark = range.getBookmark();
				}
				return scene;
			},

			/** 
			 * 复现编辑器的场景
			 * @method restoreScene
			 * @param {Scene} scene 场景
			 * @return {void}
			 */
			restoreScene: function(scene) {
				if (typeof scene != "object") return;
				try {
					this.editor.win.focus();
					var body = this.editor.doc.body,
						range;
					if ("control" == scene.type) {
						range = body.createControlRange();
						range.addElement(scene.control);
					} else {
						range = body.createTextRange();
						range.moveToBookmark(scene.bookmark);
					}
					range.select();
				} catch (e) {}
			}
		};
	}());


	//---------------EditorCommand.js
	/**
	 本文件集中处理编辑器里需要自写的ToolItem的click事件，以及ti的status返馈。
	 */

	//---------------EditorCommand.js
/*
本文件集中处理编辑器里需要自写的ToolItem的click事件，以及ti的status返馈。
*/
	/**
	 * @class EditorCmd 编辑器命令集合，集中处理编辑器里需要自写的ToolItem的click事件，以及ti的status返馈。
	 * @singleton
	 * @namespace QW.Editor
	 */
	var EditorCmd = {};

	(function() {

		function _focusEnd(el) {
			try {
				el.focus();
				if (Browser.ie) {
					var range = el.createTextRange();
					range.moveStart('character', el.value.length);
					range.select();
				}
			} catch (e) {}
		}

		mix(EditorCmd, {
			/** 
			 * 根据命令结果显示toobarItem的状态是否是active(例如，是否是粗体状态).
			 * @method _tistate
			 * @param {string} cmd queryCommandState的参数
			 * @param {Element} el ToolbarItem的handle元素
			 * @param {Editor} editor Editor实例
			 * @return {void}
			 */
			/**
			 _tistate(cmd,el,editor): 根据命令结果显示toobarItem的状态是否是active.
			 */
			_tistate: function(cmd, el, editor) {
				//try{
				var state = editor.doc.queryCommandState(cmd);
				if (state) addClass(el, "active");
				else removeClass(el, "active");
				//}catch(ex){}
			},
			/** 
			 * 根据命令结果显示toobarItem的状态是否是enable(例如，是否可以进行删除链接).
			 * @method _tienable
			 * @param {string} cmd queryCommandEnabled的参数
			 * @param {Element} el ToolbarItem的handle元素
			 * @param {Editor} editor Editor实例
			 * @return {void}
			 */
			_tienable: function(cmd, el, editor) {
				//try{
				var state = editor.doc.queryCommandEnabled(cmd);
				if (state) removeClass(el, "disabled");
				else addClass(el, "disabled");
				//}catch(ex){}
			},
			/** 
			 * 设置粗体.
			 * @method tiBold
			 * @param {Event} e Event
			 * @param {Element} el ToolbarItem的handle元素
			 * @param {Editor} editor Editor实例
			 * @return {void}
			 */
			tiBold: function(e, el, editor) {
				editor.exec('Bold');
			},
			/** 
			 * 粗体状态返馈.
			 * @method tistatusBold
			 * @param {Event} e Event
			 * @param {Element} el ToolbarItem的handle元素
			 * @param {Editor} editor Editor实例
			 * @return {void}
			 */
			tistatusBold: function(e, el, editor) {
				EditorCmd._tistate("Bold", el, editor);
			},
			/** 
			 * 设置斜体.
			 * @method tiItalic
			 * @param {Event} e Event
			 * @param {Element} el ToolbarItem的handle元素
			 * @param {Editor} editor Editor实例
			 * @return {void}
			 */
			tiItalic: function(e, el, editor) {
				editor.exec('Italic');
			},
			/** 
			 * 斜体状态返馈.
			 * @method tistatusItalic
			 * @param {Event} e Event
			 * @param {Element} el ToolbarItem的handle元素
			 * @param {Editor} editor Editor实例
			 * @return {void}
			 */
			tistatusItalic: function(e, el, editor) {
				EditorCmd._tistate("Italic", el, editor);
			},
			/** 
			 * 设置下划线.
			 * @method tiUnderline
			 */
			tiUnderline: function(e, el, editor) {
				editor.exec('Underline');
			},
			tistatusUnderline: function(e, el, editor) {
				EditorCmd._tistate("Underline", el, editor);
			},
			/** 
			 * 设置orderedlist.
			 * @method tiOrderedList
			 */
			tiOrderedList: function(e, el, editor) {
				editor.exec('InsertOrderedList');
			},
			tistatusOrderedList: function(e, el, editor) {
				EditorCmd._tistate("InsertOrderedList", el, editor);
			},
			/** 
			 * 设置unorderedlist.
			 * @method tiUnorderedList
			 */
			tiUnorderedList: function(e, el, editor) {
				editor.exec('InsertUnorderedList');
			},
			tistatusUnorderedList: function(e, el, editor) {
				EditorCmd._tistate("InsertUnorderedList", el, editor);
			},
			/** 
			 * undo.
			 * @method tiUndo
			 */
			tiUndo: function(e, el, editor) {
				if (Browser.ie) {
					editor.editorHistory.saveUndoStep();
					editor.editorHistory.undo();
				} else {
					editor.doc.execCommand("Undo", false, null);
				}
				editor.fireSelectionChange();
			},
			tistatusUndo: function(e, el, editor) {
				if (Browser.ie) {
					var eh = editor.editorHistory;
					if (eh.currentIndex == 0 && (eh.saveData[0].innerHTML == editor.doc.body.innerHTML)) addClass(el, "disabled");
					else removeClass(el, "disabled");
				} else {
					EditorCmd._tienable("Undo", el, editor);
				}
			},
			/** 
			 * redo.
			 * @method tiRedo
			 */
			tiRedo: function(e, el, editor) {
				if (Browser.ie) {
					editor.editorHistory.saveUndoStep();
					editor.editorHistory.redo();
				} else {
					editor.doc.execCommand("Redo", false, null);
				}
				editor.fireSelectionChange();
			},
			tistatusRedo: function(e, el, editor) {
				if (Browser.ie) {
					var eh = editor.editorHistory;
					if (eh.currentIndex >= eh.saveData.length - 1) addClass(el, "disabled");
					else removeClass(el, "disabled");
				} else {
					EditorCmd._tienable("Redo", el, editor);
				}
			},
			_tiFontNameConfig: '宋体,楷体_GB2312,黑体,隶书,Times New Roman,Arial'.split(","),
			_tiFontNamePopup: null,
			/** 
			 * 设置fontname.
			 * @method tiFontName
			 */
			tiFontName: function(e, el, editor) {
				var pop = EditorCmd._tiFontNamePopup;
				if (!pop) {
					var html = [];
					var fontFace = EditorCmd._tiFontNameConfig;
					for (var i = 0; i < fontFace.length; i++) {
						html.push('<div unselectable="on" class="cell" onmouseover="this.style.borderColor=\'#FF0000\'" onmouseout="this.style.borderColor=\'#DDDDDD\'" fontName="' + fontFace[i] + '" >' + '<font unselectable="on" style="font-size:12px;" face="' + fontFace[i] + '">' + fontFace[i] + '</font></div>');
					}
					pop = EditorCmd._tiFontNamePopup = new QW.LayerPopup({
						body: '<div class="js-editor-ti-fontname">' + html.join('') + '</div>'
					});
					var els = pop.oBody.firstChild.childNodes;
					var fun = function(e) {
						pop.hide();
						Editor.activeInstance.exec('FontName', this.getAttribute("fontName"));
					};
					for (var i = 0; i < els.length; i++) {
						els[i].onclick = fun;
					}
				}
				pop.show(0, el.offsetHeight, 130, null, el);
			},
			tistatusFontName: function(e, el, editor) {
				var val = editor.doc.queryCommandValue("FontName");
				if (val && arrContains(EditorCmd._tiFontNameConfig, val)) el.firstChild.innerHTML = val;
				else el.firstChild.innerHTML = "字体";
			},
			_tiFontSizeConfig: '2:小,3:标准,4:大,5:特大,6:极大'.split(","),
			_tiFontSizePopup: null,
			/** 
			 * 设置fontsize.
			 * @method tiFontSize
			 */
			tiFontSize: function(e, el, editor) {
				var pop = EditorCmd._tiFontSizePopup;
				if (!pop) {
					var html = [],
						fontSize = EditorCmd._tiFontSizeConfig;
					for (var i = 0; i < fontSize.length; i++) {
						var size = fontSize[i].split(':')[0],
							text = fontSize[i].split(':')[1];
						html.push('<div unselectable="on" class="cell" onmouseover="this.style.borderColor=\'#FF0000\'" onmouseout="this.style.borderColor=\'#DDDDDD\'" fontSize="' + size + '"> ' + '<font unselectable="on" size="' + size + '" >' + text + '</font></div>');
					}
					pop = EditorCmd._tiFontSizePopup = new QW.LayerPopup({
						body: '<div class="js-editor-ti-fontsize">' + html.join('') + '</div>'
					});
					var els = pop.oBody.firstChild.childNodes,
						fun = function(e) {
							pop.hide();
							Editor.activeInstance.exec('FontSize', this.getAttribute("fontSize"));
						};
					for (var i = 0; i < els.length; i++) {
						els[i].onclick = fun;
					}
				}
				pop.show(0, el.offsetHeight, 130, null, el);
			},
			tistatusFontSize: function(e, el, editor) {
				var fontSize = EditorCmd._tiFontSizeConfig;
				var val = editor.doc.queryCommandValue("FontSize");
				for (var i = 0; i < fontSize.length; i++) {
					var a = fontSize[i].split(":");
					if (a[0] == val) {
						el.firstChild.innerHTML = a[1];
						return;
					}
				}
				el.firstChild.innerHTML = "字号";
			},
			_colorsPopup1: null,
			_showColors1: function(e, el, colorBackfill, defaultColor) {
				var pop = EditorCmd._colorsPopup1;
				if (!pop) {
					var html = ['<div class="js-editor-ti-color1"><table cellpadding="2" cellspacing="0" border="0" style="width:100%">'];
					var colors = '000000,993300,333300,003300,003366,000080,333399,333333,800000,FF6600,808000,808080,008080,0000FF,666699,808080,FF0000,FF9900,99CC00,339966,33CCCC,3366FF,800080,999999,FF00FF,FFCC00,FFFF00,00FF00,00FFFF,00CCFF,993366,C0C0C0,FF99CC,FFCC99,FFFF99,CCFFCC,CCFFFF,99CCFF,CC99FF,FFFFFF'.split(',');
					var rc = 8;
					var cl = colors.length;
					var cc = Math.ceil(cl / rc);
					html.push('<tr><td colspan="' + rc + '" class="cell"><span class="colorBox-big"></span><span class="colortext">&nbsp自动</span></td></tr>');
					for (var i = 0, j = 0; i < cc; i++) {
						html.push('<tr>');
						for (j = 0; j < rc; j++) {
							if (i * rc + j >= cl) break;
							html.push('<td class="cell" colorValue="#' + colors[i * rc + j] + '" ><div class="colorbox" style="background-color:#' + colors[i * rc + j] + '"></div></td>');
						}
						html.push('</tr>');
					}
					html.push('<tr><td colspan="' + rc + '" class="cell" ><span>其它颜色...</span></td></tr>');
					html.push('</table></div>');
					pop = EditorCmd._colorsPopup1 = new QW.LayerPopup({body: html.join("").replace(/(<\w+)/ig, '$1  unselectable="on"')});
					var els = pop.oBody.getElementsByTagName("td");
					var _msOver = function(e) {
							addClass(this, "cell-over");
						},
						_msOut = function(e) {
							removeClass(this, "cell-over");
						},
						_msClick = function() {
							pop.hide();
							pop._colorBackfill(this.getAttribute("colorValue"));
						};
					for (var i = 0; i < els.length; i++) {
						els[i].onmouseover = _msOver;
						els[i].onmouseout = _msOut;
						els[i].onclick = _msClick;
					}
				}
				pop._colorBackfill = colorBackfill;
				var els = pop.oBody.getElementsByTagName("td");
				els[0].setAttribute("colorValue", defaultColor);
				els[0].childNodes[0].style.backgroundColor = defaultColor;
				els[els.length - 1].onclick = function(e) {
					pop.hide();
					EditorCmd._showColors2(e, el, colorBackfill, defaultColor);
				};
				pop.show(0, el.offsetHeight, 163, null, el);
			},
			_colorPopup2: null,
			_showColors2: function(e, el, colorBackfill, defaultColor) {
				var pop = EditorCmd._colorsPopup2;
				if (!pop) {
					var colorCell = function(c) {
						return '<td class="cell" colorValue="#' + c + '" style="background-color:#' + c + ';border:1px solid #' + c + '" title="#' + c + '">&nbsp;</td>';
					};
					var rgb = ["00", "33", "66", "99", "CC", "FF"];
					var aColors = "000000,333333,666666,999999,CCCCCC,FFFFFF,FF0000,00FF00,0000FF,FFFF00,00FFFF,FF00FF".split(",");
					var html = ['<div class="js-editor-ti-color2"><table class=colors-hd cellSpacing=1 border=0 ><tr><td><span class="colorbox-big"></span><span class="colortext">&nbsp;预览</span></td></tr></table>'];
					html.push('<table class=colors-bd cellSpacing=1 border=0 >');
					for (var i = 0; i < 12; i++) {
						html.push('<tr>' + colorCell(aColors[i]) + colorCell('000000'));
						for (var j = 0; j < 18; j++) {
							var c = rgb[(i - i % 6) / 2 + (j - j % 6) / 6] + rgb[j % 6] + rgb[i % 6];
							html.push(colorCell(c));
						}
						html.push('</tr>');
					}
					html.push('</table></div>');
					pop = EditorCmd._colorsPopup2 = new LayerPopup({
						body: html.join("").replace(/(<\w+)/ig, '$1  unselectable="on"')
					});
					var els = pop.oBody.getElementsByTagName("td");
					pop._previewCell = els[0];
					pop._previewFun = function(colorValue) {
						pop._previewCell.setAttribute("colorValue", colorValue);
						pop._previewCell.childNodes[0].style.backgroundColor = colorValue;

					};
					var _msOver = function(e) {
						this.style.border = "1px solid #FFF";
						pop._previewFun(this.getAttribute("colorValue"));
					};
					var _msOut = function(e) {
						this.style.border = "1px solid " + this.getAttribute("colorValue");
						pop._previewFun(pop._defaultColor);
					};
					var _msClick = function() {
						pop.hide();
						pop._colorBackfill(this.getAttribute("colorValue"));
					};
					for (var i = 0; i < els.length; i++) {
						if (i > 0) {
							els[i].onmouseover = _msOver;
							els[i].onmouseout = _msOut;
						}
						els[i].onclick = _msClick;
					}
				}
				pop._colorBackfill = colorBackfill;
				pop._defaultColor = defaultColor;
				pop._previewFun(defaultColor);
				pop.show(0, el.offsetHeight, 274, null, el);
			},
			/** 
			 * 设置fontcolor.
			 * @method tiForeColor
			 */
			tiForeColor: function(e, el, editor) {
				EditorCmd._showColors1(e, el, function(a) {
					Editor.activeInstance.exec('ForeColor', a);
				}, "#000");
			},
			/** 
			 * 设置backcolor.
			 * @method tiBackColor
			 */
			tiBackColor: function(e, el, editor) {
				EditorCmd._showColors1(e, el, function(a) {
					Editor.activeInstance.exec(Browser.ie && "BackColor" || "HiliteColor", a);
				}, "#FFF");
			},
			/** 
			 * 清空格式设置.
			 * @method tiRemoveFormat
			 */
			tiRemoveFormat: function(e, el, editor) {
				if (Browser.ie) { //JK:Add these code for :IE can not remove format of <span style="..."> 待完善
					var doc = editor.doc;
					if (doc.selection.type.toLowerCase() == "text") {
						editor.exec('RemoveFormat', null, false, true);
						var r = doc.selection.createRange();
						var tags = r.htmlText.match(/<\w+(\s|>)/ig);
						if (!tags || tags.length > 0 && (/span/ig).test(tags.join("")) && (tags.join("_") + "_").toLowerCase().replace(/[<>\s]/g, "").replace(/(font|strong|em|u|span|p|br|wbr)_/g, "") == "") {
							var len = r.text.replace(/(\r\n)|/ig, "1").length;
							r.text = r.text + "";
							r.moveStart("character", -len);
							r.select();
						}
						editor.exec('RemoveFormat', null, true, false);
						return;
					}
				}
				editor.exec('RemoveFormat');
			},
			_tiJustify: function(e, el, editor, justifyType) {
				var oImg = EditorSelection.getCtrlElement(editor);
				if (oImg && oImg.tagName == 'IMG') {
					var sf = justifyType.toLowerCase();
					if (sf == "center") sf = "none";
					//JK：非IE浏览器，直接设style，不会添加undo步骤
					var curSf = oImg.style[Browser.ie ? "styleFloat" : "cssFloat"];
					oImg.style[Browser.ie ? "styleFloat" : "cssFloat"] = (curSf == sf ? "none" : sf);
					editor.exec(0, 0, true, false);
				} else {
					if (hasClass(el, "active")) {
						editor.exec(Browser.firefox ? "JustifyLeft" : "JustifyNone");
					} else editor.exec("Justify" + justifyType);
				}
			},
			_tistatusJustify: function(e, el, editor, oCtrl, justifyType) {
				if (oCtrl && oCtrl.tagName == "IMG") {
					var sf = oCtrl.style[Browser.ie && "styleFloat" || "cssFloat"];
					var bl = (justifyType.toLowerCase() == sf) || (justifyType == "Center" && (!sf || sf == "none"));
					if (bl) addClass(el, "active");
					else removeClass(el, "active");
				} else EditorCmd._tistate("Justify" + justifyType, el, editor);
			},
			/** 
			 * tiJustifyLeft.
			 * @method tiJustifyLeft
			 */
			tiJustifyLeft: function(e, el, editor) {
				EditorCmd._tiJustify(e, el, editor, "Left");
			},
			tistatusJustifyLeft: function(e, el, editor, oCtrl) {
				EditorCmd._tistatusJustify(e, el, editor, oCtrl, "Left");
			},
			/** 
			 * tiJustifyCenter.
			 * @method tiJustifyCenter
			 */
			tiJustifyCenter: function(e, el, editor) {
				EditorCmd._tiJustify(e, el, editor, "Center");
			},
			tistatusJustifyCenter: function(e, el, editor, oCtrl) {
				EditorCmd._tistatusJustify(e, el, editor, oCtrl, "Center");
			},
			/** 
			 * tiJustifyRight.
			 * @method tiJustifyRight
			 */
			tiJustifyRight: function(e, el, editor) {
				EditorCmd._tiJustify(e, el, editor, "Right");
			},
			tistatusJustifyRight: function(e, el, editor, oCtrl) {
				EditorCmd._tistatusJustify(e, el, editor, oCtrl, "Right");
			},
			_tiLinkDialog: null,
			/** 
			 * 设置链接.
			 * @method tiLink
			 */
			tiLink: function(e, el, editor) {
				var dlg = EditorCmd._tiLinkDialog;
				if (!dlg) {
					dlg = EditorCmd._tiLinkDialog = QW.Panel.getSysDialog("prompt", "添加/修改链接", function() {
						var editor = Editor.activeInstance;
						var v = dlg.returnValue;
						if (v == null) return editor._focus(); //未修改
						editor.exec('UnLink'); //断开原有的链接
						if (v.toLowerCase() != "http://") {
							if (Browser.ie && editor.doc.selection.type == "None" || !Browser.ie && editor.win.getSelection().isCollapsed) {
								editor.pasteHTML('<a href="' + v + '" target="_blank">' + v + '</a>');
							} else editor.exec('CreateLink', v);
						}
					}, {
						withMask: 1
					});
					dlg.un('aftershow');
					dlg.on('aftershow', function() {
						_focusEnd(dlg.dialogInput);
					});
				}
				var oLink = EditorSelection.getAncestorNode(editor, "A") || EditorSelection.get1stSelectedNode(editor, "A");
				var sHref = oLink && oLink.href || "http://";
				dlg.dialogInput.value = sHref;
				dlg.returnValue = undefined;
				var rect = getRect(el);
				dlg.show(null, rect.top + rect.height + 10, 300);
			},
			/** 
			 * 移除链接.
			 * @method tiUnLink
			 */
			tiUnLink: function(e, el, editor) {
				if (!Browser.ie && editor.win.getSelection().isCollapsed) EditorSelection.moveToAncestorNode(editor, "A");
				editor.exec('UnLink');
			},
			tistatusUnLink: function(e, el, editor) {
				if (Browser.ie || Browser.opera) EditorCmd._tienable("UnLink", el, editor);
				else {
					if (EditorSelection.getAncestorNode(editor, "A") || EditorSelection.get1stSelectedNode(editor, "A")) removeClass(el, "disabled");
					else addClass(el, "disabled");
				}
			},
			_tiImageUrl: "",
			_tiImageDialog: null,
			_tiImageIfmWin: null,
			/** 
			 * 插入图片.
			 * @method tiImage
			 */
			tiImage: function(e, el, editor) {
				// 检查选种的部分是否含有图像
				var dlg = EditorCmd._tiImageDialog;
				if (!dlg) {
					var url4TiImage = editor.insertImgUrl; //这个里面用了iframe，有可能编辑器要立即上传图片，所以需要相应的反台支持。在这里留一个入口。
					var html = '<div class="js-editor-ti-image"><iframe frameBorder=0 id="EditorInsertImgIfm" name="EditorInsertImgIfm"' + (url4TiImage ? ' src="' + url4TiImage + '"' : "") + '/></div>';
					var opts = {
						title: '插入图片',
						body: html,
						posCenter: 1,
						withMask: 1,
						dragable: !!QW.SimpleDrag,
						keyEsc: 1
					};
					dlg = EditorCmd._tiImageDialog = new QW.LayerDialog(opts);
					dlg.on('afterhide', function() {
						Editor.activeInstance.focus();
					});
					EditorCmd._tiImageIfmWin = g("EditorInsertImgIfm").contentWindow;
					if (!url4TiImage) {
						var doc = EditorInsertImgIfm.document;
						doc.write("<html><head><title>Image</title><meta http-equiv='Content-Type' content='text/html; charset=GB2312' /><link rel=stylesheet href='" + Editor.editorPath + "/tifiles/tiimage/TiImage.css' ></link>" + "</head><body >aaaa</body><script language=javascript src='" + Editor.editorPath + "/tifiles/tiimage/TiImage.js' ><\/script></html>");
						doc.close();
					}
					//window.editorImageDialogInt=window.setInterval(function(){try{if(ifmWin.isInitialized) {window.clearInterval(window.editorImageDialogInt);dlg.show();ifmWin.initImg(imgUrl,imgFloat);}}catch(e){;}},20);
				}
				var rect = getRect(el);
				dlg.show(null, rect.top + rect.height + 10, 516);
				var oImg = EditorSelection.getCtrlElement(editor);
				var imgUrl = "";
				var cssFloat = "";
				if (oImg && oImg.tagName == 'IMG') {
					imgUrl = oImg.src;
					cssFloat = oImg.style[Browser.ie && "styleFloat" || "cssFloat"];
					if ("none" == (cssFloat || "none").toLowerCase()) cssFloat = oImg.style.textAlign;
				}
				lazyApply(function() {
					EditorCmd._tiImageIfmWin.initImg(imgUrl, cssFloat);
				}, null, [], 10, function() {
					return !!EditorCmd._tiImageIfmWin.initImg;
				});
			},
			_tiImageExec: function(img_url, img_float) {
				var editor = Editor.activeInstance;
				if (!img_float) {
					editor.pasteHTML('<img src="' + img_url + '"/>');
				} else if (img_float == "center") {
					editor.pasteHTML('<img src="' + img_url + '" style="margin:auto;display:block;text-align:center;" />');
				} else {
					editor.pasteHTML('<img src="' + img_url + '" style="margin:0px 5px 0px 5px;float:' + img_float + '" />');
				}
				EditorCmd._tiImageDialog.hide();
			},
			//TiFace
			_tiFaceDialog: null,
			/** 
			 * 插入表情.
			 * @method tiFace
			 */
			tiFace: function(e, el, editor) {
				var dlg = EditorCmd._tiFaceDialog;
				if (!dlg) {
					var html = ["<div class='js-editor-ti-face' id=editor_faces_wraper><div>loading...</div>"];
					var opts = {
						title: '插入表情图标',
						body: html.join(""),
						posCenter: 1,
						withMask: 1,
						dragable: !!QW.SimpleDrag,
						keyEsc: 1
					};
					dlg = EditorCmd._tiFaceDialog = new QW.LayerDialog(opts);
					dlg.on('afterhide', function() {
						Editor.activeInstance.focus();
					});
					var oScript = QW.loadJs(Editor.editorPath + "tifiles/tiface/TiFace.js?v=1.2.js");
					//return false;
				}
				var rect = getRect(el);
				dlg.show(null, rect.top + rect.height + 10, 400);
			},
			_tiFaceExec: function(src, alt) {
				Editor.activeInstance.pasteHTML('<img src="' + src + '"' + (alt ? ' alt="' + alt + '"' : '') + '/>');
				EditorCmd._tiFaceDialog.hide();
			},


			_tiCharacterDialog: null,
			/** 
			 * 插入特殊字符.
			 * @method tiCharacter
			 */
			tiCharacter: function(e, el, editor) {
				var chars = "§№☆★○●◎◇◆□■△▲※→←↑↓＝¤＃＆＠＼????∑∏℃‰。Ф＿￣－?∪∩≮≯∨∧≤≥?♀♂⊙".split("");
				var dlg = EditorCmd._tiCharacterDialog;
				if (!dlg) {
					var len = chars.length;
					var cols = 10;
					var rows = Math.ceil(len / cols);
					var html = ["<div class='js-editor-ti-character'><table cellpadding='0' cellspacing='0' border='1' >"];
					for (var i = 0; i < len; i++) {
						if (i % cols == 0) html.push("<tr>");
						html.push("<td align='center' onclick='Editor.EditorCmd._tiCharacterExec(this.innerHTML);' onmouseover='this.className=\"active\"' onmouseout='this.className=\"\"'>" + chars[i] + "</td>");
						if (i % cols == cols - 1) html.push("</tr>");
					}
					html.push("</table></div>");
					var opts = {
						title: '插入特殊字符',
						body: html.join(""),
						posCenter: 1,
						withMask: 1,
						dragable: !!QW.SimpleDrag,
						keyEsc: 1
					};
					dlg = EditorCmd._tiCharacterDialog = new QW.LayerDialog(opts);
					dlg.on('afterhide', function() {
						Editor.activeInstance.focus();
					});
				}
				var rect = getRect(el);
				dlg.show(null, rect.top + rect.height + 10, 400);
			},
			_tiCharacterExec: function(c) {
				Editor.activeInstance.pasteHTML(c);
				EditorCmd._tiCharacterDialog.hide();
			}
		});

		Editor.EditorCmd = EditorCmd;

	}());


	Editor.EditorHistory = EditorHistory;
	Editor.EditorCmd = EditorCmd;
	Editor.EditorSelection = EditorSelection;

}());