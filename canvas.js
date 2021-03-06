var canvas = {
c: document.getElementById("myCanvas"),
ctx: null,
width: null,
height: null,
ctx: null,
startX: 50,
startY: 50,
rotating: false, //true
rotatingObjSpeed: 3,
init: function() {
	canvas.ctx = canvas.c.getContext("2d");
	canvas.width = canvas.c.width;
	canvas.height = canvas.c.height;
},
changeRotating: function() {
	var chbox = document.getElementById("rotating"),
		changeObj = function(el, rotating) {
			for(var i = 0, a = el.length; i < a; i++) {
				el[i].rotating = rotating;
			}
		};
	console.log(chbox.checked);
	if (chbox.checked) {
		canvas.rotating = true;
		changeObj(canvas.circles.data, 1);
		changeObj(canvas.rects.data, 1);
		changeObj(canvas.triangles.data, 1);
	}
	else {
		canvas.rotating = false;
		changeObj(canvas.circles.data, false);
		changeObj(canvas.rects.data, false);
		changeObj(canvas.triangles.data, false);
	}
},
clear: function() {
	this.circles.data = [];
	this.rects.data = [];
	this.triangles.data = [];
},
moveObj: function(obj, cx, cy, drawing) {
	this.ctx.beginPath();
	this.ctx.fillStyle = obj.fillColor;
	if (obj.xy && obj.dx && obj.dy) {
		for(var i = 0, a = obj.xy.length; i < a; i++) {
			obj.xy[i][0] += obj.dx;
			obj.xy[i][1] += obj.dy;
		}
	} else if (obj.dx && obj.dy) {
		obj.x += obj.dx;
		obj.y += obj.dy;
	}
	if (obj.rotating) {
		this.rotateObj(cx, cy, obj.rotating, drawing)
	} else {
		drawing();
	}
	
	this.ctx.fill();
},
// ПОВОРОТ
/**
 * TODO: ужно изменить, после поворота не известно координаты повернутого объекта, из-за чего столкновение вычесляеться из текуших координат
 **/
rotateObj: function(cx, cy, turning, drawing) {
	this.ctx.save();
	this.ctx.translate(cx, cy);
	this.ctx.rotate(turning * (Math.PI / 180));
	this.ctx.translate(-cx, -cy);
	drawing();
	this.ctx.restore();
},
circles: {
	data: [],
	circle: function(x, y, dx, dy, radius) {
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.radius = radius;
		this.rotating = canvas.rotating ? 1 : false,
		this.fillColor = generateColor();
	},
	add: function() {
		var radius = random(20, 40);
		var dx = random(1, 2);
		var dy = random(1, 2);
		var obj = new this.circle(canvas.startX, canvas.startY, dx, dy, radius);
		this.data.push(obj);
	},
	move: function() {
		for(var i = 0, a = this.data.length; i < a; i++) {
			var obj = this.data[i];
			obj.rotating = obj.rotating ? obj.rotating + canvas.rotatingObjSpeed : obj.rotating;
			canvas.moveObj(obj, obj.x, obj.y, function() {
				canvas.circles.collision.borders(obj);
				canvas.circles.collision.withСircles(i, obj);
				canvas.circles.collision.withRects(obj);
				canvas.circles.collision.withTriangles(obj);
				canvas.ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI*2);
			});
		}
	},
	collision: {
		borders: function(obj) {
			if ((obj.x + obj.radius > canvas.width) || (obj.x - obj.radius < 0)) {
				obj.dx = -obj.dx;
			}
			if ((obj.y + obj.radius > canvas.height) || (obj.y - obj.radius < 0)) {
				obj.dy = -obj.dy;
			}
		},
		withСircles: function(i, obj1) {
			for(var j = i, a = canvas.circles.data.length; j < a; j++) {
				if (i != j) {
					var obj2 = canvas.circles.data[j];
					var dist = Math.dist(obj1.x, obj1.y, obj2.x, obj2.y);
					if (dist <= obj1.radius + obj2.radius && dist != 0) {
						obj1.dx = -obj1.dx;
						obj1.dy = -obj1.dy;
						obj2.dx = -obj2.dx;
						obj2.dy = -obj2.dy;
					}
				}
			} 
		},
		withRects: function(obj1) {
			for(var i = 0, a = canvas.rects.data.length; i < a; i++) {
				obj2 = canvas.rects.data[i];
				if (isCollisionRects(obj1.x - obj1.radius, obj1.y - obj1.radius, obj1.radius * 2, obj1.radius * 2, obj2.x, obj2.y, obj2.width, obj2.height)) {
					obj1.dx = -obj1.dx;
					obj1.dy = -obj1.dy;
					obj2.dx = -obj2.dx;
					obj2.dy = -obj2.dy;
				}
			}
		},
		withTriangles: function(obj1) {
			for(var i = 0, a = canvas.triangles.data.length; i < a; i++) {
				var obj2 = canvas.triangles.data[i];
				xy = [
				  [obj1.x - obj1.radius, obj1.y + obj1.radius],
				  [obj1.x + obj1.radius, obj1.y + obj1.radius],
				  [obj1.x + obj1.radius, obj1.y - obj1.radius],
				  [obj1.x - obj1.radius, obj1.y - obj1.radius],
				];
				if (isCollisionPolygon(xy, obj2.xy)) {
					obj1.dx = -obj1.dx;
					obj1.dy = -obj1.dy;
					obj2.dx = -obj2.dx;
					obj2.dy = -obj2.dy;
				}
			}
		},
	},
},
rects: {
	data: [],
	rect: function(x, y, width, height, dx, dy) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.dx = dx;
		this.dy = dy;
		this.rotating = canvas.rotating ? 1 : false,
		this.fillColor = generateColor();
	},
	add: function() {
		var height = random(20, 60);
		var dx = random(1, 2);
		var dy = random(1, 2);
		var obj = new this.rect(canvas.startX, canvas.startY, height, height, dx, dy);
		this.data.push(obj);
	},
	move: function() {
		for(var i = 0, a = this.data.length; i < a; i++) {
			var obj = this.data[i];
			obj.rotating = obj.rotating ? obj.rotating + canvas.rotatingObjSpeed : obj.rotating;
			canvas.moveObj(obj, obj.x + obj.width / 2, obj.y + obj.height / 2, function() {
				canvas.rects.collision.borders(obj);
				canvas.rects.collision.withRects(i, obj);
				canvas.rects.collision.withTriangles(obj);
				canvas.ctx.fillRect(obj.x, obj.y, obj.width, obj.height, 0, Math.PI*2);
			});
		}
	},
	collision: {
		borders: function(obj) {
			if ((obj.x + obj.width > canvas.width) || (obj.x < 0)) {
				obj.dx = -obj.dx;
			}
			if ((obj.y + obj.height > canvas.height) || (obj.y < 0)) { 
				obj.dy = -obj.dy;
			}
		},
		withRects: function(i, obj1) {
			for(var j = i, a = canvas.rects.data.length; j < a; j++) {
				if (i != j) {
					var obj2 = canvas.rects.data[j];
					if (isCollisionRects(obj1.x, obj1.y, obj1.width, obj1.height, obj2.x, obj2.y, obj2.width, obj2.height)) {
						obj1.dx = -obj1.dx;
						obj1.dy = -obj1.dy;
						obj2.dx = -obj2.dx;
						obj2.dy = -obj2.dy;
					}
				}
			}
		},
		withTriangles: function(obj1) {
			for(var i = 0, a = canvas.triangles.data.length; i < a; i++) {
				var obj2 = canvas.triangles.data[i];
				xy = [
				  [obj1.x, obj1.y],
				  [obj1.x + obj1.width, obj1.y],
				  [obj1.x + obj1.width, obj1.y + obj1.height],
				  [obj1.x, obj1.y + obj1.height],
				];
				if (isCollisionPolygon(xy, obj2.xy)) {
					obj1.dx = -obj1.dx;
					obj1.dy = -obj1.dy;
					obj2.dx = -obj2.dx;
					obj2.dy = -obj2.dy;
				}
			}
		},
	},
},
triangles: {
	data: [],
	triangle: function(x1, y1, x2, y2, x3, y3, dx, dy) {
		this.xy = [
			[x1, y1],
			[x2, y2],
			[x3, y3],
		];
		this.dx = dx;
		this.dy = dy;
		this.rotating = canvas.rotating ? 1 : false,
		this.fillColor = generateColor();
	},
	add: function() {
		var dx = random(1, 2);
		var dy = random(1, 2);
		var size = random(10, 30); 
		var obj = new this.triangle(canvas.startX, canvas.startY, 80 + size, 55, 55 + size, 80 + size,  dx, dy);
		this.data.push(obj);
	},
	move: function() {
		for(var i = 0, a = this.data.length; i < a; i++) {
			var obj = this.data[i];
			obj.rotating = obj.rotating ? obj.rotating + canvas.rotatingObjSpeed : obj.rotating;
			
			canvas.moveObj(obj, Math.floor((obj.xy[0][0] + obj.xy[1][0] + obj.xy[2][0]) / 3), Math.floor((obj.xy[0][1] + obj.xy[1][1] + obj.xy[2][1]) / 3), function() {
				canvas.triangles.collision.borders(obj);
				canvas.triangles.collision.withTriangles(i, obj);
				canvas.ctx.moveTo(obj.xy[0][0], obj.xy[0][1]);
				canvas.ctx.lineTo(obj.xy[1][0], obj.xy[1][1]);
				canvas.ctx.lineTo(obj.xy[2][0], obj.xy[2][1]);
			});
		}
	},
	collision: {
		borders: function(obj) {
			if ((obj.xy[0][1] >= canvas.height) || (obj.xy[0][1] <= 0) || (obj.xy[1][1] >= canvas.height) || (obj.xy[1][1] <= 0) || (obj.xy[2][1] >= canvas.height) || (obj.xy[2][1] <= 0)) { 
				obj.dy = -obj.dy;
			}
			if ((obj.xy[0][0] >= canvas.width) || (obj.xy[0][0] <= 0) || (obj.xy[1][0] >= canvas.width) || (obj.xy[1][0] <= 0) || (obj.xy[2][0] >= canvas.width) || (obj.xy[2][0] <= 0)) { 
				obj.dx = -obj.dx;
			}
		},
		withTriangles: function(i, obj1) {
			for(var j = 0, a = canvas.triangles.data.length; j < a; j++) {
				if (i != j) {
					var obj2 = canvas.triangles.data[j];
					if (isCollisionPolygon(obj1.xy, obj2.xy)) {
						obj1.dx = -obj1.dx;
						obj1.dy = -obj1.dy;
						obj2.dx = -obj2.dx;
						obj2.dy = -obj2.dy;
					}
				}
			}
		},
	},
},
};

var draw = function() {
canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
canvas.ctx.beginPath();

canvas.circles.move();
canvas.triangles.move();
canvas.rects.move();

setTimeout("draw()", 20);
}

window.onload = function() {
canvas.init();
draw();
}

function isCollisionRects(x1, y1, w1, h1, x2, y2, w2, h2,) {
return (x1 < x2 + w2 &&
	   x1 + w1 > x2 &&
	   y1 < y2 + h2 &&
	   h1 + y1 > y2);
}

function isIntersectionLine(l1, l2) {
var dx1 = l1[1][0] - l1[0][0],
	dy1 = l1[1][1] - l1[0][1],
	dx2 = l2[1][0] - l2[0][0],
	dy2 = l2[1][1] - l2[0][1],
	x = dy1 * dx2 - dy2 * dx1;

if(!x, !dx2) {
	return false;
}

var y = l2[0][0] * l2[1][1] - l2[0][1] * l2[1][0];
x = ((l1[0][0] * l1[1][1] - l1[0][1] * l1[1][0]) * dx2 - y * dx1) / x;
y = (dy2 * x - y) / dx2;

return ((l1[0][0] <= x && l1[1][0] >= x) || (l1[1][0] <= x && l1[0][0] >= x)) &&
		((l2[0][0] <= x && l2[1][0] >= x) || (l2[1][0] <= x && l2[0][0] >= x));
}

function isCollisionPolygon(obj1, obj2) {
for(var i = 0, a = obj1.length; i < a; i++) {
	var k = i + 1 >= a ? 0 : i + 1; 
	for(var j = 0, b = obj2.length; j < b; j++) {
		var l = j + 1 >= b ? 0 : j + 1;
		if (isIntersectionLine([obj1[i] , obj1[k]], [obj2[j] , obj2[l]])) {
			return true;
		}
	}
}
return false;
}
	
Math.dist=function(x1,y1,x2,y2){ 
if(!x2) x2=0; 
if(!y2) y2=0;
return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)); 
}
function random(min, max) {
return Math.floor(Math.random() * (max - min + 1)) + min;
}
function generateColor() {
return '#' + Math.floor(Math.random()*16777215).toString(16)
}