/* vQuery by Valtrius 						*/
/* copyright 2018     						*/
/* You can view the documentation here 		*/
/* https://code.sololearn.com/W85ymC5431L2/ */

const $ = vQuery = (function(){

    const $ = function( ...selector ) {
        return new $.fn.init( ...selector )
    }

    const attr = function(info, attr, val, getAttr, setAttr){
        if(!this[0] && attr === undefined) return undefined
        if(!this[0] && attr) return this
        if(val === undefined) {
            let arr = []
            if(info == "attr") this.each(t=>arr.push(t[getAttr](attr)))
            else if(info == "data") this.each(t=>arr.push(t[getAttr][attr]))
            else if(info == "prop") this.each(t=>arr.push(t[attr]))
            return arr[0]
        }
        if(info == "attr") return this.each(t => t[setAttr](attr, val))
        else if(info == "data") return this.each(t => t[setAttr][attr] = val)
        else if(info == "prop") return this.each(t => t[attr] = val)
    }

    const returnArray = function(...arr) {
        let $t = $(...arr)
        $t.prevQuery = this
        return $t
    }

    const family = function(method, args, until) {
        let arr = []
        this.each(t => {
            let el = t[method]
            while(el){
                let $x = $(el).filter(...args)
                if($x.length && until!="until") arr.push(el)
                else if(!$x.length && until=="until") arr.push(el)
                
                if(until=="once" || ($x.length && until == "until")) break
                else if(until=="once") break
                el = el[method]
            }
        })
        return returnArray.call(this, ...arr)
    }

    const fragment = function(str) {
        let frag = document.createDocumentFragment()
        let temp = document.createElement('div')
        temp.innerHTML = str
        while (temp.firstChild) frag.appendChild(temp.firstChild)
        return frag
    }

    const pend = function(method, ...args) {
        return this.each((t, i) => {
            for(let arg of args){
                if(typeof arg === "string") t[method](fragment(arg))
                else if(arg instanceof HTMLElement) i !== this.length-1 ? t[method](arg.cloneNode()) : t[method](arg)
                else if(arg instanceof $ || arg instanceof HTMLCollection || arg instanceof NodeList) i !== this.length-1 ? t[method](...[...arg].map(t => t.cloneNode(true))) : t[method](...arg)
                else if(typeof arg == 'function') pend.call($(t), method, arg.call(t, i, t.innerHTML))
                else t[method](arg)
            }
        })
    }

    $.fn = $.prototype = {
        constructor: $,
        init: function( ...args ) {
            this.selector = args.join(", ")
            let arr = []
            for(let arg of args){
                if(typeof arg === "function") $doc.on("DOMContentLoaded", arg)
                else if(typeof arg === "string" && arg.charAt(arg.length-1) === ">") arr.push(...fragment(arg).children)
                else if(typeof arg === "string") arr.push(...document.querySelectorAll(arg))
                else if(arg instanceof $ || arg instanceof HTMLCollection || arg instanceof NodeList) arr.push(...arg)
                else arr.push(arg)
            }
            
            arr = Array.from(new Set(arr))
            for(let i=0, k=arr.length; i<k; i++) this[i] = arr[i]
            this.length = arr.length
            return this
        },
        add(...args){
            return returnArray.call(this, ...this, ...args)
        },
        push(...args){
            let $t = $(...this), $x = $(...args), l = this.length
            $t.prevQuery = this.prevQuery

            $x.each((t, i) => this[i+l] = $x[i])
            this.length = $t.length + $x.length
            
            this.prevQuery = $t
            return this
        },
        each(fn){
            for(var i=0,k=this.length;i<k;i++){
                if(fn.call(this[i], this[i], i, this) === false) break
            }
            return this
        },
        html(str){
            return this.prop("innerHTML", str)
        },
        text(str){
            return this.prop("innerText", str)
        },
        val(str){
            return this.prop("value", str)
        },
        prop(prop, v){
            return attr.call(this, "prop", prop, v)
        },
        attr(str, v){
            return attr.call(this, "attr", str, v, "getAttribute", "setAttribute")
        },
        data(str, v){
            let d = attr.call(this, "data", str, v, "dataset", "dataset")
            return d
        },
        css(obj, v){
            if(v) obj = {[obj]: v}
            else if(!v && typeof obj === 'string') return this.length ? this[0].style[obj] : this.constructor()
            
            return this.each(t=>{
                for(let k in obj){
                    t.style[k] = obj[k]
                }
            })
            
        },
        addClass(str){
            return this.each(t=>t.classList.add(...str.split(" ")))
        },
        removeClass(str){
            return this.each(t=>t.classList.remove(...str.split(" ")))
        },
        hasClass(str){
            let hasClass = false
            this.each(t=>{
                if(t.classList.contains(str)){
                    hasClass = true
                    return false
                }
            })
            return hasClass
        },
        map(fn){
            return this.each((t, i, all) => this[i] = fn.call(t, t, i, all))
        },
        on(event, fn, target){
            let details
            if(target) [fn, target] = [target, fn]
            if(typeof target === 'object') [details, target] = [target, details]
            return this.each(t => t.addEventListener(event, e => {
                let targeted = !target || $(target).filter((i, t) => t == e.target).length
                
                if(targeted){
                    e.data = details
                    if(fn.call(target ? e.target : t, e, details) === false){
                        e.stopPropagation()
                        e.preventDefault()
                    }
                }
            }))
        },
        off(event, fn){
            return this.each(t => t.removeEventListener(event, fn))
        },
        trigger(name, data){
            if(!name) return this
            let e = new CustomEvent(name, data)
            return this.each(t => t.dispatchEvent(e))
        },
        click(fn, target){
            if(!fn) return this.trigger('click')
            return this.on("click", fn, target)  
        },
        append(...args){
            return pend.call(this, "append", ...args)
        },
        prepend(...args){
            return pend.call(this, "prepend", ...args)
        },
        before(...args){
            return pend.call(this, "before", ...args)  
        },
        after(...args){
            return pend.call(this, "after", ...args)
        },
        appendTo(el){
            $(el).append(this)
            return this
        },
        prependTo(el){
            $(el).prepend(this)
            return this
        },
        ["get"](i){
            if(i !== undefined) return this[i]
            return [...this]
        },
        eq(i){
            if(i !== undefined) return $(this[i])
            return this
        },
        find(...args){
            let arr = []

            for(let i=0, a=args.length; i<a; i++){
                let arg = args[i]
                if(typeof arg === "string") this.each(el => arr.push(...el.querySelectorAll(arg)))
                else if(arg instanceof HTMLElement) this.each(t => {t.contains(arg) && arr.push(arg)})
                else if(arg instanceof $ || arg instanceof HTMLCollection || arg instanceof NodeList){
                    for(let c = 0, a = arg, l = a.length; c<l; c++) this.each(t => {t.contains(a[c]) && arr.push(a[c])})
                }
            }
            return returnArray.call(this, ...arr)
        },
        filter(...args){
            if(!args.length) return this
            let arr = []
            for(let arg of args){
                if(typeof arg === "function"){
                    this.each((t, i)=>{
                        if(arg.call(t, i, t)) arr.push(t)
                    })
                }else{
                    let $x = $(arg)
                    this.each(t=>{
                        $x.each(el=>{
                            if(el === t) arr.push(t)
                        })
                    })
                }
            }
            return returnArray.call(this, ...arr)
        },
        not(...args){
            return this.filter(t => {
                return !$(t).filter(...args).length
            })
        },
        closest(...args){
            let arr = [], $x = $(...args)

            this.each(v => {
                let el = v.parentNode, w
                while(el && !w){
                    $x.each(n=>{
                        if(el == n){
                            arr.push(el)
                            w = true
                            return false
                        }
                    })
                    el = el.parentNode
                }
            })
            return returnArray.call(this, ...arr)
        },
        next(...args){
            return family.call(this, "nextElementSibling", args, "once")
        },
        prev(...args){
            return family.call(this, "previousElementSibling", args, "once")
        },
        parent(...args){
            return family.call(this, "parentElement", args, "once")
        },
        nextAll(...args){
            return family.call(this, "nextElementSibling", args)
        },
        prevAll(...args){
            return family.call(this, "previousElementSibling", args)
        },
        parents(...args){
            return family.call(this, "parentElement", args)
        },
        nextUntil(...args){
            return family.call(this, "nextElementSibling", args, "until")
        },
        prevUntil(...args){
            return family.call(this, "previousElementSibling", args, "until")
        },
        parentsUntil(...args){
            return family.call(this, "parentElement", args, "until")
        },
        siblings(...args){
            let arr = [];
            this.each(t => {
                let $t = $(t)
                arr.push(...$t.prevAll(), ...$t.nextAll())
            })
            return returnArray.call(this, ...$(...arr).filter(...args))
        },
        end(){console.log("end")
            return this.prevQuery || this.constructor()
        },
        addBack(...args){
            return returnArray.call(this, this, this.prevQuery.filter(...args))
        },
        [Symbol.iterator]: function*(){
            let i = 0
            while(i < this.length) yield this[i++]
        },
        hide(){
            return this.each(t=>t.style.display="none")
        },
        show(){
            return this.each(t=>t.style.display="")
        },
        wrap(str){
            this.each(t => $(t).wrapAll(str))
        },
        wrapInner(str){
            this.each(t => $(t.childNodes).wrapAll(str))
        },
        wrapAll(str){
            let $wrap = $(str).eq(0)
            if($doc.find(this).length) this.eq(0).before($wrap)
            $wrap.map(t => { while(t.firstElementChild) t = t.firstElementChild; return t } ).append(this)
            return this
        },
        detach(){
            return this.each(t=>{
                t.parentNode.removeChild(t)
            });
        },
        remove(){
            this.each(t=>t.remove())
        },
        clone(){
            let $clone = $(...this).map(t => {
                 return t.cloneNode(true)
            })
            $clone.prevQuery = this
            return $clone
        },
        contents(){
            let arr = []
            this.each(t => arr.push(t.childNodes))
            return returnArray.call(this, ...arr)
        },
        children(){
            let arr = []
            this.each(t => arr.push(t.children))
            return returnArray.call(this, ...arr)
        },
        empty(){
            return this.each(t => {
                while(t.firstChild) t.removeChild(t.firstChild)
            })
        }
    }

    $.fn.init.prototype = $.fn
    
    const $doc = $(document)
    const $win = $(window)

    return $
 
 })();