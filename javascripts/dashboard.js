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

const setStatus = (index) => {
  STATUS = statuses[index];
  $('#status').text(STATUS);
};

const setConnection = (connected) => {
  if (connected)
    $('#connection').text('CONNECTED').addClass('success').removeClass('danger');
  else
    $('#connection').text('DISCONNECTED').addClass('danger').removeClass('success');
};

// Check if authentication login is present, if not redirect to login
const token = getCookie('token');
if (!token)
  goTo('');

// Opening a socket and specifying handlers
const socket = io('http://localhost:3000');

socket.on('connect', function () {
  console.log('socket connected');
  setConnection(true);
});

socket.on('disconnect', function () {
  console.log('socket disconnected');
  setConnection(false);
});

socket.on('batch', (batch) => {
  console.log('batch', batch);
  setStatus(2);
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
  $('button#newBatch').on('click', (d) => {
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
});