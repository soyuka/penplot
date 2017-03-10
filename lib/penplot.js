import createLoop from 'raf-loop';
import defined from 'defined';
import css from 'dom-css';
import keycode from 'keycode';
import xhr from 'xhr';

// Constants
export const PaperSize = {
  LETTER: [ 21.59, 27.94 ],
  PORTRAIT: [ 24, 36 ],
  SKETCHBOOK: [ 17.7, 25.4 ],
  SQUARE_POSTER: [ 30, 30 ]
};

export const Orientation = {
  LANDSCAPE: 'landscape',
  PORTRAIT: 'portrait'
};

export const Margin = {
  ONE_INCH: [ 2.54, 2.54 ] // 1 in margins
};

export const PenThickness = {
  FINE_TIP: 0.03
};

// Main export
export default function penplot (createPlot, opt = {}) {
  const displayPadding = defined(opt.displayPadding, 40);
  const pixelRatio = window.devicePixelRatio;

  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  document.body.style.margin = '0';
  css(canvas, {
    display: 'block',
    position: 'absolute',
    'box-shadow': '3px 3px 20px 0px rgba(0, 0, 0, 0.15)',
    'box-sizing': 'border-box'
  });

  const context = canvas.getContext('2d');
  let canvasWidth, canvasHeight;

  if (opt.orientation && typeof opt.orientation !== 'string') {
    throw new TypeError('opt.orientaiton must be a string or Orientation constant, "landscape" or "portrait"');
  }
  if (opt.dimensions && !Array.isArray(opt.dimensions)) {
    throw new TypeError('opt.dimensions must be an array or PaperSize constant, e.g. [ 25, 12 ]');
  }

  const orientation = opt.orientation || Orientation.PORTRAIT;
  const dimensions = orient(opt.dimensions || PaperSize.LETTER, orientation);
  const aspect = dimensions[0] / dimensions[1];

  const plot = createPlot(context, dimensions);
  const lineWidth = defined(plot.lineWidth, PenThickness.FINE_TIP);

  window.addEventListener('resize', () => {
    resize();
    draw();
  });
  window.addEventListener('keydown', ev => {
    const key = keycode(ev);
    if ((ev.ctrlKey || ev.metaKey) && key === 'p') {
      ev.preventDefault();
      print();
    }
  })
  resize();
  clear();

  if (plot.animate) {
    createLoop(draw).start();
  } else {
    draw();
  }

  function clear () {
    if (plot.background) {
      context.save();
      context.globalAlpha = 1;
      context.fillStyle = plot.background;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.restore();
    } else {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function orient (dimensions, orientation) {
    return orientation === Orientation.LANDSCAPE
      ? dimensions.slice().reverse()
      : dimensions.slice();
  }

  function draw (dt = 0) {
    context.save();
    context.scale(
      pixelRatio * (canvasWidth / dimensions[0]),
      pixelRatio * (canvasHeight / dimensions[1])
    );

    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.globalAlpha = 1;
    context.lineWidth = lineWidth;
    context.fillStyle = 'black';
    context.strokeStyle = 'black';

    if (plot.clear !== false) {
      clear();
    }

    plot.draw(dt);
    context.restore();
  }

  function resize () {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let width, height;
    if (windowWidth > windowHeight) {
      height = windowHeight - displayPadding * 2;
      width = height * aspect;
    } else {
      width = windowWidth - displayPadding * 2;
      height = width / aspect;
    }

    const left = Math.floor((windowWidth - width) / 2);
    const top = Math.floor((windowHeight - height) / 2);
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.left = `${left}px`;
    canvas.style.top = `${top}px`;
    canvasWidth = width;
    canvasHeight = height;
  }

  function print () {
    if (process.env.NODE_ENV === 'production') {
      console.error('You need to be in development mode to print a plot!');
    } else if (typeof plot.print !== 'function') {
      throw new Error('Plot has no print() function defined!');
    } else {
      const svg = plot.print();
      if (!svg || (!Buffer.isBuffer(svg) && typeof svg !== 'string')) {
        throw new Error('print() must return a string or Buffer SVG file!');
      }
      xhr.post('/print', {
        json: true,
        body: {
          dimensions,
          orientation,
          lineWidth,
          svg
        }
      }, (err, resp) => {
        if (err) throw err;
        console.log(resp)
      });
    }
  }
}