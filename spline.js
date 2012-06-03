
console.warn('to make a gradient green -> red');
console.warn('to make S = const = 1');
console.warn('to make basis interpolation');

var width = 960,
    height = 500,
    n = 10;
//    points = d3.range(0, 11).map(function(i) { return [i * width / 10, 50 + Math.random() * (height - 100)]; }),




// create initial points array, to get a sum of ordinates to 1
var points = (function () {
  var sum = 1;
  var pts = [];
  var yArr = _.range(n + 1).map(function (ind) {
    var val = (ind === n) ? sum : Math.random() * sum;
    sum -= val;
    return val;
  }).sort();
//  yArr = _.shuffle(yArr);
  return _.map(yArr, function (val, ind) {
    return [width * ind / n, height * (1 - val)]
  });

})();


console.log('points', points);
var ys = _.pluck(points, '1');
console.log('ys', ys.sort());
var sum = _.reduce(ys, function(memo, num){ return memo + num; }, 0);
console.log('sum', sum);



var selected = points[0],
    dragged = null;


var line = d3.svg.line();

var x = d3.scale.linear()
    .domain([0, 1])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([0, 1])
    .range([height, 0]);

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
      .attr("cy", function(d) { return d[1]; });

  circle.exit().remove();

  if (d3.event) {
    d3.event.preventDefault();
    d3.event.stopPropagation();
  }
}


function mousemove() {
  if (!dragged) return;
  var m = d3.mouse(svg.node());

  var otherPoints = [];


//  console.log('----------------');
//  console.log('m', m);
//  for (var k in points) {
//    var p = points[k];
//    console.log('p[0], m[0]', p[0], m[0]);
//    if (Math.abs(p[0] - m[0]) > 1e-3) {
//      otherPoints.push(p);
//    } else {
//      console.error('got it', m);
//    }
//  }

//  console.log('otherPoints', otherPoints.length, 'of', points.length);

//  dragged[0] = Math.max(0, Math.min(width, m[0]));
  var oldY = dragged[1];
  var newY = Math.max(0, Math.min(height, m[1]));

  for (var k in points) {
    var p = points[k];
    points
  }

  dragged[1] = Math.max(0, Math.min(height, m[1]));
  update();
}

function mouseup() {
  if (!dragged) return;
  mousemove();
  dragged = null;
}

