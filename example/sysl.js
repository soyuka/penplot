/*
  This is a basic example of a plot that could be sent
  to AxiDraw V3 and similar pen plotters.
*/

import newArray from 'new-array';

import { PaperSize, Orientation } from 'penplot';
// import { randomFloat, setSeed } from 'penplot/util/random';
// setSeed(2);
import { polylinesToSVG } from 'penplot/util/svg';
import lsystem from 'sysl'

export const orientation = Orientation.PORTRAIT;
export const dimensions = PaperSize.LETTER;

function rad(v) {
 return v * (Math.PI / 180)
}

function SierpinskiArrowheadCurveRule(num, init = 'A') {
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

function SierpinskiArrowheadCurve({distance, angle, start, iterations}) {
  const lines = []

  let previous = [...start]
  let tree = SierpinskiArrowheadCurveRule(iterations)
  tree = tree[tree.length - 1]

  for (let i = 0; i < tree.length; i++) {
    let from, to

    switch (tree[i]) {
      case 'A':
      case 'B':
        from = [...previous]
        var x = distance * Math.cos(rad(angle))
        var y = distance * Math.sin(rad(angle))
        to = [from[0] - x, from[1] - y]
        previous = [...to]
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

  return lines
}

function DragonCurveRule(num, init = 'FX') {
  return lsystem(num, rule, init)

  function rule (v) {
    switch (v) {
      case 'X':
        return 'X+YF+'
      case 'Y':
        return '-FX-Y'
    }

    return v
  }
}

function DragonCurve({distance, angle, start, iterations}) {
  const lines = []

  let previous = [...start]
  let tree = DragonCurveRule(iterations)
  tree = tree[tree.length - 1]
  console.log(tree)

  for (let i = 0; i < tree.length; i++) {
    let from, to

    switch (tree[i]) {
      case 'F':
        from = [...previous]
        var x = distance * Math.cos(rad(angle))
        var y = distance * Math.sin(rad(angle))
        to = [from[0] - x, from[1] - y]
        previous = [...to]
        lines.push(from, to)
        break
      case '+':
        angle -= 90
        break;
      case '-':
        angle += 90
        break;
    }
  }

  return lines
}

export default function createPlot (context, dimensions) {
  const [ width, height ] = dimensions;

  // const start = [width / 6, height / 2]
  // const distance = 0.05
  // const angle = 180
  // const iterations = 9
  // const lines = SierpinskiArrowheadCurve({distance, angle, start, iterations})


  // const start = [width / 2, height / 2]
  // const distance = 1
  // const angle = 180
  // const iterations = 10
  // const lines = DragonCurve({distance, angle, start, iterations})
  // console.log(lines)

  const start = [width / 2, height / 2]
  const distance = 1
  const angle = 180
  const iterations = 7
  const lines = DragonCurve({distance, angle, start, iterations})
  console.log(lines)

  return {
    draw,
    print,
    clear: true,
    background: 'white'
  };

  function draw () {
    [lines].forEach(points => {
      context.beginPath();
      context.lineWidth = 0.1

      //bevel, round, mitter
      // context.lineJoin = 'mitter';
      //butt round square
      // context.lineCap = 'butt';
      points.forEach(p => context.lineTo(p[0], p[1]));
      context.stroke();
    });
  }

  function print () {
    // document.body.innerText = polylinesToSVG([lines], {dimensions})
    return polylinesToSVG([lines], {
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
