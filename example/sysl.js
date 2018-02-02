/*
  This is a basic example of a plot that could be sent
  to AxiDraw V3 and similar pen plotters.
*/

import newArray from 'new-array';

import { PaperSize, Orientation } from 'penplot';
// import { randomFloat, setSeed } from 'penplot/util/random';
import { polylinesToSVG } from 'penplot/util/svg';
import lsystem from 'sysl'

function rad(v) {
 return v * (Math.PI / 180)
}

function FractalTree(num, init = 'A') {
  return lsystem(num, rule, init)

  function rule (v) {
    switch (v) {
      case 'A':
        return 'B-A-B'
      case 'B':
        return 'A+B+A'
    }

    return v
  }
}

// setSeed(2);

export const orientation = Orientation.PORTRAIT;
export const dimensions = PaperSize.LETTER;

export default function createPlot (context, dimensions) {
  const [ width, height ] = dimensions;

  // const lineCount = 20;
  // const segments = 500;
  // const radius = 2;

  const start = [0, 0]
  let lastPoint = [...start]
  const distance = 0.05

  const lines = []
  let angle = 180
  let tree = FractalTree(10)
  tree = tree[tree.length - 1]

  for (let i = 0; i < tree.length; i++) {
    let from, to

    switch (tree[i]) {
      case 'A':
      case 'B':
        from = [...lastPoint]
        var x = distance * Math.cos(rad(angle))
        var y = distance * Math.sin(rad(angle))
        to = [from[0] - x, from[1] - y]
        lastPoint = [...to]
        lines.push(from, to)
        break
      case '+':
        angle -= 60
        break;
      case '-':
        angle += 60
        break;
    }
  }

  return {
    draw,
    print,
    clear: true,
    background: 'white'
  };

  function draw () {
    [lines].forEach(points => {
      context.beginPath();
      points.forEach(p => context.lineTo(p[0], p[1]));
      context.stroke();
    });
  }

  function print () {
    return polylinesToSVG(lines, {
      dimensions
    });
  }
}

  // const lines = []
  //     case '[':
  //       stack.push([...previous])
  //       factor = stack.length + 1
  //       transform = function (coord, d) {
  //         const x = d * Math.cos(angle) - d * Math.sin(angle)
  //         const y = d * Math.sin(angle) + d * Math.cos(angle)
  //         return [coord[0] - x, coord[1] - y]
  //       }
  //       continue
//
/**
 * Formula
        const x' = x * Math.cos(angle) - y * Math.sin(angle)
        const y' = x * Math.sin(angle) + y * Math.cos(angle)
        https://en.wikipedia.org/wiki/Transformation_matrix#Examples_in_2D_computer_graphics
 */
