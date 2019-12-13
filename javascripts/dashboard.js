import { getCookie, goTo } from './utility.js';

const statuses = [
  'IDLE',
  'WAITING', // All batches have been processed, nothing to do
  'WORKING'
];
// When true, requests new batch everytime client gets back to IDLE status
let AUTOMODE = false;
// Reflects what the client is currently doing
let STATUS = statuses[0];
// Time to wait before retrying if no batch available
let autoGetBatchIntervalMs = 3000;
// Algorithm in JS to use for computing
let ALGORITHM = '';

const setStatus = (index) => {
  STATUS = statuses[index];
  $('#status').text(STATUS);

  if (index === 2 || index === 3)
    $('#newBatch').attr('disabled', true);
};

const setConnection = (connected) => {
  switch (connected) {
    case 0:
      $('#connection').text('DISCONNECTED').addClass('danger').removeClass('success');
      break;
    case 1:
      $('#connection').text('CONNECTING').removeClass('danger').removeClass('success');
      break;
    case 2:
      $('#connection').text('CONNECTED').addClass('success').removeClass('danger');
      break;
  }
};

// Check if authentication login is present, if not redirect to login
const token = getCookie('token');
if (!token)
  goTo('');

// Opening a socket and specifying handlers
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('socket connected');
  socket.emit('getAlgorithm', 'js');
  setConnection(1);
});

socket.on('disconnect', function () {
  console.log('socket disconnected');
  setConnection(0);
});

socket.on('algorithm', ({ code }) => {
  ALGORITHM = eval(`(${code})`);
  setConnection(2);
});

socket.on('batch', (batch) => {
  console.log('batch', batch);
  setStatus(2);
  processBatch(batch).then((secret) => {
    console.log('secret found ', secret);
    // TODO: emit key found
  }).catch(() => {
    console.log('secret not found ');
    // TODO : emit key not found
  }).finally(() => {
    setStatus(0);
  });
});

socket.on('noBatches', () => {
  console.log('no batches');
  if (AUTOMODE) {
    setStatus(1);
    setTimeout(() => {
      socket.emit('getBatch');
    }, autoGetBatchIntervalMs);
  } else {
    setStatus(0);
  }
});

// User interaction handlers
$(function () {
  $('input#automode').prop('checked', false);

  $('button#newBatch').on('click', (d) => {
    if (STATUS !== 3)
      socket.emit('getBatch');
  });

  $('input#automode').change(() => {
    if ($('input#automode').is(':checked')) {
      AUTOMODE = true;
      if (STATUS === statuses[0]) {
        console.log('requesting new batch');
        socket.emit('getBatch');
      }
    } else {
      AUTOMODE = false;
    }
  });

  $('button#abort').on('click', (e) => {
    // ! Creates a vulnerability : client can request new batch then abort repeatdly might stall all batches
    setStatus(0);
  });
});

// Computing functions
async function processBatch(batch) {
  return new Promise((resolve, reject) => {
    $('#progress').text(`(${batch.fromKey}/${batch.toKey})`);
    // Processing is deliberately slowed down to simulate heavy load
    for (let i = batch.fromKey, j = 1; i <= batch.toKey; i++ , j++) {
      setTimeout(() => {
        console.log('processing ', batch);
        if (ALGORITHM(batch.message, i) === batch.slug)
          resolve(i);
        else if (i === batch.toKey) { // At the last iteration, return undefined
          $('#progress').text('');
          reject(); // TODO: this does not work
        }
        $('#progress').text(`(${i}/${batch.toKey})`);
      }, j * 10);
    }
  });
}