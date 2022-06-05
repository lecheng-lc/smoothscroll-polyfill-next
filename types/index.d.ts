interface ContextScroll {
    scrollable: HTMLElement | Window;
    method: any;
    startTime: number;
    startX: number;
    startY: number;
    x: number;
    y: number;
    callback?: Function;
    cubicObj: CubicType;
    duration: number;
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
declare class Cubic {
    px3: number;
    px2: number;
    px1: number;
    py3: number;
    py2: number;
    py1: number;
    epsilon: number;
    constructor(a: number, b: number, c: number, d: number);
    getX(t: number): number;
    getY(t: number): number;
    solve(x: number): number;
}
/**
 * @notExported
 */
declare class ScrollPolyfill {
    original: OriginalScroll;
    ROUNDING_TOLERANCE: number;
    scrollLeft: Number;
    scrollTop: Number;
    nowTime: Function;
    noAniBehaviors: string[];
    aniBehaviors: string[];
    constructor();
    /**
     * 改变元素内的滚动位置
     * @method scrollElement
     * @param {Number} x
     * @param {Number} y
     * @returns {undefined}
     */
    scrollElement(x: number, y: number): void;
    getScrollCubicBehavior(arg: any): Cubic | null;
    /**
     * 表明是否应用平滑行为
     * @method shouldBailOut
     * @param {Number|Object} firstArg
     * @returns {Boolean}
     */
    shouldBailOut(firstArg: any): boolean;
    /**
     * 表明元素在提供的轴中是否具有可滚动空间
     * @method hasScrollableSpace
     * @param  el
     * @param  axis
     * @returns
     */
    hasScrollableSpace(el: HTMLElement, axis: string): boolean | undefined;
    /**
   * 表明元素是否在轴上具有可滚动溢出属性
   * @method canOverflow
   * @param  el
   * @param  axis
   * @returns
   */
    canOverflow(el: HTMLElement, axis: string): boolean;
    /**
     * 表明元素是否可以在任意轴上滚动
     * @method isScrollable
     * @param  el DOM元素
     * @returns
     */
    isScrollable(el: HTMLElement): boolean | undefined;
    /**
    * 查找元素的可滚动父元素
    * @method findScrollableParent
    * @param el
    * @returns  el 返回父元素
    */
    findScrollableParent(el: HTMLElement): HTMLElement;
    /**
     * Self调用函数，在给定上下文的情况下逐步滚动
     * @method step
     * @param context
     * @returns {undefined}
     */
    step(context: ContextScroll): void;
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
    smoothScroll(el: HTMLElement, x: number, y: number, duration: number, callback?: Function, cubicObj?: any): void;
    /**
     * @description 获取滚动元素节点，主要针对IOS和安卓做不同的区分
     */
    elementDomNode(node: HTMLElement): HTMLElement;
    /**
     * @description 覆盖重写滚动方法
     */
    coverageProtoTypeScroll(): void;
    /**
     * @description 是否是IE浏览器
     */
    get isMicrosoftBrowser(): boolean;
    get isIOSPlatform(): boolean;
    get documentScrollType(): HTMLElement;
    /**
     * @description 获取默认的标准滚动时间
     */
    get SCROLL_TIME(): number;
}
declare const _default: ScrollPolyfill;
export default _default;
