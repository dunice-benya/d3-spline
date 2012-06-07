console.warn('to make an init state to be a normal distribution')
console.warn('to make a gradient green -> red')
console.warn('to make S = const = 1')
console.warn('to make basis interpolation')
console.warn('to make wirefrime')
console.warn('to make half circle dragged at border')


window.MySpline = function (options) {

    var self = this

    !options && (options = {})

    var width = options.width || 500,
        height = options.height || 500,
        N = options.N || 10

    var x = d3.scale.linear()
        .domain([0, 1])
        .range([0, width])

    var y = d3.scale.linear()
        .domain([0, 1])
        .range([height, 0])

    var yy = d3.scale.linear()
        .domain([height, 0])
        .range([0, 1])


    // POINT

    function Point (realX, realY) {
        this.realX = realX
        this.realY = realY
        this.guid = guid()

        function guid() {
            function S4() {
                 return (((1+Math.random())*0x10000)|0).toString(16).substring(1)
            }
            return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4())
        }

    }

    Point.prototype.__defineSetter__('0', function (realX) {
        this.realX = realX
    })

    Point.prototype.__defineSetter__('1', function (realY) {
        this.realY = realY
    })

    Point.prototype.__defineGetter__('0', function () {
        return x(this.realX)
    })

    Point.prototype.__defineGetter__('1', function () {
        return y(this.realY)
    })

    Point.prototype.__defineGetter__('2', function () {
        return this.guid
    })

    // END POINT


    var points = d3.range(0, N + 1).map(function(i) { return new Point(i / N, 0.3) })

    var realSum = _.reduce(points, function (memo, point) {
        return memo + point.realY
    }, 0)

    var line = d3.svg.line()

    var selected = points[0],
        dragged = null




    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickSize(-500)
        .tickPadding(10)

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickSize(-1500)
        .tickPadding(10)

    var area = d3.svg.area()
        .x(line.x())
        .y1(line.y())
        .y0(y(0))
        .interpolate('basis')


    var svg = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height)

    svg.append("rect")
        .attr("width", width)
        .attr("height", height)

    svg.append("path")
        .data([points])
        .attr("id", "main")
        .attr("class", "line")
        .call(update)

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)


//    z = svg.selectAll(".x.axis .tick")

//        .data([points])


    d3.select(window)
        .on("mousemove", mousemove)
        .on("mouseup", mouseup)


    // Add interpolator dropdown
    d3.select("#interpolate")
        .on("change", function() {
            area.interpolate(this.value)
            update()
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
        svg.select("path#main").attr("d", area)
        var circle = svg.selectAll("circle")
            .data(points, function(d) { return d })
        circle.enter().append("circle")
//            .attr("r", 1e-6)
            .attr("r", 6.5)
            .on("mousedown", function(d) {
                selected = dragged = d
                update()
            })
//        .transition()
//            .duration(1750)
//            .ease("elastic")
//            .attr("r", 6.5)
        circle
            .classed("selected", function(d) { return d === selected })
            .attr("cx", function(d) { return d[0] })
            .attr("cy", function(d) { return d[1] })
            .attr("data-id", function(d) { return d[2] })
        circle.exit().remove()
        if (d3.event) {
            d3.event.preventDefault()
            d3.event.stopPropagation()
        }
    }


    function mousemove() {
        if (!dragged) return
        var cursorPoint = d3.mouse(svg.node())
        var oldY = dragged.realY
        var newY = Math.max(0, Math.min(1, yy(cursorPoint[1])))
        var dy = newY - oldY
        var others = _(points).filter(function (point) {
            return (point.guid !== dragged.guid)
        })
        var othersSum = realSum - oldY
        var dyy = dy / othersSum
        _.each(others, function (point) {
            point.realY *= 1 - dyy
        })
        dragged.realY = newY
        update()
    }

    function mouseup() {
        if (!dragged) return
        mousemove()
        dragged = null
    }

}


spline = new MySpline({N: 10, width: 1500, height: 500})

