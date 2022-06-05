interface ContextScroll {
  scrollable: HTMLElement | Window
  method: any
  startTime: number
  startX: number
  startY: number
  x: number
  y: number
  callback?: Function
  cubicObj: CubicType
  duration: number
}
interface OriginalScroll {
  scroll(left: number, top: number): void;
  scrollBy(left: number, top: number): void;
  elementScroll(left: number, top: number): void;
  scrollIntoView(viewPort: boolean): void;
}
interface CubicType {
  px3: number;
  px2: number;
  px1: number;
  py3: number;
  py2: number;
  py1: number;
  epsilon: number;
  constructor(a: number, b: number, c: number, d: number): void;
  getX(t: number): number;
  getY(t: number): number;
  solve(x: number): number;
}
/**
 * @description
 * @param a 赛贝尔第一个值
 * @param b 赛贝尔第二个值
 * @param c 赛贝尔第三个值
 * @param d 赛贝尔第四个值
 */
class Cubic {
  px3: number
  px2: number
  px1: number
  py3: number
  py2: number
  py1: number
  epsilon: number
  constructor(a: number, b: number, c: number, d: number) {
    this.px3 = 3 * a
    this.px2 = 3 * (c - a) - this.px3
    this.px1 = 1 - this.px3 - this.px2
    this.py3 = 3 * b
    this.py2 = 3 * (d - b) - this.py3
    this.py1 = 1 - this.py3 - this.py2
    this.epsilon = 1e-7 // 目标精度
  }
  getX(t: number) {
    return ((this.px1 * t + this.px2) * t + this.px3) * t
  }
  getY(t: number) {
    return ((this.py1 * t + this.py2) * t + this.py3) * t
  }
  solve(x: number) {
    if (x === 0 || x === 1) { // 对 0 和 1 两个特殊 t 不做计算
      return this.getY(x)
    }
    let t = x
    for (let i = 0; i < 8; i++) { // 进行 8 次迭代
      let g = this.getX(t) - x
      if (Math.abs(g) < this.epsilon) { // 检测误差到可以接受的范围
        return this.getY(t)
      }
      let d = (3 * this.px1 * t + 2 * this.px2) * t + this.px3 // 对 x 求导
      if (Math.abs(d) < 1e-6) { // 如果梯度过低，说明牛顿迭代法无法达到更高精度
        break
      }
      t = t - g / d
    }
    return this.getY(t)// 对得到的近似 t 求 y
  }
}
/**
 * @notExported
 */
class ScrollPolyfill {
  original: OriginalScroll
  ROUNDING_TOLERANCE: number
  scrollLeft: Number = 0
  scrollTop: Number = 0
  nowTime: Function
  noAniBehaviors: string[]
  aniBehaviors: string[]
  constructor() {
    this.noAniBehaviors = ['auto', 'instant']
    this.aniBehaviors = ['smooth', 'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out']
    this.nowTime = window.performance ? window.performance.now.bind(window.performance) : Date.now
    this.original = {
      scroll: window.scroll || window.scrollTo,
      scrollBy: window.scrollBy,
      elementScroll: window.HTMLElement.prototype.scroll || this.scrollElement,
      scrollIntoView: window.HTMLElement.prototype.scrollIntoView
    }
    this.ROUNDING_TOLERANCE = this.isMicrosoftBrowser ? 1 : 0;
    this.coverageProtoTypeScroll()
  }
  /**
   * 改变元素内的滚动位置
   * @method scrollElement
   * @param {Number} x
   * @param {Number} y
   * @returns {undefined}
   */
  scrollElement(x: number, y: number) {
    this.scrollLeft = x
    this.scrollTop = y
  }
  getScrollCubicBehavior(arg: any) {
    let behavior =  arguments[0].behavior, cubicObj = null
    if (behavior) {
      if (typeof behavior !== 'string' && behavior instanceof Array && behavior.length) {
        cubicObj = new Cubic(behavior[0], behavior[1], behavior[2], behavior[3])
      } else {
        switch (true) {
          case behavior.toLowerCase() === 'linear':
            cubicObj = new Cubic(0.0, 0.0, 1.0, 1.0)
            break
          case behavior.toLowerCase() === 'ease' || behavior.toLowerCase() === 'smooth':
            cubicObj = new Cubic(0.25, 0.1, 0.25, 1.0)
            break
          case behavior.toLowerCase() === 'ease-in':
            cubicObj = new Cubic(0.42, 0, 1.0, 1.0)
            break
          case behavior.toLowerCase() === 'ease-out':
            cubicObj = new Cubic(0, 0, 0.58, 1.0)
            break
          case behavior.toLowerCase() === 'ease-in-out':
            cubicObj = new Cubic(0.42, 0, 0.58, 1.0)
            break
          default:
            cubicObj = new Cubic(0.25, 0.1, 0.25, 1.0)
        }
      }
    }
    return cubicObj
  }
  /**
   * 表明是否应用平滑行为
   * @method shouldBailOut
   * @param {Number|Object} firstArg
   * @returns {Boolean}
   */
  shouldBailOut(firstArg: any) {
    if (
      firstArg === null ||
      typeof firstArg !== 'object' ||
      firstArg.behavior === undefined ||
      firstArg.behavior === 'auto' ||
      firstArg.behavior === 'instant'
    ) {
      return true
    }
    if (typeof firstArg === 'object' && (this.aniBehaviors.includes(firstArg.behavior) || firstArg[0].behavior instanceof Array && firstArg[0].behavior.length === 4)) {
      return false
    }
    throw new TypeError(
      'behavior member of ScrollOptions ' +
      firstArg.behavior +
      ' is not a valid value for enumeration ScrollBehavior.'
    )
  }
  /**
   * 表明元素在提供的轴中是否具有可滚动空间
   * @method hasScrollableSpace
   * @param  el
   * @param  axis
   * @returns 
   */
  hasScrollableSpace(el: HTMLElement, axis: string) {
    if (axis === 'Y') {
      return el.clientHeight + this.ROUNDING_TOLERANCE < el.scrollHeight
    }
    if (axis === 'X') {
      return el.clientWidth + this.ROUNDING_TOLERANCE < el.scrollWidth
    }
  }
  /**
 * 表明元素是否在轴上具有可滚动溢出属性
 * @method canOverflow
 * @param  el
 * @param  axis
 * @returns
 */
  canOverflow(el: HTMLElement, axis: string) {
    let overflowValue = window.getComputedStyle(el, null)[('overflow' + axis) as keyof CSSStyleDeclaration]
    return overflowValue === 'auto' || overflowValue === 'scroll'
  }
  /**
   * 表明元素是否可以在任意轴上滚动
   * @method isScrollable
   * @param  el DOM元素
   * @returns 
   */
  isScrollable(el: HTMLElement) {
    let isScrollableY = this.hasScrollableSpace(el, 'Y') && this.canOverflow(el, 'Y')
    let isScrollableX = this.hasScrollableSpace(el, 'X') && this.canOverflow(el, 'X')
    return isScrollableY || isScrollableX
  }
  /**
  * 查找元素的可滚动父元素
  * @method findScrollableParent
  * @param el 
  * @returns  el 返回父元素
  */
  findScrollableParent(el: HTMLElement): HTMLElement {
    while ((this.isIOSPlatform ?  el !== document.body : el !== document.documentElement) && this.isScrollable(el) === false) {
      el = el.parentNode as HTMLElement
    }
    return el
  }
  /**
   * Self调用函数，在给定上下文的情况下逐步滚动
   * @method step
   * @param context
   * @returns {undefined}
   */
  step(context: ContextScroll) {
    let time = this.nowTime()
    let value
    let currentX
    let currentY
    let elapsed = (time - context.startTime) / context.duration
    elapsed = elapsed > 1 ? 1 : elapsed
    if (context.scrollable.targetDisY !== context.y || context.scrollable.targetDisX !== context.x) return
    value = context.cubicObj.solve(elapsed)
    currentX = context.startX + (context.x - context.startX) * value
    currentY = context.startY + (context.y - context.startY) * value
    context.method.call(context.scrollable, currentX, currentY)
    if (currentX !== context.x || currentY !== context.y) {
      window.requestAnimationFrame(this.step.bind(this, context))
    } else {
      context.callback ? context.callback() : ''
    }
  }
  /**
   * 以平滑的方式滚动窗口或元素
   * @method smoothScroll
   * @param el
   * @param  x
   * @param  y
   * @param  y
   * @param  callback
   * @returns
   */
  smoothScroll(el: HTMLElement, x: number, y: number, duration: number, callback?: Function, cubicObj?: any) {
    let scrollable: HTMLElement
    let startX
    let startY
    let method
    let startTime = this.nowTime()
    if (el === document.body || el === document.documentElement) {
      scrollable = window as any
      startX = window.scrollX || window.pageXOffset
      startY = window.scrollY || window.pageYOffset
      method = this.original.scroll
    } else {
      scrollable = el
      startX = el.scrollLeft
      startY = el.scrollTop
      method = this.scrollElement
    }
    this.step({
      scrollable: scrollable,
      method: method,
      startTime: startTime,
      startX: startX,
      startY: startY,
      x: x,
      y: y,
      callback,
      cubicObj,
      duration
    })
  }
  /**
   * @description 获取滚动元素节点，主要针对IOS和安卓做不同的区分
   */
  elementDomNode(node:HTMLElement):HTMLElement{
    if(node === document.body ||  node === document.documentElement) {
      return this.documentScrollType
    }
    return  node
  }
  /**
   * @description 覆盖重写滚动方法
   */
  coverageProtoTypeScroll() {
    let that = this
    window.scroll = window.scrollTo = function () {
      if (arguments[0] === undefined) {
        return
      }
      if (that.shouldBailOut(arguments[0]) === true) {
        let left = arguments[0].left !== undefined ? arguments[0].left : typeof arguments[0] !== 'object' ? arguments[0] : window.scrollX || window.pageXOffset
        let top = arguments[0].top !== undefined ? arguments[0].top : arguments[1] !== undefined ? arguments[1] : window.scrollY || window.pageYOffset
        that.original.scroll.call(window,left, top)
        return
      }
      let scrollY = window.scrollY || window.pageYOffset
      let scrollX = window.scrollX || window.pageXOffset
      let left = ~~arguments[0].left !== undefined ? ~~arguments[0].left : scrollX
      let top = ~~arguments[0].top !== undefined ? ~~arguments[0].top : scrollY
      const cubicObj = that.getScrollCubicBehavior(arguments[0])
      window.targetDisY = top // 说明有新的操作值进来了
      window.targetDisX = left// 说明有新的操作值进来了
      that.smoothScroll(
        document.body,
        left,
        top,
        typeof arguments[0].duration === 'number' ? arguments[0].duration : that.SCROLL_TIME,
        typeof arguments[0].callback === 'function' ? arguments[0].callback : null,
        cubicObj,
      )
    }
    window.scrollBy = function () {
      if (arguments[0] === undefined) {
        return
      }
      if (that.shouldBailOut(arguments[0])) {
        let left = arguments[0].left !== undefined ? arguments[0].left : typeof arguments[0] !== 'object' ? arguments[0] : 0
        let top = arguments[0].top !== undefined ? arguments[0].top : arguments[1] !== undefined ? arguments[1] : 0
        that.original.scrollBy.call(
          window,
          left,
          top
        )
        return
      }
      let scrollY = window.scrollY || window.pageYOffset
      let scrollX = window.scrollX || window.pageXOffset
      let left = ~~arguments[0].left + scrollX
      let top = ~~arguments[0].top + scrollY
      window.targetDisX = left
      window.targetDisY = top
      const cubicObj = that.getScrollCubicBehavior(arguments[0])
      that.smoothScroll(
        that.documentScrollType,
        left,
        top,
        typeof arguments[0].duration === 'number' ? arguments[0].duration : that.SCROLL_TIME,
        typeof arguments[0].callback === 'function' ? arguments[0].callback : null,
        cubicObj
      )
    }
    window.HTMLElement.prototype.scroll = window.HTMLElement.prototype.scrollTo = function () {
      if (arguments[0] === undefined) {
        return
      }
      if (that.shouldBailOut(arguments[0]) === true) {
        if (typeof arguments[0] === 'number' && arguments[1] === undefined) {
          throw new SyntaxError('Value could not be converted');
        }
        let left = arguments[0].left !== undefined ? ~~arguments[0].left: typeof arguments[0] !== 'object' ? ~~arguments[0] : this.scrollLeft
        let top = arguments[0].top !== undefined ? ~~arguments[0].top : arguments[1] !== undefined ? ~~arguments[1] : this.scrollTop
        that.original.elementScroll.call(
          this,
          left,
          top
        )
        return
      }
      let left = typeof arguments[0].left === 'undefined' ? this.scrollLeft : ~~arguments[0].left
      let top = typeof arguments[0].top === 'undefined' ? this.scrollTop : ~~arguments[0].top 
      this.targetDisY = top // 说明有新的操作值进来了
      this.targetDisX = left// 说明有新的操作值进来了
      const cubicObj = that.getScrollCubicBehavior(arguments[0])
      that.smoothScroll(
        this,
        left,
        top,
        typeof arguments[0].duration === 'number' ? arguments[0].duration : that.SCROLL_TIME,
        typeof arguments[0].callback === 'function' ? arguments[0].callback : null,
        cubicObj,
      )
    }

    window.HTMLElement.prototype.scrollBy = function () {
      if (arguments[0] === undefined) {
        return
      }
      let scrollElement =  that.elementDomNode(this)
      if (that.shouldBailOut(arguments[0]) === true) {
        let left = arguments[0].left !== undefined ? ~~arguments[0].left + scrollElement.scrollLeft : ~~arguments[0] + scrollElement.scrollLeft
        let top = arguments[0].top !== undefined ? ~~arguments[0].top + scrollElement.scrollTop : ~~arguments[1] + scrollElement.scrollTop
        that.original.elementScroll.call(
          scrollElement,
          left,
          top
        )
        return
      }
      let left = ~~arguments[0].left + scrollElement.scrollLeft
      let top = ~~arguments[0].top + scrollElement.scrollTop
      if(this === document.body || scrollElement === document.documentElement){
        window.targetDisX = left
        window.targetDisY = top
      } else {
        scrollElement.targetDisX = left
        scrollElement.targetDisY = top
      }
      const cubicObj = that.getScrollCubicBehavior(arguments[0])
      this.scroll({
        left,
        top,
        behavior: arguments[0].behavior,
        callback: typeof arguments[0].callback === 'function' ? arguments[0].callback : null,
        cubicObj: cubicObj,
        duration: typeof arguments[0].duration === 'number' ? arguments[0].duration : that.SCROLL_TIME
      })
    }
    window.HTMLElement.prototype.scrollIntoView = function () {
      if (that.shouldBailOut(arguments[0]) === true) {
        that.original.scrollIntoView.call(
          this,
          arguments[0] === undefined ? true : arguments[0]
        )
        return
      }
      let scrollableParent = that.findScrollableParent(this)
      let parentRects = scrollableParent.getBoundingClientRect()
      let clientRects = this.getBoundingClientRect()
      if (scrollableParent !== document.body && scrollableParent !== document.documentElement) {
        const cubicObj = that.getScrollCubicBehavior(arguments[0])
        let left = scrollableParent.scrollLeft + clientRects.left - parentRects.left
        let top = scrollableParent.scrollTop + clientRects.top - parentRects.top
        if(arguments[0].block && arguments[0].block === 'end') {
          top = scrollableParent.scrollTop + clientRects.top - parentRects.top + parseFloat(window.getComputedStyle(scrollableParent).height)
        }
        if(arguments[0].block && arguments[0].block === 'center') {
          top = scrollableParent.scrollTop + clientRects.top - parentRects.top + parseFloat(window.getComputedStyle(scrollableParent).height)/2
        }
        if(arguments[0].inline && arguments[0].inline === 'end') {
          left = scrollableParent.scrollLeft + clientRects.left - parentRects.left + parseFloat(window.getComputedStyle(scrollableParent).width)
        }
        if(arguments[0].inline && arguments[0].inline === 'center') {
          left = scrollableParent.scrollLeft + clientRects.left - parentRects.left + parseFloat(window.getComputedStyle(scrollableParent).width)/2
        }
        scrollableParent.targetDisY = top // 说明有新的操作值进来了
        scrollableParent.targetDisX = left // 说明有新的操作值进来了
        that.smoothScroll(
          scrollableParent,
          left,
          top,
          typeof arguments[0].duration === 'number' ? arguments[0].duration : that.SCROLL_TIME,
          typeof arguments[0].callback === 'function' ? arguments[0].callback : null,
          cubicObj,
        )
        if (window.getComputedStyle(scrollableParent).position !== 'fixed') {
          window.scrollBy({
            left: parentRects.left,
            top: parentRects.top,
            behavior: 'smooth'
          })
        }
      } else {
        window.scrollBy({
          left: clientRects.left,
          top: clientRects.top,
          behavior: 'smooth'
        })
      }
    }
  }
  /**
   * @description 是否是IE浏览器
   */
  get isMicrosoftBrowser(): boolean {
    const userAgent = window.navigator.userAgent
    const userAgentPatterns = ['MSIE ', 'Trident/', 'Edge/']
    return new RegExp(userAgentPatterns.join('|')).test(userAgent)
  }
  get isIOSPlatform(): boolean {
    var u = navigator.userAgent, app = navigator.appVersion
    var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
    return  isIOS
  }
  get documentScrollType():HTMLElement{
      return this.isIOSPlatform ? document.documentElement : document.body
  }
  /**
   * @description 获取默认的标准滚动时间
   */
  get SCROLL_TIME() {
    return 468
  }
}
export default new ScrollPolyfill()
