



console.warn('to make a gradient green -> red');
console.warn('to make S = const = 1');
console.warn('to make basis interpolation');
console.warn('to make wirefrime');
console.warn('to make half circle dragged at border');


Math.sign = function (x) {
  return (x > 0) ? 1 : ((x < 0) ? -1 : 0);
}

var width = 960,
    height = 500,
    n = 10;
    points = d3.range(0, 11).map(function(i) { return [i * width / 10, 50 + Math.random() * (height - 100), guid()]; })




// create initial points array, to get a sum of ordinates to 1
//var points = (function () {
//  var sum = 1;
//  var pts = [];
//  var yArr = _.range(n + 1).map(function (ind) {
//    var val = (ind === n) ? sum : Math.random() * sum;
//    sum -= val;
//    return val;
//  }).sort();
////  yArr = _.shuffle(yArr);
//  return _.map(yArr, function (val, ind) {
//    return [width * ind / n, height * (1 - val)]
//  });

//})();


//console.log('points', points);
//var ys = _.pluck(points, '1');
//console.log('ys', ys.sort());
//var sum = _.reduce(ys, function(memo, num){ return memo + num; }, 0);
//console.log('sum', sum);



var selected = points[0],
    dragged = null;


var line = d3.svg.line();

var x = d3.scale.linear()
    .domain([0, 1])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([0, 1])
    .range([height, 0]);

var yy = d3.scale.linear()
    .domain([height, 0])
    .range([0, 1]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var area = d3.svg.area()
    .x(line.x())
    .y1(line.y())
    .y0(y(0))
    .interpolate('basis');


var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("rect")
    .attr("width", width)
    .attr("height", height)

svg.append("path")
    .data([points])
    .attr("class", "line")
    .call(update)

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

d3.select(window)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup)


// Add interpolator dropdown
d3.select("#interpolate")
    .on("change", function() {
      area.interpolate(this.value);
      update();
    })
  .selectAll("option")
    .data([
      "basis",
      "linear",
      "step-before",
      "step-after",
      "basis-open",
      "basis-closed",
      "cardinal",
      "cardinal-open",
      "cardinal-closed",
      "monotone"
    ])
  .enter().append("option")
    .attr("value", String)
    .text(String)
  .selectAll("option")
  .attr("selected", function () {
    return true
  })


function update() {
  svg.select("path").attr("d", area);

  var circle = svg.selectAll("circle")
      .data(points, function(d) { return d; });

  circle.enter().append("circle")
      .attr("r", 1e-6)
      .on("mousedown", function(d) {
        selected = dragged = d;
        update();
      })
    .transition()
      .duration(1750)
      .ease("elastic")
      .attr("r", 6.5);

  circle
      .classed("selected", function(d) { return d === selected; })
      .attr("cx", function(d) { return d[0]; })
      .attr("cy", function(d) { return d[1]; })
      .attr("data-id", function(d) { return d[2]; });

  circle.exit().remove();

  if (d3.event) {
    d3.event.preventDefault();
    d3.event.stopPropagation();
  }
}


function mousemove() {
  if (!dragged) return;
  var cursorPoint = d3.mouse(svg.node());
  var oldY = dragged[1];
  var newY = Math.max(0, Math.min(height, cursorPoint[1]));
  dragged[1] = newY;
  var N = points.length;
  var dy = newY - oldY;
  var others = _(points).filter(function (point) {
    return (point[2] !== dragged[2]);
  });
  var othersSum = _.reduce(others, function (memo, point) {
      return memo + yy(point[1]);
  }, 0);
  var dyy = yy(dy) / othersSum;
  _.each(others, function (point) {
      var dss = dyy * yy(point[1]);
      point[1] -= Math.sign(dy) * dss;
      point[1] = (point[1] > height) ? height : ((point[1] < 0) ? 0 : point[1])
  });
  update();
}

function mouseup() {
  if (!dragged) return;
  mousemove();
  dragged = null;
}


function guid() {
  function S4() {
     return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  }
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

