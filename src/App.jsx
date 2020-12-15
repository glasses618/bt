import React, { useRef } from 'react';
import Canvas from './Canvas';

function App() {
  const canvasOneRef = useRef();
  const canvasTwoRef = useRef();

  const handleObject = obj => {
    console.log(JSON.stringify(obj))
    if (canvasOneRef.current) {
      canvasOneRef.current.syncObj(obj);
    }
    if (canvasTwoRef.current) {
      canvasTwoRef.current.syncObj(obj);
    }
  }

  return (
    <div>
      <Canvas
        ref={canvasOneRef}
        width={400}
        height={300}
        onObject={handleObject}
      />
      <Canvas
        ref={canvasTwoRef}
        width={400}
        height={300}
        onObject={handleObject}
      />
    </div>
  );
}

export default App;
