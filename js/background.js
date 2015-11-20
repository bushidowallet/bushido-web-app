var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var topgrad = context.createLinearGradient(0, 1920, 971, 0);
topgrad.addColorStop(0, 'rgba(153,218,255,1)');
topgrad.addColorStop(1, 'rgba(9,120,184,1)');
context.fillStyle = topgrad;
context.fillRect(0, 0, 1920, 971);