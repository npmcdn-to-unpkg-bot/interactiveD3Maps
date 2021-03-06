
var selectorVars = ["aserGrade5Subtract","aserGrade5Reading"];
var keyArray = ["2005","2006","2007","2008","2009","2010","2011","2012","2013","2014"];
var expressed = keyArray[0];
var legend_title = "ASER-Grade 5 Children Who can Subtract";

//begin script when window loads
window.onload = initialize();

//the first function called once the html is loaded
function initialize()
{
	setMap();
};

//set choropleth map parameters
function setMap()
{
	var width = 960;
	var height = 540;

	var map = d3.select("body")
				.append("svg")
				.attr("width", width)
				.attr("height", height)
				.attr("class", "map");

	var projection = d3.geoMercator()
						.center([72, 23])
                        .scale(500*10);

    //create svg path generator using the projection
	var path = d3.geoPath()
				.projection(projection);


	//use queue.js to parallelize asynchronous data loading
	queue().defer(d3.csv, "data/ASER_Grade5ChildrenSubtract.csv") //load attributes from csv
		.defer(d3.csv,"data/ASER_Grade5ChildrenReadGrade1.csv")
		.defer(d3.json, "data/gujarat_2011_census_topojson.json") //load geometry
		.await(callback); //trigger callback function once data is loaded

	function callback(error, csvAserSubtractData, csvAserReadData, gujMapData)
	{
		if(error) {console.log(error)};
		console.log(csvAserSubtractData);
		console.log(csvAserReadData);
		console.log(gujMapData);


		var tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip hidden');

		var recolorMap = colorScale(csvAserSubtractData);

		var jsonRegions = gujMapData.objects.Dist_census11.geometries;

		// get subtraction data

		for(var i=0; i<csvAserSubtractData.length; i++){
          	//console.log(csvAserSubtractData[i].district_name);
            var csvRegion = csvAserSubtractData[i];
            var csvRegionName = csvAserSubtractData[i].district_name;
            
            for(var j=0; j<jsonRegions.length; j++){
              //console.log(jsonRegions[j].properties.DISTRICT);
              var jsonRegion = jsonRegions[j].properties.DISTRICT;

              if( jsonRegion == csvRegionName){                
                //one more for loop to assign all key valye pairs
                //console.log(jsonRegion);
                // adding an object of aser subtraction to append year wise data
                jsonRegions[j].properties[selectorVars[0]] ={};
                var tempObj = jsonRegions[j].properties[selectorVars[0]];

                for (var key in keyArray){
                	var attr = keyArray[key];
                	//console.log(jsonRegion+":"+ attr+"-"+csvRegion[attr]);
                	var val = parseFloat(csvRegion[attr]);
                	tempObj[attr]=val;
                	//console.log(jsonRegions[j].properties[attr]);
                }
                //jsonRegions[j].properties.name = csvRegion.district_name;

                break;
              }
            }
         }

         //Get Aser Reading Data

		for(var i=0; i<csvAserReadData.length; i++){
          	//console.log(csvAserSubtractData[i].district_name);
            var csvRegion = csvAserReadData[i];
            var csvRegionName = csvAserReadData[i].district_name;
            
            for(var j=0; j<jsonRegions.length; j++){
              //console.log(jsonRegions[j].properties.DISTRICT);
              var jsonRegion = jsonRegions[j].properties.DISTRICT;

              if( jsonRegion == csvRegionName){                
                //one more for loop to assign all key valye pairs
                //console.log(jsonRegion);
                // adding an object of aser subtraction to append year wise data
                jsonRegions[j].properties[selectorVars[1]] ={};
                var tempObj = jsonRegions[j].properties[selectorVars[1]];

                for (var key in keyArray){
                	var attr = keyArray[key];
                	//console.log(jsonRegion+":"+ attr+"-"+csvRegion[attr]);
                	var val = parseFloat(csvRegion[attr]);
                	tempObj[attr]=val;
                	//console.log(jsonRegions[j].properties[attr]);
                }
                //jsonRegions[j].properties.name = csvRegion.district_name;

                break;
              }
            }
         }

         // get a map

		var regions = map.selectAll("path")
						.data(topojson.feature(gujMapData, gujMapData.objects.Dist_census11).features)
						.enter()
            			.append("path")
						.attr("d", path)
						.attr("class","regions")
						.attr("id", function(d){ return "district-"+d.properties.DISTRICT})
						.style("fill", function(d)
						{
							return choropleth(d, recolorMap);

						})
						.on("mousemove", function(d)
						{

							d3.select("#district-"+d.properties.DISTRICT) //select the current region in the DOM
								.style("opacity", 0.7);
							var mouse = d3.mouse(map.node()).map(function(d) 
							{
                        			return parseInt(d);
                    		});

                    		tooltip.classed('hidden', false)
                        			.attr('style', 'left:' + (mouse[0] + 15) +
                                		'px; top:' + (mouse[1] - 35) + 'px')
                        			.html(d.properties.DISTRICT+":"+d.properties.aserGrade5Subtract[expressed]);
						})
						
						.on("mouseout", function(d){
							d3.select("#district-"+d.properties.DISTRICT) //select the current region in the DOM
								.style("opacity", 1);
							tooltip.classed('hidden', true)
							
						})
						//.on("mousemove", moveLabel)
						.append("desc")
							.text(function(d){
								//console.log("in regions"+ d.properties.DISTRICT+ choropleth(d, recolorMap))
								return choropleth(d, recolorMap);
							});
		
		d3.select("body")
			.append('div')
			.attr('id', 'legend')
			.attr('style', 'border:0; color:#777; font-weight:bold;')
			.attr('readonly');

		addingLegend(expressed, csvAserSubtractData);
		
		d3.select("body")
			.append('div')
			.attr('id', 'slider-main')
			.attr('style','margin-top:'+(height-142)+'px; margin-left: '+(width/2-160)+'px');
			
		// d3.select("#slider-main").append('input')
		// 	.attr('id', 'year')
		// 	.attr('type', 'text')
		// 	.attr( 'style','border:0; color:#f6931f; font-weight:bold;');

		d3.select("#slider-main").append('div')
			.attr('id', 'slider')
			.attr('style','position: relative; width:'+(keyArray.length*40)+'px;');


		//createDropdown(csvAserSubtractData);
		addingSlider(expressed, csvAserSubtractData);					
	};
};

function addingLegend(attribute, csvAserSubtractData){
	
	var recolorMap = colorScale(csvAserSubtractData);
	expressed = attribute;
	
	d3.select('#legend')
			.html(legend_title+' of '+expressed);

		var legend = d3.select('#legend')
						.append('ul')
						.attr('class', 'list-inline');
		var keys = legend.selectAll('li.key')
						.data(recolorMap.range());
		keys.enter().append('li')
			.attr('class', 'key')
			.style('border-top-color', String)
			.text(function(d){
				var r = recolorMap.invertExtent(d);
				//console.log("r="+r);
				return r[0].toFixed(0);
			});
}

function createDropdown(csvAserSubtractData){
	//add a select element for the dropdown menu
	var dropdown = d3.select("body")
		.append("div")
		.attr("class","dropdown") //for positioning menu with css
		.attr('style','margin-left: 816px; margin-top: -518px;')
		.html("<h3>Select Variable</h3>")
		.append("select")
		.on("change", function(){ changeAttribute(this.value, csvAserSubtractData) }); //changes expressed attribute
	

	//create each option element within the dropdown
	dropdown.selectAll("options")
		.data(keyArray)
		.enter()
		.append("option")
		.attr("value", function(d){ return d })
		.text(function(d) {
			d = d[0].toUpperCase() + d.substring(1,3) + " " + d.substring(3);
			return d
		});
};


function colorScale(csvAserSubtractData){

	//create quantile classes with color scale		
	// var color = d3.scaleQuantile() //designate quantile scale generator
	// 	.range([
	// 		"#D4B9DA",
	// 		"#C994C7",
	// 		"#DF65B0",
	// 		"#DD1C77",
	// 		"#980043"
	// 	]);
	
	var color = d3.scaleQuantize().range(colorbrewer.Greens[7]);
	//build array of all currently expressed values for input domain
	// var domainArray = [];
	// for (var i in csvAserSubtractData){
	// 	domainArray.push(Number(csvAserSubtractData[i][expressed]));
	// };
	
	//for equal-interval scale, use min and max expressed data values as domain
	// color.domain([
	// 	d3.min(csvAserSubtractData, function(d) { return Number(d[expressed]); }),
	// 	d3.max(csvAserSubtractData, function(d) { return Number(d[expressed]); })
	// ]);
	// console.log(d3.min(csvAserSubtractData, function(d) { 
	// 		for(var i=0; i<keyArray.length; i++){
	// 			var tempKey = keyArray[i];
	// 			return Number(d[tempKey]);
	// 		}
			 
	// 	}));

	color.domain([
		d3.min(csvAserSubtractData, function(d) { 
			for(var i=0; i<keyArray.length; i++){
				var tempKey = keyArray[i];
				return Number(d[tempKey]);
			}
			 
		}),
		d3.max(csvAserSubtractData, function(d) { 
			for(var i=0; i<keyArray.length; i++){
				var tempKey = keyArray[i];
				return Number(d[tempKey]);
			}
		 })
	]);

	//for quantile scale, pass array of expressed values as domain
	//color.domain(domainArray);
	
	return color; //return the color scale generator
};

function choropleth(d, recolorMap){
	
	//get data value
	//console.log(d.properties);
	var value = d.properties.aserGrade5Subtract[expressed];
	//console.log(value);
	//if value exists, assign it a color; otherwise assign gray
	if (value) {
		return recolorMap(value); //recolorMap holds the colorScale generator
	} else {
		return "#ccc";
	};
};

function changeAttribute(attribute, csvAserSubtractData){
	//change the expressed attribute
	expressed = attribute;
	
	//recolor the map
	d3.selectAll(".regions") //select every region
		.style("fill", function(d) { //color enumeration units
			return choropleth(d, colorScale(csvAserSubtractData)); //->
		})
		.select("desc") //replace the color text in each region's desc element
			.text(function(d) {
				//console.log("in change attri"+choropleth(d, colorScale(csvAserSubtractData)));
				return choropleth(d, colorScale(csvAserSubtractData)); //->
			});
	
	addingLegend(attribute, csvAserSubtractData);

	// var recolorMap = colorScale(csvAserSubtractData);
	// //updating the legend entry also
	// d3.select('#legend').html('Number of '+expressed);

	// var legend = d3.select('#legend')
	// 					.append('ul')
	// 					.attr('class', 'list-inline');
	// var keys = legend.selectAll('li.key')
	// 				.data(recolorMap.range());
	// keys.enter().append('li')
	// 	.attr('class', 'key')
	// 	.style('border-top-color', String)
	// 	.text(function(d){
	// 		var r = recolorMap.invertExtent(d);
	// 			//console.log("r="+r);
	// 		return r[0].toFixed(0);
	// 	});

};


function highlight(data){	

	var props = data.properties; //json properties

	d3.select("#district-"+props.DISTRICT) //select the current region in the DOM
		.style("fill", "#000"); //set the enumeration unit fill to black

	var mouse = d3.mouse(d3.select("svg").node()).map(function(d){
		return parseInt(d);
	});

	console.log(d3.select("tooltip"));
	var tooltip = d3.select("tooltip");
	tooltip.classed('hidden', false)
			.attr('style', 'left:' + (mouse[0] + 15) +
                                'px; top:' + (mouse[1] - 35) + 'px')
            .html(props.DISTRICT);
	// var labelAttribute = "<h2>"+props[expressed]+
	// 	"</h2><b>"+expressed+"</b>"+ props.DISTRICT; //label content
	// var labelName = props.DISTRICT; //html string for name to go in child div
	
	
	// //console.log(mouse[0]);
	
    // console.log(props.DISTRICT);
	// //create info label div
	// var infolabel = d3.select("body")
	// 	.append("div") //create the label div
	// 	.attr("class", "infolabel")
	// 	.attr("id", props.DISTRICT+"label") //for styling label
	// 	.html(labelAttribute) //add text
	// 	.append("div") //add child div for feature name
	// 	.attr("class", "labelname") //for styling name
	// 	.html(labelName); //add feature name to label

	// var div = d3.select("body").append("div")
	// 			.attr("class", "tooltip")
	// 			.style("opacity", 0);
	
	// d3.select("tooltip").transition()
	// 	.duration(200)
	// 	.style("opacity", .9)
	// 	.html(labelAttribute)
	// 	.style("left", (d3.event.pageX+30) + "px")
	// 	.style("top", (d3.event.pageY-30) + "px");


};

function dehighlight(data){
	
	// var props = data.properties; //json properties
	// var region = d3.select("#district-"+props.DISTRICT); //select the current region
	// //console.log(region.select("desc").text());
	// var fillcolor = region.select("desc").text(); //access original color from desc
	// region.style("fill", fillcolor); //reset enumeration unit to orginal color
	
	// d3.select("#"+props.DISTRICT+"label").remove(); //remove info label
	// d3.select("hidden tooltip").classed('hidden', true);
	// d3.select("tooltip").transition()        
 //                .duration(1000)      
 //                .style("opacity", 0); 
};

function moveLabel() {
	
	// var x = d3.event.clientX+10; //horizontal label coordinate based mouse position stored in d3.event
	// var y = d3.event.clientY-40; //vertical label coordinate
	// // d3.select(".infolabel") //select the label div for moving
	// // 	.style("margin-left", x+"px") //reposition label horizontal
	// // 	.style("margin-top", y+"px"); //reposition label vertical

	// d3.select("hidden tooltip").classed('hidden', false)
	// 		.attr('style', 'left:' + (mouse[0] + 15) +
 //                                'px; top:' + (mouse[1] - 35) + 'px')
 //            .html(props.DISTRICT);
};

function addingSlider(attribute, csvAserSubtractData) {

	$( function() {
	    $( "#slider" ).slider({
	      value:attribute,
	      min: parseInt(keyArray[0]),
	      max: parseInt(keyArray[keyArray.length-1]),
	      step: 1,
	      animate: 'slow',
	      slide: function( event, ui ) {
	        changeAttribute(ui.value.toString(), csvAserSubtractData);
	      },
	      change: function( event, ui){
	      	changeAttribute(ui.value.toString(), csvAserSubtractData);
	      }
	    });

//	    $( "#year" ).val( "Year: " + $( "#slider" ).slider( "value" ) );
	  } );

	$('#slider').labeledslider({
        min: parseInt(keyArray[0]),
        max: parseInt(keyArray[keyArray.length-1]),
        tickArray: parseInt(keyArray)
        // tickLabels: {
        //   12:'cat',
        //   38:'dog',
        // }
      });
}