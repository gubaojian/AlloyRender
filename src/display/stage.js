import Group from './group.js'
import Renderer from '../render/renderer.js'
import HitRender from '../render/hit_render.js'
import Event from '../base/event.js'

class Stage extends Group  {
    constructor(width,height,renderTo) {
        super()
        if(arguments.length === 1){
            this.canvas = typeof width === 'string'?document.querySelector(width):width
        }else {
            this.renderTo = typeof renderTo === 'string' ? document.querySelector(renderTo) : renderTo
            this.canvas = document.createElement('canvas')
            this.canvas.width = width
            this.canvas.height = height
            this.renderTo.appendChild(this.canvas)
        }
        this.renderer = new Renderer(this.canvas)
        this.canvas.addEventListener('click', evt => this._handleClick(evt))

        this.canvas.addEventListener("mousemove", evt => this._handleMouseMove(evt))

        this.canvas.addEventListener("mousedown", evt => this._handleMouseDown(evt))

        this.canvas.addEventListener("mouseup", evt => this._handleMouseUp(evt))

        this.canvas.addEventListener("mouseout", evt => this._handleMouseOut(evt))
        //this.canvas.addEventListener("click", this._handleClick.bind(this), false);

        this.canvas.addEventListener("dblclick", evt => this._handlDblClick(evt))
        //this.addEvent(this.canvas, "mousewheel", this._handleMouseWheel.bind(this));
        //this.canvas.addEventListener("touchmove", this._handleMouseMove.bind(this), false);
        //this.canvas.addEventListener("touchstart", this._handleMouseDown.bind(this), false);
        //this.canvas.addEventListener("touchend", this._handleMouseUp.bind(this), false);
        //this.canvas.addEventListener("touchcancel", this._handleTouchCancel.bind(this), false);

        this.borderTopWidth = 0
        this.borderLeftWidth = 0

        this.hitAABB = false
        this._hitRender = new HitRender()
        //get rect again when trigger onscroll onresize event!?
        this._boundingClientRect = this.canvas.getBoundingClientRect()
        this._overObject = null


        this._scaleX = 1
        this._scaleY = 1

        this._mouseDownX = 0
        this._mouseDownY = 0

        this._mouseUpX = 0
        this._mouseUpY = 0

        this.willDragObject = null
        this.preStageX = null
        this.preStageY = null
    }

    _handlDblClick(evt){
        let obj = this._getObjectUnderPoint(evt)
    }

    _handleClick(evt){
        //this._computeStageXY(evt)
        if(Math.abs(this._mouseDownX- this._mouseUpX)<20&&Math.abs(this._mouseDownY- this._mouseUpY)<20) {
            let obj = this._getObjectUnderPoint(evt)
        }
    }

    _handleMouseDown(evt){
        let obj = this._getObjectUnderPoint(evt)
        this.willDragObject = obj
        this._mouseDownX = evt.stageX
        this._mouseDownY = evt.stageY
        this.preStageX = evt.stageX
        this.preStageY = evt.stageY
    }

    scaleStage(x,y){
        this._scaleX = x
        this._scaleY = y
    }

    _handleMouseUp(evt){
        let obj = this._getObjectUnderPoint(evt)

        this._mouseUpX = evt.stageX
        this._mouseUpY = evt.stageY

        this.willDragObject = null
        this.preStageX = null
        this.preStageY = null
    }

    _handleMouseOut(evt) {
        this._computeStageXY(evt)
        this.dispatchEvent({
            pureEvent: evt,
            type: 'mouseout',
            stageX: evt.stageX,
            stageY: evt.stageY,
            pureEvent: evt
        })

        //this._overObject&& this._overObject.dispatchEvent({
        //    pureEvent: evt,
        //        type: 'mouseout',
        //        stageX: evt.stageX,
        //        stageY: evt.stageY,
        //        pureEvent: evt
        //})

    }

    _handleMouseMove(evt) {

        let obj = this._getObjectUnderPoint(evt)
        let mockEvt = new Event()
        mockEvt.stageX = evt.stageX
        mockEvt.stageY = evt.stageY
        mockEvt.pureEvent = evt

        if(this.willDragObject){
            mockEvt.type = 'drag'
            mockEvt.dx =  mockEvt.stageX - this.preStageX
            mockEvt.dy =  mockEvt.stageY - this.preStageY
            this.preStageX = mockEvt.stageX
            this.preStageY = mockEvt.stageY
            this.willDragObject.dispatchEvent(mockEvt)
        }

        if (obj) {
            if (this._overObject === null) {
                mockEvt.type = 'mouseover'
                obj.dispatchEvent(mockEvt)
                this._overObject = obj
                this._setCursor(obj.cursor);
            } else {
                if (obj.id !== this._overObject.id) {
                    mockEvt.type = 'mouseover'
                    obj.dispatchEvent(mockEvt)
                    this._setCursor(obj.cursor)
                    this._overObject.dispatchEvent({
                        pureEvent: evt,
                        type: 'mouseout',
                        stageX: evt.stageX,
                        stageY: evt.stageY,
                        pureEvent: evt
                    })
                    this._overObject = obj
                } else {
                    mockEvt.type = 'mousemove'
                    obj.dispatchEvent(mockEvt)
                }
            }
        } else if (this._overObject) {

            mockEvt.type = 'mouseout'
            this._overObject.dispatchEvent(mockEvt)
            this._overObject = null
            this._setCursor(this.cursor)
        }
    }

    _setCursor(cursor){
        this.canvas.style.cursor = cursor;
    }

    _getObjectUnderPoint (evt) {
        this._computeStageXY(evt)
        if (this.hitAABB) {
            return this._hitRender.hitAABB(this, evt)
        } else {
            return this._hitRender.hitPixel(this, evt)
        }
    }

    _computeStageXY(evt){
        this._boundingClientRect = this.canvas.getBoundingClientRect()
        evt.stageX  = (evt.clientX - this._boundingClientRect.left - this.borderLeftWidth)/this._scaleX
        evt.stageY = (evt.clientY - this._boundingClientRect.top - this.borderTopWidth)/this._scaleY
    }

    update(){
        this.renderer.update(this)
        //this.renderer.clear()
        //this.children.forEach( child => {
        //    this.renderer.render(child)
        //})
    }
}

export default Stage;