# smoothscroll-polyfill-next
最初是解决ios不支持scroll-behavior问题。后来发现好多的业务场景中需要一个回调和动画时间，所以fork了smoothscroll-polyfill的库

### 使用
callback需结合behavior使用 且behavior不为'auto'|'instant'
#### 支持属性

| key        | description         | default | type               |
| :--------- | ------------------- | ------- | --------------------- |
| `callback` | dom滚动完成回调函数 | 无      | `Function`            |
| `duration` | dom滚动持续时间     | `478`   | `Number`              |
| `behavior` | dom滚动速率曲线     | 无      | [behavior](#behavior) |
#### behavior
| type     | options                                                                                          | description                            |
| :------- | ------------------------------------------------------------------------------------------------ | -------------------------------------- |
| `String` | `linear`\| `ease` \|`ease-in`\|`smooth`\|`ease-in`\|`ease-out`\|`ease-in-out`\|`auto`\|`instant` | 速率运动方式                           |
| `Array`  | 无                                                                                               | 三次赛贝尔曲线如：[0.0, 0.0, 1.0, 1.0] |
#### case
```js
  Element.scrollTo({
    top: 1800,
    behavior: 'ease-in',
    callback: function () {
      console.log('我是Element的回调')
    }
  })
```
#### npm
```
npm install --save-dev mmb-scroll
import 'mmb-scroll'
```


