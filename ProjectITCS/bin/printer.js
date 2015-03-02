/*var printer = require("printer"),
    util = require('util'),
    printerName = 'HP LaserJet P1007',
    printerFormat = 'TEXT';

printer.printDirect({
    data:new Buffer("I will be written","utf8"), // or simple String: "some text"
	printer:printerName, // printer name
	type: printerFormat, // type: RAW, TEXT, PDF, JPEG, .. depends on platform
	success:function(jobID){
		console.log("Job sent with ID: " + jobID) 
		var jobInfo = printer.getJob(printerName, jobID)
		console.log("Job info:" + JSON.stringify(jobInfo, null, 2))
		/*console.log("sent to printer with ID: "+jobID);
        var jobInfo = printer.getJob(printerName, jobID);
        console.log("current job info:"+util.inspect(jobInfo, {depth: 10, colors:true}));
        if(jobInfo.status.indexOf('PRINTED') !== -1)
        {
            console.log('too late, already printed');
            return;
        }
        console.log('cancelling...');
        var is_ok = printer.setJob(printerName, jobID, 'CANCEL');
		console.log("cancelled: "+is_ok);
		try{
			console.log("current job info:"+util.inspect(printer.getJob(printerName, jobID), {depth: 10, colors:true}));
		}catch(err){
			console.log('job deleted. err:'+err);
		}*/
	/*},
	error:function(err){console.log(err);}
});*/

var printer = require("printer");
var printerName = "HP LaserJet P1007" ;

console.log("---------------------")
console.log(printer. getPrinter(printerName))