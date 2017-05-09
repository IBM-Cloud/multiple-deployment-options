// based on https://github.com/fvdm/nodejs-fibonacci
// adapted to run each iteration asynchronuously,
// allowing multiple "concurrent" calls in a nodejs app
let BigNum;
try {
  BigNum = require('./bn.js');
} catch (err) {
  BigNum = require('bn.js');
}

function Fibonacci() {
  const self = this;

  function iterate(options) {
    const context = {
      limit: options.iteration,
      timeLimit: options.duration,
      next: new BigNum(1),
      cur: new BigNum(-1),
      last: new BigNum(0),
      loop: new BigNum(0),
      start: new Date().getTime(),
      result: {},
      canceled: false,
      parallel: options.parallel,
      callback: options.callback
    };

    context.limit = context.limit && new BigNum(context.limit);

    return {
      cancel: () => {
        context.canceled = true;
      },
      do: () => oneIteration(context)
    };
  }

  function oneIteration(context) {
    while (true) {
      // prev cur -> now last
      // prev next -> now cur
      context.last = context.cur;
      context.cur = context.next;
      context.next = context.cur.add(context.last);

      context.result.number = context.next.toString();
      context.result.length = context.next.toString().length;
      context.result.iterations = context.loop.toString();
      context.result.ms = new Date().getTime() - context.start;

      if (context.canceled ||
          (context.timeLimit && context.result.ms >= context.timeLimit) ||
          (context.limit && context.loop.eq(context.limit))) {
        if (context.callback) {
          context.callback(context.result);
        }
        return context.result;
      }

      // catch infinity
      if (context.next === 'Infinity') {
        const result = {
          reason: 'infinity',
          max_limit: Number.MAX_LIMIT.toString(),
          last_result: context.result,
          iterations: context.loop.toString(),
          intended: context.limit ? context.limit : null
        };
        if (context.callback) {
          context.callback(result);
        }
        return result;
      }

      // count
      context.loop = context.loop.add(new BigNum(1));

      if (context.parallel) {
        break;
      }
    }

    // implement pseudo parallel computation
    // overall it slows down all computation and allow to generate latency
    if (context.parallel) {
      setTimeout(() => oneIteration(context), 0);
    }

    return null;
  }

  // iteration:
  //  Given a number `n` of iteration, it returns the Fibonacci number
  //  at position `n` in the sequence.
  // duration:
  //  Given a duration `t` in milliseconds, it computes the Fibonacci sequence
  //  during this duration and returns the value it was able to compute and
  //  the iteration number it reached.
  self.compute = options => iterate(options);

  // Generate an html document suitable for registering
  // a Fibonacci service endpoint with the web tester
  self.addEnpointHtml = (name, icon, pingEndpoint, crashEndpoint) => {
    const addEnpoint = 'http://deployment-options-tester.mybluemix.net/?action=add' +
      `&name=${encodeURIComponent(name)}` +
      `&icon=${encodeURIComponent(icon)}` +
      `&iterate=${encodeURIComponent(pingEndpoint)}` +
      `&crash=${encodeURIComponent(crashEndpoint)}`;

    const body = `<html><body><a href="${addEnpoint}">Add this service to the web tester</a></body></html>`;
    return body;
  };
}

module.exports = () => new Fibonacci();
