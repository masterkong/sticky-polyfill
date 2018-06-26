# sticky-polyfill

css position:sticky的兼容实现库。  
如果浏览器支持则使用浏览器实现，如果不支持则采用监听scroll+position:fixed实现。  
核心算法依赖element.getBoundingClientRect()  

## 用法

#### 1、引入js
`<script type="text/javascript" src="sticky-polyfill.js"></script>`  

**支持AMD require语法**

#### 2、配置参数

```
<script type="text/javascript">

     StickyPolyFill.polyfill();
    /**
     * //跟上面的写法是等价的，也就是默认配置
     * StickyPolyFill.polyfill({
     *    className: 'sticky-polyfill',
     *    top: '0px',
     *    bottom: '',
     *    zIndex: '99'
     * });
    */

    /**
     * 可以多次配置自定义参数来增加sticky类型
     */
    StickyPolyFill.polyfill({
        className: 'my-sticky-bottom',
        top: '',
        bottom: '0px',
        zIndex: '1'
    });
</script>
```
#### 3、在需要的element上应用第2步的className
```
<section class="sticky-polyfill">
    <span>sticky-top</span>
</section>


<div class="my-sticky-bottom">
    <span>sticky-bottom</span>
</div>
```
#### 4、sticky应用在bottom的情况下时需要等element生成好之后(如Vue中根据请求数据来决定element内容)，手动触发onscroll一次
```
//手工触发onscroll
document.documentElement.scrollTop = 1; //chrome
document.body.scrollTop = 1; //safari

//还原
document.documentElement.scrollTop = 0; //chrome
document.body.scrollTop = 0; //safari
```

## 参考文献
[MDN-position](https://developer.mozilla.org/en-US/docs/Web/CSS/position)  
[CSS “position: sticky” – Introduction and Polyfills](https://www.sitepoint.com/css-position-sticky-introduction-polyfills/)  
