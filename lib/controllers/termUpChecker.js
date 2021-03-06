var ShoeClient = require('../ShoeClient');
var MuxDemux = require('mux-demux');
var command = require('../models/command');
var debug = require('./debugAdder.js');

// check if terminal is responsive.
// send an echo test command to terminal stream and create timeout error if unreachable
function checkTermUp (cb) {
  var stream = new ShoeClient('ws://localhost:15000/streams/terminal');
  var muxDemux = new MuxDemux(onStream);
  stream.pipe(muxDemux).pipe(stream);
  debug.addForStream(stream, "termUpChecker stream");

  function onStream(stream) {
    if (stream.meta === 'terminal') {
      onTerminal(stream);
    }
  }
  function onTerminal(stream) {
    var timeout = setTimeout(timeoutError, 2000);
    var err;
    stream.on('data', function (data) {
      // grab output of echo command
      if (/xterm-color/.test(data) && !err) {
        clearTimeout(timeout);
        cb();
      }
    });
    stream.write('echo $TERM\n');
    function timeoutError () {
      err = new Error('timeout');
      cb(err);
    }
  }
}

module.exports = checkTermUp;