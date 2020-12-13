var canvas = new fabric.Canvas('c');
canvas.selection = false; // disable group selection
rect.set('selectable', false); // make object unselectable

http://fabricjs.com/events
So which other events are available in Fabric? Well, from mouse-level ones there are "mouse:down", "mouse:move", and "mouse:up". From generic ones, there are "after:render". Then there are selection-related events: "before:selection:cleared", "selection:created", "selection:cleared". And finally, object ones: "object:modified", "object:selected", "object:moving", "object:scaling", "object:rotating", "object:added", and "object:removed"

If you'd like to create a group with objects that are already present on canvas, you'll need to clone them first:
// create a group with copies of existing (2) objects
var group = new fabric.Group([canvas.item(0).clone(), canvas.item(1).clone()]);
// remove all objects and re-render
canvas.clear().renderAll();
// add group onto canvas
canvas.add(group);

Class
http://fabricjs.com/fabric-intro-part-3

Creating a minimap for the canvas
http://fabricjs.com/build-minimap

