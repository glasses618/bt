import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { nanoid } from 'nanoid'
import fabric from './fabric';

function Canvas({ width, height, onObject }, ref) {
  const [currentMode, setCurrentMode] = useState('');
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x:0, y: 0 });
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const gridRef = useRef(null);

  const drawGrid = () => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const zoom = canvas.getZoom();
      const width = canvasWidth / zoom;
      const height = canvasHeight / zoom;
      const vLines = [];
      const hLines = [];
      const distance = 40;
      const originX = -1 * distance;
      const originY = -1 * distance;
      for (let i = 0; i * distance < (width + 2 * distance); i++) {
        const lineDef = {
          fill: 'black',
          stroke: i % 5 === 0 ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.1)',
          strokeWidth: 1,
        }
        const vLine = new fabric.Line([
          originX + i * distance, originY,
          originX + i * distance, height + distance
        ], lineDef)
        vLines.push(vLine);
      }
      for (let i = 0; i * distance < (height + 2 * distance); i++) {
        const lineDef = {
          fill: 'black',
          stroke: i % 5 === 0 ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.1)',
          strokeWidth: 1,
        }
        const hLine = new fabric.Line([
          originX, originY + i * distance,
          width + distance, originY + i * distance
        ], lineDef)          
        hLines.push(hLine);
      }
      const rect = new fabric.Rect({ 
        left: originX, 
        top: originY, 
        width: width + 2 * distance, 
        height: height + 2 * distance, 
        fill: '#9f9', 
        //originX: 'center', 
        //originY: 'center',
        //centeredRotation: true
      });
      if (!gridRef.current) {
        gridRef.current = new fabric.Group(
          [rect, ...vLines, ...hLines],
          { 
            hasControls: false,
            selectable: false,
          }
        );
        gridRef.current.name = 'grid';
        canvas.add(gridRef.current);
      } else {
        //gridRef.current.addWithUpdate()
      }
    }
  }

  useEffect(() => {
    function updateCanvas() {
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        backgroundColor: 'salmon',
        selectionLineWidth: 2,
        isDrawingMode: currentMode === 'drawing',
      });

      const canvas = fabricCanvasRef.current;

      drawGrid()

      //canvas.loadFromJSON('{"objects":[{"type":"rect","left":50,"top":50,"width":20,"height":20,"fill":"green","overlayFill":null,"stroke":null,"strokeWidth":1,"strokeDashArray":null,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"selectable":true,"hasControls":true,"hasBorders":true,"hasRotatingPoint":false,"transparentCorners":true,"perPixelTargetFind":false,"rx":0,"ry":0},{"type":"circle","left":100,"top":100,"width":100,"height":100,"fill":"red","overlayFill":null,"stroke":null,"strokeWidth":1,"strokeDashArray":null,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"selectable":true,"hasControls":true,"hasBorders":true,"hasRotatingPoint":false,"transparentCorners":true,"perPixelTargetFind":false,"radius":50}],"background":"rgba(0, 0, 0, 0)"}');

      var circle = new fabric.Circle({
        radius: 20, fill: 'green', left: 100, top: 100
      });
      var triangle = new fabric.Triangle({
        width: 20, height: 30, fill: 'blue', left: 50, top: 50
      });

      var path = new fabric.Path('M 0 0 L 200 100 L 170 200 z');
      path.set({ left: 120, top: 120 });
      
      fabric.Image.fromURL('http://fabricjs.com/article_assets/9.png', oImg => {
        if (canvas) {
          oImg.scale(0.5).set('flipX', true);
          oImg.on('selected', function() {
            console.log('selected an image');
          });
          // canvas.add(oImg);
        }
      });

      // canvas.add(circle, triangle, path);

      var circle1 = new fabric.Circle({
        radius: 50,
        fill: 'red',
        left: 0
      });
      var circle2 = new fabric.Circle({
        radius: 50,
        fill: 'green',
        left: 100
      });
      var circle3 = new fabric.Circle({
        radius: 50,
        fill: 'blue',
        left: 200
      });
      
      var group = new fabric.Group([ circle1, circle2, circle3 ], {
        left: 200,
        top: 100
      });
      
      // canvas.add(group);

      canvas.on('mouse:wheel', (opt) => {
        var delta = opt.e.deltaY;
        var zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      }) 
      
      canvas.on('object:added', options => {
        if (options.target) {
          var obj = options.target;
          if(!obj.id){
            // If object created by you, initially id will be undefined
            // Set the id and sync object
            obj.set('id', nanoid());
            obj.toJSON = (function(toJSON) {
              return function() {
                return fabric.util.object.extend(toJSON.call(this), {
                  id: this.id,
                });
              };
            })(obj.toJSON);
            onObject(obj);
          }
       }
      })
      canvas.on('object:modified', options => {
        if (options.target) {
          var obj = options.target;
          onObject(obj);
       }
      })
    }

    updateCanvas();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;

      // default
      canvas.on('mouse:down', (options) => {
        if (!options.target) {
          //drawGrid();
        }
      });

      // drawing
      canvas.isDrawingMode = currentMode === 'drawing';
      
      // drag
      const isDraggingMode = currentMode === 'drag';
      canvas.selection = !isDraggingMode;
      canvas.forEachObject(o => {
        if (o.name !== 'grid') {
          o.selectable = !isDraggingMode
        }
      })
      if (isDraggingMode) {
        canvas.on('mouse:down', (opt) => {
          var evt = opt.e;
          isDraggingRef.current = true;
          lastPosRef.current.x = evt.clientX;
          lastPosRef.current.y = evt.clientY;
        });
        canvas.on('mouse:move', (opt) => {
          if (isDraggingRef.current) {
            var e = opt.e;
            canvas.viewportTransform[4] += e.clientX - lastPosRef.current.x;
            canvas.viewportTransform[5] += e.clientY - lastPosRef.current.y;
            canvas.requestRenderAll();
            lastPosRef.current.x = e.clientX;
            lastPosRef.current.y = e.clientY;
          }
        });  
        canvas.on('mouse:up', (opt) => {
          // on mouse up we want to recalculate new interaction
          // for all objects, so we call setViewportTransform
          canvas.setViewportTransform(canvas.viewportTransform);
          isDraggingRef.current = false;
        });
      }

      // rect
      const isRectMode = currentMode === 'rect';
      let rectangle, isDown, origX, origY;
      let width = 0;
      let height = 0;;
      if (isRectMode) {
        canvas.on('mouse:down', o => {
          const pointer = canvas.getPointer(o.e);
          isDown = true;
          origX = pointer.x;
          origY = pointer.y;
        });
        canvas.on('mouse:move', o => {
            if (!isDown) return;
            var pointer = canvas.getPointer(o.e);
            //bug fix needed
            if(origX>pointer.x){
                origX = Math.abs(pointer.x);
            }
            if(origY>pointer.y){
                origY = Math.abs(pointer.y);
            }
            width = Math.abs(origX - pointer.x);
            height = Math.abs(origY - pointer.y);
            canvas.renderAll();
        });
        canvas.on('mouse:up', o => {
          if (width > 0 && height > 0) {
            rectangle = new fabric.Rect({
              left: origX,
              top: origY,
              width,
              height,
              fill: 'transparent',
              stroke: 'pink',
              strokeWidth: 3,
            });
            canvas.add(rectangle);
          }
          width = 0;
          height = 0;
          isDown = false;
        });
      }
    }

    return (() => {
      if (fabricCanvasRef.current) {
        const canvas = fabricCanvasRef.current;
        canvas.off('mouse:down');
        canvas.off('mouse:move');
        canvas.off('mouse:up');
      }
    });
  }, [currentMode])

  useImperativeHandle(ref, () => ({
    syncObj: obj => {
      const canvas = fabricCanvasRef.current;
      if (!canvas || !obj) {
        return;
      }

      function getObjectFromId(id){
        if (!id) {
          return null;
        }
        const currentObjects = canvas.getObjects();
        for (var i = currentObjects.length - 1; i >= 0; i-- ) {
          if (currentObjects[i].id === id) {
            return currentObjects[i];
          }
        }
       return null;
      }

      var existing = getObjectFromId(obj?.id);
      console.log(existing)
      if (existing) {
        // if(obj.removed){
        //   canvas.remove(existing);
        // } else {
          existing.set(obj);
          canvas.renderAll();
        // }
      } else {
        if(obj.type === 'rect'){
          canvas.add(new fabric.Rect(obj));
        }
        canvas.renderAll();
      }
    }
  }));

  return (
    <div>
      <button onClick={() => { setCurrentMode(currentMode === 'drawing' ? '' : 'drawing') }}>
        {`drawin mode: ${currentMode === 'drawing'}`}
      </button>
      <button onClick={() => { setCurrentMode(currentMode === 'rect' ? '' : 'rect') }}>
        {`rect mode: ${currentMode === 'rect'}`}
      </button>
      <button onClick={() => { setCurrentMode(currentMode === 'drag' ? '' : 'drag') }}>
        {`drag mode: ${currentMode === 'drag'}`}
      </button>
      <canvas ref={canvasRef} width={width} height={height}/>
    </div>
  );
}

export default forwardRef(Canvas);
