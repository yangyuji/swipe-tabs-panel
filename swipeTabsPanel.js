/*
* author: "oujizeng",
* license: "MIT",
* github: "https://github.com/yangyuji/swipe-tabs-panel",
* name: "swipeTabsPanel.js",
* version: "1.2.1"
*/

(function (root, factory) {
    if (typeof module != 'undefined' && module.exports) {
        module.exports = factory();
    } else if (typeof define == 'function' && define.amd) {
        define( function () { return factory(); } );
    } else {
        root['swipeTabsPanel'] = factory();
    }
}(this, function () {
    'use strict'

    var _getEle = function (str) {
        return document.querySelector(str);
    };

    var _transform = function (el, attr, val) {
        var vendors = ['', 'webkit', 'ms', 'Moz', 'O'],
            body = document.body || document.documentElement;

        [].forEach.call(vendors, function (vendor) {
            var styleAttr = vendor ? vendor + attr.charAt(0).toUpperCase() + attr.substr(1) : attr;
            if (typeof body.style[styleAttr] === 'string') {
                el.style[styleAttr] = val;
            }
        });
    };

    var _transitionEnd = function (el, fun) {
        var vendors = ['webitTransitionEnd', 'transitionend'];
        var handler = function (e) {
            [].forEach.call(vendors, function (vendor) {
                el.removeEventListener(vendor, handler, false);
            });
            fun.apply(el, arguments);
        };
        [].forEach.call(vendors, function (vendor) {
            el.addEventListener(vendor, handler, false);
        });
    };

    var swipeTabsPanel = {

        init: function(opt){

            var moveCountX = opt.moveCountX || 40,          // 位移系数
                coefficient = 0.35,                         // 阻尼系数，0.2~0.5比较合适
                clientWidth = window.screen.width,
                clientHeight = window.screen.height,
                panelNum = 3,                               // 默认屏个数
                currentPanel = 1,                           // 当前所在屏
                moveX = 0,                                  // 横向滑动距离
                moveY = 0,                                  // 竖向滑动距离
                moveDirection = '',                         // 滑动方向，在开始的时候就定死，不再改变
                currentMoveX = 0,                           // 横向动画已经滑动距离
                dragStart = null;                           // 开始抓取标志位

            var scroller = _getEle(opt.scroller),            // 滚动容器
                page = _getEle(opt.page);                    // 主容器

            page.addEventListener('touchstart', function (e) {
                // 记录开始滑动位置
                dragStart = {
                    x: e.touches[0].pageX,
                    y: e.touches[0].pageY
                };
                // 还原transitionDuration
                _transform(scroller, 'transitionDuration', '0ms');
            });

            page.addEventListener('touchmove', function (e) {
                // 防止从其他地方滑到page内的
                if (dragStart === null) {
                    return;
                }

                var nowX = e.touches[0].pageX;
                var nowY = e.touches[0].pageY;
                moveX = nowX - dragStart.x;
                moveY = nowY - dragStart.y;

                // 上下滑动
                if(Math.abs(moveX) <= Math.abs(moveY)) {
                    if (moveY > 0) {
                        moveDirection = 'down'
                    } else {
                        moveDirection = 'up'
                    }
                }
                // 左右滑动
                if (Math.abs(moveX) > Math.abs(moveY)) {

                    if (moveX > 0) {
                        moveDirection = 'right';
                        // 已经到最左边了
                        if (currentMoveX == 0) {
                            // 加上阻尼效果
                            // var x = moveX > clientWidth ? clientWidth * coefficient : moveX * coefficient;
                            // 改为不限制滚动距离
                            var x = moveX * coefficient;
                            _transform(scroller, 'transform', 'translate3d(' + x + 'px,0,0)');
                        } else {
                            _transform(scroller, 'transform', 'translate3d(' + (currentMoveX + Math.abs(moveX)) + 'px,0,0)');
                        }
                    } else {
                        moveDirection = 'left';
                        // 已经到最右边了
                        if (Math.abs(currentMoveX) >= (panelNum - 1) * clientWidth) {
                            // 加上阻尼效果
                            // var x = Math.abs(moveX) > clientWidth ? currentMoveX - (clientWidth * coefficient) : currentMoveX - (Math.abs(moveX) * coefficient);
                            // 改为不限制滚动距离
                            var x = currentMoveX - (Math.abs(moveX) * coefficient);
                            _transform(scroller, 'transform', 'translate3d(' + x + 'px,0,0)');
                        } else {
                            _transform(scroller, 'transform', 'translate3d(' + (currentMoveX - Math.abs(moveX)) + 'px,0,0)');
                        }
                    }
                }
            });

            page.addEventListener('touchend', function() {

                if (moveX === 0 && moveY === 0) {
                    return;
                }

                _transform(scroller, 'transition', 'transform 350ms cubic-bezier(0, 0, 0.25, 1)');

                // 向右滑动
                if (moveDirection == 'right') {
                    // 达到第一屏
                    if (currentMoveX === 0) {
                        scroller.style.transform = 'translate3d(' + currentMoveX + 'px,0,0)';
                    } else {
                        if (Math.abs(moveX) > moveCountX) {
                            // 向右滑一屏
                            currentPanel -= 1;
                            currentMoveX += clientWidth;
                            _transform(scroller, 'transform', 'translate3d(' + currentMoveX + 'px,0,0)');
                            // 配置panel的高度，避免被高的撑开
                            _transitionEnd(scroller, function () {
                                for (var n = 0; n < scroller.children.length; n++) {
                                    if (n === currentPanel - 1) {
                                        scroller.children[n].style.height = 'auto';
                                        // window滚动
                                        window.scrollTo(0, 0);
                                        // 局部容器滚动
                                        // scroller.scrollTop = 0;
                                    } else {
                                        scroller.children[n].style.height = clientHeight + 'px';
                                    }
                                }
                            });
                        } else {
                            // 回到初始位置
                            _transform(scroller, 'transform', 'translate3d(' + currentMoveX + 'px,0,0)');
                        }
                    }
                }

                // 向左滑动
                if (moveDirection == 'left') {
                    // 达到最后一屏
                    if (Math.abs(currentMoveX) == (panelNum - 1) * clientWidth) {
                        _transform(scroller, 'transform', 'translate3d(' + currentMoveX + 'px,0,0)');
                    } else {
                        if (Math.abs(moveX) > moveCountX) {
                            // 向左滑一屏
                            currentPanel += 1;
                            currentMoveX -= clientWidth;
                            _transform(scroller, 'transform', 'translate3d(' + currentMoveX + 'px,0,0)');
                            // 配置panel的高度，避免被高的撑开
                            _transitionEnd(scroller, function () {
                                for (var n = 0; n < scroller.children.length; n++) {
                                    if (n === currentPanel - 1) {
                                        scroller.children[n].style.height = 'auto';
                                        // window滚动
                                        window.scrollTo(0, 0);
                                        // 局部容器滚动
                                        // scroller.scrollTop = 0;
                                    } else {
                                        scroller.children[n].style.height = clientHeight + 'px';
                                    }
                                }
                            });
                        } else {
                            // 回到初始位置
                            _transform(scroller, 'transform', 'translate3d(' + currentMoveX + 'px,0,0)');
                        }
                    }
                }

                // 规划代码，判断当前的transform位置是否在currentMoveX的整数倍位置，不在需要纠正

                // 恢复初始化状态
                moveDirection = '';
                dragStart = null;
                moveX = 0;
                moveY = 0;
            });

            page.addEventListener('touchcancel', function() {
                // 回到初始位置
                _transform(scroller, 'transitionDuration', '200ms');
                _transform(scroller, 'transform', 'translate3d(' + currentMoveX + 'px,0,0)');
                // 恢复初始化状态
                moveDirection = '';
                dragStart = null;
                moveX = 0;
                moveY = 0;
            });
        }
    };

    return swipeTabsPanel;
}));