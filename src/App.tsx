import { useEffect, useRef } from 'react';
// import { fabric } from 'fabric';

interface RectProps { ctx: any, x: any, y: any, width: any, height: any, }

function rect(props: RectProps) {
  const {ctx, x, y, width, height} = props;
  ctx.fillRect(x, y, width, height);
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    function updateCanvas() {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.clearRect(0,0, 300, 300);
        // draw children “components”
        rect({ctx, x: 10, y: 10, width: 50, height: 50});
        rect({ctx, x: 110, y: 110, width: 50, height: 50});
      }
    }

    updateCanvas();
  }, [canvasRef]);

  return (
    <div style={{ backgroundColor:'teal'}}>
      <canvas ref={canvasRef} width={600} height={600}/>
    </div>
  );
}

export default App;
