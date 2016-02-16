var height = 800,
	width = 800,
    active = d3.select(null);

var color = d3.scale.linear()
// 	.range(['gray','orange', 'blue','gray']);
	.range(['orange','orange','blue','blue']);
    
var opacity_range = [.15, .2];
for (var i = 700; i <= 1000; i = i + 1) {
    opacity_range.push(parseFloat(i)/1000);
}

console.log(opacity_range);

var opacity = d3.scale.quantile()
	.range(opacity_range)

var projection = d3.geo.albers()
    .scale(height*9)
    .translate([width / 2, height / 2])
	.center([0,46.45])
	.rotate([93.25,0,0]);
	
var zoom = d3.behavior.zoom()
	.scaleExtent([1, 10])
	.on("zoom", zoomed);
	
var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#mapdiv").append("svg")
    .attr("width", width)
    .attr("height", height);

var g = svg.append("g");

svg
	.call(zoom)
	.call(zoom.event);

queue()
    .defer(d3.json, "/mn_min.json")
    .defer(d3.csv, "/data.csv")
    .await(ready);
    
function ready (error, mn, data) {
	var precincts = topojson.feature(mn, mn.objects.vtd2014general_wgs84).features;
	var districts = topojson.feature(mn, mn.objects.l2012_wgs84).features;
	
	for (var i = 0; i < precincts.length; i++) {
 		for (var j = 0; j < data.length; j++) {
 			if (precincts[i].properties.VTDID == data[j].VTD) {
 				precincts[i].data = data[j];
 			}
 		}
 	}
 	
 	for (var i = 1; i < precincts.length; i++) {
		if(typeof precincts[i].data == 'undefined') {
			precincts.splice(i, 1);
		}
	}
 	
 	color.domain([
		-1,-.05,.05,1
	]);
	opacity.domain(d3.extent(precincts, function(d) { return d.data.votes_area; }));
	
	g.selectAll("path")
		.data(precincts.concat(districts))
		.enter()
		.append("path")
		.attr("class",function(d) { if (typeof d.properties.MNLEGDIST !== 'undefined') { return "precincts" } else { return "mesh" } })
		.attr("id", function(d) { if (typeof d.properties.DISTRICT !== 'undefined') { return 'HD' + d.properties.DISTRICT; } })
		.style("fill", function(d) { if (typeof d.properties.MNLEGDIST !== 'undefined') { return color(d.data.sth14-d.data.stw14); } })
		.style("opacity", function(d) { if (typeof d.properties.MNLEGDIST !== 'undefined') { return opacity(d.data.votes_area); } })
		.attr("d", path)
		.on('click',function (d) { console.log(d) })
		.on('mouseover', function (d) { 
			if (typeof d.properties.MNLEGDIST !== 'undefined') {
				d3.select(this)
					.style('opacity',1)
					.style('stroke','black')
					.style('stroke-width', 1 / zoom.scale() + "px");
				var thisDistrict = d3.select(this).data()[0].properties.MNLEGDIST;
				thisDistrict.length == 2 ? thisDistrict = "0" + thisDistrict : thisDistrict = thisDistrict;
				d3.select('#HD'+thisDistrict)
					.style("stroke-width", 3 / zoom.scale() + "px")
			}
		})
		.on('mouseout', function (d) {
			if (typeof d.properties.MNLEGDIST !== 'undefined') {
				var thisDistrict = d3.select(this).data()[0].properties.MNLEGDIST;
				thisDistrict.length == 2 ? thisDistrict = "0" + thisDistrict : thisDistrict = thisDistrict;
				d3.select('#HD'+thisDistrict)
					.style("stroke-width", 1 / zoom.scale() + "px");
				d3.select(this)
					.style('opacity', function(d) { return opacity(d.data.votes_area); })
					.style('stroke','none');
			}
		});
}

function clicked(d) {
	svg.transition()
		.duration(750)
		.style("stroke-width", 1.25 / d3.log(zoom.scale()) + "px")
		.call(zoom.translate(zoom.translate()).scale(zoom.scale()).event);
}

function reset() {
	active.classed("active", false);
	active = d3.select(null);

	svg.transition()
		.duration(750)
		.style("stroke-width", 1.25 / zoom.scale() + "px")
		.call(zoom.translate([0, 0]).scale(1).event);
}

function zoomed() {
	g.style("stroke-width", 1 / d3.event.scale + "px");
	g.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
	d3.selectAll(".mesh")
		.style("stroke-width", 1 / d3.event.scale + "px");
}

function stopped() {
	if (d3.event.defaultPrevented) d3.event.stopPropagation();
}
