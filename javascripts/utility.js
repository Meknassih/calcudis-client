export function setCookie(cname, cvalue, exhours) {
  const d = new Date();
  d.setTime(d.getTime() + (exhours * 60 * 60 * 1000));
  const expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

export function getCookie(cname) {
  var name = cname + '=';
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

export function deleteCookie(cname) {
  const d = new Date();
  d.setTime(d.getTime() - (24 * 60 * 60 * 1000));
  const expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + ';' + expires + ';path=/';
}

export function goTo(path) {
  window.location = 'http://' + window.location.host + '/' + path;
}