//global variable, where we store and retrieve our data from
var events = new Array();

function init(){
	read_data();
	refresh_tables();
	auto_scroll();
	update_clock();
	setInterval(function(){update_clock()}, 1000);
	count_down();
	setInterval(function(){count_down()}, 1000);
}
function refresh_tables(){
	create_time_table();
	
	//special events table------------------------------------------
	var new_content = "";
	var copy_events = copy_arr(events);
	
	while(true){
		var content_array = current_s_event(copy_events);//return one of the events in events array
		if(content_array == 'x')break;//if cant find s event anymore
		
		copy_events.splice(copy_events.indexOf(content_array), 1);//delete this row, not needed anymore
		
		content_array = decode_event(content_array);
		new_content += "<span style='font-size:0.7em; color:lightBlue;'>"+content_array[1]+"</span>" + " " + content_array[3]+"<br/>";
		content_array = "";
	}
	
	document.getElementById("events_content").innerHTML = new_content;
	//--------------------------------------------------------------
	
	//weekly events table-----------------------------
	new_content = "";
	var copy_event = copy_arr(events);
	
	for(var i = 0; i < 8; i++){
		
		//use w_event function
		var day_list = w_event(i);
		
		if(i == 1){ 
			new_content += "<span style='color:lightBlue; font-size:0.8em;'>Monday</span><br/>";
		} else if(i == 2){
			new_content += "<span style='color:lightBlue; font-size:0.8em;'>Tuesday</span><br/>";
		} else if(i == 3){
			new_content += "<span style='color:lightBlue; font-size:0.8em;'>Wednesday</span><br/>";
		} else if(i == 4){
			new_content += "<span style='color:lightBlue; font-size:0.8em;'>Thursday</span><br/>";
		} else if(i == 5){
			new_content += "<span style='color:lightBlue; font-size:0.8em;'>Friday</span><br/>";
		} else if(i == 6){
			new_content += "<span style='color:lightBlue; font-size:0.8em;'>Saturday</span><br/>";
		} else if(i == 7){
			new_content += "<span style='color:lightBlue; font-size:0.8em;'>Sunday</span><br/>";
		}
		
		for(j = 0; j < day_list.length; j++){
			var decode = decode_event(day_list[j]);
			var event_name = decode[3];
			
			new_content += "<div>"+event_name+"</div>";
		}
	}
	
	document.getElementById("w_events_content").innerHTML = new_content;
	//------------------------------------------------
	
	//current event table-----------------------
	new_content = "";
	var split = current_s_event(events).split("%");
	if(split != 'x'){
		var date_split = split[1].split("/");
		var time_split = split[2].split(":");
	}
	var today = new Date();
	var month = today.getMonth() + 1;
	
	/*special events*/
	if( split != 'x' && (date_split[0] == today.getDate() && date_split[1] == month && date_split[2] == today.getFullYear() && time_split[0] == today.getHours())){
			new_content = split[3];
	} else {
	/*weekly events*/
		var day = today.getDay();
		if(day == 0)day = 7;
		
		var today_list = w_event(day);
		for(i = 0; i< today_list.length; i ++){
			var split = today_list[i].split("%");
			var time_split = split[2].split(":");
			if(time_split[0] == today.getHours()){
				new_content = split[3];
			}
		}
	}
	
	document.getElementById("current_content").innerHTML = new_content;
	//------------------------------------------
	
	//next event table----------------------------------------
	/*weekly event*/
	new_content = "";
	day = today.getDay();
		if(day == 0)day = 7;
		
		var today_list = w_event(day);
		for(i = 0; i< today_list.length; i ++){
			var split = today_list[i].split("%");
			var time_split = split[2].split(":");
			if(time_split[0] == today.getHours()+1){
				new_content = split[3];
			}
		}
	document.getElementById("next_content").innerHTML = new_content;
	//--------------------------------------------------------
}

function read_data(){

	/*new user configuration*/
	if(!localStorage.getItem("whatsnext")){
		//New year---------------------e_type+"%"+date_val+"%"+time_val+"%"+e_name;----------
		var today = new Date();
		var next_year = today.getFullYear() + 1;
		events[events.length] = "s%1/1/" + next_year + " %0:0%Next Year "+next_year+"<div style='font-size:0.7em;'>(empty data)</div>";
		//------------------------------------------------------------------------------------
	} else {
	//read data from localstorage
		var read = localStorage.getItem("whatsnext").split("*");
		for(i = 0; i < read.length; i++){
			events[events.length] = read[i];
		}
	}
	
}
function save_data(){
	
	//save to localstorage, later
	var join = events.join("*");
	localStorage.setItem("whatsnext", join);
	
	//refresh
	refresh_tables();
}

function closest_s_event(array){
	
	var closest = -1;
	//find the closest event(special type)
	for(i = 0; i < array.length; i++){
	
		var split = decode_event(array[i]);
		var today = new Date();
		var today_time = today.getTime();

		var future = true;
		if(date_to_milli(split) < today_time){array.splice(i, 1); continue;}
		
		if(split[0] == "s"){
			if(closest == -1){
				closest = i;
			} else if(date_to_milli(split) < date_to_milli(decode_event(array[closest])) && future){//date must be later than today
				closest = i;//this date has closest to today
			}
		}
	}
	
	//what to do if closest = -1
	if(closest == -1)return 'x';	
	
	else return array[closest];
}
function current_s_event(array){
	
	var closest = -1;
	//find the closest event(special type)
	for(i = 0; i < array.length; i++){
	
		var split = decode_event(array[i]);
		var today = new Date();
		var today_time = today.getTime();

		if(date_to_milli(split) + 3600000 < today_time){array.splice(i, 1); continue;}
		
		if(split[0] == "s"){
			if(closest == -1){
				closest = i;
			} else if(date_to_milli(split) < date_to_milli(decode_event(array[closest]))){//date must be later than today
				closest = i;//this date has closest to today
			}
		}
	}
	
	//what to do if closest = -1
	if(closest == -1)return 'x';	
	
	else return array[closest];
}

function w_event(day){//return a event list of that day(day eg:Monday)
	
	var day_events = new Array();
	
	for(i = 0; i < events.length; i++){
		var split = decode_event(events[i]);
		if(split[1] == day){
			day_events[day_events.length] = events[i];
		}
	}
	
	return day_events;
}

function decode_event(encoded){
	var n = encoded.split("%");
	return n;
}

function date_to_milli(split){//array format => date/month/year to milli
	var date_split = split[1].split("/");
	var time_split = split[2].split(":");
	var the_day = new Date(""+month_to_alphabet(date_split[1])+" "+date_split[0]+", "+date_split[2]+" "+time_split[0]+":"+time_split[1]+":00");//eg("October 13, 1975 11:13:00");

	return the_day.getTime();		
}

function month_to_alphabet(x){
	switch(Number(x)){
	case 1:
		return "January";
	case 2:
		return "February";
	case 3:
		return "March";
	case 4:
		return "April";
	case 5:
		return "May";
	case 6:
		return "June";
	case 7:
		return "July";
	case 8:
		return "August";
	case 9:
		return "September";
	case 10:
		return "October";
	case 11:
		return "November";
	case 12:
		return "December";
	default:
		return "read error";
	}
}

function copy_arr(array){//this function is used because '=' will direct array pointed to left operand
	var copy = new Array();
	for(i = 0; i < array.length; i++){
		copy[copy.length] = array[i];
	}
	return copy;
}

function create_time_table(){

	document.getElementById("time_table").innerHTML = "";
	
	var tt_span = document.getElementById("time_table").innerHTML;
	var new_span = "";
	
	for(i=0; i<8; i++){
	
		var name = "";
		var style= "";
	
		if(i == 1)name = "Mon";
		else if(i == 2)name = "Tue";
		else if(i == 3)name = "Wed";
		else if(i == 4)name = "Thu";
		else if(i == 5)name = "Fri";
		else if(i == 6)name = "Sat";
		else if(i == 7)name = "Sun";
		
		var today = new Date();
		var year = today.getFullYear();
		var month = today.getMonth() + 1;
		var date = today.getDate();
		var day = today.getDay();
		var milli = today.getTime();
		
		if(day == 0)day = 7;
			
		if(day == i){//it's today
			name += "("+date+"/"+month+")";
			style += "background-color:black;color:white;";
		} else if(i != 0){
			//display date before today
			if(i < day){
				var that_day = new Date(milli - (day - i) * 86400000);
				var that_month = that_day.getMonth()+1;
				
				name += "("+that_day.getDate()+"/"+that_month+")";
			} else {
				var that_day = new Date(milli + (i - day) * 86400000);
				var that_month = that_day.getMonth()+1;

				name += "("+that_day.getDate()+"/"+that_month+")";
			}
		}
	
		new_span += "<button class='time_block' style='"+style+"'>"+name+"</button>";
	}
	new_span += "<br/><div id='time_scroll'>";
	
	for(var i=0; i<24; i++){
		for(var j=0; j<8; j++){
			var name = "-";//name in button
			var style = "";//additional style
			
			if(j == 0){
				if(i == 0)name = "12-1am";
				else if(i == 1)name = "1-2am";
				else if(i == 2)name = "2-3am";
				else if(i == 3)name = "3-4am";
				else if(i == 4)name = "4-5am";
				else if(i == 5)name = "5-6am";
				else if(i == 6)name = "6-7am";
				else if(i == 7)name = "7-8am";
				else if(i == 8)name = "8-9am";
				else if(i == 9)name = "9-10am";
				else if(i == 10)name = "10-11pm";
				else if(i == 11)name = "11-12pm";
				else if(i == 12)name = "12-1pm";
				else if(i == 13)name = "1-2pm";
				else if(i == 14)name = "2-3pm";
				else if(i == 15)name = "3-4pm";
				else if(i == 16)name = "4-5pm";
				else if(i == 17)name = "5-6pm";
				else if(i == 18)name = "6-7pm";
				else if(i == 19)name = "7-8pm";
				else if(i == 20)name = "8-9pm";
				else if(i == 21)name = "9-10pm";
				else if(i == 22)name = "10-11pm";
				else if(i == 23)name = "11-12pm";
			}
			
			if(j == 0) style = "background-color:black;";
			else if(j == 1) style = "background-color:#00000F;";
			else if(j == 2) style = "background-color:#00001F;";
			else if(j == 3) style = "background-color:#00002E;";
			else if(j == 4) style = "background-color:#00003D;";
			else if(j == 5) style = "background-color:#00004C;";
			else if(j == 6) style = "background-color:#00005C;";
			else if(j == 7) style = "background-color:#00006B;";
			
			//same day and same time
			var today = new Date();
			var day = today.getDay();
			var hour = today.getHours();
			
			if(day == 0)day = 7;
			if(day == j && hour == i)style = "background-color:green;";
			
			//events
			var box_date;
			if(j != 0){
				box_date = get_seven_days()[j-1];
				for(k = 0; k < events.length; k++){
					var split = decode_event(events[k]);
					if( split[1] == box_date && i == split[2].split(":")[0] ){//same date with events date and same time
						style = "background-color:red;";
					} else if(split[1] == j && i == split[2].split(":")[0]){
						name = split[3];//same day with events and same time
					}
				}
			}
			
			if(name.length > 10) style += "font-size:0.5em;";
			new_span += "<button id='"+i+","+j+","+name+"' class='normal_block' onclick='date_info(this.id);' style='"+style+"'>"+name+"</button>";
		}new_span += "<br/>";
	}
	document.getElementById("time_table").innerHTML = tt_span + new_span;
	new_span += "</div>";
}
function auto_scroll(){
	var today = new Date();
	var hour = today.getHours();
	var extra = 0;
	if(hour > 12) extra = 3;
	var value = 950 / 24 * (hour + extra);//950 is approximately to the bottom
	document.getElementById("time_scroll").scrollTop = value;
}
function get_seven_days(){//return the array(dates) of seven days in that week
	var seven_days = new Array();
	var today = new Date();
	var day = today.getDay();
	if(day == 0)day = 7;//0 is sunday, I change it to 7 personally
	
	for(i = 1; i < day; i++){
		var past = new Date(today.getTime() - (day - i) * 86400000);
		var actual_month = past.getMonth() + 1;
		
		seven_days[seven_days.length] = ""+past.getDate()+"/"+actual_month+"/"+past.getFullYear()+"";
	}
	
	for(i = day; i < 8; i++){
		var future = new Date(today.getTime() + (i - day) * 86400000);
		var actual_month = future.getMonth() + 1;
		
		seven_days[seven_days.length] = ""+future.getDate()+"/"+actual_month+"/"+future.getFullYear()+"";
	}
	return seven_days;
}

function update_clock(){
	var today = new Date();
	var date = today.getDate();
	var month = today.getMonth() + 1;
	
	var hour = today.getHours();
	var minute = today.getMinutes();
	var sec = today.getSeconds();
	
	var new_span = "";
	
	var r_degree = hour * 30;	
	//degree beautify adjustment---------------
	if(minute >= 50)r_degree += 30 - 5;
	else if(minute >= 40) r_degree += 30 - 10;
	else if(minute >= 30) r_degree += 30 - 15;
	else if(minute >= 20) r_degree += 30 - 20;
	else if(minute >= 10) r_degree += 30 - 25;
	//-----------------------------------------
	
	new_span +=
	 "<span id='hour_spin' style='-webkit-transform:rotate("+r_degree+"deg);-moz-transform:rotate("+r_degree+"deg);-ms-transform:rotate("+r_degree+"deg);-o-transform:rotate("+r_degree+"deg);'><div id='hour_top'></div><div id='hour_bot'></div></span>";	
	
	r_degree = minute * 6;
	new_span +=
	 "<span id='min_spin' style='-webkit-transform:rotate("+r_degree+"deg);-moz-transform:rotate("+r_degree+"deg);-ms-transform:rotate("+r_degree+"deg);-o-transform:rotate("+r_degree+"deg);'><div id='min_top'></div><div id='min_bot'></div></span>";	
	
	
	r_degree = sec * 6;	
	new_span +=
	 "<span id='sec_spin' style='-webkit-transform:rotate("+r_degree+"deg);-moz-transform:rotate("+r_degree+"deg);-ms-transform:rotate("+r_degree+"deg);-o-transform:rotate("+r_degree+"deg);'><div id='sec_top'></div><div id='sec_bot'></div></span>";
	
	document.getElementById("clock").innerHTML = new_span;
}

function count_down(){
	var today = new Date();
	
	var hour = today.getHours();
	var minute = today.getMinutes();
	var sec = today.getSeconds();
	
	var d_sec = 0 - sec;//dont have to specify too detail, so seconds ignored
	
	var split = closest_s_event(events);//find the current latest event
	
	//exception---(cant find special event)--
	if(split == 'x'){
		document.getElementById("next_clock_inner").innerHTML = "";
		document.getElementById("next_special_content").innerHTML = "";
		return;
	}
	//---------------------------------------
	
	split = decode_event(split);
	var date_split = split[1].split("/");
	var time_split = split[2].split(":");
	
	var d_min = time_split[1] - minute;
	var d_hour = time_split[0] - hour;
	var d_day = days_dist(date_split[2], date_split[1], date_split[0]);//year, month, date
	
	//if less than 0, then borrow from front----
	if(d_sec < 0){d_sec += 60; d_min--;}
	if(d_sec < 10)d_sec = '0'+d_sec;

	if(d_min < 0){d_min += 60;d_hour--;}
	if(d_min < 10)d_min = '0'+d_min;
	
	if(d_hour < 0){d_hour += 24;d_day--;}
	if(d_hour < 10)d_hour = '0'+d_hour;
	//------------------------------------------
	
	var next_date; 
	document.getElementById("next_clock_inner").innerHTML = "Left<br/> "+d_day+" day(s)<br/><br/>"+d_hour+":"+d_min+":"+d_sec+"";
	document.getElementById("next_special_content").innerHTML = split[3];
}
function days_dist(s_year, s_month, s_date){
	var today = new Date();
	var date = today.getDate();
	var month = today.getMonth() + 1;
	var year = today.getFullYear();
	
	var d_date = s_date - date;
	var d_month = s_month - month;
	var d_year = s_year - year;
	
	//if less than 0, then borrow from front-----
	if(d_date < 0){
		d_date += days_in_month(month, year); d_month--;//if days is neg, calculate the days between w/o considering the months between them
	} else if(d_month != 0){
		d_date = days_in_month(month, year) - date + s_date;//if month is not same, calculate days left in this month + days in the target month
	}	
	
	if(d_month < 0){d_month += 12; d_year--;}
	//if d_year < 0, it's an negative distance bet two(invalid entry)
	//-------------------------------------------
	
	//convert d_month and d_year to days--------------
	var copy_month = month + 1;//plus one bcox already calculate days that month, so next
	var copy_year = year;
	while(d_month > 0){//d_month is number of month left to be converted
		if(copy_month > 12){
			copy_month -= 12;//new month in next year, eg:13=>1
			copy_year = s_year;//year for days_in_month calculation
		}
		
		d_date += days_in_month(copy_month, copy_year);
		
		//decrement
		copy_month ++;//next month
		d_month--;
	}
	copy_year = year + 1;//plus one because calculate the next year's day
	while(d_year > 0){//years left to be converted
	
		if(is_leap_year(copy_year))
			d_date += 366;
		else 
			d_date += 365;
		
		//decrement
		d_year--;
	}
	//------------------------------------------------
	
	return d_date;
}
function days_in_month(x, year){//x represents month
	switch(x){
	case 1:
	case 3:
	case 5:
	case 7:
	case 8:
	case 10:
	case 12:
		return 31;
		break;
	case 2:
		if(is_leap_year)return 29;
		else return 28;
		break;
	case 4:
	case 6:
	case 9:
	case 11:
		return 30;
		break;
	}
}
function is_leap_year(x){
	if(x % 400 == 0)
		return true;
	else if(x % 4 == 0 && x % 100 != 0)
		return true;
	else 
		return false;
}

function add_event(){
	document.getElementById("add_event").className = "non_trans";
	document.getElementById("main_area").className = "half_trans";
	
	var new_content = "";
	/*basic layout*/
	new_content += "Create New Event + <br/><br/>";
	
	//form(things to save---------------------------------------------------------------
	new_content += "<span id='chg_form_type'>Date <input id='date_form' type='text' value='Date/Month/Year' onkeypress='clear_default(this.id);'/></span><br/><br/>";
	new_content += "Time <input id='time_form' type='text' value='Hour:Minute' onkeypress='clear_default(this.id);'/> Duration: <select id='duration'><option value='1'>1</option><option value='2'>2</option><option value='3'>3</option><option value='4'>4</option><option value='5'>5</option></select><br/><br/>";
	new_content += "Event type <input id='w' type='radio' name='e_type' onclick='change_form_type(this.id);'/>Weekly<input id='s' type='radio' name='e_type' checked='checked' onclick='change_form_type(this.id);'/>Special<br/><br/>";
	new_content += "Event Name <br/><input id='e_name_form' type='text' value='' style='width:300px; height:30px;font-size:1.3em;'/><br/><br/>";
	//----------------------------------------------------------------------------------
	
	//button-----------------------
	new_content += "<button class='form_button' onclick='create_event();'>Create</button><button class='form_button' onclick='close_window();'>Cancel</button>";
	//-----------------------------
	
	document.getElementById("add_event").innerHTML = new_content;
	
	/*initialize again, used this to refresh, something like repaint*/
	document.getElementById("main_area").innerHTML = document.getElementById("main_area").innerHTML;
}
function cancel_event(){
	document.getElementById("cancel_event").className = "non_trans";
	document.getElementById("main_area").className = "half_trans";
	
	var new_content = "";
	
	/*basic layout*/
	new_content += "Cancel Event(s) - <br/><br/>";
	
	//forms(things to delete)-----------------------------
	var special_list = new Array();
	var weekly_list = new Array();
	
	for(i = 0; i < events.length; i++){
		var split = events[i].split("%");
		if(split[0] == 'w'){
			weekly_list[weekly_list.length] = events[i];
		} else if(split[0] == 's'){
			special_list[special_list.length] = events[i];
		}
	}
	
	//special table===============================================================
	new_content += "Special<br/>";
	new_content += "<table><th>Date</th><th>Time</th><th>Name</th><th>Mark</th>";
	
	for(i = 0; i < special_list.length; i++){
		var split = special_list[i].split("%");
		var id;
		for(j = 0; j < events.length; j++){
			if(events[j] == special_list[i]){
				id = j;
				break;
			}
		}
		
		new_content += "<tr><td>"+split[1]+"</td><td>"+split[2]+"</td><td>"+split[3]+"</td><td><input type='checkbox' id='del_"+id+"'/></td></tr>";
	}
	
	new_content += "</table><br/>";
	//=============================================================================
	
	//weekly table===============================================================
	new_content += "Weekly<br/>";
	new_content += "<table><th>Day</th><th>Time</th><th>Name</th><th>Mark</th>";
	
	for(i = 0; i < weekly_list.length; i++){
		var split = weekly_list[i].split("%");
		var day = day_to_alphabet(split[1]);
		var id;
		for(j = 0; j < events.length; j++){
			if(events[j] == weekly_list[i]){
				id = j;
				break;
			}
		}
		
		new_content += "<tr><td>"+day+"</td><td>"+split[2]+"</td><td>"+split[3]+"</td><td><input type='checkbox' id='del_"+id+"'/></td></tr>";
	}
	
	new_content += "</table><br/><br/>";
	//=============================================================================
	
	//----------------------------------------------------
	//button-----------------------
	new_content += "<button class='form_button' onclick='delete_event();'>Delete</button><button class='form_button' onclick='close_window();'>Cancel</button>";
	//-----------------------------
	
	document.getElementById("cancel_event").innerHTML = new_content;
	
	/*initialize again, used this to refresh, something like repaint*/
	document.getElementById("main_area").innerHTML = document.getElementById("main_area").innerHTML;
}
function delete_event(){
	var id_key = "del_";
	var count = 0;
	var new_events = new Array();
	
	/*instead of deleting, choose the specify value then add into new array so that deleted wont be added*/
	for(i = 0; i < events.length; i++){
		var key_combine = id_key+i;
		var check = document.getElementById(key_combine).checked;
		if(!check){
			new_events[new_events.length] = events[i];
		} else {
			count++;
		}
	}
	
	events = new_events;
		
	save_data();
	alert("Delete complete. "+count+" item(s) has been deleted.");
	
	//save data
	close_window();

}
function change_form_type(id){
	if(id == "w"){
		var new_form = "Day <select id='date_form'>";
		new_form += "<option value='1'>Monday</option>";
		new_form += "<option value='2'>Tuesday</option>";
		new_form += "<option value='3'>Wednesday</option>";
		new_form += "<option value='4'>Thursday</option>";
		new_form += "<option value='5'>Friday</option>";
		new_form += "<option value='6'>Saturday</option>";
		new_form += "<option value='7'>Sunday</option>";
		new_form += "</select>";
		document.getElementById("chg_form_type").innerHTML = new_form;
	} else if(id == "s"){
		document.getElementById("chg_form_type").innerHTML = "Date <input id='date_form' type='text' value='Date/Month/Year' onkeypress='clear_default(this.id);'/>";		
	}
}
function create_event(){
	var date_val = document.getElementById("date_form").value;
	var time_val = document.getElementById("time_form").value;
	var dur = document.getElementById("duration").value;
	//way to get e_type, checking the w is checked or not---
	var e_type;
	if(document.getElementById("w").checked){
		e_type = "w";
	} else {
		e_type = "s";
	}//------------------------------------------------------
	var e_name = document.getElementById("e_name_form").value;
	time_val = Number(time_val.split(":")[0])+ ":" + Number(time_val.split(":")[1])
	var concurent_check = e_type+"%"+date_val+"%"+time_val+"%"+e_name;
	
	if(!date_val || !time_val || !e_name){
		alert("Please complete the form.");
	} else if(date_val == "Date/Month/Year" || time_val == "Hour:Minute"){
		alert("Please modify the form.");
	} else if(!date_format_check(date_val) && e_type == "s"){
		alert("Date format is incorrect.\neg: 31/12/2012");
	} else if(!time_format_check(time_val)){
		alert("Time format is incorrect.\neg: 13:23");
	} else if(e_name.indexOf("%") >= 0 || e_name.indexOf("*") >= 0){
		alert("Make sure that event name does not contain some special symbol");
	} else if(concurrent_event_time(concurent_check)){
		alert("This time slot has been used, please delete previous one first.");
	} else {
		var encoded = e_type+"%"+date_val+"%"+time_val+"%"+e_name;
		events[events.length] = encoded;//save in the last of array
			
		var time_arr = time_val.split(":");
		var hour = time_arr[0];
		var minute = time_arr[1];
		var comb = hour + ":" + minute;
		for(i = 1; i < dur; i++){
			hour = Number(hour) + 1;
			//exception---------
			if(hour > 23)break;
			//------------------
			comb = hour + ":" + minute;
			encoded = e_type+"%"+date_val+"%"+comb+"%"+e_name;
			if(concurrent_event_time(encoded)){
				alert("One of these time slots has been used, please delete previous one first.");
				return;
			}
			events[events.length] = encoded;
		}
			
		save_data();
		alert("Events saved.");
		close_window();
	}
	
}
function close_window(){
	document.getElementById("add_event").className = "full_trans";
	document.getElementById("cancel_event").className = "full_trans";
	document.getElementById("info_event").className = "full_trans";
	document.getElementById("main_area").className = "non_trans";
	
	/*initialize again, used this to refresh, something like repaint*/
	document.getElementById("main_area").innerHTML = document.getElementById("main_area").innerHTML;
	auto_scroll();
}
function clear_default(id){
	if(document.getElementById(id).value == "Date/Month/Year")
		document.getElementById(id).value = "";
	else if(document.getElementById(id).value == "Hour:Minute")
		document.getElementById(id).value = "";
}
function date_format_check(x){
	var copy_x = x;
	var date;
	var month; 
	var year;
	
	for(i = 0; i < 2; i++){
	
		if(copy_x.indexOf("/") < 0){
			return false;
		} else {
			if(i == 0)date = copy_x.substr(0, copy_x.indexOf("/"));
			else if(i == 1)month = copy_x.substr(0, copy_x.indexOf("/"));
			
			copy_x = copy_x.substr(copy_x.indexOf("/")+1);
		}
	}
	year = copy_x;
	
	//check if all value is number and valid date-------
	if(year < 2012 || year > 3000 || !Number(year))
		return false;
	else if(month < 1 || month > 12 || !Number(month))
		return false;
	else if(date < 1 || Number(date) > days_in_month(Number(month), Number(year)) || !Number(date))
		return false;
	//--------------------------------------------------
	return true;
}
function time_format_check(x){
	if(x.indexOf(":") < 0)
		return false;
	//check if all x is number and valid time------
	var first = x.substr(0, x.indexOf(":"));
	var second = x.substr(x.indexOf(":")+1);
	//alert(Number(first));alert(second);
	if(first < 0 || first >= 24 || (!Number(first) && first != 0))
		return false;
	else if(second < 0 || second >= 60 || (!Number(second) && second != 0))
		return false;
	//--------------------------------------------
	return true;
}
function day_to_alphabet(x){	
	if(x == 1)return "Monday";
	else if(x == 2)return "Tuesday";
	else if(x == 3)return "Wednesday";
	else if(x == 4)return "Thursday";
	else if(x == 5)return "Friday";
	else if(x == 6)return "Saturday";
	else if(x == 7)return "Sunday";
}

function concurrent_event_time(x){
	var split_x = x.split("%");
	for(i = 0; i < events.length; i++){
		var split_e = events[i].split("%");
		
		if(split_e[0] == split_x[0] && split_e[1] == split_x[1] && split_e[2] == split_x[2]){
			return true;//has concurrent
		}
	}
	return false;//no concurrent
}

function date_info(id){
	document.getElementById("info_event").className = "non_trans";
	document.getElementById("main_area").className = "half_trans";
	var i = id.substr(0, id.indexOf(","));
	i = i_get_time(i);
	id = id.substr(id.indexOf(",")+1);
	var j = id.substr(0, id.indexOf(","));
	var day = j_get_day(j);
	var date = j_get_date(j);
	var name = id.substr(id.indexOf(",")+1);
	var s_name = s_event_name(date);
	var new_content = "";
	new_content += "<h3>Today's special</h3>";
	new_content += "Time : "+ i + "<br/>";
	new_content += "Day : "+ day + "<br/>";
	new_content += "Date : "+ date + "<br/>";
	new_content += "Weekly event<br/>";
	new_content += "<b><span style='color:black; font-size:1.5em;'>" + name + "</span></b><br/>";
	new_content += "Special event<br/>";
	new_content += "<b><span style='color:black; font-size:1.5em;'>" + s_name + "</span></b><br/>";
	new_content += "<br/>";
	new_content += "<button class='form_button' onclick='close_window();'>Ok</button>";
	document.getElementById("info_event").innerHTML = new_content;
	
	/*initialize again, used this to refresh, something like repaint*/
	document.getElementById("main_area").innerHTML = document.getElementById("main_area").innerHTML;
}
function i_get_time(i){
	var name = "";
	if(i == 0)name = "12-1am";
	else if(i == 1)name = "1-2am";
	else if(i == 2)name = "2-3am";
	else if(i == 3)name = "3-4am";
	else if(i == 4)name = "4-5am";
	else if(i == 5)name = "5-6am";
	else if(i == 6)name = "6-7am";
	else if(i == 7)name = "7-8am";
	else if(i == 8)name = "8-9am";
	else if(i == 9)name = "9-10am";
	else if(i == 10)name = "10-11pm";
	else if(i == 11)name = "11-12pm";
	else if(i == 12)name = "12-1pm";
	else if(i == 13)name = "1-2pm";
	else if(i == 14)name = "2-3pm";
	else if(i == 15)name = "3-4pm";
	else if(i == 16)name = "4-5pm";
	else if(i == 17)name = "5-6pm";
	else if(i == 18)name = "6-7pm";
	else if(i == 19)name = "7-8pm";
	else if(i == 20)name = "8-9pm";
	else if(i == 21)name = "9-10pm";
	else if(i == 22)name = "10-11pm";
	else if(i == 23)name = "11-12pm";
	return name;
}
function j_get_day(j){
	var name = "";
	if(j == 1)name = "Monday";
	else if(j == 2)name = "Tuesday";
	else if(j == 3)name = "Wednesday";
	else if(j == 4)name = "Thursday";
	else if(j == 5)name = "Friday";
	else if(j == 6)name = "Saturday";
	else if(j == 7)name = "Sunday";
	return name;
}
function j_get_date(j){
	var name = "";

	var today = new Date();
	var year = today.getFullYear();
	var month = today.getMonth() + 1;
	var date = today.getDate();
	var day = today.getDay();
	var milli = today.getTime();
	
	if(day == 0)day = 7;
		
	if(day == j){//it's today
		name += "("+date+"/"+month+")";
	} else if(j != 0){
		//display date before today
		if(j < day){
			var that_day = new Date(milli - (day - j) * 86400000);
			var that_month = that_day.getMonth()+1;
			
			name += "("+that_day.getDate()+"/"+that_month+")";
		} else {
			var that_day = new Date(milli + (j - day) * 86400000);
			var that_month = that_day.getMonth()+1;

			name += "("+that_day.getDate()+"/"+that_month+")";
		}
	}
	return name;
}

function s_event_name(date){
	var name = "";
	date = date.substr(1, date.length-2);
	var the_date = date.substr(0, date.indexOf("/"));
	var the_month = date.substr(date.indexOf("/") +1);
	for(i = 0; i < events.length; i++){
		var split = events[i].split("%");
		if(split[0] == "w")
			continue;
		var date_split = split[1].split("/");
		var time_split = split[2];
		if(Number(the_date) == Number(date_split[0]) && Number(the_month) == Number(date_split[1])){
			name += split[3] + "("+time_split+")<br/>";
		}
	}
	if(name == "")return "-";
	return name;
}