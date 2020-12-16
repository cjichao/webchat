/**
 * @param {Object} targetDom  鼠标指向的dom
 * @param {Object} moveDom   要移动的dom
 * @param {Object} isBoundary 是否有边界
 */
(function() {
	function move(targetDom, moveDom, isBoundary, parent) {
		if (targetDom === undefined || targetDom === '') {
			// alert('请传入鼠标指定的dom对象');
			return;
		}
		if (isBoundary === undefined) {
			isBoundary = true;
		} else {
			isBoundary = !!isBoundary;
		}
		if (parent === undefined) {
			parent = !!parent;
		} else {
			parent = true;
		}
		moveDom = moveDom || targetDom;
		var isMove = false;
		var x, y;
		var moveDomStyle = getComputedStyle(moveDom);
		var tf = moveDomStyle.transform;

		var moveDomWidth = parseInt(moveDomStyle.width);
		var moveDomHeight = parseInt(moveDomStyle.height);
		var currentX = parseInt(moveDomStyle.left);
		var currentY = parseInt(moveDomStyle.top);

		if (tf !== 'none') {
			var tfArr = tf.replace(/matrix\(|\)/g, '').split(',');
			var offset_x = parseInt(tfArr[4]);
			var offset_y = parseInt(tfArr[5]);
			moveDom.style.left = currentX + offset_x + 'px';
			moveDom.style.top = currentY + offset_y + 'px';
			moveDom.style.transform = 'translate(0,0)';
			currentX = parseInt(moveDomStyle.left);
			currentY = parseInt(moveDomStyle.top);
		} else {
			moveDom.style.left = currentX + 'px';
			moveDom.style.top = currentY + 'px';
		}
		var clientX, clientY;
		if (parent) {
			var parentNode = moveDom.parentNode;
			var parentNodeStyle = getComputedStyle(parentNode);
			clientX = parseInt(parentNodeStyle.width);
			clientY = parseInt(parentNodeStyle.height);
		} else {
			clientX = document.body.clientWidth;
			clientY = document.body.clientHeight;
		}
		var offsetX = 0;
		var offsetY = 0;
		var maxX = clientX - moveDomWidth;
		var maxY = clientY - moveDomHeight;

		targetDom.addEventListener('mousedown', function(e) {
			e = e || event;
			// e.preventDefault();
			if (e.target === targetDom) {
				isMove = true;
				x = e.clientX;
				y = e.clientY;
			}
		})
		document.addEventListener('mousemove', function(e) {
			if (isMove) {
				e = e || event;
				var moveX = e.clientX - x;
				var moveY = e.clientY - y;
				var positionX = currentX + moveX;
				var positionY = currentY + moveY;
				if (isBoundary) {
					if (moveX < 0) {
						positionX = Math.max(offsetX, positionX);
					} else {
						positionX = Math.min(maxX, positionX);
					}
					if (moveY < 0) {
						positionY = Math.max(offsetY, positionY);
					} else {
						positionY = Math.min(maxY, positionY);
					}
				}

				moveDom.style.left = positionX + 'px';
				moveDom.style.top = positionY + 'px';
			}
		})
		document.addEventListener('mouseup', function(e) {
			e = e || event;
			e.preventDefault()
			isMove = false;
			currentX = parseInt(moveDomStyle.left);
			currentY = parseInt(moveDomStyle.top);
		})
	}
	window.moveDom = move;
})()
