import { getCookie, goTo } from './utility.js';

// Check if authentication login is present, if not redirect to login
const token = getCookie('token');
if (!token)
  goTo('');

// Trying to open a socket with the server
const socket = io('http://localhost:3000');
socket.on('connect', function () {
  console.log('socket connected');
});
socket.on('event', function (data) {
  console.log('socket got event', data);
});
socket.on('disconnect', function () {
  console.log('socket disconnected');
});

$(function () {
  $('input#signin').on('click', (e) => {
    $.ajax({
      method: 'POST',
      url: 'http://localhost:3010/auth/login',
      data: { username: $('#username').val(), password: $('#password').val() }
    }).fail((http) => {
      $('#formError').text(http.responseJSON.message);
      setTimeout(() => {
        $('#formError').text('');
      }, 2000);
    }).then(({ token }) => {
      setCookie('token', token, 24);
    });
  });
});