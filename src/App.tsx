import React, { useEffect, useRef } from 'react';
import './App.css';
import { useHelperScroll } from './utils/useHeplerSlider';

function App() {
  const ref = useRef(null);
  const {setElement} = useHelperScroll({
    itemGap: 20,
    elementName: 'li',
    marginEdge: 10
  })

  useEffect(() => {
    setElement(ref.current)
  }, [ref.current])
  return (
    <div className="App">
      <ul ref={ref}>
        <li>

        </li>
        <li>

        </li>
        <li>

        </li>
        <li>

        </li>
        <li>

        </li>
        <li>

        </li>
      </ul>
    </div>
  );
}

export default App;
