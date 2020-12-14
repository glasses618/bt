import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

interface OptionEvent {
  clientX: number,
  clientY: number,
  deltaY: number,
  preventDefault: Function,
  stopPropagation: Function,
  altKey: boolean,
}

interface Option {
  target: any,
  e: OptionEvent,
}

function App() {
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isDraggingMode, setIsDraggingMode] = useState(false);
  const isDraggingRef = useRef<boolean>(false);
  const lastPosRef = useRef<{ x: number, y: number }>({ x:0, y: 0});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<{
    add: Function,
    on: Function,
    off: Function,
    toJSON: Function,
    toObject: Function,
    loadFromJSON: Function,
    isDrawingMode?: boolean,
    getZoom: Function,
    setZoom: Function,
    clear: Function,
    height?: number,
    width?: number,
    getWidth: Function,
    getHeight: Function,
    viewportTransform?: number[],
    requestRenderAll: Function,
    setViewportTransform: Function,
  } | null>(null);

  useEffect(() => {
    function updateCanvas() {
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        backgroundColor: 'salmon',
        selectionLineWidth: 2,
        isDrawingMode,
      });

      const canvas = fabricCanvasRef.current;

      function drawGrid () {
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        console.log({canvasWidth, canvasHeight})
        const longer = canvasWidth > canvasHeight ? canvasWidth : canvasHeight;
        const vLines = [];
        const hLines = [];
        const distance = 40;
        for (let i = 0; i * distance <= longer; i++) {
          const lineDef = {
            fill: 'black',
            stroke: i % 5 === 0 ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.1)',
            strokeWidth: 1,
            //selectable: false
          }
          const vLine = new fabric.Line([i * distance, 0, i * distance, 600], lineDef)
          const hLine = new fabric.Line([0, i * distance, 600, i * distance], lineDef)          
          vLines.push(vLine);
          hLines.push(hLine);
        }
        const rect = new fabric.Rect({ 
          //left: 100, 
          //top: 100, 
          width: canvasWidth, 
          height: canvasHeight, 
          fill: '#9f9', 
          //originX: 'left', 
          //originY: 'top',
          //centeredRotation: true
        });
        var group = new fabric.Group([rect, ...vLines, ...hLines], { hasControls: false, selectable: false });
        canvas.add(group);
      }

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
          canvas.add(oImg);
          console.log(canvas.toJSON())
          console.log(canvas.toObject())
        }
      });

      canvas.add(circle, triangle, path);

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
      
      canvas.add(group);

      canvas.on('mouse:down', (options: Option) => {
        console.log(options.e.clientX, options.e.clientY);
        if (options.target) {
          console.log(options.target.type);
        }
      });

      canvas.on('mouse:wheel', (opt: Option) => {
        var delta = opt.e.deltaY;
        var zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        canvas.setZoom(zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      })    
    }

    updateCanvas();

    return (() => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.off('mouse:down');
        fabricCanvasRef.current.off('mouse:wheel');
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      canvas.on('mouse:down', (opt: Option) => {
        var evt = opt.e;
        if (isDraggingMode) {
          isDraggingRef.current = true;
          lastPosRef.current.x = evt.clientX;
          lastPosRef.current.y = evt.clientY;
        }
      });
      canvas.on('mouse:move', (opt: Option) => {
        if (isDraggingRef.current) {
          var e = opt.e;
          var vpt = canvas.viewportTransform ?? [];
          vpt[4] += e.clientX - lastPosRef.current.x;
          vpt[5] += e.clientY - lastPosRef.current.y;
          canvas.requestRenderAll();
          lastPosRef.current.x = e.clientX;
          lastPosRef.current.y = e.clientY;
        }
      });  
      canvas.on('mouse:up', (opt: Option) => {
        // on mouse up we want to recalculate new interaction
        // for all objects, so we call setViewportTransform
        canvas.setViewportTransform(canvas.viewportTransform);
        isDraggingRef.current = false;
      });
    }

    return (() => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.off('mouse:down');
        fabricCanvasRef.current.off('mouse:move');
      }
    });
  }, [isDraggingMode])

  useEffect(() => {
    if(fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = isDrawingMode;
    }
  }, [isDrawingMode])

  return (
    <div style={{ }}>
      <button onClick={() => { setIsDrawingMode(prevState => !prevState) }}>
        {`drawin mode: ${isDrawingMode}`}
      </button>
      <button onClick={() => { setIsDraggingMode(prevState => !prevState) }}>
        {`drag mode: ${isDraggingMode}`}
      </button>
      <canvas ref={canvasRef} width={600} height={600}/>
    </div>
  );
}

export default App;
