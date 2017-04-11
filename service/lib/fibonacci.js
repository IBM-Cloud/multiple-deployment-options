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

  function iterate(limit, timeLimit, callback) {
    const context = {
      limit,
      timeLimit,
      callback,
      next: new BigNum(1),
      cur: new BigNum(-1),
      last: new BigNum(0),
      loop: new BigNum(0),
      start: new Date().getTime(),
      result: {},
    };

    context.limit = context.limit && new BigNum(context.limit);

    // start counting
    oneIteration(context);
  }

  function oneIteration(context) {
    // prev cur -> now last
    // prev next -> now cur
    context.last = context.cur;
    context.cur = context.next;
    context.next = context.cur.add(context.last);

    context.result.number = context.next.toString();
    context.result.length = context.next.toString().length;
    context.result.iterations = context.loop.toString();
    context.result.ms = new Date().getTime() - context.start;

    if (context.timeLimit && context.result.ms >= context.timeLimit) {
      context.callback(context.result);
      return;
    }

    // found the one
    if (context.limit && context.loop.eq(context.limit)) {
      context.callback(context.result);
      return;
    }

    // catch infinity
    if (context.next === 'Infinity') {
      context.callback({
        reason: 'infinity',
        max_limit: Number.MAX_LIMIT.toString(),
        last_result: context.result,
        iterations: context.loop.toString(),
        intended: context.limit ? context.limit : null
      });
    }

    // count
    context.loop = context.loop.add(new BigNum(1));

    // keep going, but give a chance to other computation to run too
    // we simulate a bit of parallel queries here
    // process.nextTick(() => {
    setTimeout(() => {
      oneIteration(context);
    }, 0);
  }

  // Given a number `n` of iteration, it returns the Fibonacci number
  // at position `n` in the sequence.
  self.compute = (n, callback) => {
    iterate(n, null, callback);
  };

  // Given a duration `t` in milliseconds, it computes the Fibonacci sequence
  // during this duration and returns the value it was able to compute and
  // the iteration number it reached.
  self.computeFor = (duration, callback) => {
    iterate(null, duration, callback);
  };
}

module.exports = () => new Fibonacci();
