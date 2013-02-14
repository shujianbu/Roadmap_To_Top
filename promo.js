var ranks = { "DNL": "Deputy National Level" , "ML": "Ministerial Level", "DML": "Deputy Ministerial Level", "NL": "National Level" },
	w = 700,
	h = 450,
	margin = 30,
	startYear = 1970, 
	endYear = 2013,
	startGrade = 0.5,
	endGrade = 8.5,
	y = d3.scale.linear().domain([endGrade, startGrade]).range([0 + margin, h - margin]),
	x = d3.scale.linear().domain([1970, 2012]).range([0 + margin -5, w]),
	years = d3.range(startYear, endYear);

var vis = d3.select("#vis")
    .append("svg:svg")
    .attr("width", w)
    .attr("height", h)
    .append("svg:g");
			
var line = d3.svg.line()
    .x(function(d,i) { return x(d.x); })
    .y(function(d) { return y(d.y); });
			

// Ranks
var leaders_ranks = {};
d3.text('leader-rank.csv', 'text/csv', function(text) {
    var ranks = d3.csv.parseRows(text);
    for (i=1; i < ranks.length; i++) {
        leaders_ranks[ranks[i][0]] = ranks[i][1];
    }
});

var leaders_info = {};
d3.text('leader-info.csv', 'text/csv', function(text) {
    var info = d3.csv.parseRows(text);
    for (i=1; i < info.length; i++) {
        leaders_info[info[i][0]] = info[i][1];
    }
});

var leaders_link = {};
d3.text('leader-link.csv', 'text/csv', function(text) {
    var link = d3.csv.parseRows(text);
    for (i=1; i < link.length; i++) {
        leaders_link[link[i][0]] = link[i][1];
    }
});

var startEnd = {},
    leaderCodes = {};

d3.text('leader-all.csv', 'text/csv', function(text) {
    var leaders = d3.csv.parseRows(text);
    
    for (i=1; i < leaders.length; i++) {
        var values = leaders[i].slice(2, leaders[i.length-1]);
        var currData = [];
        leaderCodes[leaders[i][1]] = leaders[i][0];
        
        var started = false;
        for (j=0; j < values.length; j++) {
            if (values[j] != '') {
                currData.push({ x: years[j], y: values[j] });
            
                if (!started) {
                    startEnd[leaders[i][1]] = { 'startYear':years[j], 'startVal':values[j] };
                    started = true;
                } else if (j == values.length-1) {
                    startEnd[leaders[i][1]]['endYear'] = years[j];
                    startEnd[leaders[i][1]]['endVal'] = values[j];
                }               
            }
        }

        vis.append("svg:path")
            .data([currData])
            .attr("leader", leaders[i][1]) //404, 403...
            .attr("class", leaders_ranks[leaders[i][1]])
            .attr("d", line)
            .on("mouseover", onmouseover)
            .on("mouseout", onmouseout);

    }
});  
    
vis.append("svg:line")
    .attr("x1", x(startYear))
    .attr("y1", y(startGrade))
    .attr("x2", x(endYear))
    .attr("y2", y(startGrade))
    .attr("class", "axis")

vis.append("svg:line")
    .attr("x1", x(startYear))
    .attr("y1", y(startGrade))
    .attr("x2", x(startYear))
    .attr("y2", y(endGrade))
    .attr("class", "axis")
			
vis.selectAll(".xLabel")
    .data(x.ticks(5))
    .enter().append("svg:text")
    .attr("class", "xLabel")
    .text(String)
    .attr("x", function(d) { return x(d) })
    .attr("y", h-10)
    .attr("text-anchor", "middle")


			
vis.selectAll(".xTicks")
    .data(x.ticks(5))
    .enter().append("svg:line")
    .attr("class", "xTicks")
    .attr("x1", function(d) { return x(d); })
    .attr("y1", y(startGrade))
    .attr("x2", function(d) { return x(d); })
    .attr("y2", y(startGrade)+7)


function onclick(d, i) {
    var currClass = d3.select(this).attr("class");
    if (d3.select(this).classed('selected')) {
        d3.select(this).attr("class", currClass.substring(0, currClass.length-9));
    } else {
        d3.select(this).classed('selected', true);
    }
}

function onmouseover(d, i) {  
	var currClass = d3.select(this).attr("class");
    d3.select(this)
        .attr("class", currClass + " current");
    
    var leaderCode = $(this).attr("leader");
    var leaderVals = startEnd[leaderCode];
    //var percentChange = 100 * (leaderVals['endVal'] - leaderVals['startVal']) / leaderVals['startYear'];
    
	if (leaderCode <= 404) 
	{
		var blurb = '<h2>' + leaderCodes[leaderCode] + '</h2>';
	    blurb += '<p></br>' + leaders_info[leaderCode];
	    blurb += " Political career began in " + leaderVals['startYear'] + " and currently at rank " + Math.round(leaderVals['endVal']) + ". </br>"+ "<a href=\"" + leaders_link[leaderCode] + "\"\>  Online Resume\>\> \<\/" + "a\>";
	} 
	else if (leaderCode <=408)
	{
		var blurb = '<h2> Average ' + leaderCodes[leaderCode] + '</h2>';
	    blurb += "<p> </br>This is the average promotion path of " + leaderCodes[leaderCode] + " leaders" + ". </br>";
	    //blurb += '</br>' + leaders_info[leaderCode] + "</br><a href=\"" + leaders_link[leaderCode] + "\"\> Online Resume\<\/" + "a\>";
	}

    blurb += "</p>";    
    $("#default-blurb").hide();
    $("#blurb-content").html(blurb);
}
function onmouseout(d, i) {
    var currClass = d3.select(this).attr("class");
    var prevClass = currClass.substring(0, currClass.length-8);
    d3.select(this)
        .attr("class", prevClass);
    //$("#default-blurb").show();
    //$("#blurb-content").html('');
}

function showRank(rankCode) {
	//alert( rankCode + "Hello! I am an alert box!");
	//var leaders = d3.selectAll("path."+ rankCode);	
	switch(rankCode) 
	{
	case 'AVG': 
    	{
			var leaders = d3.selectAll("path."+ rankCode);
			if (leaders.classed('highlight')) {
		        leaders.attr("class", rankCode);
		    } else {leaders.classed('highlight', true);}
			var cap = "<p> </br> 4 average promotion paths of all leaders at each level.</br>";
			$("#default-cap").hide();
			$("#cap-content").html(cap);
	  		break;
		}
	case 'NL':
		{
			var leaders = d3.selectAll("path."+ rankCode);
			var leaders1 = d3.selectAll("path.NLTp");			
			if (leaders.classed('highlight')) {
		        leaders.attr("class", rankCode);
		    } else {leaders.classed('highlight', true);}
			if (leaders1.classed('highlight')) {
		        leaders1.attr("class", "NLTp");
		    } else {leaders1.classed('highlight', true);}
			var cap = "<p> </br>9 promotion paths of all leaders at national level.</br>";
			$("#default-cap").hide();
			$("#cap-content").html(cap);
			  break;
		}
	case 'DNL':
		{
			var leaders = d3.selectAll("path.DNL");
			var leaders1 = d3.selectAll("path.DNLNp");
			var leaders2 = d3.selectAll("path.DNLTp");			
			if (leaders.classed('highlight')) {
		        leaders.attr("class", "DNL");
		    } else {leaders.classed('highlight', true);}
			if (leaders1.classed('highlight')) {
		        leaders1.attr("class", "DNLNp");
		    } else {leaders1.classed('highlight', true);}	
			if (leaders2.classed('highlight')) {
		        leaders2.attr("class", "DNLTp");
		    } else {leaders2.classed('highlight', true);}		
			var cap = "<p> </br> 54 promotion paths of all leaders at deputy national level.</br>";
			$("#default-cap").hide();
			$("#cap-content").html(cap);
			  break;
		}
	case 'ML':
		{
			var leaders = d3.selectAll("path.ML");
			var leaders1 = d3.selectAll("path.MLNp");
			var leaders2 = d3.selectAll("path.MLTp");			
			if (leaders.classed('highlight')) {
		        leaders.attr("class", rankCode);
		    } else {leaders.classed('highlight', true);}
			if (leaders1.classed('highlight')) {
		        leaders1.attr("class", "MLNp");
		    } else {leaders1.classed('highlight', true);}
			if (leaders2.classed('highlight')) {
		        leaders2.attr("class", "MLTp");
		    } else {leaders2.classed('highlight', true);}		
			var cap = "<p> </br> 91 promotion paths of all leaders at ministerial level.</br>";
			$("#default-cap").hide();
			$("#cap-content").html(cap);
			  break;
		}
	case 'DML':
		{
			var leaders = d3.selectAll("path.DML");
			var leaders1 = d3.selectAll("path.DMLNp");
			var leaders2 = d3.selectAll("path.DMLTp");			
			if (leaders.classed('highlight')) {
		        leaders.attr("class", rankCode);
		    } else {leaders.classed('highlight', true);}
			if (leaders1.classed('highlight')) {
		        leaders1.attr("class", "DMLNp");
		    } else {leaders1.classed('highlight', true);}
			if (leaders2.classed('highlight')) {
		        leaders2.attr("class", "DMLTp");
		    } else {leaders2.classed('highlight', true);}		
			var cap = "<p> </br> 250 promotion paths of all leaders at deputy ministerial level.</br>";
			$("#default-cap").hide();
			$("#cap-content").html(cap);
			  break;
		}
	case 'NParty':
		{
			var leaders1 = d3.selectAll("path.MLNp");
			var leaders2 = d3.selectAll("path.DMLNp");
			var leaders3 = d3.selectAll("path.DNLNp");
			if (leaders1.classed('highlight')) {
		        leaders1.attr("class", "MLNp");
		    } else {leaders1.classed('highlight', true);}
			if (leaders2.classed('highlight')) {
		        leaders2.attr("class", "DMLNp");
		    } else {leaders2.classed('highlight', true);}
			if (leaders3.classed('highlight')) {
		        leaders3.attr("class", "DNLNp");
		    } else {leaders3.classed('highlight', true);}	
			var cap = "<p> </br> 45 promotion paths of non-communist members.</br>";
			$("#default-cap").hide();
			$("#cap-content").html(cap);
			  break;
		}
	case 'Tuanpai':
		{
			var leaders1 = d3.selectAll("path.NLTp");
			var leaders2 = d3.selectAll("path.DNLTp");
			var leaders3 = d3.selectAll("path.MLTp");	
			var leaders4 = d3.selectAll("path.DMLTp");						
			if (leaders1.classed('highlight')) {
		        leaders1.attr("class", "NLTp");
		    } else {leaders1.classed('highlight', true);}
			if (leaders2.classed('highlight')) {
		        leaders2.attr("class", "DNLTp");
		    } else {leaders2.classed('highlight', true);}
			if (leaders3.classed('highlight')) {
		        leaders3.attr("class", "MLTp");
		    } else {leaders3.classed('highlight', true);}
			if (leaders4.classed('highlight')) {
		        leaders4.attr("class", "DMLTp");
		    } else {leaders4.classed('highlight', true);}		
			var cap = "<p> </br> 101 promotion paths of all Tuanpai Members.</br>";
			$("#default-cap").hide();
			$("#cap-content").html(cap);
			  break;
		}		
	default: 
		{
			$("#default-cap").show();
			$("#cap-content").hide();
		}

	}
	 
}

$(document).ready(function() {
    $('#filters a').click(function() {
        var leaderId = $(this).attr("id");
        $(this).toggleClass(leaderId);
        showRank(leaderId); 
    });
    
});
