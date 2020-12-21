import './App.css';
import CovidVisualization from './CovidVisualization.js';


function App() {
  return (
    <div className='quadrant'>
      <div className='qtop'>
        <div className='quadrant1'>
          <div className='title'>COVID-19 VISUALIZATION</div>
        </div>
      </div>
      <div className='qbottom'>
        <div className='quadrant3'>
          <CovidVisualization type="state" metric="cases"/>
        </div>
        <div className='quadrant4'>
          <CovidVisualization type="state" metric="deaths" />
        </div>
      </div>
      <div className='qbottom'>
        <div className='quadrant3'>
          <CovidVisualization type="country" metric="cases" />
        </div>
        <div className='quadrant4'>
          <CovidVisualization type="country" metric="deaths" />
        </div>
      </div>
      <div className='qend'>
        <div className='footer'>
          Thanks to <a href="https://disease.sh/" target="_blank" rel="noreferrer">disease.sh</a> for providing free access to data about the COVID-19 pandemic.
        </div>
      </div>
    </div>
  );
}

export default App;