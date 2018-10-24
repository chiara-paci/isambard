/** Panel **/

function Panel(panel_id,config) {
    this.panel_id=panel_id;
    this.error=$('#error-'+panel_id);
    this.box=$('#'+panel_id+'_table');
    this.locale=config["locale"];
    this.history_max_size=config["history_max_size"];
    this.cupio_dissolvi=config["cupio_dissolvi"];

    this.thead_fields=[];
    this.OK='<i class="far fa-laugh"></i>';
    this.WARNING='<i class="far fa-meh-blank"></i>';
    this.FAIL='<i class="far fa-angry"></i>';

};

function QueuesPanel(panel_id,config) {
    Panel.call(this,panel_id,config);
    this.thead_fields=[
	{
	    "title": "&nbsp;",
	    "colspan": 1
	},
	{
	    "title": "queue type",
	    "colspan": 1
	},
	{
	    "title": "size",
	    "colspan": 2
	}
    ];
}

function StagePanel(config) {
    Panel.call(this,"stage",config);
    this.thead_fields=[
	{
	    "title": "&nbsp;",
	    "colspan": 2,
	},
	{
	    "title": "input data",
	    "colspan": 3
	},
	{
	    "title": "output data",
	    "colspan": 2
	},
	{
	    "title": "destinations",
	    "colspan": 2
	}
    ];
}

function WithSubtabsPanel(panel_id,config) {
    Panel.call(this,panel_id,config);
    this.subtabs=$('#'+panel_id+'-subtabs');
    this.sub_panel_thead =[];
}

function NormalizerPanel(config) {
    WithSubtabsPanel.call(this,"normalizer",config);
    this.sub_panel_thead =[
	"&nbsp;",
	"execution time (msec)",
	"source",
	"input data id",
	"destinations",
	"output data id",
	"result",
	"&nbsp;"
    ];
    
    this.thead_fields=[
	{
	    "title": "filter",
	    "colspan": 1
	},
	{
	    "title": "sources",
	    "colspan": 1
	},
	{
	    "title": "destinations",
	    "colspan": 1
	}
    ];
}


function ObjectsPanel(panel_id,config) {
    WithSubtabsPanel.call(this,panel_id,config);

    this.nav=$('#nav-'+panel_id);
    this.obj_type="object";
    this.add_fields=[];
	
    this.sub_panel_thead =[
	"&nbsp;",
	"data id",
	"timestamp",
	"exec time (msec)",
	"data" 
    ];
};

function DestinationsPanel(config){
    ObjectsPanel.call(this,"destinations",config);
    this.obj_type="destination";
    this.add_fields=[
	{
	    obj_key: "wait_retry",
	    title: "wait before retry"
	}
    ];

    this.sub_panel_thead.push("success");

};

function SourcesPanel(config){
    ObjectsPanel.call(this,"sources",config);
    this.obj_type="source";
    this.add_fields=[
	{
	    obj_key: "interval",
	    title: "interval"
	}
    ];
    this.sub_panel_thead.push("checkpoint");
    this.sub_panel_thead.push("success");
};

Panel.prototype = {
    set_error: function() {
	this.box.html("");
	this.error.show();
	this.box.hide();
    },
    set_no_error: function(){
	this.error.hide();
	this.box.show();
    },
    set_panel: function(data) {
	var i,queue,html;

	this.set_no_error();
	this.create_panel(data);
    },
    table_header: function() {
	var html,i;
	html="<thead>";
	html+="<tr>";
	for(i=0;i<this.thead_fields.length;i++) {
	    html+='<th colspan="'+this.thead_fields[i]["colspan"]+'">'+this.thead_fields[i]["title"]+'</th>';
	}
	html+="</tr>";
	html+="</thead>";
	return html;
    },
    table_body: function(obj){
	return "";
    },
    create_panel: function(data) {
	var i,obj,html;
	html=this.table_header();
	for(i=0;i<data.length;i++) {
	    obj=data[i];
	    html+=this.table_body(obj);
	}
	this.box.html(html);
    },
    set_status: function(status,log_time){
	return ;
    }
};

QueuesPanel.prototype = Object.create(Panel.prototype);
QueuesPanel.prototype.constructor = QueuesPanel;

StagePanel.prototype = Object.create(Panel.prototype);
StagePanel.prototype.constructor = StagePanel;

WithSubtabsPanel.prototype = Object.create(Panel.prototype);
WithSubtabsPanel.prototype.constructor = WithSubtabsPanel;

ObjectsPanel.prototype = Object.create(WithSubtabsPanel.prototype);
ObjectsPanel.prototype.constructor = ObjectsPanel;

DestinationsPanel.prototype = Object.create(ObjectsPanel.prototype);
DestinationsPanel.prototype.constructor = DestinationsPanel;

SourcesPanel.prototype = Object.create(ObjectsPanel.prototype);
SourcesPanel.prototype.constructor = SourcesPanel;

NormalizerPanel.prototype = Object.create(WithSubtabsPanel.prototype);
NormalizerPanel.prototype.constructor = NormalizerPanel;


/***/

WithSubtabsPanel.prototype.set_error = function() {
    this.subtabs.tabs();
    this.subtabs.tabs("destroy");
    this.subtabs.html("");
    Panel.prototype.set_error.apply(this); //(this, arguments);
    this.subtabs.hide();
};

ObjectsPanel.prototype.set_error = function() {
    WithSubtabsPanel.prototype.set_error.apply(this); //(this, arguments);
    this.nav.hide();
};

/***/

WithSubtabsPanel.prototype.set_no_error=function(){
    Panel.prototype.set_no_error.apply(this);
    this.subtabs.show();
}

ObjectsPanel.prototype.set_no_error=function(){
    WithSubtabsPanel.prototype.set_no_error.apply(this);
    this.nav.show();
}

/***/

WithSubtabsPanel.prototype.set_panel=function(data) {
    var html;
    this.set_no_error();
    html=this.box.html().trim();
    if (html) {
	this.update_panel(data);
	return;
    }
    this.create_panel(data);
}

/***/

WithSubtabsPanel.prototype.update_panel=function(data) {};

ObjectsPanel.prototype.update_panel=function(data) {
    var i;
    for(i=0;i<data.length;i++) {
	obj=data[i];
	this.set_status(obj["status"],obj["status"]["timestamp"]);
    }
}

/***/

ObjectsPanel.prototype.table_header = function (){
    var html;

    html="<thead>";
    html+="<tr>";
    html+='<th>';
    html+='<div class="checkbox">';
    html+='<input type="checkbox" id="'+this.obj_type+'-select-all" name="select/deselect all" />';
    html+='<label for="'+this.obj_type+'-select-all"></label></div>';
    html+='</th>';
    html+="<th colspan='2'>&nbsp;</th>";
    html+="<th>on_boot</th>";
    html+="<th>"+this.obj_type+" type</th>";
    html+="<th>status</th>";
    html+="<th>status change</th>";
    html+="<th>timeout</th>";
    for(n=0;n<this.add_fields.length;n++){
	html+="<th>"+this.add_fields[n].title+"</th>";
    }
    html+="</tr>";
    html+="</thead>";

    return html;
};

/***/

StagePanel.prototype.table_body=function(data){
    var log_time,obj;
    log_time=data[0];
    obj=data[1];

    var in_data=obj["in_data"];
    var row;


    var data_id=in_data["data_id"];
    
    var row="",fullspan=0,i,j,out_data,dest_list,cell_id;

    for(i=0;i<obj["out_data_list"].length;i++){
	out_data=obj["out_data_list"][i][0];
	dest_list=obj["out_data_list"][i][1];
	fullspan+=dest_list.length;
    }

    row='<tbody id="'+this.row_id(data_id)+'">';

    var out_id;
    for(i=0;i<obj["out_data_list"].length;i++){
	out_data=obj["out_data_list"][i][0];
	dest_list=obj["out_data_list"][i][1];
	out_id = this.out_cell_id(data_id,out_data["data_id"]);

	for(j=0;j<dest_list.length;j++){

	    if ( (i==0)&&(j==0) ) {
		row+="<tr class='first'>";
	    } else {
		row+="<tr>";
	    };
	    if (j==0) {
		if (i==0) {
		    if (obj["sent_completed"])
			row+='<td class="input completed faicon" rowspan="'+fullspan+'">'+this.OK+'</td>';
		    else
			row+='<td class="input completed faicon" rowspan="'+fullspan+'">&nbsp;</td>';
		    
		    row+='<td class="input ts" rowspan="'+fullspan+'">'+format_time(this.locale,log_time)+'</td>';
		    row+='<td class="input datats" rowspan="'+fullspan+'">'+format_value(this.locale,in_data["timestamp"])+"</td>";
		    row+='<td class="input source" rowspan="'+fullspan+'">'+format_value(this.locale,in_data["source_id"])+"</td>";
		    row+='<td class="input id" rowspan="'+fullspan+'">'+format_value(this.locale,in_data["data_id"])+"</td>";
		};
		row+='<td rowspan="'+dest_list.length+'">'+format_value(this.locale,out_data["timestamp"])+"</td>";
		row+='<td rowspan="'+dest_list.length+'" id="'+out_id+'">';
		row+=format_value(this.locale,out_data["data_id"])+"</td>";
		
	    }

	    cell_id = this.dest_cell_id(data_id,out_data["data_id"],dest_list[j][0]);
	    row+='<td>'+format_value(this.locale,dest_list[j][0])+"</td>";
	    row+='<td id="'+cell_id+'">';
	    if (dest_list[j][1]) {
		row+=format_time(this.locale,dest_list[j][1]);
	    } else {
		row+="&nbsp;"
	    };
	    row+='</td>';

	}
    }

    row+='</tbody>';

    return row;

};


QueuesPanel.prototype.table_body=function(obj){
    var html="";
    if (!(obj[2] instanceof Array)) {
	html+='<tbody>';
	html+='<tr>';
	html+='<th>'+obj[0]+'</th>';
	html+='<td class="center">'+obj[1]+'</td>';
	html+='<td colspan="2">'+obj[2]+'</td>';
	html+='</tr>';
	html+='</tbody>';
	return html;
    }
    html+='<tbody>';
    html+='<tr>';
    html+='<th rowspan="'+obj[2].length+'">'+obj[0]+'</th>';
    html+='<td rowspan="'+obj[2].length+'">'+obj[1]+'</td>';
    for(j=0;j<obj[2].length;j++) {
	if (j!=0) html+='<tr>';
	html+='<td>'+obj[2][j][0]+'</td>';
	html+='<td>'+obj[2][j][1]+'</td>';
	html+='</tr>';
    }
    html+='</tbody>'
    return html;
};

NormalizerPanel.prototype.table_body=function(obj){
    var html;
    var filter=obj["filter"];
    var sources=obj["sources"]["labels"];
    var destinations=obj["destinations"]["labels"];

    var f_len=Math.max(sources.length,destinations.length);
    var i,j;

    html="<tbody>";
    for(i=0;i<f_len;i++) {
	html+="<tr>";
	if (i==0) {
	    html+='<th rowspan="'+f_len+'">';
	    html+=filter["label"];
	    html+='</th>';
	}
	if (i<sources.length) 
	    html+="<td>"+sources[i]+"</td>";
	else
	    html+="<td></td>";
	if (i<destinations.length) 
	    html+="<td>"+destinations[i]+"</td>";
	else
	    html+="<td></td>";
	html+="</tr>";
    }
    html+="</tbody>";
    return html;

};

ObjectsPanel.prototype.table_body=function(object){
    var html;

    html='<tbody><tr>';
    html+='<td>';
    html+='<div class="checkbox">';
    html+='<input type="checkbox" class="'+this.obj_type+'-select" value="'+object["object_id"]+'"';
    html+=' id="'+this.obj_type+'-'+object["object_id"]+'" name="select '+object["label"]+'" />';
    html+='<label for="'+this.obj_type+'-'+object["object_id"]+'"></label></div>';
    html+='</td>';
    html+='<th id="'+this.obj_type+'-status-icon-'+object["object_id"]+'">';
    if (object["status"]["status"]){
	html+=this.status_icon(object["status"]["status"]);
    }
    html+='</th>';
    html+='<th>'+object["label"]+'</th>';
    if (object["on_boot"]) {
	html+='<th class="center"><i class="fa fa-check-circle"></i></th>';
    } else {
	html+='<th>&nbsp;</th>';
    };
    html+='<td class="left">'+object["class"]+'</td>';
    if (object["status"]["status"]){
	html+='<td id="'+this.obj_type+'-status-'+object["object_id"]+'">'+object["status"]["status"]+'</td>';
	html+='<td id="'+this.obj_type+'-changed-'+object["object_id"]+'">';
	html+=format_datetime(this.locale,object["status"]["status_update"])+'</td>';
    } else {
	html+='<td id="'+this.obj_type+'-status-'+object["object_id"]+'"></td>';
	html+='<td id="'+this.obj_type+'-changed-'+object["object_id"]+'"></td>';
    };
    html+='<td>'+object["timeout"]+'</td>';
    for(n=0;n<this.add_fields.length;n++){
	html+='<td id="'+this.obj_type+'-'+this.add_fields[n].obj_key+'-'+object["object_id"]+'">'+format_value(this.locale,object[this.add_fields[n].obj_key])+'</td>';
    }

    html+='</tr></tbody>'
    return html;
};


/***/

NormalizerPanel.prototype.create_panel = function(data) {
    var html,obj;
    var html_i,html_p;
    html=this.table_header();
    html_i="<ul>";
    html_p="";
    for(i=0;i<data.length;i++) {
	obj=data[i];
	html+=this.table_body(obj);

	html_i+='<li><a href="#'+this.obj_type+'-'+obj["filter"]["filter_id"]+'">';
	html_i+=obj["filter"]["label"]+'</a></li>';
	html_p+=this.sub_panel(obj);
    }
    this.box.html(html);
    html_i+="</ul>";
    this.subtabs.html(html_i+html_p);
    this.subtabs.tabs();

};

StagePanel.prototype.create_panel = function(data) {
    var i,obj,html,log_time,real_data;
    var remove_list=[],row;
    log_time=data[0];
    real_data=data[1];
    html=this.table_header();
    for(i=0;i<real_data.length;i++) {
	obj=real_data[i];
	html+=this.table_body( [log_time,obj] );
	if (obj["sent_completed"]) remove_list.push(obj);
    };
    this.box.html(html);

    for(i=0;i<remove_list.length;i++){
	obj=remove_list[i];
	row=$('#'+this.row_id(obj["in_data"]["data_id"]));
	this.fade_row(row);
    };

};

ObjectsPanel.prototype.create_panel = function(data) {
    var html,obj;
    var html_i,html_p;
    html=this.table_header();
    html_i="<ul>";
    html_p="";
    for(i=0;i<data.length;i++) {
	obj=data[i];
	html+=this.table_body(obj);

	html_i+='<li><a href="#'+this.obj_type+'-'+obj["object_id"]+'">'+obj["label"]+'</a></li>';
	html_p+=this.sub_panel(obj);
    }
    this.box.html(html);
    html_i+="</ul>";
    this.subtabs.html(html_i+html_p);
    this.subtabs.tabs();

    var self=this;
    $('#'+this.obj_type+'-select-all').change(function(){
    	var checked=$(this).prop("checked");
    	$('.'+self.obj_type+'-select').prop("checked",checked);
    });

};

/***/

ObjectsPanel.prototype.status_icon = function(status) {
    switch(status) {
    case "running":
	return '<i class="fa fa-toggle-on"></i>';
    case "stopped":
	return '<i class="fa fa-toggle-off"></i>';
    case "stop requested":
    case "start requested":
	return '<i class="fas fa-sync fa-spin"></i>';
    default: return "";
    }
};

/***/

ObjectsPanel.prototype.set_status = function(status,log_time){
    var obj_id=status["object"]["object_id"];

    if (!(status)) {
	$('#'+this.obj_type+'-status-'+obj_id).html("");
	$('#'+this.obj_type+'-changed-'+obj_id).html("");
	$('#'+this.obj_type+'-status-icon-'+obj_id).html("");
	return;
    }

    switch(status["type"]){
    case "status":
	$('#'+this.obj_type+'-status-'+obj_id).html(status["status"]["status"]);
	$('#'+this.obj_type+'-changed-'+obj_id).html(format_datetime(this.locale,log_time));
	$('#'+this.obj_type+'-status-icon-'+obj_id).html(this.status_icon(status["status"]));
	return;
    default: 
	this.update_status_values(obj_id,status,log_time);
    }

};

StagePanel.prototype.set_status = function(status,log_time){

    switch (status["type"]) {
    case "add":
	this.set_status_add(status,log_time);
	break;
    case "set_relation":
	this.set_status_set_relation(status,log_time);
	break;
    case "remove":
	this.set_status_remove(status,log_time);
	break;
    case "commit_output":
    default:
	break;
    };

}

NormalizerPanel.prototype.set_status = function(status,log_time){
    var source=status["source"];
    var ts=status["timestamp"];
    var i,st_exec,filter,table,row,j;
    var rowspan,destinations,result,msg;

    for(i=0;i<status["exec"].length;i++) {
	st_exec=status["exec"][i];
	filter=st_exec["filter"]["filter"];
	table=$('#'+this.obj_type+'-status-table-'+filter["filter_id"]);
	destinations=st_exec["filter"]["destinations"]["labels"];
	result=st_exec["filter"]["result"];
	msg=st_exec["filter"]["message"];
	rowspan=destinations.length;
	row="<tbody>";
	if (rowspan==1) {
	    row+="<tr>";
	    row+="<td>"+format_time(this.locale,ts)+"</td>";
	    row+="<td class='right'>"+format_sec_to_msec(st_exec["time"])+"</td>";
	    row+="<td>"+format_value(this.locale,source["label"])+"</td>";
	    row+="<td>"+format_value(this.locale,st_exec["input_data_id"])+"</td>";
	    row+="<td>"+format_value(this.locale,destinations[0])+"</td>";
	    row+="<td>"+format_value(this.locale,st_exec["output_data_id"])+"</td>";
	    if (result==="ok") {
		row+="<td class='faicon'>"+this.OK+"</td>";
		row+="<td>&nbsp;</td>";
	    } else {
		row+="<td class='faicon'>"+this.WARNING+"</td>";
		row+="<td>"+msg+"</td>";
	    }
	    row+="</tr>";
	} else for (j=0;j<rowspan;j++) {
	    row+="<tr>";
	    if (j==0) {
		row+="<td rowspan='"+rowspan+"'>"+format_time(this.locale,ts)+"</td>";
		row+="<td rowspan='"+rowspan+"'  class='right'>"+format_sec_to_msec(st_exec["time"])+"</td>";
		row+="<td rowspan='"+rowspan+"'>"+format_value(this.locale,source["label"])+"</td>";
		row+="<td rowspan='"+rowspan+"'>"+format_value(this.locale,st_exec["input_data_id"])+"</td>";
	    }
	    row+="<td>"+format_value(this.locale,destinations[j])+"</td>";
	    if (j==0) {
		row+="<td rowspan='"+rowspan+"'>"+format_value(this.locale,st_exec["output_data_id"])+"</td>";
		if (result==="ok") {
		    row+="<td class='faicon' rowspan='"+rowspan+"'>"+this.OK+"</td>";
		    row+="<td rowspan='"+rowspan+"'>&nbsp;</td>";
		} else {
		    row+="<td class='faicon' rowspan='"+rowspan+"'>"+this.WARNING+"</td>";
		    row+="<td rowspan='"+rowspan+"'>"+msg+"</td>";
		}
		row+="</td>";
	    }
	    row+="</tr>";
	};
	row+="</tbody>";
	table.children("thead:last-of-type").after(row);
	
	if (table.children("tbody").length > this.history_max_size) {
     	    table.children("tbody:last-of-type").remove();
	};
    };

};

/***/

ObjectsPanel.prototype.update_status_values=function(obj_id,status,log_time){

    var table=$('#'+this.obj_type+'-status-table-'+obj_id);

    var row="<tbody><tr>";
    row+=this.status_cells(status,log_time);
    row+="</tr></tbody>";
    table.children("thead:last-of-type").after(row);

    if (table.children("tbody").length > this.history_max_size) {
    	table.children("tbody:last-of-type").remove();
    };

};

/***/

ObjectsPanel.prototype.status_cells=function(status,log_time){
    var html="";
    html+="<td>"+format_time(this.locale,log_time)+"</td>";
    html+="<td>"+format_value(this.locale,status["data_id"])+"</td>";
    html+="<td>"+format_value(this.locale,status["data_timestamp"])+"</td>";
    html+="<td>"+format_sec_to_msec(status["time"])+"</td>";
    html+="<td>"+format_value(this.locale,status["last_value"])+"</td>";
    return html;
};

DestinationsPanel.prototype.status_cells=function(status,log_time){
    var html="";
    html=ObjectsPanel.prototype.status_cells.apply(this,[status,log_time]);
    switch(status["object"]["class"]) {
    case "brocchetta_lib.destinations.SapHanaStreamDestination":
	switch(status["type"]) {
	case "fail":
	    html+="<td class='faicon'>"+this.FAIL+"</td>";
	    html+="<td colspan='4'>"+status["error"]+"</td>";
	    break;
	case "empty_data":
	    html+="<td class='faicon'>"+this.WARNING+"</td>";
	    html+="<td colspan='4'>Empty data</td>";
	    break;
	default:
	    html+="<td class='faicon'>"+this.OK+"</td>";
	    html+="<td>"+format_sec_to_msec(status["auth_tconn"])+"</td>";
	    html+="<td>"+format_sec_to_msec(status["auth_texec"])+"</td>";
	    html+="<td>"+format_sec_to_msec(status["tconn"])+"</td>";
	    html+="<td>"+format_sec_to_msec(status["texec"])+"</td>";
	}
	break;
    default:
	switch(status["type"]) {
	case "fail":
	    html+="<td class='faicon'>"+this.FAIL+"</td>";
	    html+="<td>"+status["error"]+"</td>";
	    break;
	case "empty_data":
	    html+="<td class='faicon'>"+this.WARNING+"</td>";
	    html+="<td>Empty data</td>";
	    break;
	default:
	    html+="<td class='faicon'>"+this.OK+"</td>";
	    html+="<td class='faicon'>&nbsp;</td>";
	}
    }
    return html;
};

SourcesPanel.prototype.status_cells=function(status,log_time){
    var html="";
    html=ObjectsPanel.prototype.status_cells.apply(this,[status,log_time]);
    html+="<td>"+format_value(this.locale,status["checkpoint"])+"</td>";

    switch(status["object"]["class"]) {
    case "brocchetta_lib.sources.AurorasWebTreatmentsSource":
    case "brocchetta_lib.sources.AurorasWebPhenologicalPhasesSource":
    case "brocchetta_lib.sources.AurorasWebAlertsPeronosporaSource":
    case "brocchetta_lib.sources.AurorasWebAlertsOidioSource":
    case "brocchetta_lib.sources.AurorasWebAlertsBotriteSource":
    case "brocchetta_lib.sources.AurorasWebRisksSource":
	switch(status["type"]) {
	case "fail":
	    html+="<td class='faicon'>"+this.FAIL+"</td>";
	    html+="<td colspan='5'>"+status["error"]+"</td>";
	    break;
	case "empty_data":
	    html+="<td class='faicon'>"+this.WARNING+"</td>";
	    html+="<td>Empty data</td>";
	    html+="<td>"+format_sec_to_msec(status["auth_tconn"])+"</td>";
	    html+="<td>"+format_sec_to_msec(status["auth_texec"])+"</td>";
	    html+="<td>"+format_sec_to_msec(status["tconn"])+"</td>";
	    html+="<td>"+format_sec_to_msec(status["texec"])+"</td>";
	    break;
	default:
	    html+="<td class='faicon'>"+this.OK+"</td>";
	    html+="<td>&nbsp;</td>";
	    html+="<td>"+format_sec_to_msec(status["auth_tconn"])+"</td>";
	    html+="<td>"+format_sec_to_msec(status["auth_texec"])+"</td>";
	    html+="<td>"+format_sec_to_msec(status["tconn"])+"</td>";
	    html+="<td>"+format_sec_to_msec(status["texec"])+"</td>";
	}
	break;
    case "brocchetta_lib.sources.AurorasSource":
	switch(status["type"]) {
	case "fail":
	    html+="<td class='faicon'>"+this.FAIL+"</td>";
	    html+="<td colspan='3'>"+status["error"]+"</td>";
	    break;
	case "empty_data":
	    html+="<td class='faicon'>"+this.WARNING+"</td>";
	    html+="<td>Empty data</td>";
	    html+="<td>"+format_sec_to_msec(status["tconn"])+"</td>";
	    html+="<td>"+format_sec_to_msec(status["texec"])+"</td>";
	    break;
	default:
	    html+="<td class='faicon'>"+this.OK+"</td>";
	    html+="<td>&nbsp;</td>";
	    html+="<td>"+format_sec_to_msec(status["tconn"])+"</td>";
	    html+="<td>"+format_sec_to_msec(status["texec"])+"</td>";
	}
	break;
    default:
	switch(status["type"]) {
	case "fail":
	    html+="<td class='faicon'>"+this.FAIL+"</td>";
	    html+="<td>"+status["ERROR"]+"</td>";
	    break;
	case "empty_data":
	    html+="<td class='faicon'>"+this.WARNING+"</td>";
	    html+="<td>Empty data</td>";
	    break;
	default:
	    html+="<td class='faicon'>"+this.OK+"</td>";
	    html+="<td class='faicon'>&nbsp;</td>";
	}
    }
	
    return html;
};


/***/

NormalizerPanel.prototype.sub_panel = function(object) {
    var html="";
    var filter=object["filter"];
    var i;

    html+='<section id="'+this.obj_type+'-'+filter["filter_id"]+'" class="panel">';
    html+="<h1>"+filter["label"]+"</h1>";

    html+="<section class='status'>";
    html+="<p>Blocks:</p>";
    html+="<ol>";
    for(i=0;i<filter["blocks"].length;i++){
	html+="<li>";
	html+=filter["blocks"][i]["label"]+": "+filter["blocks"][i]["class"]+"()";
	html+="</li>";
    }
    
    html+="</ol>";
    html+="</section>";

    html+=this.sub_panel_table(object);

    html+='</section>';
    return html;
};


ObjectsPanel.prototype.sub_panel = function(object) {
    var html="";

    html+='<section id="'+this.obj_type+'-'+object["object_id"]+'" class="panel">';
    html+="<h1>"+object["label"]+"</h1>";

    html+="<section class='status'>";
    html+="<p class='subtitle'>"+object["class"]+"</p>";

    if (object["status"]["status"]){
	html+='<p class="subtitle">';
	html+='last status change: &nbsp;<span id="'+this.obj_type+'-changed-'+object["object_id"]+'">';
	html+=format_datetime(this.locale,object["status"]["status_update"])+'</span>';
	html+='</p>';
	html+='<p>';
	html+='<span id="'+this.obj_type+'-status-icon-'+object["object_id"]+'" class="bigicon">';
	html+=this.status_icon(object["status"]["status"]);
	html+="</span>";
	html+='<span id="'+this.obj_type+'-status-'+object["object_id"]+'">'+object["status"]["status"]+'</span>';
	html+='</p>';
    } else {
	html+='<p class="subtitle">last status change: &nbsp;';
	html+='<span id="'+this.obj_type+'-changed-'+object["object_id"]+'"></span>';
	html+='</p>';
	html+='<p>';
	html+='<span id="'+this.obj_type+'-status-icon-'+object["object_id"]+'" class="bigicon"></span>';
	html+='<span id="'+this.obj_type+'-status-'+object["object_id"]+'"></span>';
	html+='</p>';
    };
    html+="</section>";

    html+=this.sub_panel_table(object);

    html+='</section>';
    return html;
};

/**/

WithSubtabsPanel.prototype.sub_panel_table = function(object) {
    var html="",i;

    html+='<table id="'+this.sub_panel_id(object)+'" class="multiple">';
    html+="<thead>";
    switch(object["class"]) {
    case "brocchetta_lib.destinations.SapHanaStreamDestination":
	html+="<tr>";
	for(i=0;i<this.sub_panel_thead.length;i++)
	    html+="<th rowspan='3'>"+this.sub_panel_thead[i]+"</th>";
	html+="<th colspan='4'>times (msec)</th>";
	html+="</tr>";
	html+="<tr>";
	html+="<th colspan='2'>auth</th>";
	html+="<th colspan='2'>insert</th>";
	html+="</tr>";
	html+="<tr>";
	html+="<th>conn</th>";
	html+="<th>post</th>";
	html+="<th>conn</th>";
	html+="<th>upload</th>";
	html+="</tr>";
	break;
    case "brocchetta_lib.sources.AurorasWebTreatmentsSource":
    case "brocchetta_lib.sources.AurorasWebPhenologicalPhasesSource":
    case "brocchetta_lib.sources.AurorasWebAlertsPeronosporaSource":
    case "brocchetta_lib.sources.AurorasWebAlertsOidioSource":
    case "brocchetta_lib.sources.AurorasWebAlertsBotriteSource":
    case "brocchetta_lib.sources.AurorasWebRisksSource":
	html+="<tr>";
	for(i=0;i<this.sub_panel_thead.length;i++) {
	    if (this.sub_panel_thead[i]=="success")
		html+="<th colspan='2' rowspan='3'>"+this.sub_panel_thead[i]+"</th>";
	    else
		html+="<th rowspan='3'>"+this.sub_panel_thead[i]+"</th>";
	}
	html+="<th colspan='4'>times (msec)</th>";
	html+="</tr>";
	html+="<tr>";
	html+="<th colspan='2'>auth</th>";
	html+="<th colspan='2'>retrieve</th>";
	html+="</tr>";
	html+="<tr>";
	html+="<th>conn</th>";
	html+="<th>post</th>";
	html+="<th>conn</th>";
	html+="<th>download</th>";
	html+="</tr>";
	break;
    case "brocchetta_lib.sources.AurorasSource":
	html+="<tr>";
	for(i=0;i<this.sub_panel_thead.length;i++) {
	    if (this.sub_panel_thead[i]=="success")
		html+="<th colspan='2' rowspan='2'>"+this.sub_panel_thead[i]+"</th>";
	    else
		html+="<th rowspan='2'>"+this.sub_panel_thead[i]+"</th>";
	}
	html+="<th colspan='2'>times (msec)</th>";
	html+="</tr>";
	html+="<tr>";
	html+="<th>conn</th>";
	html+="<th>download</th>";
	html+="</tr>";
	break;
    default:
	html+="<tr>";
	for(i=0;i<this.sub_panel_thead.length;i++){
	    if (this.sub_panel_thead[i]=="success")
		html+="<th colspan='2'>"+this.sub_panel_thead[i]+"</th>";
	    else
		html+="<th>"+this.sub_panel_thead[i]+"</th>";
	}
	html+="</tr>";
    }
    html+="</thead>";
    html+="</table>";

    return html;
};

/***/

WithSubtabsPanel.prototype.sub_panel_id = function(object) {
    return this.obj_type+'-status-table-'+object["object_id"];
};

NormalizerPanel.prototype.sub_panel_id = function(object) {
    return this.obj_type+'-status-table-'+object["filter"]["filter_id"];
};



/***/

StagePanel.prototype.row_id = function(data_id){
    return 'stage-row-'+data_id;
};

StagePanel.prototype.dest_cell_id = function(data_id,out_id,dest_id){
    return 'stage-dest-'+data_id+'-'+out_id+'-'+dest_id;
};

StagePanel.prototype.out_cell_id = function(data_id,out_id){
    return 'stage-dest-'+data_id+'-'+out_id;
};

StagePanel.prototype.add_row = function(in_data,log_time) {
    var data_id=in_data["data_id"];
    var row=$('#'+this.row_id(data_id));
    if (row.length!=0) return row;

    var html;
    html='<tbody id="'+this.row_id(data_id)+'">';
    html+="<tr class='first'>";
    html+='<td class="input completed faicon">&nbsp;</td>';
    html+='<td class="input ts">'+format_time(this.locale,log_time)+'</td>';
    html+='<td class="input datats">'+format_value(this.locale,in_data["timestamp"])+"</td>";
    html+='<td class="input source">'+format_value(this.locale,in_data["source_id"])+"</td>";
    html+='<td class="input id">'+format_value(this.locale,in_data["data_id"])+"</td>";
    html+='<td class="empty" colspan="4"></td>';
    html+="</tr>";
    html+='</tbody>';

    this.box.append(html);

    row=$('#'+this.row_id(data_id));
    return row;
};

StagePanel.prototype.set_status_add = function(status,log_time){
    row=this.add_row(status["in_data"],log_time);

    // var data_id=status["in_data"]["data_id"];
    // var row;

    // var row=$('#'+this.row_id(data_id));
    // if (row.length==0) {
    // 	this.add_row(status["in_data"],log_time);
    // 	row=$('#'+this.row_id(data_id));
    // }
};

StagePanel.prototype.set_status_set_relation = function(status,log_time){

    var data_id=status["in_data"]["data_id"];

    var row=this.add_row(status["in_data"],log_time);
    var old_rowspan=row.find(".input").attr("rowspan");
    if (!old_rowspan) old_rowspan=1;

    var out_id = this.out_cell_id(data_id,status["out_data"]["data_id"]);
    var out=$('#'+out_id);
    if (out.length!=0) return;

    var empty=row.find(".empty");

    var rowspan,row_begin,i,html,dest_id;

    var num_dest=status["out_data"]["destination_id_list"].length;

    if (empty.length>0) {
	empty.remove();
	rowspan=num_dest;
	row_begin=row.find("tr").html();
	row.html("");
    } else {
	rowspan=old_rowspan+num_dest;
	row_begin="";
    }

    for(i=0;i<num_dest;i++) {
	dest_id=status["out_data"]["destination_id_list"][i];
	cell_id = this.dest_cell_id(data_id,status["out_data"]["data_id"],dest_id);
	html="<tr>";
	if (i==0) {
	    html+=row_begin;
	    html+='<td rowspan="'+num_dest+'">'+format_value(this.locale,status["out_data"]["timestamp"])+"</td>";
	    html+='<td rowspan="'+num_dest+'" id='+out_id+'>';
	    html+=format_value(this.locale,status["out_data"]["data_id"])+"</td>";
	}

	html+='<td>'+format_value(this.locale,dest_id)+"</td>";
	html+='<td id="'+cell_id+'">&nbsp;</td>';

	html+="</tr>";
	if (row.html())
	    row.children("tr:last-of-type").after(html);
	else
	    row.html(html);
    }

    row.find(".input").attr("rowspan",rowspan);

};

StagePanel.prototype.fade_row=function(row){
    if (this.cupio_dissolvi<=0) {
	row.remove();
    } else if (this.cupio_dissolvi<=5) {
	row.fadeOut({
	    "duration": this.cupio_dissolvi*1000, // msec
	    "complete": function() {
		this.remove();
	    }
	});
    } else {
	setTimeout(function(obj){
	    obj.fadeOut({
		"duration": 5000, // msec
		"complete": function() {
		    this.remove();
		}
	    });
	},(this.cupio_dissolvi-5)*1000,row);
    }
};

StagePanel.prototype.set_status_remove = function(status,log_time){

    var data_id,i,row,cell_id,cell,sent_cell,in_data;
    var destination_id=status["destination_id"];

    for(i=0;i<status["in_data_list"].length;i++) {
	in_data=status["in_data_list"][i]["in_data"];
	data_id=in_data["data_id"];
	cell_id = this.dest_cell_id(data_id,status["out_data"]["data_id"],destination_id);

	row=$('#'+this.row_id(data_id));
	cell=$('#'+cell_id);

	cell.html(format_time(this.locale,log_time));


	if (status["in_data_list"][i]["sent_completed"]) {
	    row.find(".input.completed").html(this.OK);
	    this.fade_row(row);

	}

	
    }

};

