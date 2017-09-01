/*!
 * sticky-polyfill.js v1.0.0
 * (c) 2017-2017 masterkong
 * Github: https://github.com/masterkong/sticky-polyfill.git
 * Released under the MIT License.
 */
(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
        (global.StickyPolyFill = factory());
}(this, (function() {
    'use strict';

    function polyfill(option) {
        var config = {
            className: 'sticky-polyfill',
            top: '0px',
            bottom: '',
            zIndex: '1'
        };

        if (option) {
            config.className = option.className || config.className;
            if (option.top || !option.bottom) {
                config.top = option.top || config.top;
                config.bottom = '';
            } else {
                config.top = '';
                config.bottom = option.bottom;
            }
            config.zIndex = option.zIndex || config.zIndex;
        }
        console.log(config);
        /**
         * 参考:https://modernizr.com/download?csspositionsticky-dontmin-setclasses&q=sticky
         */
        function ModernizrTestCSSPositionSticky() {
            var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
            var prop = 'position:';
            var value = 'sticky';
            var el = document.createElement('a');
            var mStyle = el.style;

            mStyle.cssText = prop + prefixes.join(value + ';' + prop).slice(0, -prop.length);

            return mStyle.position.indexOf(value) !== -1;
        }

        document.addEventListener('DOMContentLoaded', function() {
            var className = config.className;
            var stickyElements = Array.prototype.slice.call(document.getElementsByClassName(className));
            /**
             * sticky-native
             */
            //*/
            if (ModernizrTestCSSPositionSticky()) {
                for (var i in stickyElements) {
                    stickyElements[i].style.position = '-webkit-sticky';
                    stickyElements[i].style.position = '-moz-sticky';
                    stickyElements[i].style.position = '-o-sticky';
                    stickyElements[i].style.position = '-ms-sticky';
                    stickyElements[i].style.position = 'sticky';
                    stickyElements[i].style.top = config.top;
                    stickyElements[i].style.bottom = config.bottom;
                    stickyElements[i].style.zIndex = config.zIndex;
                }
                return;
            }
            //*/

            /**
             * sticky-polyfill
             */
            var stickyElementsObjectArray = [];
            for (var i in stickyElements) {
                var stickyEle = stickyElements[i],
                    clientRect = stickyEle.getBoundingClientRect(),
                    computedStyle = document.defaultView.getComputedStyle(stickyEle, null);
                /**
                 * 使用opacity在元素上生成一个新的z-index层叠上下文
                 */
                stickyEle.style.opacity = computedStyle.opacity || '1';
                stickyEle.style.zIndex = parseInt(computedStyle.zIndex) || config.zIndex; //z-index默认值为auto

                /**
                 * placeholderEle作为元素的替身有两个作用:
                 * 1、在position变为fixed时，保证下方的元素不会有突然向上跳的感觉
                 * 2、在滚动时正确计算元素何时恢复原来的position
                 * 参考:https://www.sitepoint.com/css-position-sticky-introduction-polyfills/
                 */
                var placeholderEle = document.createElement('div');
                placeholderEle.style.width = clientRect.width + 'px';
                placeholderEle.style.height = clientRect.height + 'px';
                placeholderEle.style.margin = computedStyle.margin;

                stickyElementsObjectArray.push({
                    stickyEle: stickyEle,
                    config: config,
                    cssText: stickyEle.style.cssText,
                    clientRect: clientRect,
                    placeholderEle: placeholderEle,
                    isPlaceholderEleAdded: false
                });
            }

            OnScroll(); //先运行一次，保证以bottom确定sticky的时候正常
            window.addEventListener('scroll', OnScroll);

            function OnScroll() {
                /**
                 * 在Safari中测试发现clientHeight会有变化，改为实时获取clientHeight
                 */
                var clientHeight = window.innerHeight;
                if (typeof clientHeight != "number") {
                    clientHeight = document.documentElement.clientHeight;
                }
                for (var i in stickyElementsObjectArray) {
                    stickyExe(stickyElementsObjectArray[i]);
                }

                function stickyExe(stickyObject) {
                    var stickyEle = stickyObject.stickyEle,
                        clientRect = stickyObject.clientRect,
                        placeholderEle = stickyObject.placeholderEle,
                        config = stickyObject.config,
                        cssText = stickyObject.cssText;

                    /**
                     * 再次说明，如果有placeholderEle替身元素，计算滚动时以placeholderEle为准.
                     * 因为此时原来元素的position为fixed,top/bottom始终不变
                     */
                    var pos = stickyEle.getBoundingClientRect();
                    stickyObject.isPlaceholderEleAdded ? pos = placeholderEle.getBoundingClientRect() : '';

                    if (config.top) {
                        /**
                         *以top确定sticky的距离
                         *
                         */
                        var stickyTop = parseFloat(config.top) || 0;
                        if (pos.top <= stickyTop && !stickyObject.isPlaceholderEleAdded) {
                            stickyEle.style.marginTop = '0px';
                            //stickyEle.style.top = config.top;
                            stickyEle.style.top = stickyTop + 'px';
                            stickyEle.style.zIndex = config.zIndex;

                            stickyFun();
                        } else if (pos.top > stickyTop && stickyObject.isPlaceholderEleAdded) {
                            restoreFun();
                        }
                    } else {
                        /**
                         * 以bottom确定sticky的距离
                         */
                        var stickyBottom = parseFloat(config.bottom) || 0;
                        if (clientHeight - pos.bottom <= stickyBottom && !stickyObject.isPlaceholderEleAdded) {
                            stickyEle.style.marginBottom = '0px';
                            //stickyEle.style.bottom = config.bottom;
                            stickyEle.style.bottom = stickyBottom + 'px';
                            stickyEle.style.zIndex = config.zIndex;

                            stickyFun();
                        } else if (clientHeight - pos.bottom > stickyBottom && stickyObject.isPlaceholderEleAdded) {
                            restoreFun();
                        }
                    }

                    function stickyFun() {
                        //在原来元素下方生成一个替身元素
                        stickyEle.parentNode.insertBefore(placeholderEle, stickyEle);
                        stickyObject.isPlaceholderEleAdded = true;

                        stickyEle.style.position = 'fixed';
                        stickyEle.style.left = clientRect.left + 'px';
                        stickyEle.style.width = clientRect.width + 'px';
                        stickyEle.style.marginLeft = '0px';
                        stickyEle.style.marginRight = '0px';
                        stickyEle.style.boxSizing = 'border-box'; //clientRect.width是以border-box模型计算的
                    }

                    function restoreFun() {
                        stickyEle.parentNode.removeChild(placeholderEle);
                        stickyEle.style.cssText = cssText;
                        stickyObject.isPlaceholderEleAdded = false;
                    }
                }
            }

        }, false)
    }

    return {
        polyfill: polyfill
    }
})));