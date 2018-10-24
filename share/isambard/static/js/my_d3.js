function mk_scaler(box,xs0,ys0,xs1,ys1){
    //var xs0=0,ys0=0,xs1=320,ys1=160,ws=xs1-xs0,hs=ys1-ys0;
    var yu0=box["y_min"],yu1=box["y_max"]; //,hu=yu1-yu0;
    var xu0=box["x_min"],xu1=box["x_max"]; //,wu=xu1-xu0;
    
    if (!Number.isFinite(xu0)) {
	var xScale = d3.scaleTime().
	    domain([mk_time(xu0), mk_time(xu1)]). // your data minimum and maximum
	    range([xs0, xs1]); // the pixels to map to, e.g., the width of the diagram.
	    var calc_x=function(x) { return xScale(mk_time(x)); }
    } else {
	var xScale = d3.scaleLinear().
	    domain([xu0, xu1]). // your data minimum and maximum
	    range([xs0, xs1]); // the pixels to map to, e.g., the width of the diagram.
	    var calc_x=function(x) { return xScale(x); }
    }
    
    var yScale = d3.scaleLinear().
	domain([yu0, yu1]). // your data minimum and maximum
	range([ys0, ys1]);  // the pixels to map to, e.g., the width of the diagram.
	
    var calc_y = function(y) {
	return yScale(yu1+yu0-y);
    }

    return [calc_x,calc_y];
};


function plot_fill_under(parent,plot,scale_x,scale_y,bottom_y){
    var x=plot["x"];
    var y=plot["y"];
    
    var areaplot = d3.area()
	.x(function(datum,index) { return scale_x(x[index]); })
	.y0(function(datum,index) { return scale_y(y[index]); })
	.y1(bottom_y)
	.curve(d3.curveLinear);

    parent.append("svg:path")
	.attr("d", areaplot(y))
	.attr("class",plot["class"]);

};

function plot_scatter(parent,plot,scale_x,scale_y,radius){
    var x=plot["x"];
    var y=plot["y"];
    
    parent.selectAll("circle")
	.data(y)
	.enter()
	.append("circle")
	.attr("cx", function(datum, index) { return scale_x(x[index]); })
	.attr("cy", function(datum, index) { return scale_y(y[index]); })
	.attr("r", radius)
	.attr("class","scatter "+plot["class"]);

};

function plot_line(parent,plot,scale_x,scale_y){
    var x=plot["x"];
    var y=plot["y"];
    
    var line = d3.line()
     	.x(function(datum,index) { return scale_x(x[index]); })
     	.y(function(datum,index) { return scale_y(y[index]); })
     	.curve(d3.curveLinear);

    parent.append("svg:path")
     	.attr("d", line(y))
     	.attr("class",plot["class"]);

};


function Plot(locale,svg,label,box){
    var self=this;
    this.box=box;
    this.svg=svg;
    this.label=label.trim().replace(/[^a-zA-Z0-9_-]+/g,'_');

    var xs0=0,ys0=0,xs1=380,ys1=220;
    var x_padding=30;
    var y_padding=20;

    this.xp0=xs0+x_padding;
    this.xp1=xs1-x_padding;
    this.yp0=ys0+y_padding;
    this.yp1=ys1-y_padding;

    [this.scale_x,this.scale_y]=mk_scaler(box,this.xp0,this.yp0,this.xp1,this.yp1);

    this.init=function(){
	self.svg.selectAll("*").remove();
	var plot_clip=self.svg.append("clipPath")
	    .attr("id",self.label+"-plot-area");
	plot_clip.append("rect")
	    .attr("x",self.xp0)
	    .attr("y",self.yp0)
	    .attr("width",self.xp1-self.xp0)
	    .attr("height",self.yp1-self.yp0);

	var plot_area = self.svg.append("g")
	    .attr("viewbox",self.xp0+" "+self.yp0+" "+(self.xp1-self.xp0)+" "+(self.yp1-self.yp0))
	    .attr("clip-path","url(#"+self.label+"-plot-area)");

	plot_area.append("rect")
	    .attr("class","plot-background")
	    .attr("x",self.xp0)
	    .attr("y",self.yp0)
	    .attr("width",self.xp1-self.xp0)
	    .attr("height",self.yp1-self.yp0);

	self.plot_area=plot_area;

	return plot_area;
    };

    this.frame = function(){
	var ret=self.svg.append("rect")
	    .attr("class","plot-frame")
	    .attr("x",self.xp0)
	    .attr("y",self.yp0)
	    .attr("width",self.xp1-self.xp0)
	    .attr("height",self.yp1-self.yp0);
	return ret;
    };

    this.plot_fill_under=function(gdesc) {
	plot_fill_under(self.plot_area,gdesc,self.scale_x,self.scale_y,self.yp1);
    };

    this.plot_scatter= function(gdesc){
	var radius=Math.max( (self.xp1-self.xp0),(self.yp1-self.yp0) )/100;
	plot_scatter(self.plot_area,gdesc,self.scale_x,self.scale_y,radius);
    };

    this.plot_line=function(gdesc) {
	plot_line(self.plot_area,gdesc,self.scale_x,self.scale_y);
    };

    this.plot=function(gdesc){
	switch (gdesc["type"]) {
	case "fill_between":
	    self.plot_fill_under(gdesc);
	    break;
	case "scatter":
	    self.plot_scatter(gdesc);
	    break;
	case "line":
	    self.plot_line(gdesc);
	    break;
	}
    };

    this.grid_axis=function(gdesc){
	var tick=3;
	var text_pos=tick+2;
	var x1,x2,y1,y2,y;
	var gaxis;
	var pos=["right","top","left","bottom"];

	switch(gdesc["type"]) {
	case "vertical": 
	    x1=self.scale_x(gdesc["x"]);
	    x2=self.scale_x(gdesc["x"]);
	    y1=self.yp0;
	    y2=self.yp1;
	    if ("top" in gdesc)
		y1-=tick;
	    if ("bottom" in gdesc)
		y2+=tick;
	    break;
	case "horizontal": 
	    y1=self.scale_y(gdesc["y"]);
	    y2=self.scale_y(gdesc["y"]);
	    x1=self.xp0;
	    x2=self.xp1;
	    if ("left" in gdesc)
		x1-=tick;
	    if ("right" in gdesc)
		x2+=tick;
	    break;
	}

	gaxis=self.svg.append("g")
	    .attr("class","axis");

	gaxis.append("rect")
	    .style("fill","transparent")
	    .style("stroke","transparent")
	    .attr("x",x1-2)
	    .attr("y",y1-2)
	    .attr("width",x2-x1+4)
	    .attr("height",y2-y1+4);

	gaxis.append("line")
	    .attr("class",gdesc["class"])
	    .attr("x1",x1)
	    .attr("y1",y1)
	    .attr("x2",x2)
	    .attr("y2",y2);

	gaxis.selectAll("text")
	    .data(pos)
	    .enter()
	    .append("text")
	    .attr("class",gdesc["class"])
	    .attr("text-anchor",function(val,idx){
		switch(val) {
		case "right": return "begin";
		case "left":  return "end";
		default:      return "middle";
		}
	    })
	    .attr("alignment-baseline",function(val,idx){
		switch(val) {
		case "top":    return "text-after-edge";
		case "bottom": return "text-before-edge";
		default:       return "center";
		}
	    })
	    .attr("x",function(val,idx){
		switch(val) {
		case "right": return x2+2;
		case "left":  return x1-2;
		default:      return x1;
		}
	    })
	    .attr("y",function(val,idx){
		switch(val) {
		case "top":    return y1-6;
		case "bottom": return y2+6;
		default:       return y1;
		}
	    })
	    .text(function(val,idx){
		if (!(val in gdesc)) return ""
		if (typeof(gdesc[val]) === "object")
		    return format_time(locale,gdesc[val]);
		return gdesc[val];
	    });

	return gaxis;
    };

    this.draw=function(plot,grid){
	var ind,gdesc;

	self.init();
	for(ind=0;ind<plot.length;ind++)
	    self.plot(plot[ind]);

	self.frame();

	if (grid !== undefined) {
	    for(ind=0;ind<grid.length;ind++)
		self.grid_axis(grid[ind]);
	};

    };

};
