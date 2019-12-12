import { getCookie, setCookie, deleteCookie } from './utility.js';
$(function () {
  // TODO: REMOVE THIS LINE AFTER DEV v
  deleteCookie('token');
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
      window.location = window.location.host + '/dashboard.html';
    });
  });
});