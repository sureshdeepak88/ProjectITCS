/*********************************************************************************************
Project 		-	ITCSPROJ1
Author			-	R.Ram Kishore
Date			-	3/1/2015
Description		-	Hospital patient tracker and billing
Customer		-	Sri Ragavendra hospital

The following document contains the node js server code.
*********************************************************************************************/
var patientCounter = 0 ;
var billNbrCounter = 0 ;
var docNbrCounter = 0 ;
var serviceNbrCounter = 0 ;
var caseSheetNbrCounter = 0 ;
var summaryNbrCounter = 0 ;
var pdfjs = require ('./bill') ;
var casejs = require ('./casesheet') ;
var summary = require ('./summary') ;
var startUTC = 0 ;
var endUTC = 0 ;
var appointmentToday = [] ;
function nextLetter(a){
	c = a.charCodeAt (0) ;
	switch(c){
		case 57: return '9' ;
		case 90: return 'Z';
        case 122: return 'z';
        default: return String.fromCharCode(++c);
    }
}
// This function will load current days appointment in the application memory. This is done in order to fetch next token number
// This function has to be called in the following cases
// 1. When application starts
// 2. When a new appointment is added to the current day
 
function loadTodaysAppt ()
{
	// reload todays start time and end time when loading appointment details
	var ttime = new Date() ;
	var startTime = ttime.getFullYear()+'/'+('0'+(ttime.getMonth()+1)).slice(-2)+'/'+('0'+ttime.getDate()).slice(-2)+' 00:00:00' ;
	var endTime = ttime.getFullYear()+'/'+('0'+(ttime.getMonth()+1)).slice(-2)+'/'+('0'+ttime.getDate()).slice(-2)+' 23:59:59' ;
	var st = new Date(startTime) ;
	var et = new Date(endTime) ;
	startUTC = st.getTime() 
	endUTC = et.getTime() ;
	
	var nodeCouchDB = require("node-couchdb");
	var couch = new nodeCouchDB(installDetails.dbaddress, installDetails.dbport );
	appointmentToday = [] ;// Clear the array
	var apptDate = new Date() ;
	var queryOptions = {} ;
	var dateRangeLow = apptDate.getFullYear()+'/'+('0'+(apptDate.getMonth()+1)).slice(-2)+'/'+('0'+apptDate.getDate()).slice(-2)+' 00:00:00' ;
	var dateRangeUp = apptDate.getFullYear()+'/'+('0'+(apptDate.getMonth()+1)).slice(-2)+'/'+('0'+apptDate.getDate()).slice(-2)+' 23:59:59' ;
	queryOptions.startkey = dateRangeLow ;
	queryOptions.endkey = dateRangeUp ;
	couch.get( "patient", "_design/patient/_view/todayAppt" , queryOptions , function (err, resData) {
		if (err)
			return "Error";
		else
		{
			if ( resData.data.error )
				return "Error" ;
		}	
		if ( resData.data.rows)
			appointmentToday = resData.data.rows ;
	}) ;		
}
// This function will return next token number 
function getNextToken()
{
	var t = new Date() ;
	var token = 1 ;
	for ( i = 0 ; i < appointmentToday.length ; i++ )
	{
		d = new Date( appointmentToday[i].value.apptDate ) ;
		if ( appointmentToday[i].value.status == 'open' )
		{
			if ( d.getTime() >= (t.getTime()-900000))
				return i+1 ;
			else 
				token = i+1 ;
		}	
	}	
	return token ;
} 
//function to update current days appointment 
function updateApptStatusMem (apptNo,apptDate)
{
	var t = new Date(apptDate) ;
	for ( i = 0 ; i < appointmentToday.length ; i++ )
	{
		d = new Date( appointmentToday[i].value.apptDate ) ;
		if ( appointmentToday[i].value.nbr == apptNo && (d.getTime() == t.getTime())) 
		{
			appointmentToday[i].value.status = "closed" ;
			return "Success" ;
		}	
	}	
	return "Error" ;
} 
//function to update current days appointment 
function printApptNbr (apptNo,apptDate)
{
	var t = new Date(apptDate) ;
	for ( i = 0 ; i < appointmentToday.length ; i++ )
	{
		d = new Date( appointmentToday[i].value.apptDate ) ;
		if ( appointmentToday[i].value.nbr == apptNo && (d.getTime() == t.getTime())) 
		{
			//appointmentToday[i].value.status = "closed" ;
			//Call print token api . Token number will be (i+1) ;
			return "Success" ;
		}	
	}	
	return "Error" ;
}
function sendResponse ( errStr , pageName , response )
{
	var fs = require('fs');
	var filepath = installDetails.installdir+'/html/'+pageName ;
	fs.readFile(filepath, 'utf8', function (err,data) {
		if (err) {
			response.writeHead(404, {"Content-Type": "text/html"});
			response.end('Error 404: File not found');
			return ;
		}
		response.writeHead(200, {"Content-Type": "text/html"});
		var resp = data.replace ( '</html>' , '<script>captureResponse("'+errStr+'");</script></html>' )  ;
		response.write(resp);
		response.end();
	});
}
function padNum(n)
{
	if ( n < 10 )
		return "00000"+n;
	else if ( n < 100 )	
		return "0000"+n ;
	else if ( n < 1000 )
		return "000"+n ;
	else if ( n < 10000 )
		return "00" + n ;
	else if ( n < 100000 )
		return "0" + n ;
	else
		return n ;	
}

function getCount(type)
{
	var nodeCouchDB = require("node-couchdb");
	var couch = new nodeCouchDB(installDetails.dbaddress, installDetails.dbport );
	var dbName = '' ;
	var viewName = '' ;
	var counter = 0 ;
	switch (type)
	{
		case 1://Patient
			dbName = 'patient' ;
			viewName = '_design/patient/_view/patientId' ;
			break ;
		case 2://Bill
			dbName = 'bill' ;
			viewName = '_design/bill/_view/billId' ;
			break ;
		case 3://Case Sheet
			dbName = 'casesheet' ;
			viewName = '_design/casesheet/_view/casesheetId' ;
			break ;
		case 4://Discharge
			dbName = 'summary' ;
			viewName = '_design/summary/_view/summaryId' ;
			break ;
		case 5://doctor
			dbName = 'doctor' ;
			viewName = '_design/doctor/_view/doctorId' ;
			break ;
		case 6://service
			dbName = 'service' ;
			viewName = '_design/service/_view/serviceId' ;
			break ;
	}
	couch.get( dbName, viewName , function (err, resData) {
		if (err)
			return "Error";
		else
		{
			try {
				counter = parseInt ( resData.data.rows[0].value ) ; 
				switch (type)
				{
					case 1://Patient
						patientCounter = counter ;
						break ;
					case 2://Bill
						billNbrCounter = counter ;
						break ;
					case 3://Case Sheet
						caseSheetNbrCounter = counter ;
						break ;
					case 4://Discharge
						summaryNbrCounter = counter ;
						break ;
					case 5://doctor
						docNbrCounter = counter ;
						break ;
					case 6://service
						serviceNbrCounter = counter ;
						break ;
				}
			}
			catch(e){}
		}
	});
	
}

function updatePatient ( request , response )
{
	// Sample request JSON
	/* 
		{
			"patientId":"1",//Note this field will be present only during modification
			"name": "KIRAN",
			"nbr": "0001",
			"gender": "M",
			"maritalStatus": 1,
			"dateOfBirth": "10-JAN-1989",
			"addressLine1": "23/125, Kanniah Chetty Street",
			"addressLine2": "Venkatapuram, Ambattur",
			"city": "Chennai",
			"pin": 600053,
			"contactNo": 9962162807,
			"primaryContact": "Sridharan",
			"primaryContactNbr": 9094619416,
			"primaryContactRelationship": "Father",
			"admittedContact": "Thanigaivel",
			"admittedContactNbr": 9962162803,
    */
	var today = new Date();
	var year = today.getYear() - 100 ;
	var month = ''+((today.getMonth()<10)?'0'+(today.getMonth()+1):(today.getMonth()+1)) ;
	var cts = today.getFullYear()+'/'+('0'+(today.getMonth()+1)).slice(-2)+'/'+('0'+today.getDate()).slice(-2)+' '+('0'+today.getHours()).slice(-2)+':'+('0'+today.getMinutes()).slice(-2)+':'+('0'+today.getSeconds()).slice(-2) ;
	var nodeCouchDB = require("node-couchdb");
	var couch = new nodeCouchDB(installDetails.dbaddress, installDetails.dbport );
	var dob = '' ;
	if ( ( typeof request.dateOfBirth != 'undefined' ) && ( request.dateOfBirth.length ))
	{
		try {var bDate = new Date ( request.dateOfBirth ) ;
		dob = bDate.getFullYear()+'/'+('0'+(bDate.getMonth()+1)).slice(-2)+'/'+('0'+bDate.getDate()).slice(-2)
		}catch(e){}
	}	
	if ( ( typeof request.name == 'undefined' ) || !request.name.length )
		return "Error" ;
	if ( ( typeof request.contactNo == 'undefined' ) || !request.contactNo.length )
		return "Error" ;
	if ( typeof request.patientId == 'undefined' )// New patient case
	{
		idval = patientCounter+1 ;
		var counterval = (idval>999999)?(padNum(idval-999999)):padNum(idval) ;
		var respData = {} ;
		respData._id = ''+idval ;
		respData.name = request.name ;	
        respData.nbr = 	''+year+month+counterval ;	
		respData.gender = request.gender ;
		respData.occupation = request.occupation ;
		respData.maritalStatus = request.maritalStatus ;
		respData.dateOfBirth = dob ;
		respData.primaryContact = request.primaryContact ;
		respData.primaryContactNbr = request.primaryContactNbr ;
		respData.addressLine1 = request.addressLine1 ;
		respData.addressLine2 = request.addressLine2 ;
		respData.city = request.city ;
		respData.pin = request.pin ;
		respData.contactNo = request.contactNo ;
		respData.createTs = cts ;
		respData.modifiedTs = cts ;
		respData.modifiedUser = "operator" ;
		couch.insert("patient", respData , function (err, resData) {
			console.log(err) ;
			console.log(resData) ;
			sendResponse ( (err)?"Error":"Success" , "1000.html" , response ) ;
			if(!err)
				patientCounter+=1;	
			return ;
		});
	}	
	else//TODO: Handle modify case
	{
		couch.get("patient", "_design/patient/_view/patientById", {key: request.patientId}, function (err, resData1) {
		if (err)
		{
			sendResponse ( "Error" , "1000.html" , response ) ;
		}	
		else
		{
			var respData = resData1.data.rows[0].value  ;
			respData.gender = request.gender ;
			respData.occupation = request.occupation ;
			respData.maritalStatus = request.maritalStatus ;
			respData.dateOfBirth = request.dateOfBirth ;
			respData.primaryContact = request.primaryContact ;
			respData.primaryContactNbr = request.primaryContactNbr ;
			respData.addressLine1 = request.addressLine1 ;
			respData.addressLine2 = request.addressLine2 ;
			respData.city = request.city ;
			respData.pin = request.pin ;
			respData.contactNo = request.contactNo ;
			respData.modifiedTs = cts ;
			respData.modifiedUser = "operator" ;
			couch.update("patient", respData , function (err, updateRes) {
				sendResponse ( (err)?"Error":"Success" , "1000.html" , response ) ;
				return ;
			});
		}               
		});             
	}                   
	return ;            
}
function getPdf ( type , reqData , response )
{
	switch ( type )
	{
		case 1://Bill
			pdfjs.createBill ( installDetails.installdir , reqData , response ) ;//return bill as pdf in response
			break ;
		case 2://Case sheet
			casejs.createCaseSheet ( installDetails.installdir , reqData , response ) ;//return case sheet as pdf in response
			break ;
		case 3://discharge summary
			summaryjs.createSummary ( installDetails.installdir , reqData , response  ) ;//return discharge summary as pdf in response
			break ;
	}
}
// Update the appointment status to closed once billed
// Update bill number ,  case sheet number and discharge summary nbr 
function updateApptStatus ( reqData , response , type )
{
	var nodeCouchDB = require("node-couchdb");
	var couch = new nodeCouchDB(installDetails.dbaddress, installDetails.dbport );	
	var apptDate ;
	try {
		apptDate = new Date ( reqData.apptDate ) ;
	} catch (e) {}
	couch.get('patient', reqData.patientId, function (err, patData) {
		if (err)
		{
			sendResponse ( (err)?"Error":"Success" , "home.html" , response ) ;
			return ;
		}
		if ( patData.data.error)
		{
			sendResponse ( (err)?"Error":"Success" , "home.html" , response ) ;
			return ;		
		}	
		for ( i = 0 ; i < patData.data.appointment.length ; i++ )
		{
			var apptAvbDate = '' ;
			try {
				apptAvbDate = new Date (patData.data.appointment[i].date) ;
			}catch(e){}
			if ( patData.data.appointment[i].nbr == reqData.apptNbr && (apptDate.getTime() == apptAvbDate.getTime() ))
			{
				switch ( type )
				{
					case 1://Bill
						if ( reqData.surgeryDate )
							patData.data.appointment[i].surgeryDate = reqData.surgeryDate ;
						if ( reqData.dischargeDate )
							patData.data.appointment[i].dischargeDate = reqData.dischargeDate ;
						patData.data.appointment[i].status = "closed" ;
						patData.data.appointment[i].billNbr = reqData.nbr ;
						break ;
					case 2://Case sheet
						patData.data.appointment[i].caseNbr = reqData.nbr ;
						break ;
					case 3://discharge summary
						patData.data.appointment[i].smryNbr = reqData.nbr ;
						break ;
				}
				
				break ;
			}	
		}	
		if ( i >=  patData.data.appointment.length )
		{
			sendResponse ( (err)?"Error":"Success" , "home.html" , response ) ;
			return ;		
		}	
		var apptData = patData.data ;
		couch.update("patient", apptData , function (err, updateRes) {
				if ( err )
				{
					sendResponse ( (err)?"Error":"Success" , "home.html" , response ) ;
				}
				else 
				{
					getPdf ( type , reqData , response ) ;					
				}			
				return ;
		});
	});
}
/*
	Case sheet JSON
{
  "name"         : "Radhika Sangaralingam",
  "nbr"          : 3234,
  "age"          : 101,
  "sex"          : "F",
  "addressLine1" : "23/125, Kanniah Chetty Street,",
  "addressLine2" : "Venkatapuram, Ambattur"
  "city"         : "Chennai",
  "pin"          : 600053,
  "admitTs"      : "2015/02/19 08:45:00"
  "operateTs"    : "2015/02/22 11:05:00"
  "exitTs"       : "2015/02/25 18:20:00",
  "doc"          : [
                  {
                    "name" : "Rajini Kanth"
                  },
                  {
                    "name" : "Ram Gopal"
                  },
                  {
                    "name" : "Lalitha"
                  }]
  "briefDiag"    : "Mild Cardiac Arrest"
}*/
/*DISCHARGE SUMMARY JSON
{
      "name"         : "Radhika Sangaralingam",
      "nbr"          : 3234,
      "age"          : 101,
      "sex"          : "F",
        "weight"       : 120.11,
        "bloodGrp"     : "AB+",
      "admitTs"      : "2015/02/19 08:45:00",
        "operateTs"    : "2015/02/22 11:05:00",
        "exitTs"       : "2015/02/25 18:20:00",
        "firNbr"       : "40/A/14",
        "mlcNbr"       : "H00115",
        "doc"          : [
                        {
                            "name" : "Geetha N",
                            "speciality" : "OBC & Gynac",
                            "contactNbr" : "9884275784"
                        },
                        {
                            "name" : "Selvam K",
                            "speciality" : "Orthopaedic Surgeon",
                            "contactNbr" : "9884275784"
                        },
                        {
                            "name" : "Muthukumaran K",
                            "speciality" : "Gastro Entrology",
                            "contactNbr" : "9884275784"
                        }],
        "bp"          : [{"min" : 70,"max" : 110}],
        "temp"        : 103,
        "pr"          : 96,
        "rr"          : 20,
        "cvs"         : 99,
        "ab"          : 120,
        "cns"         : 99,
        "gynaecPr"    : 150,
        "rs"          : 100,
        "icd10Cd"     : "ORE.23-187",
        "initDiag"    : "Mild Cardiac Arrest combined with Vomitting and giddiness",
        "finalDiag"   : "Excess glucose content the past night resulted in a Cardiac Arrest with Level 1",
        "presentingIllness" : "Minute level of pain in the Right chest with reddish pattern on the above",
        "presentingCmplts" : "Unbearable Chest Pain",
        "keyFindings" : "Methane impalance with inversly proportional glucose content",
        "investEncl"  : ["C","U","C","C","C","C","U","U","C","U","U","C"],
        "surgeryHist" : "Arteries and Veins surgeory, Last mid year",
        "keyInvSumm"  : "Contant smoking for the past 12 yrs",
        "coursInHosp" : "Nomial Blood Flow through the vena cauva (Refer ECG). Ideal pulse rate and other vitals",
        "habitHist"   : "Contant smoking for the past 12 yrs",
        "familyHist"  : "Parents are diabedic, Spouce with Hyper Hydrology",
        "exitAdvice"  : "Food filled with Sucrose will need to avoided, In Case of emergency call the consulted doctor without hesitation",
        "nxtReview"   : "2015/03/10 17:00:00",
        "nxtReviewDoc" : "Nandha Gopalan"
  }*/
/*
	Bill submission Data
	{
		"patientId":"1",
		"patientNbr":"IN000011",
		"apptNbr":"1231",
		"apptDate":"2015/02/12 08:00:11",
		"surgeryDate":"2015/02/13 10:30:12",
		"dischargeDate":"2015/02/14 09:00:00",
		"name":"Ricky",
		"billDetail":[
			{
				"particulars":"Room rent",
				"amt":"1200",
				"qty":"1",
				"tot":"1200"
			},
			{
				"particulars":"Doc fees",
				"amt":"100",
				"qty":"3",
				"tot":"300"
			}
		],
		"earnings":"1500"
	}
*/
function updatePatientDocs (request,response,type)
{
	var closeDetail = request ;
	var dbName = '' ;
	switch (type)
	{
		case 1://Bill
			closeDetail._id = billNbrCounter + 1 ;
			dbName = 'bill' ;
			break ;
		case 2://Case sheet
			closeDetail._id = caseSheetNbrCounter + 1 ;
			dbName = 'casesheet' ;
			break ;
		case 3://discharge summary
			closeDetail._id = summaryNbrCounter + 1 ;
			dbName = 'summary' ;
			break;
	}
	var nodeCouchDB = require("node-couchdb");
	var couch = new nodeCouchDB(installDetails.dbaddress, installDetails.dbport );
	couch.insert(dbName, closeDetil , function (err, updateRes) {
		if (!err)
		{
			if ( type==1 )
			{	
				billNbrCounter += 1 ;
				updateApptStatusMem (request.apptNbr,request.apptDate) ;
			}
			else if ( type==2 )	
			{
				caseSheetNbrCounter += 1 ;
			}	
			else if ( type==3 )	
			{
				summaryNbrCounter += 1 ;
			}	
			updateApptStatus (request,response,type) ;
			
		}
		else
		{
			sendResponse ( "Error" , "home.html" , response ) ;
		}		
		return ;
	});
	return ;
}

function updateAppointment( jsonReq , patData , response )
{
/*{
	JSON data for appointment/admission
	
	"nbr":"",
	"date":"",
	"surgeryDate":"",
	"dischargeDate":"",
	"type":"",
	"status":"",
	"docName":"",
	"pov":"",
	"contactPerson":"",
	"contactNo":"",
	"relation":""
}

During appointment creation, the following value will be available from request
date , type , docName , pov

During admission creation, the following value will be available from the request
date, type, pov, contactPerson , contactNo , relation

For both the case application has to compute , 
nbr and status
*/
	var apptInfo = {};
	try {
		apptDate = new Date(jsonReq.date) ;
		
		apptInfo.date = apptDate.getFullYear()+'/'+('0'+(apptDate.getMonth()+1)).slice(-2)+'/'+('0'+apptDate.getDate()).slice(-2)+' '+('0'+apptDate.getHours()).slice(-2)+':'+('0'+apptDate.getMinutes()).slice(-2)+':'+('0'+apptDate.getSeconds()).slice(-2) ;
		dateRangeLow = apptDate.getFullYear()+'/'+('0'+(apptDate.getMonth()+1)).slice(-2)+'/'+('0'+apptDate.getDate()).slice(-2)+' 00:00:00' ;
		dateRangeUp = apptDate.getFullYear()+'/'+('0'+(apptDate.getMonth()+1)).slice(-2)+'/'+('0'+apptDate.getDate()).slice(-2)+' 23:59:59' ;
		apptInfo.status = "open";
		apptInfo.type = jsonReq.type ;
		apptInfo.pov = jsonReq.pov ;
		if ( jsonReq.docName )
			apptInfo.docName = jsonReq.docName ;
		if ( jsonReq.contactPerson )
			apptInfo.contactPerson = jsonReq.contactPerson ;
		if ( jsonReq.contactNo )
			apptInfo.contactNo = jsonReq.contactNo ;
		if ( jsonReq.relation )
			apptInfo.relation = jsonReq.relation ;
		var nodeCouchDB = require("node-couchdb");
		var couch = new nodeCouchDB(installDetails.dbaddress, installDetails.dbport );
		var queryOption = { startkey: dateRangeLow, endkey: dateRangeUp} ;
		couch.get("patient", "_design/patient/_view/totappt", queryOption , function (err, resData) {
			if (err)
			{
				err.error = "Internal error" ;	
				if ( apptInfo.type == 'IN' )
					err.reason = "Unable to generate admission number" ;
				else
					err.reason = "Unable to generate appointment number" ;
				response.write (  JSON.stringify(err) ) ;
				response.end();
				return "Error";
			}	
			else
			{
				try { apptNumber = (parseInt ( resData.data.rows[0].value ))+1 ; }
				catch(e){apptNumber=1;}
			}
			apptInfo.nbr = apptNumber ;
			patData.appointment.push ( apptInfo ) ;
			couch.update("patient", patData , function (err, updateRes) {
				if (err)
				{
					err.error = "Internal error" ;	
					if ( apptInfo.type == 'IN' )
						err.reason = "Unable to generate admission number" ;
					else
						err.reason = "Unable to generate appointment number" ;
				}
				else
				{
					err={};
					if ( apptInfo.type == 'IN' )
						err.success = "Patient admission successful and admission number is "+ apptInfo.nbr; 
					else
					{
						err.success = "Appointment generated successfully for " +patData.name+ " and appointment number is "+ apptInfo.nbr; 
						loadTodaysAppt() ;
					}	
				}	
				response.write (  JSON.stringify(err) ) ;
				response.end();		
				return ;
			});
		});
	}	
	catch(e)
	{
		err.error = "Bad request" ;	
		err.reason = "Invalid date format" ;
		response.write (  JSON.stringify(err) ) ;
		response.end();
		return ;
	}
}

function generateId()
{
	var  randomVal = Math.floor(Math.random() * 9000) + 1000; // This will generate a random 4 digit number	
	var  date = new Date().getTime() ;
	return ''+date+randomVal;
}
var installDetails = {} ;// An object to store installation details such as install path, server listening IP and port, DB server IP and port
var arguments = process.argv.slice(2);
if (arguments[0].toLowerCase()=='admin' )
	installDetails.adminType = 'Admin' ;
else
	installDetails.adminType = 'Operator' ;
var filextnArr = ["js","css","svg","ttf","otf","woff","eot","woff2"] ;
var filextnMime = ["application/javascript","text/css","image/svg+xml","application/x-font-ttf","application/x-font-opentype","application/font-woff","application/vnd.ms-fontobject","font/woff2"] ;
var Winreg = require('winreg') ;// The installation details will be stored in the registry of windows system
regKey = new Winreg({
		hive: Winreg.HKLM, // HKEY_LOCAL_MACHINE
		key:  '\\Software\\Wow6432Node\\ITCSBILL' //Actual key where the details are stored
    })
	regKey.values(function (err, items) {
	if (err)
		console.log('ERROR: '+err);
	else
	{
		// Fetch each of the registry keys one by one
		// This function is callback function. Hence please wait for few seconds before accessing the variables defined here
		for (var i in items)
		{
			if ( items[i].name.toLowerCase() == 'installpath' )
			{	
				installDetails.installdir = items[i].value ;
			}
			else if ( items[i].name.toLowerCase() == 'ipaddress' )
			{
				installDetails.ipaddress = items[i].value ;
			}	
			else if ( items[i].name.toLowerCase() == 'port' )
			{
				installDetails.port = parseInt ( items[i].value ) ;
			}		
			else if ( items[i].name.toLowerCase() == 'dbport' )
			{
				installDetails.dbport = parseInt ( items[i].value );
			}	
			else if ( items[i].name.toLowerCase() == 'dbaddress' )
			{
				installDetails.dbaddress = items[i].value ;
			}	
		}	
	}  
});
setTimeout(function(){ 
if ( getCount(1) == "Error" ) 
{
	console.log ( "Unable to fetch patient nbr. Exiting program" ) ;
	return ;
}
if ( getCount(2) == "Error" ) 
{
	console.log ( "Unable to fetch bill nbr. Exiting program" ) ;
	return ;
}
if ( getCount(3) == "Error" ) 
{
	console.log ( "Unable to fetch case sheet nbr. Exiting program" ) ;
	return ;
}
if ( getCount(4) == "Error" ) 
{
	console.log ( "Unable to fetch discharge summary nbr. Exiting program" ) ;
	return ;
}
if ( getCount(5) == "Error" ) 
{
	console.log ( "Unable to fetch doctor nbr. Exiting program" ) ;
	return ;
}
if ( getCount(6) == "Error" ) 
{
	console.log ( "Unable to fetch service nbr. Exiting program" ) ;
	return ;
}
if ( loadTodaysAppt() == "Error" )
{
	console.log ("Unable to load current days appt. Exiting program" ) ;
	return ;
}
var http = require("http");
// Start the http server
var server = http.createServer(function(request, response) {
	var url =  request.url ;
	var fileurl = request.url.split('/').pop();// Get the file name requested by client
	var filextn = '' , filepath = '' ;
	var presentTime = new Date() ;
	presentTime = presentTime.getTime();
	if ( presentTime < startUTC || presentTime > endUTC )
		loadTodaysAppt() ;
	if ( request.url.indexOf ('?') == -1 )// If the URL contains '?' then it is a get Request with parameter  
	{	
		if ( fileurl.length == 0 )
		{
			filextn = 'html' ;
			if (installDetails.adminType == 'Admin' )
			{
				filename = 'index1.html';
				filepath = installDetails.installdir+'/html/'+url.substring ( url.indexOf('/') , url.length ) + '/index1.html' ;
			}
			else
			{		
				filename = 'index.html';
				filepath = installDetails.installdir+'/html/'+url.substring ( url.indexOf('/') , url.length ) + '/index.html' ;
			}	
		}
		else 
		{	
			filextn = fileurl.split('.').pop() ;// Obtain the file extension of the requsted file
			filename = fileurl ;
			filepath = installDetails.installdir+'/html/'+url.substring ( url.indexOf('/') , url.length ) ;
			if ( (filename=='index.html' || filename=='index.htm' ) && installDetails.adminType == 'Admin' )
			{
				filename = 'index1.html';
				filepath = installDetails.installdir+'/html/'+url.substring ( url.indexOf('/') , url.length ) + '/index1.html' ;
			}
		}	
	}	  
	else
	{
		var pathArr  = request.url.split('/') ;
		var index = pathArr.length -1 ;
		while ( index > 0 )
		{
			if ( pathArr[index].indexOf('?') != -1 )
				break ;
			index--;
		}	
		fileurl = pathArr[index] ;
		filextn = fileurl.substring(0, fileurl.indexOf('?')) ;
		filextn = filextn.split('.').pop();
		filename = fileurl.substring(0, fileurl.indexOf('?')) ;	
		filepath = installDetails.installdir+'/html/'+url.substring ( url.indexOf('/') , url.indexOf('?' ) ) ;
		if ( (filename=='index.html' || filename=='index.htm' ) && installDetails.adminType == 'Admin' )
		{
			filename = 'index1.html';
			filepath = installDetails.installdir+'/html/'+url.substring ( url.indexOf('/') , url.length ) + '/index1.html' ;
		}
	}	  
	var urlno = parseInt ( filename.substring(0, filename.indexOf('.')) ) ;
	if ( filextnArr.indexOf (filextn) != -1 )// Of the file extension is 'js' or 'css' read the file from html directory
	{
		var index = filextnArr.indexOf (filextn) ;	
		var fs = require('fs');
		var fontfile = '' ;
		if ( index > 1 )
		{	
			try {
				fontfile = fs.readFileSync(filepath);
			}
			catch (e)
			{
				console.log ( e.message ) ;	
				response.writeHead(404, {"Content-Type": "text/plain"});
				response.end('Error 404: File not found');
				return ;
			}
			response.writeHead(200, {"Content-Type": filextnMime[index]});
			response.end(fontfile,'binary');
		}	
		else
		{
				fs.readFile(filepath, 'utf8', function (err,data) {
				if (err) {
					response.writeHead(404, {"Content-Type": "text/html"});
					response.end('Error 404: File not found');
					return ;
				}
				response.writeHead(200, {"Content-Type": filextnMime[index]});
				response.write(data);
				response.end();
			});
		}
		
	}
	else if ( filextn == 'html' || filextn == 'htm' )
	{
		// In case of html files, check whether the url is internal or external
		// Internal urls are those which require DB interaction
		if (urlno && ( urlno % 10 != 0 ) )
		{
			if ( request.method == 'GET' )
			{
				var query = require('url').parse(request.url,true).query;	
				var nodeCouchDB = require("node-couchdb");
				var couch = new nodeCouchDB(installDetails.dbaddress, installDetails.dbport );
				var dbName = '' ;
				var startKey = "";
				var endKey = "";
				var viewUrl = "";
				var queryOptions = {};
				switch ( urlno )
				{
					case 1001:// Search patient details using name or mobile number
						// This request is a GET request
						var name = query.searchVal ;
						var path = '' ;
						if ( typeof name == 'undefined' )
							name = "";
						dbName = "patient";
						if ( isNaN ( name ) == true )
						{
							viewUrl = "_design/patient/_view/patientName";
							if ( name.length )
							{
								startKey = name ;
								if ( name.charAt(name.length-1) == 'z' )
								{
									endKey = name.substring(0, name.length - 1 ) + 'zz' ;	
								}	
								else if ( name.charAt(name.length-1) == 'Z' )
								{
									endKey = name.substring(0, name.length - 1 ) + 'ZZ' ;	
								}	
								else
								{
									endKey = name.substring(0, name.length - 1 ) + nextLetter(name.charAt(name.length-1));			
								}	
								queryOptions= {startkey : startKey,
												endkey : endKey}
							}		
						}	
						else
						{	
							viewUrl = "_design/patient/_view/patientNo";
							if ( name.length )
							{	
								startKey = name ; 
								var tempkey = 0 , tempname = name , i = name.length;
								do 
								{
									i-- ;
									tempkey = nextLetter ( name.charAt(i) ) ;
									tempname = tempname.substr(0, i) + tempkey + tempname.substr(i+tempkey.length);
								}
								while ( tempkey[0] == '0' && i ) ;
								endKey = tempname ;		
								if ( name.length== 1 && parseInt ( name.charAt(name.length-1) ) == 9 )
									queryOptions.startkey = startKey ;
								else
								{	
									queryOptions.startkey = startKey ;
									queryOptions.endkey = endKey ;
								}
							}	
						}
						break ;
					case 1003:
						// Get current days pending appointments
						// This request is a GET request
						dbName = "patient";
						var apptDate = new Date() ;
						var dateRangeLow = apptDate.getFullYear()+'/'+('0'+(apptDate.getMonth()+1)).slice(-2)+'/'+('0'+apptDate.getDate()).slice(-2)+' 00:00:00' ;
						var dateRangeUp = apptDate.getFullYear()+'/'+('0'+(apptDate.getMonth()+1)).slice(-2)+'/'+('0'+apptDate.getDate()).slice(-2)+' 23:59:59' ;
						queryOptions.startkey = dateRangeLow ;
						queryOptions.endkey = dateRangeUp ;
						viewUrl = "_design/patient/_view/apptopenout";
						break ;
					case 1004:
						//Add appointment for a patient	
						var query = require('url').parse(request.url,true).query;
						var jsonReq = JSON.parse( query.jsonData ) ;
						if ( typeof name == 'undefined' )
							name = "";
						var nodeCouchDB = require("node-couchdb");
						var couch = new nodeCouchDB(installDetails.dbaddress, installDetails.dbport );
						var dbName = "patient";
						var startKey = "";
						var endKey = "";
						var viewUrl = "_design/patient/_view/apptopen";
						var apptDate = new Date(jsonReq.date) ;
						var dateRangeLow = apptDate.getFullYear()+'/'+('0'+(apptDate.getMonth()+1)).slice(-2)+'/'+('0'+apptDate.getDate()).slice(-2)+' 00:00:00' ;
						var dateRangeUp = apptDate.getFullYear()+'/'+('0'+(apptDate.getMonth()+1)).slice(-2)+'/'+('0'+apptDate.getDate()).slice(-2)+' 23:59:59' ;
						var queryOptions = {} ;
						queryOptions.startkey = [jsonReq.patientId,dateRangeLow] ;
						queryOptions.endkey = [jsonReq.patientId,dateRangeUp] ;
						response.writeHead(200, {"Content-Type": "text/html"});
						couch.get(dbName, viewUrl, queryOptions, function (err, resData) {
							if (err)
							{	
								response.write ( JSON.stringify(err) );
								response.end () ;
								return ;
							}
							else
							{	
								if ( resData.data.rows.length )
								{
									err = {} ;
									err.error = "appt exist" ;	
									err.reason = "Open appointment already exists for today" ;
									response.write (  JSON.stringify(err) ) ;
									response.end();
									return ;
								}	
								couch.get(dbName, jsonReq.patientId, function (err, patData) {
									if (err)
									{
										response.write ( JSON.stringify(err) );
										response.end () ;
										return ;
									}
									if ( patData.data.error)
									{
										response.write ( JSON.stringify(patData.data.error) );
										response.end () ;
										return ;		
									}	
									if ( !patData.data.appointment.length)
										patData.data.appointment=[];
									updateAppointment (jsonReq, patData.data , response) ;
								});
						}});	
						return;
					case 1005://Open appointment for a patient TODO: Need to modify this
						var patientId = query.searchVal ;
						today = new Date() ;
						dateRangeLow = today.getFullYear()+'/'+('0'+(today.getMonth()+1)).slice(-2)+'/'+('0'+today.getDate()).slice(-2)+' 00:00:00' ;
						dateRangeUp = today.getFullYear()+'/'+('0'+(today.getMonth()+1)).slice(-2)+'/'+('0'+today.getDate()).slice(-2)+' 23:59:59' ;
						if ( typeof patientId == 'undefined' )
						{
							err = {} ;
							err.error = "appt exist" ;	
							err.reason = "Open appointment already exists for today" ;
							response.write (  JSON.stringify(err) ) ;
							response.end();
							return ;
						}	
						dbName = "patient";
						queryOptions.startkey = [ patientId , dateRangeLow ];
						queryOptions.endkey = [ patientId , dateRangeUp ] ;
						viewUrl = "_design/patient/_view/apptopen";
						break ;		
					case 1006:
						// Get current days closed appointments
						// This request is a GET request
						dbName = "patient";
						var apptDate = new Date() ;
						var dateRangeLow = apptDate.getFullYear()+'/'+('0'+(apptDate.getMonth()+1)).slice(-2)+'/'+('0'+apptDate.getDate()).slice(-2)+' 00:00:00' ;
						var dateRangeUp = apptDate.getFullYear()+'/'+('0'+(apptDate.getMonth()+1)).slice(-2)+'/'+('0'+apptDate.getDate()).slice(-2)+' 23:59:59' ;
						queryOptions.startkey = dateRangeLow ;
						queryOptions.endkey = dateRangeUp ;
						viewUrl = "_design/patient/_view/apptclosedout";
						break ;	
					case 1007:
						// Get current days next token number. This will be the appointment number next to the last closed appt number
						// This request is a GET request
						var out = {} ;
						out.rows = [] ;
						out.rows[0] = { value : getNextToken() } ;
						response.writeHead(200, {"Content-Type": "text/html"});
						response.write (JSON.stringify(out)) ;
						response.end() ;
						return ;	
					case 1008:
						// Get current days missed pending appointments
						// This request is a GET request
						dbName = "patient";
						var apptDate = new Date() ;
						var dateRangeLow = apptDate.getFullYear()+'/'+('0'+(apptDate.getMonth()+1)).slice(-2)+'/'+('0'+apptDate.getDate()).slice(-2)+' 00:00:00' ;
						var dateRangeUp = apptDate.getFullYear()+'/'+('0'+(apptDate.getMonth()+1)).slice(-2)+'/'+('0'+apptDate.getDate()).slice(-2)+' '+('0'+(apptDate.getHours()+1)).slice(-2)+':'+('0'+(apptDate.getMinutes()+1)).slice(-2)+':'+('0'+(apptDate.getSeconds()+1)).slice(-2) ;
						queryOptions.startkey = dateRangeLow ;
						queryOptions.endkey = dateRangeUp ;
						viewUrl = "_design/patient/_view/apptopenout";
						break ;		
					case 1009:
						// Get last 7 days appointment count
						// This request is a GET request
						dbName = "patient";
						queryOptions.group_level = 1 ;
						viewUrl = "_design/patient/_view/lst7appt";
						response.writeHead(200, {"Content-Type": "text/html"});
						couch.get(dbName, viewUrl, queryOptions, function (err, resData) {
							if (err)
								response.write ( JSON.stringify(err) );
							else
								response.write ( JSON.stringify(resData.data)) ;
							response.end () ;
						});
						return ;			
					case 1011:
						// Get monthly visitor count
						// This request is a GET request
						dbName = "patient";
						queryOptions.group_level = 1 ;
						viewUrl = "_design/patient/_view/lst1yrappt";
						response.writeHead(200, {"Content-Type": "text/html"});
						couch.get(dbName, viewUrl, queryOptions, function (err, resData) {
							if (err)
								response.write ( JSON.stringify(err) );
							else
								response.write ( JSON.stringify(resData.data)) ;
							response.end () ;
						});
						return ;	
					case 1012:
						// Get open appointment and admission for a patient
						var patientId = query.searchVal ;
						dbName = "patient";
						queryOptions.key = patientId ;
						viewUrl = "_design/patient/_view/patientOpenAppt";
						break ;
					case 1013:
						// Get closed appointment and admission for a patient
						var patientId = query.searchVal ;
						dbName = "patient";
						queryOptions.key = patientId ;
						viewUrl = "_design/patient/_view/patientCloseAppt";
						break ;	
					case 3001:// Get total earnings
						dbName = "bill" ;
						viewUrl = "_design/bill/_view/totEarnings"; 
						break ;
					case 3002:// Get current days earnings
						dbName = "bill" ;
						var apptDate = new Date() ;
						var dateRangeLow = apptDate.getFullYear()+'/'+('0'+(apptDate.getMonth()+1)).slice(-2)+'/'+('0'+apptDate.getDate()).slice(-2)+' 00:00:00' ;
						var dateRangeUp = apptDate.getFullYear()+'/'+('0'+(apptDate.getMonth()+1)).slice(-2)+'/'+('0'+apptDate.getDate()).slice(-2)+' 23:59:59' ;
						queryOptions.startkey = dateRangeLow ;
						queryOptions.endkey = dateRangeUp ;
						viewUrl = "_design/bill/_view/todEarnings"; 
						break ;		
					case 3003:// Get bill pdf by bill nbr
						var billNbr = query.searchVal ;
						couch.get("bill", billNbr, function (err, resData) {
							if (err || resData.data.error)
							{	
								response.write ( JSON.stringify(err) );
								response.end() ;
								return ;		
							}
							else 
							{
								getPdf ( 1 , resData.data , response ) ;
								return ;
							}	
						});
						return ; 
					case 3004:// Get case sheet pdf by case sheet number
						var caseNbr = query.searchVal ;
						couch.get("casesheet", caseNbr, function (err, resData) {
							if (err || resData.data.error)
							{	
								response.write ( JSON.stringify(err) );
								response.end() ;
								return ;		
							}
							else 
							{
								getPdf ( 2 , resData.data , response ) ;
								return ;
							}	
						});
						return ;
					case 3005:// Get discharge summary by discharge summary number
						var smryNbr = query.searchVal ;
						couch.get("summary", smryNbr, function (err, resData) {
							if (err || resData.data.error)
							{	
								response.write ( JSON.stringify(err) );
								response.end() ;
								return ;		
							}
							else 
							{
								getPdf ( 3 , resData.data , response ) ;
								return ;
							}	
						});
						return ;
					case 5001:
						//Get all doc details
						dbName = "doctor" ;
						viewUrl = "_design/doctor/_view/getDocDetails"; 
						break ;
					case 5002:
						//Get doc count 
						dbName = "doctor" ;
						viewUrl = "_design/doctor/_view/getDocCount"; 
						break ;
					case 5003:
						//Get current day doc count
						dbName = "doctor" ;
						var todaysDoc = new Date();
						queryOptions.key = todaysDoc.getDay();
						viewUrl = "_design/doctor/_view/getCurDocCount"; 
						break ;
					case 5004:
						//Add/modify doctor details	
						var query = require('url').parse(request.url,true).query;
						var jsonData = JSON.parse( query.jsonData ) ;
						var nodeCouchDB = require("node-couchdb");
						var couch = new nodeCouchDB(installDetails.dbaddress, installDetails.dbport );
						var today = new Date() ;
						var cts = today.getFullYear()+'/'+('0'+(today.getMonth()+1)).slice(-2)+'/'+('0'+today.getDate()).slice(-2)+' '+('0'+today.getHours()).slice(-2)+':'+('0'+today.getMinutes()).slice(-2)+':'+('0'+today.getSeconds()).slice(-2) ;
						var reqData = {} ;
						if (!jsonData.id)
						{	
							reqData._id = ''+(docNbrCounter + 1);
							console.log
							reqData.name = jsonData.name ;
							reqData.speciality = jsonData.speciality ;
							reqData.contact = jsonData.contact ;
							reqData.status = "active" ;
							if ( jsonData.availability.length )
							{
								reqData.availability = new Array() ;
								for ( i = 0 ; i < jsonData.availability.length ; i++ )
								{	
									var obj = {} ;
									obj.day = jsonData.availability[i].day ;
									obj.timeFrom = jsonData.availability[i].timeFrom ;
									obj.timeTo = jsonData.availability[i].timeTo ;
									reqData.availability.push(obj) ;
								}	
							}
							reqData.createTs = cts ;
							reqData.modifiedTs = cts ;	
							couch.insert( "doctor", reqData , function (err, resData) {
								if (err)
								{
									response.write ( JSON.stringify(err) );
									response.end () ;
								}	
								else
								{
									response.write ( '{"response":"Success"}' ) ;
									response.end () ;
									docNbrCounter+=1;	
								}	
								return ;
							});
						}
						else						
						{
						    couch.get("doctor", jsonData.id, function (err, resData1) {
								if (err)
								{
									response.write ( '{"response":"Unable to fetch doctor information"}' );
									response.end () ;
									return ;
								}	
								else
								{
									var respData = resData1.data ;
									respData.name = jsonData.name ;
									respData.speciality = jsonData.speciality ;
									respData.contact = jsonData.contact ;
									respData.status = jsonData.status ;
									if ( jsonData.availability.length )
									{
										respData.availability = new Array() ;
										for ( i = 0 ; i < jsonData.availability.length ; i++ )
										{	
											var obj = {} ;
											obj.day = jsonData.availability[i].day ;
											obj.timeFrom = jsonData.availability[i].timeFrom ;
											obj.timeTo = jsonData.availability[i].timeTo ;
											respData.availability.push(obj) ;
										}	
									}
									reqData.modifiedTs = cts ;	
									couch.update("doctor", respData , function (err, updateRes) {
										if (err)
											response.write ( JSON.stringify(err) );
										else
											response.write ( '{"response":"Success"}' ) ;
										response.end () ;
										return ;
									});
								}               
							});         
						}	
						return;
					case 6001:
						//Get all service details
						dbName = "service" ;
						viewUrl = "_design/service/_view/serviceInfo"; 
						break ;
					case 6002:
						//Get service count
						dbName = "service" ;
						viewUrl = "_design/service/_view/serviceId"; 
						break ;
					case 6004:
						//Add/Modify service details
						var query = require('url').parse(request.url,true).query;
						var jsonData = JSON.parse( query.jsonData ) ;
						var nodeCouchDB = require("node-couchdb");
						var couch = new nodeCouchDB(installDetails.dbaddress, installDetails.dbport );
						var today = new Date() ;
						var cts = today.getFullYear()+'/'+('0'+(today.getMonth()+1)).slice(-2)+'/'+('0'+today.getDate()).slice(-2)+' '+('0'+today.getHours()).slice(-2)+':'+('0'+today.getMinutes()).slice(-2)+':'+('0'+today.getSeconds()).slice(-2) ;
						var reqData = {} ;
						if (!jsonData.id)
						{	
							reqData._id = ''+(serviceNbrCounter + 1);
							reqData.desc = jsonData.desc ;
							reqData.isDocSpecific = jsonData.isDocSpecific ;
							reqData.defaultCost = jsonData.defaultCost ;
							reqData.createTs = cts ;
							reqData.modifiedTs = cts ;	
							couch.insert("service", reqData , function (err, resData) {
								if (err)
								{
									response.write ( JSON.stringify(err) );
									response.end () ;
								}	
								else
								{
									response.write ( '{"response":"Success"}' ) ;
									response.end () ;
									serviceNbrCounter+=1;	
								}	
								return ;
							});
						}
						else						
						{
							couch.get("service", jsonData.id , function (err, resData1) {
								if (err)
								{
									response.write ( '{"error":"Unable to fetch service information"}' );
									response.end () ;
									return ;
								}	
								else
								{
									var respData = resData1.data ;
									respData.desc = jsonData.desc ;
									respData.isDocSpecific = jsonData.isDocSpecific ;
									respData.defaultCost = jsonData.defaultCost ;
									respData.modifiedTs = cts ;	
									couch.update("service", respData , function (err, updateRes) {
										console.log (updateRes);
										if (err)
											response.write ( JSON.stringify(err) );
										else
											response.write ( '{"response":"Success"}' ) ;
										response.end () ;
										return ;
									});
								}               
							});         
						}	
						return ;
					case 9001:
						//server stop
						setTimeout(function(){ 
							server.close() ;
							process.exit() ;
						},1000) ;
						response.writeHead(200, { "Content-Type": "text/html" });
						response.write('{"response":"ok"}');
						response.end();
						return ;
					default:
						response.writeHead(404, {"Content-Type": "text/html"});
						response.end('Error 404: File not found');
						return ;
				}
				response.writeHead(200, {"Content-Type": "text/html"});
				couch.get(dbName, viewUrl, queryOptions, function (err, resData) {
				if (err)
					response.write ( JSON.stringify(err) );
				else
					response.write ( JSON.stringify(resData.data)) ;
				response.end () ;
				});
			}
			else
			{
				var inputJSON = '';
				var reqData = {} ;
				var body = '';
				request.on('data', function (data) {
					body += data;
				});
				request.on('end', function () {
					try {
						var paramArr = body.split('&') ;
						for ( i = 0 ; i < paramArr.length ; i++ )
						{
							if ( paramArr[i].search ( 'itcsdata=') != -1 )
								break ;
						}	
						if ( i>=paramArr.length )
						{
							sendResponse ( "Error" , "1000.html" , response ) ;
							return ;
						}	
						inputJSON = paramArr[i].split('=') ;
						inputJSON = unescape(inputJSON[1].replace(/\+/g," "));
						reqData = JSON.parse ( inputJSON ) ;
						
					}			
					catch (e)//TODO: Change error case
					{
						response.writeHead(200, {"Content-Type": "text/html"});
						response.end('Error : Operation failed');
					}
					switch ( urlno )
					{
						case 1002://Add/Modify patient
							updatePatient ( reqData , response ) ;	
							return ;
						case 3011://Submit and generate bill
							updatePatientDocs ( reqData , response , 1 ) ;
							return ;
						case 3012://Submit and generate case sheet
							updatePatientDocs ( reqData , response , 2 ) ;
							return ;
						case 3013://Submit and generate discharge summary
							updatePatientDocs ( reqData , response , 3 ) ;
							return ;
						default:
							response.writeHead(404, {"Content-Type": "text/html"});
							response.end('Error 404: File not found');
							break ;
					}
				});	
			}	
		}		
		else
		{
			// Read file
			var fs = require('fs');
			filename = installDetails.installdir+'/html/'+filename;
			fs.readFile(filename, 'utf8', function (err,data) {
				if (err) {
					response.writeHead(404, {"Content-Type": "text/html"});
					response.end('Error 404: File not found');
					return ;
				}
				response.writeHead(200, {"Content-Type": "text/html"});
				response.write(data);
				response.end();
			});
		}   
	} 
	else // Other than html and js files, rest of the files are image files or binary files. Place the content type accordingly and return the response
	{
		// Read file
		var fs = require('fs');
		filename = installDetails.installdir+'/images/'+filename;
		var img = ''
		try {
			img = fs.readFileSync(filename);
		}
		catch (e)
		{
			response.writeHead(404, {"Content-Type": "text/plain"});
			response.end('Error 404: File not found');
			return ;
		}
		if ( filextn == 'bmp' )
			response.writeHead(200, {"Content-Type": "image/bmp"});
		else if ( filextn == 'gif' )
			response.writeHead(200, {"Content-Type": "image/gif"});
		else if ( filextn == 'ico' )
			response.writeHead(200, {"Content-Type": "image/x-icon"});
		else if ( filextn == 'jpeg' || filextn == 'jpg' )
			response.writeHead(200, {"Content-Type": "image/jpeg"});
		else if ( filextn == 'png' )
			response.writeHead(200, {"Content-Type": "image/png"});
		else if ( filextn == 'psd' )
			response.writeHead(200, {"Content-Type": "image/vnd.adobe.photoshop"});
		else if ( filextn == 'pbm' )
			response.writeHead(200, {"Content-Type": "image/x-portable-bitmap"});
		else if ( filextn == 'tiff' )
			response.writeHead(200, {"Content-Type": "image/tiff"});
		else
			response.writeHead(200, {"Content-Type": "application/octet-stream"});
		response.end(img,'binary');
	}	  
});
server.listen(installDetails.port,installDetails.ipaddress);
console.log("Server is listening");
}, 2000);