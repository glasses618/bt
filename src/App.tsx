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
  } | null>(null);

  useEffect(() => {
    function updateCanvas() {
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        backgroundColor: 'rgb(100,100,200)',
        selectionColor: 'blue',
        selectionLineWidth: 2,
        isDrawingMode,
      });

      const canvas = fabricCanvasRef.current;

      canvas.loadFromJSON('{"objects":[{"type":"rect","left":50,"top":50,"width":20,"height":20,"fill":"green","overlayFill":null,"stroke":null,"strokeWidth":1,"strokeDashArray":null,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"selectable":true,"hasControls":true,"hasBorders":true,"hasRotatingPoint":false,"transparentCorners":true,"perPixelTargetFind":false,"rx":0,"ry":0},{"type":"circle","left":100,"top":100,"width":100,"height":100,"fill":"red","overlayFill":null,"stroke":null,"strokeWidth":1,"strokeDashArray":null,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"selectable":true,"hasControls":true,"hasBorders":true,"hasRotatingPoint":false,"transparentCorners":true,"perPixelTargetFind":false,"radius":50}],"background":"rgba(0, 0, 0, 0)"}');

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

      canvas.on('mouse:down', (opt: Option) => {
        // var evt = opt.e;
        // if (evt.altKey === true) {
        //   this.isDragging = true;
        //   this.selection = false;
        //   this.lastPosX = evt.clientX;
        //   this.lastPosY = evt.clientY;
        // }
      });
      canvas.on('mouse:move', (opt: Option) => {
        // if (this.isDragging) {
        //   var e = opt.e;
        //   var vpt = this.viewportTransform;
        //   vpt[4] += e.clientX - this.lastPosX;
        //   vpt[5] += e.clientY - this.lastPosY;
        //   this.requestRenderAll();
        //   this.lastPosX = e.clientX;
        //   this.lastPosY = e.clientY;
        // }
      });
      canvas.on('mouse:up', (opt: Option) => {
        // on mouse up we want to recalculate new interaction
        // for all objects, so we call setViewportTransform
        // this.setViewportTransform(this.viewportTransform);
        // this.isDragging = false;
        // this.selection = true;
      });
          
      
    }

    updateCanvas();

    return (() => {
      if (fabricCanvasRef.current) {
        //fabricCanvasRef.current.off('mouse:down', mouseDownEventHandler);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if(fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = isDrawingMode;
    }
  }, [isDrawingMode])

  return (
    <div style={{ backgroundColor:'teal'}}>
      <button onClick={() => { setIsDrawingMode(prevState => !prevState) }}>
        {`${isDrawingMode}`}
      </button>
      <canvas ref={canvasRef} width={600} height={600}/>
    </div>
  );
}

export default App;
