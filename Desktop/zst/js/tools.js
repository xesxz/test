/**
 * 将查询字符串转换为对象
 * @param queryString <String> 查询字符串
 * @return <Object> 转换后生成的对象
 */
function parseToObject(queryString) {
	// 使用 & 符号将查询字符串分割开
	var parts = queryString.split("&");
	// 遍历所有的 "key=value" 字符串结构
	var obj = {};
	for (var i = 0, len = parts.length; i < len; i++) {
		// 使用 = 将 "key=value" 字符串分割开
		var arr = parts[i].split("=");
		// = 号前的内容是对象的属性名，= 号后的内容是对应属性的值
		var
			name = arr.shift(),
			value = arr.join("=");
		// 将属性添加到对象中
		obj[name] = value;
	}

	// 返回创建好的对象
	return obj;
}

/**
 * 产生一个指定范围的随机整数
 * @param lower <Number> 下限
 * @param upper <Number> 上限
 * @return <Number> 从 lower 到 upper 范围内的任意随机整数，可包括下限值，不包括上限值
 */
function random(lower, upper) {
	return Math.floor(Math.random() * (upper - lower)) + lower;
}

/**
 * 生成随机RGB颜色
 */
function randomColor() {
	var
		r = random(0, 256),
		g = random(0, 256),
		b = random(0, 256);
	return "rgb("+ r +", "+ g +", "+ b +")";
}

/**
 * 根据类名查找元素，解决浏览器兼容问题
 * @param className <String> 待查找的类名
 * @return 返回查找到的元素集合
 */
function byClass(className) {
	if (document.getElementsByClassName) // 支持使用
		return document.getElementsByClassName(className);

	/* 不支持使用 getElementsByClassName() 方法，解决兼容 */
	// 定义保存结果的数组
	var result = [];
	// 根据标签名查找所有元素
	var elements = document.getElementsByTagName("*");
	// 遍历每个元素
	for (var i = 0, len = elements.length; i < len; i++) {
		// 当前遍历到元素的所有类名
		var classNames = elements[i].className.split(" ");
		// 遍历当前元素的类名
		for (var j = 0, l = classNames.length; j < l; j++) {
			// 判断当前遍历到的类名是否与待查找元素的类名一致
			if (classNames[j] === className) {
				// 一致，则说明当前遍历到的元素是待查找出元素其中之一
				result.push(elements[i]);
				break;
			}
		}
	}
	// 返回查找到的结果
	return result;
}

/**
 * 根据id/类名/元素名称查找元素
 * @param selector 选择器(#id 、.className、tagname)
 * @return 返回根据选择器条件查找到的元素
 */
function $(selector) {
	if (selector.indexOf("#") === 0) // id
		return document.getElementById(selector.slice(1))
	if (selector.indexOf(".") === 0) // className
		return byClass(selector.slice(1));
	// element
	return document.getElementsByTagName(selector);
}

/**
 * 添加事件监听：解决兼容(事件冒泡)
 * @param element 待添加事件的事件源元素
 * @param type 事件类型字符串
 * @param callback 事件处理程序
 */
function on(element, type, callback) {
	if (element.addEventListener) { // 支持使用 addEventListener() 方法
		if (type.indexOf("on") === 0) // "onclick"，以 "on" 开头，去掉 "on" 前缀
			type = type.slice(2);
		element.addEventListener(type, callback);
	} else { // 不支持使用 addEventListener() 方法
		if (type.indexOf("on") !== 0) // 不以 "on" 开头，则连接前缀
			type = "on" + type;
		element.attachEvent(type, callback);
	}
}

/**
 * 获取元素的CSS样式属性值
 */
function css(element, attrName) {
	/*if (window.getComputedStyle)
		return window.getComputedStyle(element)[attrName]
	return element.currentStyle[attrName];*/

	return window.getComputedStyle 
			? getComputedStyle(element)[attrName]
			: element.currentStyle[attrName];
}

/**
 * 保存或读取cookie
 */
function cookie(key, value, options) {
	// 未传递 value 参数，表示根据 cookie 名获取对应的 cookie 值
	if (typeof value === "undefined") {
		// 所有cookie
		var cookies = document.cookie.split("; ");
		// 遍历每条 cookie
		for (var i = 0, len = cookies.length; i < len; i++) {
			// "key=value"
			var parts = cookies[i].split("=")
			// cookie名，由于保存时会编码，所以读取时需要解码
			var name = decodeURIComponent(parts.shift());
			// 比较
			if (name === key) { // 如果当前遍历到 cookie 名与待查找的 cookie 名称一致，则说明找到了
				return decodeURIComponent(parts.join("="))
			}
		}
		// 未查找到，则返回 undefined;
		return undefined;
	}

	/* 传递了 value表示保存 cookie */
	var cookie = encodeURIComponent(key) + "="+ encodeURIComponent(value);
	// 未传递 options 参数，默认取 {}
	options = options || {};
	// 判断是否有失效时间
	if (options.expires) {
		var date = new Date();
		date.setDate(date.getDate() + options.expires);
		cookie += "; expires=" + date.toUTCString();
	}
	// 判断是否有路径
	if (options.path)
		cookie += "; path=" + options.path;
	// 判断域
	if (options.domain)
		cookie += "; domain=" + options.domain;
	// 判断 secure
	if (options.secure)
		cookie += "; secure";

	// 保存 cookie
	document.cookie = cookie;
}

function removeCookie(key, options) {
	options = options || {};
	options.expires = -1;
	cookie(key, "", options);
}

/**
 * 运动框架，多属性运动框架
 * @param element 待添加运动动画效果的元素
 * @param options 运动目标终点值对象
 * @param speed 运动总时间
 * @param fn 可选参数，运动结束后继续执行的函数
 */
function animate(element, options, speed, fn) {
	// 先取消元素上已有的运动动画
	clearInterval(element.timer);
	// 计算元素运动初始值、范围值
	var start = {}, range = {};
	for (var attrName in options) {
		start[attrName] = parseFloat(css(element, attrName));
		range[attrName] = options[attrName] - start[attrName];
	}
	// 记录启动运动动画效果的时间
	var startTime = +new Date();
	// 启动计时器，实现运动动画
	element.timer = setInterval(function(){
		// 计算运动时间
		var elapsed = Math.min(+new Date() - startTime, speed);
		// 根据公式：计算每个运动属性当前计算值
		for(var attrName in options) {
			var result = elapsed * range[attrName] / speed + start[attrName];
			// CSS设置各属性当前值
			element.style[attrName] = result + (attrName === "opacity" ? "" : "px");
		}
		// 判断是否停止运动计时器
		if (elapsed === speed) {
			clearInterval(element.timer);
			// 如果有运动结束后继续执行的函数，则调用执行
			fn && fn();
		}
	}, 1000/60);
}

/**
 * 淡出
 * @param element 待添加运动动画效果的元素
 * @param speed 运动总时间
 * @param fn 可选参数，运动结束后继续执行的函数
 */
function fadeOut(element, speed, fn) {
	// 默认运动时间为 400ms
	speed = speed || 400;
	animate(element, {opacity: 0}, speed, function() {
		// 淡出完毕，隐藏元素
		element.style.display = "none";
		fn && fn();
	});
}

/**
 * 淡入
 * @param element 待添加运动动画效果的元素
 * @param speed 运动总时间
 * @param fn 可选参数，运动结束后继续执行的函数
 */
function fadeIn(element, speed, fn) {
	// 默认运动时间为 400ms
	speed = speed || 400;
	// 显示出元素
	element.style.display = "block";
	// 初始不透明度为0
	element.style.opacity = 0;
	// 运动动画
	animate(element, {opacity: 1}, speed, fn);
}
