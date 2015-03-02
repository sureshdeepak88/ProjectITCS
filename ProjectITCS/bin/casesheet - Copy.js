var MARGIN = 20;
var brdrMARGIN = 10;
var xyMinPos = 0;
var xMaxPos = 612;
var yMaxPos = 792;
//A4 Paper Size X & Y Max Position
var xBrdrMaxPos = xMaxPos - brdrMARGIN;
var yBrdrMaxPos = yMaxPos - brdrMARGIN;
var brdrMARGIN1 = brdrMARGIN + 1;
var headerEnd = 80;
var ptIndentLrg = 20;
var ptIndentNrm = 10;
var ptIndentSml = 5;
var LESSINDENT = 0.75;
var NORMINDENT = 1;
var XTRALARGE = 24;
var LARGE = 11;
var NORM = 10;
var SMALL = 9;
var BLACK = 'black';
var BLUE = '#211A90';
var GREY = '#68848C';
var R = 'right';
var L = 'left';
var C = 'center';
var SEP = ':';

function dateFrmtr(dt)
{
    var d = new Date(dt)
    return ('0' + d.getDate()).slice(-2) + '-' + ( '0' + (d.getMonth() + 1)).slice(-2) + '-' + d.getFullYear() + ' ' + ( '0' + d.getHours()).slice(-2) + ':' + ( '0' + d.getMinutes()).slice(-2)
}

function addDataAlgn(doc, text, fSize, fName, fColor, alignment) {
    doc.font(fName);
    doc.fontSize(fSize);
    doc.fillColor(fColor);
    doc.text(text, { align: alignment });
}

function addDataAxis(doc, text, fSize, fName, fColor, x, y, tWidth, tAlign, tHeight) {
    doc.font(fName);
    doc.fontSize(fSize);
    doc.fillColor(fColor);
    doc.text(text, x, y, { width: tWidth, height: tHeight, align: tAlign });
}

function drawBorder(color) {
    doc.moveTo(brdrMARGIN, brdrMARGIN);
    doc.lineTo(xBrdrMaxPos, brdrMARGIN);
    doc.lineTo(xBrdrMaxPos, yBrdrMaxPos);
    doc.lineTo(brdrMARGIN, yBrdrMaxPos);
    doc.lineTo(brdrMARGIN, brdrMARGIN);
    doc.lineTo(brdrMARGIN1, brdrMARGIN);
    doc.strokeColor();
    doc.stroke(color);
}

function hzntlLine(x, y, color) {
    doc.moveTo(x, y);
    doc.lineTo(xBrdrMaxPos, y);
    doc.stroke(color);
    doc.stroke();
}

function vertLine(xStatic, yStart, yStop, color) {
    if (!yStop)
    {
        yStop = yBrdrMaxPos;
    }
    doc.moveTo(xStatic, yStart);
    doc.lineTo(xStatic, yStop);
    doc.stroke(color);
    doc.stroke();
}

function addHeader(HOME, BLD, yAxisPtr, color) {
    drawBorder(color);
    doc.image(HOME + 'images/SRHLogoOrg.png', 30, 20, { width: 50 }, { height: 50 });
    doc.moveUp(4 * NORMINDENT);
    addDataAlgn(doc, 'SRI RAGHAVENDRA HOSPITAL', XTRALARGE, BLD, color, C);
    addDataAlgn(doc, '#87/52A, North Park Street, Ambattur, Chennai - 600053', SMALL, BLD, color, C);
    addDataAlgn(doc, 'Phone : 6564 9029 / 2657 1500', SMALL, BLD, color, C);
    hzntlLine(brdrMARGIN, yAxisPtr, color);
    yAxisPtr += ptIndentSml;
    return yAxisPtr;
}

function addCaseData(HOME, REG, ITL, BLD, ctext, cdata, xAxis, yAxis, lineSpace)
{
    if (ctext.length)
    {
        addDataAxis(doc, ctext, LARGE, BLD, BLACK, xAxis + brdrMARGIN, yAxis, xAxis + 200, L);
        addDataAxis(doc, SEP, LARGE, BLD, BLACK, xAxis + (2 * brdrMARGIN) + 200, yAxis, 4, C);
    }
    addDataAxis(doc, cdata, LARGE, REG, BLACK, MARGIN + xAxis + (3 * brdrMARGIN) + 200 + 4, yAxis, 350, L);
    yAxis += lineSpace;
    return yAxis;
}
function createCaseSheet(installdir,reqData,response)
	{
		PDFDocument = require('pdfkit');
		doc = new PDFDocument({ margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } });
		var fs = require('fs');
		var HOME = installdir;
		var FONT_CLASS = HOME + 'html/fonts/OpenSans-';
		var REG = FONT_CLASS + 'Regular.ttf';
		var ITL = FONT_CLASS + 'Italic.ttf';
		var BLD = FONT_CLASS + 'Bold.ttf';
		var BLDITL = FONT_CLASS + 'BoldItalic.ttf'
		var xAxisPtr = brdrMARGIN;
		var yAxisPtr = headerEnd;
		yAxisPtr = addHeader(HOME, BLD, yAxisPtr, GREY);
		addDataAxis(doc, 'CASE SHEET', 16, BLD, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, xMaxPos - (4 * brdrMARGIN), C);
		xAxisPtr = MARGIN + brdrMARGIN;
		yAxisPtr += (ptIndentLrg + ptIndentSml);
		yAxisPtr += (ptIndentLrg + ptIndentSml);
		yAxisPtr = addCaseData(HOME, REG, ITL, BLD, 'IP. No.', 'IP' + reqData.patientNbr, xAxisPtr, yAxisPtr, (ptIndentLrg + ptIndentNrm));
		yAxisPtr = addCaseData(HOME, REG, ITL, BLD, 'Name', reqData.name, xAxisPtr, yAxisPtr, (ptIndentLrg + ptIndentNrm));
		yAxisPtr = addCaseData(HOME, REG, ITL, BLD, 'Age', reqData.age + ' Yrs', xAxisPtr, yAxisPtr, (ptIndentLrg + ptIndentNrm));
		yAxisPtr = addCaseData(HOME, REG, ITL, BLD, 'Gender', reqData.sex == 'M' ? 'Male' : 'Female' , xAxisPtr, yAxisPtr, (ptIndentLrg + ptIndentNrm));
		yAxisPtr = addCaseData(HOME, REG, ITL, BLD, 'Address', reqData.addressLine1, xAxisPtr, yAxisPtr, ptIndentLrg);
		yAxisPtr = addCaseData(HOME, REG, ITL, BLD, '', reqData.addressLine2, xAxisPtr, yAxisPtr, ptIndentLrg);
		yAxisPtr = addCaseData(HOME, REG, ITL, BLD, '', reqData.city + ' - ' + reqData.pin, xAxisPtr, yAxisPtr, (ptIndentLrg + ptIndentNrm));
		yAxisPtr = addCaseData(HOME, REG, ITL, BLD, 'Admission Time', dateFrmtr(reqData.apptDate), xAxisPtr, yAxisPtr, (ptIndentLrg + ptIndentNrm));
		yAxisPtr = addCaseData(HOME, REG, ITL, BLD, 'Operation Time', dateFrmtr(reqData.surgeryDate), xAxisPtr, yAxisPtr, (ptIndentLrg + ptIndentNrm));
		yAxisPtr = addCaseData(HOME, REG, ITL, BLD, 'Discharge Time', dateFrmtr(reqData.dischargeDate), xAxisPtr, yAxisPtr, (ptIndentLrg + ptIndentNrm));
		for (var i = 0; i < reqData.doc.length ; i++)
		{
			if (!i)
			{
				yAxisPtr = addCaseData(HOME, REG, ITL, BLD, 'Case Seen by Doctor(s)', reqData.doc[i].name, xAxisPtr, yAxisPtr, ptIndentLrg);
			}
			else if (i == reqData.doc.length)
			{
				yAxisPtr = addCaseData(HOME, REG, ITL, BLD, '', reqData.doc[i].name, xAxisPtr, yAxisPtr, (ptIndentLrg + ptIndentNrm));
			}
			else
			{
				yAxisPtr = addCaseData(HOME, REG, ITL, BLD, '', reqData.doc[i].name, xAxisPtr, yAxisPtr, ptIndentLrg);
			}
		}
		yAxisPtr = addCaseData(HOME, REG, ITL, BLD, 'Diagnosis', reqData.briefDiag, xAxisPtr, yAxisPtr, (ptIndentLrg + ptIndentNrm));
		doc.pipe(response);
		doc.end();
	}



jsonVal = {
  name         : "Radhika Sangaralingam",
  patientNbr	: 3234,
  age          : 101,
  sex          : "F",
  addressLine1 : "23/125, Kanniah Chetty Street,",
  addressLine2 : "Venkatapuram, Ambattur",
  city         : "Chennai",
  pin          : 600053,
  apptDate      : "2015/02/19 08:45:00",
  surgeryDate    : "2015/02/22 11:05:00",
  dischargeDate       : "2015/02/25 18:20:00",
  doc          : [
                  {
                    name : "Rajini Kanth"
                  },
                  {
                    name : "Ram Gopal"
                  },
                  {
                    name : "Lalitha"
                  }],
  briefDiag    : "Mild Cardiac Arrest"
}
var http = require("http");
// Start the http server
var server = http.createServer(function(request, response) {
	createCaseSheet ("D:/ProjectITCS/" , jsonVal , response ) ;
});
server.listen(8081,"127.0.0.1");
console.log("Server is listening");