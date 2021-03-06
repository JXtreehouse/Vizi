BrushesPrefab = function(param) {

	param = param || {};
	
	var obj = new Vizi.Object;

	var brushesScript = new BrushesScript(param);
	obj.addComponent(brushesScript);
	
	return obj;
}

goog.provide('BrushesScript');
goog.require('Vizi.Script');

BrushesScript = function(param) {
	Vizi.Script.call(this, param);

	this.ui = param.ui;
}

goog.inherits(BrushesScript, Vizi.Script);

BrushesScript.prototype.realize = function() {
	
    this.brushes = [];
    this.activeBrushIndex = 0;
    this._object.addChild(WandPrefab());
    this._object.addChild(FirePrefab());
	this._object.addChild(BubblesPrefab());
	this._object.addChild(FirefliesPrefab());
//	this._object.addChild(MysteryPrefab());
    
    var i, len = this._object._children.length;
    for (i = 0; i < len; i++) {
    	var obj = this._object._children[i];
    	var brush = obj.getComponent(BrushScript);
        this.brushes.push(brush);
    }
    
    this.addDomHandlers();
}

BrushesScript.prototype.addDomHandlers = function() {
	
	var that = this;
}

BrushesScript.prototype.update = function() {
}

BrushesScript.prototype.nextBrush = function() {
    this.brushes[this.activeBrushIndex].endPaint();
    this.activeBrushIndex++;
    if (this.activeBrushIndex === this.brushes.length) {
      this.activeBrushIndex = 0;
    }
    if (this.ui) {
  	  this.ui.setBrush(this.activeBrushIndex)
    }
}

BrushesScript.prototype.startPaint = function() {
    return this.brushes[this.activeBrushIndex].startPaint();
}

BrushesScript.prototype.endPaint = function() {
    return this.brushes[this.activeBrushIndex].endPaint();
}

BrushesScript.prototype.getBrush = function(index) {
	return this.brushes[index];
}