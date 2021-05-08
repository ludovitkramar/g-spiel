var canvas = document.getElementById('tutorial');
var ctx = canvas.getContext('2d');
function draw() {
    var w = ctx.canvas.width;
    var h = ctx.canvas.height;

    ctx.fillStyle = 'rgb(200, 50, 50)'
    ctx.fillRect(10, 20, 30, 40)

    ctx.fillStyle = "rgba(60, 200, 20, 0.6)"
    ctx.fillRect(30, 15, 10, 20)

    ctx.fillStyle = "rgb(70, 70, 20)"
    ctx.fillRect(50, 50, 40, 40)
    ctx.clearRect(60, 60, 20, 20)
    ctx.strokeRect(62, 62, 16, 16)
    ctx.strokeRect(80, 80, 400, 400)

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    offset = 30
    ctx.fillRect(offset, offset, w-(offset*2) , 50)

    var s = 60
    ctx.fillStyle = "rgba(200, 140, 50, 0.8)"
    ctx.beginPath()
    ctx.moveTo(w/2, h/2)
    ctx.lineTo(w/2 + s/2, h/2 - s)
    ctx.lineTo(w/2 + s, h/2)
    ctx.lineTo(w/2 + s/2, h/2 - s/3)
    ctx.fill()

    
}
draw();
function resizeCanvas() {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    console.log(ctx.canvas.width + " / " + ctx.canvas.height)
    draw();
}