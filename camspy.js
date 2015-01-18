// 2015 (C) Ben Lippincott

// I'm feeling anti-semicolon today

var Camelot = require('camelot')
var engine = require('engine.io').listen('9000')
var fs = require('fs')

var http = require("http")
var url = require("url")
var path = require("path")
var httpPort = process.argv[2] || 8888


var camOptions = {
  verbose: false,
  device : '/dev/video0',
  resolution : '640x480',
  png : '1',
  greyscale : false,
  controls : {
    focus : 'auto',
    brightness : 100,
    contrast : 100,
    saturation : 100,
    hue : 100,
    gamma : 100,
    sharpness : 50
  }
}

var camelot = new Camelot(camOptions);

engine.on('connection',function(socket){
  socket.on('message', function(data){
    console.log('message recieved')
    console.log(data)
    camelot.grab({},function(image){
      console.log('image')
      socket.send(image)
    })
  });
  socket.on('close',function(){})
})

http.createServer(function(request, response) {
  var uri = url.parse(request.url).pathname
	var filename = path.join(process.cwd(), uri)

  fs.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"})
      response.write("404 Not Found\n")
      response.end()
      return
    }

    if (fs.statSync(filename).isDirectory())
      filename += '/index.html'

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {
        response.writeHead(500, {"Content-Type": "text/plain"})
        response.write(err + "\n")
        response.end()
        return
      }

      response.writeHead(200)
      response.write(file, "binary")
      response.end()
    })
  })
}).listen(parseInt(httpPort, 10))
