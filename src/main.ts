import './style.css'
import P5 from 'p5'
import ApollonianGasket from './components/ApollonianGasket.ts'

const bootstrap = (p5: P5) => {
  let apollonianGasket: ApollonianGasket;

  const createCanvas = () => {
    const size = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight;
    p5.createCanvas(size, size);
  };

  p5.setup = () => {
    createCanvas();
    apollonianGasket = new ApollonianGasket(p5);
  };

  p5.draw = () => {
    p5.background(255);
    apollonianGasket.draw();
  };

  p5.windowResized = () => {
    createCanvas();
    apollonianGasket.draw();
  };
};

new P5(bootstrap)
