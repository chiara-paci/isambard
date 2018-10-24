var slugify = function (text) {
    text=text.toString().toLowerCase()
	.replace(/\s+/g, '-')           // Replace spaces with -
	.replace(/[^\w\-]+/g, '')       // Remove all non-word chars
	.replace(/\-\-+/g, '-')         // Replace multiple - with single -
	.replace(/^-+/, '')             // Trim - from start of text
	.replace(/-+$/, '');            // Trim - from end of text
    text=text.trim();
    return text;
}

var mk_date = function(ser) {
    var d=luxon.DateTime.utc(ser["year"],ser["month"],ser["day"],0,0,0);
    return d;
};

var mk_time = function(ser) {
    var y=1970,m=1,d=1;
    if ("year" in ser) y=ser["year"];
    if ("month" in ser) m=ser["month"];
    if ("day" in ser) d=ser["day"];
    var d=luxon.DateTime.utc(y,m,d,ser["hour"],ser["minute"],ser["second"]);
    return d;
};

var format_date = function(locale,ser){
    var d=mk_date(ser).toLocal();
    return d.setLocale(locale).toLocaleString(luxon.DateTime.DATE_HUGE);
}

var format_time = function(locale,ser){
    var d=mk_time(ser).toLocal();
    return d.setLocale(locale).toLocaleString(luxon.DateTime.TIME_WITH_SECONDS);
};

var format_datetime = function(locale,ser){
    return format_date(locale,ser)+", "+format_time(locale,ser);
};

var format_time_utc = function(locale,ser){
    var d=mk_time(ser);
    return d.setLocale(locale).toLocaleString(luxon.DateTime.TIME_WITH_SECONDS);
};

var format_sec_to_msec = function(ser){
    var val=ser*1000.0;
    
    return val.toFixed(3);

};

var format_timedelta = function(locale,ser){
    if (ser["days"]==0) {
	return format_time_utc(locale,ser["human"]);
    } 
    if (ser["days"]==1) {
	return "1 day "+ format_time_utc(locale,ser["human"]);
    }
    return ser["days"]+" days "+ format_time_utc(locale,ser["human"]);
};

var format_value = function(locale,value){
    var i,ret;
    if (value==null) return "";
    if (value instanceof Array) {
	ret="";
	for(i=0;i<value.length;i++) {
	    if (i!=0) ret+="<br/>";
	    ret+=value[i];
	}
	return ret;
    };
    if (value instanceof Object) {
	if ("year" in value) 
	    return format_datetime(locale,value);
	if ("hour" in value)
	    return format_time(locale,value);
	if ("days" in value) 
	    return format_timedelta(locale,value);
	if ("__str__" in value)
	    return value["__str__"];
    };
    return value;
};

function JsonUpdate(url,done_f,reload,data_not_found_f) {
    this.iter=1;
    this.timeout=30000;
    this.url=url;
    this.done_f=done_f;
    this.data_not_found_f=data_not_found_f;
    this.headers={          
	Accept: "application/json"   
    };

    if (reload==undefined) 
	this.reload=false;
    else
	this.reload=true;

    var self=this;

    this.start = function(){
    	setTimeout(function(){ self.update(); },this.timeout);
    };

    this.fail_f=function(data) {
    	var h=data.getResponseHeader("Retry-After");
    	var msec=parseFloat(h)*1000;
    	self.iter+=1;
    	if (data.status==302) {
    	    console.log(self.iter,"Loading data... (timeout: "+self.iter*msec+" sec.)");
    	    setTimeout(function(){ self.update(); },self.iter*msec);
    	} else {
    	    console.log(self.iter,"Data not found");
    	    if (self.data_not_found_f) {
    		self.data_not_found_f(data);
    	    }
    	    if (self.reload) {
    		setTimeout(function(){ self.update(); },this.timeout);
    	    }
    	}
    };
    
    this.update= function(){
    	var action = {
    	    url: this.url,
    	    headers: this.headers
    	};
    	$.get(action).done(this.done_f).fail(this.fail_f);
    	if (self.reload) {
    	    self.iter=1;
    	    setTimeout(function(){ self.update(); },this.timeout);
    	}
    };
};


function set_cookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// function reldate(days) {
//     var d;
//     d = new Date();

//     /* We need to add a relative amount of time to
//        the current date. The basic unit of JavaScript
//        time is milliseconds, so we need to convert the
//        days value to ms. Thus we have
//        ms/day
//        = 1000 ms/sec *  60 sec/min * 60 min/hr * 24 hrs/day
//        = 86,400,000. */

//     d.setTime(d.getTime() + days*86400000);
//     return d.toGMTString();
// }

function read_cookies(name) {
    var cookies_s = document.cookie;
    var i,t;
    var ret={};
    if (!cookies_s) return {};
    cookies_s=cookies_s.split(';');
    for (i=0; i<cookies_s.length; i++) {
	t=cookies_s[i].split('=', 2);
	ret[unescape(t[0]).trim()]=unescape(t[1]).trim();
    }
    return ret;
}

