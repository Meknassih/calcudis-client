import { getCookie, goTo } from './utility.js';
const token = getCookie('token');
if (!token)
  goTo('');

$(function () {
  $('input#signin').on('click', (e) => {
    $.ajax({
      method: 'POST',
      url: 'http://localhost:3010/auth/login',
      data: { username: $('#username').val(), password: $('#password').val() }
    }).fail((http) => {
      console.log(http);
      $('#formError').text(http.responseJSON.message);
      setTimeout(() => {
        $('#formError').text('');
      }, 2000);
    }).then(({ token }) => {
      console.log(token);
      setCookie('token', token, 24);
      console.log('http://' + window.location.host + '/dashboard.html');
      // window.location = 'http://' + window.location.host + '/dashboard.html';
    });
  });
});