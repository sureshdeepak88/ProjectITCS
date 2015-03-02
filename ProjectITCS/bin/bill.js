var MARGIN = 20;
var brdrMARGIN = 10;
var xyMinPos = 0;
var xMaxPos = 612;
var yMaxPos = 792;
//A4 Paper Size X & Y Max Position
var xBrdrMaxPos = xMaxPos - brdrMARGIN;
var yBrdrMaxPos = yMaxPos - MARGIN;
var brdrMARGIN1 = brdrMARGIN + 1;
var particularsPosX = MARGIN;
var particularsCap = 350;
var amtPosX = 360;
var amtCap = 70;
var qtyPosX = 430;
var qtyCap = 70;
var totalPosX = 500;
var totalsCap = 90;
var partStart = 185;
var partStartIn = 225;
var partEnd = 715;
var ptIndentLrg = 20;
var ptIndentNrm = 10;
var ptIndentSml = 5;
var LESSINDENT = 0.75;
var NORMINDENT = 1;
var noOfSrvs = 24;
var LARGE = 24;
var NORM = 10;
var SMALL = 9;
var BLACK = 'black';
var BLUE = '#211A90';
var GREY = '#68848C';
var R = 'right';
var L = 'left';
var C = 'center';
var today = new Date();
date = ('0' + today.getDate()).slice(-2) + '/' + ('0' + (today.getMonth() + 1)).slice(-2) + '/' + today.getFullYear();

function addDataAlgn (doc,text,fSize,fName,fColor,alignment)
{
    doc.font(fName);
    doc.fontSize(fSize);
    doc.fillColor(fColor);
    doc.text(text,{align:alignment});
}

function addDataAxis(doc, text, fSize, fName, fColor, x, y, tWidth, tAlign, tHeight)
{
    doc.font(fName);
    doc.fontSize(fSize);
    doc.fillColor(fColor);
    doc.text(text, x, y,{width:tWidth,height:tHeight,align:tAlign});
}

function drawBorder ()
{
    doc.moveTo(brdrMARGIN, brdrMARGIN);
    doc.lineTo(xBrdrMaxPos, brdrMARGIN);
    doc.lineTo(xBrdrMaxPos, yBrdrMaxPos);
    doc.lineTo(brdrMARGIN, yBrdrMaxPos);
    doc.lineTo(brdrMARGIN, brdrMARGIN);
    doc.lineTo(brdrMARGIN1, brdrMARGIN);
	doc.strokeColor() ;
    doc.stroke(BLUE);
}

function hzntlLine (x,y)
{
    doc.moveTo(x, y);
    doc.lineTo(xBrdrMaxPos, y);
    doc.stroke(BLUE);
    doc.stroke();
}

function vertLine(x, y) {
    doc.moveTo(x, y);
    doc.lineTo(x, yBrdrMaxPos);
    doc.stroke(BLUE);
    doc.stroke();
}

function addHeader(dataFrmRqstPrs, HOME, REG, ITL, BLD)
{
    drawBorder();
    doc.image(HOME + 'images/SRHLogoOrg.png', 30, 30, { width: 50 }, { height: 50 });
    addDataAlgn(doc, 'SRI RAGHAVENDRA HOSPITAL', LARGE, BLD, BLUE, C);
    addDataAlgn(doc, '#87/52A, North Park Street, Ambattur, Chennai - 600053', SMALL, BLD, BLUE, C);
    addDataAlgn(doc, 'Phone : 6564 9029 / 2657 1500', SMALL, BLD, BLUE, C);
    doc.moveDown(LESSINDENT);
    addDataAlgn(doc, 'Bill No.  : ' + dataFrmRqstPrs.nbr, NORM, REG, BLACK, L);
    doc.moveUp(NORMINDENT);
    addDataAlgn(doc, 'Date: ' + date, NORM, REG, BLACK, R);
    doc.moveDown(LESSINDENT);
    dataFrmRqstPrs.apptDate = '01/02/2015 13:00:00';
    dataFrmRqstPrs.surgeryDate = '04/02/2015 10:30:00';
    dataFrmRqstPrs.dischargeDate = '08/02/2015 09:00:00';
    if (dataFrmRqstPrs.type == 'IN')
    {
        addDataAlgn(doc, 'Admission Time: ' + dataFrmRqstPrs.apptDate, NORM, REG, BLACK, R);
        doc.moveDown(LESSINDENT);
        addDataAlgn(doc, 'Name    : ' + dataFrmRqstPrs.name, NORM, REG, BLACK, L);
        doc.moveUp(NORMINDENT);
        addDataAlgn(doc, 'Operation Time: ' + dataFrmRqstPrs.surgeryDate, NORM, REG, BLACK, R);
        doc.moveDown(LESSINDENT);
        addDataAlgn(doc, 'IP. No.   : ' + 'IP' + dataFrmRqstPrs.patientNbr, NORM, REG, BLACK, L);
        doc.moveUp(NORMINDENT);
        addDataAlgn(doc, 'Discharge Time: ' + dataFrmRqstPrs.dischargeDate, NORM, REG, BLACK, R);
    }
    else
    {
        doc.moveDown(NORMINDENT);
        doc.moveDown(LESSINDENT);
        addDataAlgn(doc, 'Name    : ' + dataFrmRqstPrs.name, NORM, REG, BLACK, L);
        doc.moveUp(NORMINDENT);
        doc.moveDown(NORMINDENT);
        doc.moveDown(LESSINDENT);
        addDataAlgn(doc, 'OP. No. : ' + 'OP' + dataFrmRqstPrs.patientNbr, NORM, REG, BLACK, L);
        doc.moveUp(NORMINDENT);
    }
    var yAxisPtr = partStart;
    var xAxisPtr = particularsCap;
    hzntlLine(brdrMARGIN, yAxisPtr);
    vertLine(xAxisPtr, yAxisPtr);
    xAxisPtr += amtCap;
    vertLine(xAxisPtr, yAxisPtr);
    xAxisPtr += qtyCap;
    vertLine(xAxisPtr, yAxisPtr);
    yAxisPtr += ptIndentNrm;
    yAxisPtr += ptIndentSml;
    addDataAxis(doc, 'Particulars', SMALL, BLD, BLACK, particularsPosX, yAxisPtr, particularsCap - MARGIN - brdrMARGIN, C);
    addDataAxis(doc, 'Charges', SMALL, BLD, BLACK, amtPosX, yAxisPtr, amtCap - (2 * brdrMARGIN), C);
    addDataAxis(doc, 'Qty/Days', SMALL, BLD, BLACK, qtyPosX, yAxisPtr, qtyCap - (2 * brdrMARGIN), C);
    addDataAxis(doc, 'Totals (Rs.)', SMALL, BLD, BLACK, totalPosX, yAxisPtr, xMaxPos - xAxisPtr - MARGIN - brdrMARGIN, C);
    yAxisPtr += ptIndentLrg;
    yAxisPtr += ptIndentSml;
    hzntlLine(brdrMARGIN, yAxisPtr);
}

module.exports = 
{
    createBill: function (installdir,dataFrmRqstPrs,response)
    {
        PDFDocument = require('pdfkit');
        doc = new PDFDocument({ margins: { top: MARGIN, bottom: 0, left: MARGIN, right: MARGIN } });
        var fs = require('fs');
        var HOME = installdir;
        var FONT_CLASS = HOME + 'html/fonts/OpenSans-';
        var REG = FONT_CLASS + 'Regular.ttf';
        var ITL = FONT_CLASS + 'Italic.ttf';
        var BLD = FONT_CLASS + 'Bold.ttf';
        var yAxisPtr = partStartIn;
        var xAxisPtr = particularsCap;
        xAxisPtr += amtCap;
        xAxisPtr += qtyCap;
        var totPageNo = Math.ceil(dataFrmRqstPrs.billDetail.length / noOfSrvs, 0);
        var currPageNo = 0;
        addHeader(dataFrmRqstPrs, HOME, REG, ITL, BLD);
        yAxisPtr += ptIndentNrm;
		for (var i = 0 ; i < dataFrmRqstPrs.billDetail.length ; i++)
		{
		    addDataAxis(doc, dataFrmRqstPrs.billDetail[i].particulars, NORM, REG, BLACK, particularsPosX, yAxisPtr, particularsCap - MARGIN - brdrMARGIN, L);
		    addDataAxis(doc, dataFrmRqstPrs.billDetail[i].amt, NORM, REG, BLACK, amtPosX, yAxisPtr, amtCap - (2 * brdrMARGIN), R);
		    addDataAxis(doc, dataFrmRqstPrs.billDetail[i].qty, NORM, REG, BLACK, qtyPosX, yAxisPtr, qtyCap - (2 * brdrMARGIN), R);
		    addDataAxis(doc, dataFrmRqstPrs.billDetail[i].tot, NORM, REG, BLACK, totalPosX, yAxisPtr, xMaxPos - xAxisPtr - MARGIN - brdrMARGIN, R);
		    yAxisPtr += ptIndentLrg;
		    if (yAxisPtr == partEnd && totPageNo > 1)
		    {
		        currPageNo += 1;
		        yAxisPtr += ptIndentLrg;
		        addDataAxis(doc, 'Page ' + currPageNo + ' out of ' + totPageNo, NORM, ITL, BLACK, particularsPosX, yAxisPtr, particularsCap - MARGIN - brdrMARGIN, C);
		        yAxisPtr += ptIndentLrg;
		        yAxisPtr += ptIndentLrg;
		        addDataAxis(doc, '24 X 7 Services, Lab Service, Pharmacy, X-Ray, ECG, Ultra Sound Scan', SMALL, BLD, BLUE, xyMinPos, yAxisPtr, xMaxPos, C);
		        doc.addPage({ margins: { top: MARGIN, bottom: 0, left: MARGIN, right: MARGIN } });
		        addHeader(dataFrmRqstPrs, HOME, REG, ITL, BLD);
		        yAxisPtr = partStartIn;
		        yAxisPtr += ptIndentNrm;
		        addDataAxis(doc, 'Continued from Page ' + currPageNo, NORM, ITL, BLACK, particularsPosX, yAxisPtr, particularsCap - MARGIN - brdrMARGIN, C);
                yAxisPtr += ptIndentLrg;
		    }
		}
        //If Position is less than 715 (partEnd) it means Services were less than 24 for the given page
		if (yAxisPtr < partEnd)
		    yAxisPtr = partEnd;
        //Footer Block
		{
		    hzntlLine(brdrMARGIN, yAxisPtr);
		    yAxisPtr += 2;
		    addDataAxis(doc, 'For SRI RAGHAVENDRA HOSPITAL', NORM, REG, BLACK, particularsPosX, yAxisPtr, particularsCap - MARGIN - brdrMARGIN, L);
		    yAxisPtr += 3;
		    yAxisPtr += ptIndentNrm;
		    yAxisPtr += ptIndentSml;
		    addDataAxis(doc, 'Total (Rs.)', SMALL, BLD, BLACK, qtyPosX, yAxisPtr, qtyCap - (2 * brdrMARGIN), C);
		    addDataAxis(doc, dataFrmRqstPrs.earnings, NORM, REG, BLACK, totalPosX, yAxisPtr, xMaxPos - xAxisPtr - MARGIN - brdrMARGIN, R);
		    yAxisPtr += ptIndentLrg;
		    addDataAxis(doc, 'Authorised Signatory', NORM, REG, BLACK, particularsPosX, yAxisPtr, particularsCap - MARGIN - brdrMARGIN, L);
		    yAxisPtr += ptIndentLrg;
		    addDataAxis(doc, '24 X 7 Services, Lab Service, Pharmacy, X-Ray, ECG, Ultra Sound Scan', SMALL, BLD, BLUE, xyMinPos, yAxisPtr, xMaxPos, C);
		}
		doc.pipe(response);
		doc.end();
	}
}