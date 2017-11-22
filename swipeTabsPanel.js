/*
* author: "oujizeng",
* license: "MIT",
* name: "swipeTabsPanel.js",
* version: "1.1.2"
*/

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return (root.returnExportsGlobal = factory());
        });
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root['SwipeTabsPanel'] = factory();
    }
}(this, function () {

    var getEle = function (str) {
        return document.querySelector(str);
    };

    var SwipeTabsPanel = {

        init: function(opt){

            var moveCountX = opt.moveCountX || 40,          // 位移系数
                moveCountY = opt.moveCountY || 60,
                coefficient = 0.35,                         // 阻尼系数，0.2~0.5比较合适
                clientWidth = window.screen.width,
                clientHeight = window.screen.height,
                panelNum = 3,                               // 默认屏个数
                currentPanel = 1,                           // 当前所在屏
                moveX = 0,                                  // 横向滑动距离
                moveY = 0,                                  // 竖向滑动距离
                moveDirection = '',                         // 滑动方向，在开始的时候就定死，不再改变
                currentMoveX = 0,                           // 横向动画已经滑动距离
                currentMoveY = 0,                           // 竖向动画已经滑动距离
                dragStart = null;                           // 开始抓取标志位

            var scroller = getEle(opt.scroller),            // 滚动容器
                page = getEle(opt.page);                    // 主容器

            page.addEventListener('touchstart', function (event) {

                dragStart = {
                    x: event.touches[0].pageX,
                    y: event.touches[0].pageY
                }

                scroller.style.transitionProperty = 'transform';
                scroller.style.transitionTimingFunction = 'cubic-bezier(0, 0, 0.25, 1)';
                scroller.style.transitionDuration = '0ms';
            });

            page.addEventListener('touchmove', function (event) {
                // 防止从其他地方滑到page内的
                if (dragStart === null) {
                    return;
                }

                var nowX = event.touches[0].pageX;
                var nowY = event.touches[0].pageY;
                moveX = nowX - dragStart.x;
                moveY = nowY - dragStart.y;

                // 上下滑动
                if(Math.abs(moveX) <= Math.abs(moveY)) {
                    if (moveY > 0) {
                        moveDirection = 'down'
                    } else {
                        moveDirection = 'up'
                    }
                    document.querySelector('body').style.overflow = 'auto';
                    document.querySelector('html').style.overflow = 'auto';
                }
                // 左右滑动
                if (Math.abs(moveX) > Math.abs(moveY)) {
                    if (moveX > 0) {
                        moveDirection = 'right';
                    } else {
                        moveDirection = 'left';
                    }
                    document.querySelector('body').style.overflow = 'hidden';
                    document.querySelector('html').style.overflow = 'hidden';
                }

                if (moveDirection == 'right') {
                    // 已经到最左边了
                    if (currentMoveX == 0) {
                        // 加上阻尼效果
                        // var x = moveX > clientWidth ? clientWidth * coefficient : moveX * coefficient;
                        // 改为不限制滚动距离
                        var x = moveX * coefficient;
                        scroller.style.transform = 'translate3d(' + x + 'px,0,0)';
                    } else {
                        scroller.style.transform = 'translate3d(' + (currentMoveX + Math.abs(moveX)) + 'px,0,0)';
                    }
                }

                if (moveDirection == 'left') {
                    // 已经到最右边了
                    if (Math.abs(currentMoveX) >= (panelNum - 1) * clientWidth) {
                        // 加上阻尼效果
                        // var x = Math.abs(moveX) > clientWidth ? currentMoveX - (clientWidth * coefficient) : currentMoveX - (Math.abs(moveX) * coefficient);
                        // 改为不限制滚动距离
                        var x = currentMoveX - (Math.abs(moveX) * coefficient);
                        scroller.style.transform = 'translate3d(' + x + 'px,0,0)';
                    } else {
                        scroller.style.transform = 'translate3d(' + (currentMoveX - Math.abs(moveX)) + 'px,0,0)';
                    }
                }

            });

            page.addEventListener('touchend', function(event) {

                if (moveX === 0 && moveY === 0) {
                    return;
                }

                // 上下滑动
                //if(moveDirection == 'up' || moveDirection == 'down') {
                //return;
                //}

                // 向右滑动
                if (moveDirection == 'right') {
                    // 达到第一屏
                    if (currentMoveX === 0) {
                        scroller.style.transitionDuration = '350ms';
                        scroller.style.transform = 'translate3d(' + currentMoveX + 'px,0,0)';
                    } else {
                        if (Math.abs(moveX) > moveCountX) {
                            // 向右滑一屏
                            currentPanel -= 1;
                            currentMoveX += clientWidth;
                            scroller.style.transitionDuration = '350ms';
                            scroller.style.transform = 'translate3d(' + currentMoveX + 'px,0,0)';
                            // 配置panel的高度，避免被高的撑开
                            setTimeout(function () {
                                for (var n = 0; n < scroller.children.length; n++) {
                                    if (n === currentPanel - 1) {
                                        scroller.children[n].style.height = 'auto';
                                    } else {
                                        scroller.children[n].style.height = clientHeight + 'px';
                                    }
                                }
                            }, 0);
                        } else {
                            // 回到初始位置
                            scroller.style.transitionDuration = '350ms';
                            scroller.style.transform = 'translate3d(' + currentMoveX + 'px,0,0)';
                        }
                    }
                }

                // 向左滑动
                if (moveDirection == 'left') {
                    // 达到最后一屏
                    if (Math.abs(currentMoveX) == (panelNum - 1) * clientWidth) {
                        scroller.style.transitionDuration = '350ms';
                        scroller.style.transform = 'translate3d(' + currentMoveX + 'px,0,0)';
                    } else {
                        if (Math.abs(moveX) > moveCountX) {
                            // 向左滑一屏
                            currentPanel += 1;
                            currentMoveX -= clientWidth;
                            scroller.style.transitionDuration = '350ms';
                            scroller.style.transform = 'translate3d(' + currentMoveX + 'px,0,0)';
                            // 配置panel的高度，避免被高的撑开
                            setTimeout(function () {
                                for (var n = 0; n < scroller.children.length; n++) {
                                    if (n === currentPanel - 1) {
                                        scroller.children[n].style.height = 'auto';
                                    } else {
                                        scroller.children[n].style.height = clientHeight + 'px';
                                    }
                                }
                            }, 0);
                        } else {
                            // 回到初始位置
                            scroller.style.transitionDuration = '350ms';
                            scroller.style.transform = 'translate3d(' + currentMoveX + 'px,0,0)';
                        }
                    }
                }

                console.log('moveDirection', moveDirection);
                console.log('currentMoveX', currentMoveX);
                // 恢复初始化状态
                document.querySelector('body').style.overflow = 'auto';
                document.querySelector('html').style.overflow = 'auto';
                moveDirection = '';
                dragStart = null;
                moveX = 0;
                moveY = 0;
            });

            page.addEventListener('touchcancel', function(event) {
                document.querySelector('body').style.overflow = 'auto';
                document.querySelector('html').style.overflow = 'auto';
                // 回到初始位置
                scroller.style.transitionDuration = '350ms';
                scroller.style.transform = 'translate3d(' + currentMoveX + 'px,0,0)';
                // 恢复初始化状态
                moveDirection = '';
                dragStart = null;
                moveX = 0;
                moveY = 0;
            });
        }
    };

    return SwipeTabsPanel;
}));