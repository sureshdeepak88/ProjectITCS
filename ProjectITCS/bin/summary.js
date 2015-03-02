var MARGIN = 20;
var brdrMARGIN = 10;
var xyMinPos = 0;
var xMaxPos = 612;
var yMaxPos = 792;
//A4 Paper Size X & Y Max Position
var xBrdrMaxPos = xMaxPos - brdrMARGIN;
var yBrdrMaxPos = yMaxPos - brdrMARGIN;
var brdrMARGIN1 = brdrMARGIN + 1;
var shiftOneColn = 197.3333;
var shiftTwoColn = 2 * 197.3333;
var rowWidth = 177.3333;
var headerEnd = 80;
var ptIndentLrg = 20;
var ptIndentNrm = 10;
var ptIndentSml = 5;
var LESSINDENT = 0.75;
var NORMINDENT = 1;
var noOfSrvs = 24;
var LARGE = 16;
var XTRALARGE = 24;
var NORM = 10;
var SMALL = 9;
var BLACK = 'black';
var BLUE = '#211A90';
var GREY = '#68848C';
var R = 'right';
var L = 'left';
var C = 'center';
var enclosedEnum = { BLOOD: 0, ECG: 1, XRAY: 2, ULTRA: 3, URINE: 4, HEMO: 5, USG: 6, ECHO: 7, CTMRI: 8, STOOL: 9, WBC: 10, MISC: 11 };
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

function displayCheckBox(HOME, xAxisPtr, yAxisPtr, ctype)
{
    if (ctype == 'CHECK')
    {
        CHECKBOX = HOME + 'images/CheckBox-Checked.png'
    }
    else
    {
        CHECKBOX = HOME + 'images/CheckBox-UnChecked.png'
    }
    doc.image(CHECKBOX, xAxisPtr + brdrMARGIN, yAxisPtr, { width: 20 }, { height: 20 });
}

function addCaseData(REG, ctext, cdata, uom, xAxis, yAxis, xWidth)
{
    if (ctext.length)
    {
        addDataAxis(doc, ctext, NORM, REG, BLACK, xAxis, yAxis, xWidth, L);
        addDataAxis(doc, SEP, NORM, REG, BLACK, xAxis + xWidth, yAxis, 4, C);
    }
    if (ctext == 'BP')
        addDataAxis(doc, (cdata != '/' ? (' ' + cdata).slice(-7) : '---/---') + ' ' + uom, NORM, REG, BLACK, xAxis + xWidth + 4 + 10, yAxis, 90, L);
    else
        addDataAxis(doc, (cdata != 0 ? (' ' + cdata).slice(-3) : '---' ) + ' ' + uom, NORM, REG, BLACK, xAxis + xWidth + 4 + 10, yAxis, 90, L);
}

function addParagraph (ptext, xAxis, yAxis, REG)
{
    if (!ptext.length)
    {
        yAxis += ptIndentNrm;
        addDataAxis(doc, '-NA-', NORM, REG, BLACK, xAxis + brdrMARGIN, yAxis, (xMaxPos - (2 * (xAxis + brdrMARGIN))), C);
        yAxis += ((2 * ptIndentLrg + ptIndentNrm) - ptIndentNrm);
    }
    else
    {
        addDataAxis(doc, ptext, NORM, REG, BLACK, xAxis + brdrMARGIN, yAxis, (xMaxPos - (2 * (xAxis + brdrMARGIN))), L);
        yAxis += (2 * ptIndentLrg + ptIndentNrm);
    }
    return yAxis;
}

function checkBoxData (cbtext, cbdata, HOME, xAxis, yAxis, REG)
{
    displayCheckBox(HOME, xAxis, yAxis, cbdata == 'C' ? 'CHECK' : 'UNCHECK');
    xAxis += 30;
    yAxis += ptIndentSml;
    addDataAxis(doc, cbtext, NORM, REG, BLACK, xAxis + brdrMARGIN, yAxis, xMaxPos - xAxis - (3 * brdrMARGIN), L);
    yAxis -= ptIndentSml;
    xAxis -= 30;
}

module.exports = 
{
    createSummary: function (installdir,disch,response)
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
		addDataAxis(doc, 'DISCHARGE SUMMARY', LARGE, BLD, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, xMaxPos - (4 * brdrMARGIN), C);
		addDataAxis(doc, 'Page 1 of 2', NORM, ITL, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, xMaxPos - (4 * brdrMARGIN), R);
		yAxisPtr += (ptIndentLrg + ptIndentSml);
		//BLOCK1
		{

			xAxisPtr = brdrMARGIN;
			addDataAxis(doc, 'IP. No.   : ' + 'IP' + disch.patientNbr, NORM, REG, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, rowWidth, L);
			xAxisPtr += shiftTwoColn;
			addDataAxis(doc, 'Admission Time : ' + dateFrmtr(disch.apptDate), NORM, REG, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, rowWidth, L);
			xAxisPtr = brdrMARGIN;
			yAxisPtr += (ptIndentLrg + ptIndentNrm);
			addDataAxis(doc, 'Name    : ' + disch.name, NORM, REG, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, rowWidth, L);
			xAxisPtr += shiftOneColn;
			addDataAxis(doc, 'Age          : ' + disch.age + ' Yrs', NORM, REG, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, rowWidth, L);
			xAxisPtr += shiftOneColn;
			addDataAxis(doc, 'Operation Time : ' + dateFrmtr(disch.surgeryDate), NORM, REG, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, rowWidth, L);
			xAxisPtr = brdrMARGIN;
			yAxisPtr += (ptIndentLrg + ptIndentNrm);
			addDataAxis(doc, 'Gender : ' + (disch.sex == 'M' ? 'Male' : 'Female') , NORM, REG, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, rowWidth, L);
			xAxisPtr += shiftOneColn;
			addDataAxis(doc, 'Weight    : ' + disch.weight + ' Kgs', NORM, REG, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, rowWidth, L);
			xAxisPtr += shiftOneColn;
			addDataAxis(doc, 'Discharge Time : ' + dateFrmtr(disch.dischargeDate), NORM, REG, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, rowWidth, L);
			xAxisPtr = brdrMARGIN;
			yAxisPtr += (ptIndentLrg + ptIndentNrm);
			xAxisPtr = brdrMARGIN;
			addDataAxis(doc, 'FIR No.  : ' + disch.firNbr, NORM, REG, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, rowWidth, L);
			xAxisPtr += shiftOneColn;
			addDataAxis(doc, 'MLC No.  : ' + disch.mlcNbr, NORM, REG, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, rowWidth, L);
			xAxisPtr += shiftOneColn;
			addDataAxis(doc, 'Blood Group      : ' + disch.bloodGrp, NORM, REG, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, rowWidth, L);
			yAxisPtr += ptIndentLrg;
			hzntlLine(brdrMARGIN, yAxisPtr, GREY);
		}
		//BLOCK2
		{
			yAxisPtr += ptIndentSml;
			xAxisPtr = brdrMARGIN;
			addDataAxis(doc, 'Consultant/Doctor Details', NORM, BLD, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, (xMaxPos - (2 * (xAxisPtr + brdrMARGIN))), L);
			yAxisPtr += ptIndentLrg;
			if (disch.doc.length <= 3)
			{
				for (var i = 0; i < disch.doc.length; i++)
				{
					xAxisPtr = brdrMARGIN;
					addDataAxis(doc, (i + 1) + '. ' + 'Name : Dr ' + disch.doc[i].name, NORM, REG, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, rowWidth, L);
					xAxisPtr += shiftOneColn;
					addDataAxis(doc, 'Specialisation : ' + disch.doc[i].speciality, NORM, REG, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, rowWidth, L);
					xAxisPtr += shiftOneColn;
					addDataAxis(doc, 'Ph : ' + disch.doc[i].contactNbr, NORM, REG, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, rowWidth, L);
					yAxisPtr += ptIndentLrg;
				}
				if ( i < 3)
				{
					yAxisPtr += ((3 - i) * ptIndentLrg);
				}
			}
			else
			{
				for (var i = 0; i < disch.doc.length ; i++)
				{
					if (i == 0) 
					{
						xAxisPtr = brdrMARGIN;
					}
					else if (i % 3 == 0) 
					{
						yAxisPtr += ptIndentLrg;
						xAxisPtr = brdrMARGIN;
					}
					else 
					{
						xAxisPtr += shiftOneColn;
					}
					addDataAxis(doc, (i + 1) + '. Dr ' + disch.doc[i].name, NORM, REG, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, rowWidth, L);
				}
				if (i < 9)
				{
					yAxisPtr += (((9 / 3) - Math.ceil(i / 3)) * ptIndentLrg);
				}
				yAxisPtr += (ptIndentLrg + ptIndentNrm);
			}
			hzntlLine(brdrMARGIN, yAxisPtr, GREY);
		}
		//BLOCK3 Diagnosis and On Examination
		{
			xAxisPtr = brdrMARGIN;
			vertLine((xMaxPos / 2), yAxisPtr, yAxisPtr + ptIndentSml + (6 * ptIndentLrg), GREY);
			yAxisPtr += ptIndentSml;
			addDataAxis(doc, 'Key findings, on physical examination', NORM, BLD, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, (xMaxPos - (2 * (xAxisPtr + brdrMARGIN))), L);
			xAxisPtr += ((xMaxPos / 2) - brdrMARGIN);
			addDataAxis(doc, 'Examination results', NORM, BLD, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, xMaxPos - xAxisPtr - (3 * brdrMARGIN), L);
			xAxisPtr = brdrMARGIN;
			yAxisPtr += ptIndentLrg;
			addDataAxis(doc, disch.keyFindings, NORM, REG, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, ((xMaxPos - (2 * (xAxisPtr + brdrMARGIN)) - brdrMARGIN) / 2), L);
			xAxisPtr += ((xMaxPos / 2) - brdrMARGIN);
			addCaseData(REG, 'BP', disch.bp[0].min + '/' + disch.bp[0].max, ' mm Hg', xAxisPtr + brdrMARGIN, yAxisPtr, 30);
			xAxisPtr += ((xMaxPos / 4) - brdrMARGIN);
			addCaseData(REG, 'Temp',  disch.temp ,' \u00B0 F', xAxisPtr + brdrMARGIN, yAxisPtr, 50);
			xAxisPtr -= ((xMaxPos / 4) - brdrMARGIN);
			yAxisPtr += ptIndentLrg;
			addCaseData(REG, 'PR',  disch.pr ,' bpm', xAxisPtr + brdrMARGIN, yAxisPtr, 30);
			xAxisPtr += ((xMaxPos / 4) - brdrMARGIN);
			addCaseData(REG, 'RR',  disch.rr , ' bpm', xAxisPtr + brdrMARGIN, yAxisPtr, 50);
			yAxisPtr += ptIndentLrg;
			xAxisPtr -= ((xMaxPos / 4) - brdrMARGIN);
			addCaseData(REG, 'CVS',  disch.cvs,'', xAxisPtr + brdrMARGIN, yAxisPtr, 30);
			xAxisPtr += ((xMaxPos / 4) - brdrMARGIN);
			addCaseData(REG, 'Abdomen',  disch.ab, '', xAxisPtr + brdrMARGIN, yAxisPtr, 50);
			yAxisPtr += ptIndentLrg;
			xAxisPtr -= ((xMaxPos / 4) - brdrMARGIN);
			addCaseData(REG, 'CNS',  disch.cns, '',xAxisPtr + brdrMARGIN, yAxisPtr, 30);
			xAxisPtr += ((xMaxPos / 4) - brdrMARGIN);
			addCaseData(REG, 'Gyn/PR',  disch.gynaecPr, '',xAxisPtr + brdrMARGIN, yAxisPtr, 50);
			yAxisPtr += ptIndentLrg;
			xAxisPtr -= ((xMaxPos / 4) - brdrMARGIN);
			addCaseData(REG, 'RS', disch.rs, '',xAxisPtr + brdrMARGIN, yAxisPtr, 30);
			yAxisPtr += ptIndentLrg;
			hzntlLine(brdrMARGIN, yAxisPtr, GREY);
			yAxisPtr += ptIndentSml;
		}
		//BLOCK4
		{
			xAxisPtr = brdrMARGIN;
			addDataAxis(doc, 'ICD-10 Code(s) : ', NORM, BLD, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, (xMaxPos - (2 * (xAxisPtr + brdrMARGIN))), L);
			xAxisPtr += 90;
			addDataAxis(doc, disch.icd10Cd, NORM, REG, BLACK, xAxisPtr, yAxisPtr, (xMaxPos - (2 * (brdrMARGIN + brdrMARGIN))), L);
			yAxisPtr += ptIndentLrg;
			hzntlLine(brdrMARGIN, yAxisPtr, GREY);
		}
		//BLOCK5
		{
			xAxisPtr = brdrMARGIN;
			yAxisPtr += ptIndentSml;
			addDataAxis(doc, 'Provisional Diagnosis at the time of Admission', NORM, BLD, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, (xMaxPos - (2 * (xAxisPtr + brdrMARGIN))), L);
			yAxisPtr += ptIndentLrg;
			yAxisPtr = addParagraph(disch.initDiag, xAxisPtr, yAxisPtr, REG);
			addDataAxis(doc, 'Presenting Complaints with Duration and Reason for Admission', NORM, BLD, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, (xMaxPos - (2 * (xAxisPtr + brdrMARGIN))), L);
			yAxisPtr += ptIndentLrg;
			yAxisPtr = addParagraph(disch.presentingCmplts, xAxisPtr, yAxisPtr, REG);
			addDataAxis(doc, 'Summary of Presenting Illness', NORM, BLD, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, (xMaxPos - (2 * (xAxisPtr + brdrMARGIN))), L);
			yAxisPtr += ptIndentLrg;
			yAxisPtr = addParagraph(disch.presentingIllness, xAxisPtr, yAxisPtr, REG);
			hzntlLine(brdrMARGIN, yAxisPtr, GREY);
		}
		//BLOCK6
		{
			xAxisPtr = brdrMARGIN;
			yAxisPtr += ptIndentSml;
			addDataAxis(doc, 'Investigations enclosed', NORM, BLD, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, xMaxPos - xAxisPtr - (3 * brdrMARGIN), L);
			xAxisPtr += ((xMaxPos / 2) - brdrMARGIN);
			yAxisPtr += (ptIndentLrg + ptIndentSml);
			xAxisPtr = brdrMARGIN;
			checkBoxData('Blood Report', disch.investEncl[enclosedEnum.BLOOD], HOME, xAxisPtr, yAxisPtr, REG);
			xAxisPtr += ((xMaxPos / 4) - brdrMARGIN);
			checkBoxData('X-Ray', disch.investEncl[enclosedEnum.XRAY], HOME, xAxisPtr, yAxisPtr, REG);
			xAxisPtr = brdrMARGIN;
			xAxisPtr += ((xMaxPos / 2) - brdrMARGIN);
			checkBoxData('USG', disch.investEncl[enclosedEnum.USG], HOME, xAxisPtr, yAxisPtr, REG);
			xAxisPtr += ((xMaxPos / 4) - brdrMARGIN);
			checkBoxData('Echo', disch.investEncl[enclosedEnum.ECHO], HOME, xAxisPtr, yAxisPtr, REG);
			yAxisPtr += ptIndentLrg;
			xAxisPtr = brdrMARGIN;
			checkBoxData('ECG', disch.investEncl[enclosedEnum.ECG], HOME, xAxisPtr, yAxisPtr, REG);
			xAxisPtr += ((xMaxPos / 4) - brdrMARGIN);
			checkBoxData('UltraSonic', disch.investEncl[enclosedEnum.ULTRA], HOME, xAxisPtr, yAxisPtr, REG);
			xAxisPtr = brdrMARGIN;
			xAxisPtr += ((xMaxPos / 2) - brdrMARGIN);
			checkBoxData('CT SCAN/MRI', disch.investEncl[enclosedEnum.CTMRI], HOME, xAxisPtr, yAxisPtr, REG);
			xAxisPtr += ((xMaxPos / 4) - brdrMARGIN);
			checkBoxData('Stool', disch.investEncl[enclosedEnum.STOOL], HOME, xAxisPtr, yAxisPtr, REG);
			yAxisPtr += ptIndentLrg;
			xAxisPtr = brdrMARGIN;
			checkBoxData('Urine', disch.investEncl[enclosedEnum.URINE], HOME, xAxisPtr, yAxisPtr, REG);
			xAxisPtr += ((xMaxPos / 4) - brdrMARGIN);
			checkBoxData('Hemoglobin', disch.investEncl[enclosedEnum.HEMO], HOME, xAxisPtr, yAxisPtr, REG);
			xAxisPtr = brdrMARGIN;
			xAxisPtr += ((xMaxPos / 2) - brdrMARGIN);
			checkBoxData('WBC', disch.investEncl[enclosedEnum.WBC], HOME, xAxisPtr, yAxisPtr, REG);
			xAxisPtr += ((xMaxPos / 4) - brdrMARGIN);
			checkBoxData('Miscellaneous', disch.investEncl[enclosedEnum.MISC], HOME, xAxisPtr, yAxisPtr, REG);
		}
		doc.addPage({ margins: { top: MARGIN, bottom: 0, left: MARGIN, right: MARGIN } });
		xAxisPtr = brdrMARGIN;
		yAxisPtr = headerEnd;
		yAxisPtr = addHeader(HOME, BLD, yAxisPtr, GREY);
		addDataAxis(doc, 'DISCHARGE SUMMARY', 14, BLD, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, xMaxPos - (4 * brdrMARGIN), C);
		addDataAxis(doc, 'Page 2 of 2', NORM, ITL, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, xMaxPos - (4 * brdrMARGIN), R);
		yAxisPtr += ptIndentLrg;
		yAxisPtr += (ptIndentLrg + ptIndentSml);
		addDataAxis(doc, 'Significant Past Medical and Surgical History', NORM, BLD, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, (xMaxPos - (2 * (xAxisPtr + brdrMARGIN))), L);
		yAxisPtr += ptIndentLrg;
		yAxisPtr = addParagraph(disch.surgeryHist, xAxisPtr, yAxisPtr, REG);
		addDataAxis(doc, 'Summary of key investigations during Hospitalization', NORM, BLD, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, (xMaxPos - (2 * (xAxisPtr + brdrMARGIN))), L);
		yAxisPtr += ptIndentLrg;
		yAxisPtr = addParagraph(disch.keyInvSumm, xAxisPtr, yAxisPtr, REG);
		addDataAxis(doc, 'Course in the Hospital including complications', NORM, BLD, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, (xMaxPos - (2 * (xAxisPtr + brdrMARGIN))), L);
		yAxisPtr += ptIndentLrg;
		yAxisPtr = addParagraph(disch.coursInHosp, xAxisPtr, yAxisPtr, REG);
		yAxisPtr += ptIndentNrm;
		hzntlLine(brdrMARGIN, yAxisPtr, GREY);
		yAxisPtr += ptIndentNrm;
		yAxisPtr += ptIndentSml;
		addDataAxis(doc, 'History of alcoholism, tobacco or substance abuse', NORM, BLD, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, (xMaxPos - (2 * (xAxisPtr + brdrMARGIN))), L);
		yAxisPtr += ptIndentLrg;
		yAxisPtr = addParagraph(disch.habitHist, xAxisPtr, yAxisPtr, REG);
		addDataAxis(doc, 'Family History if significant/relevant to diagnosis or treatment', NORM, BLD, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, (xMaxPos - (2 * (xAxisPtr + brdrMARGIN))), L);
		yAxisPtr += ptIndentLrg;
		yAxisPtr = addParagraph(disch.familyHist, xAxisPtr, yAxisPtr, REG);
		yAxisPtr += ptIndentNrm;
		hzntlLine(brdrMARGIN, yAxisPtr, GREY);
		yAxisPtr += ptIndentSml;
		yAxisPtr += ptIndentNrm;
		addDataAxis(doc, 'Final Diagnosis at the time of Discharge', NORM, BLD, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, (xMaxPos - (2 * (xAxisPtr + brdrMARGIN))), L);
		yAxisPtr += ptIndentLrg;
		yAxisPtr = addParagraph(disch.finalDiag, xAxisPtr, yAxisPtr, REG);
		addDataAxis(doc, 'Advice on Discharge and In Case of Emergency', NORM, BLD, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, (xMaxPos - (2 * (xAxisPtr + brdrMARGIN))), L);
		yAxisPtr += ptIndentLrg;
		yAxisPtr = addParagraph(disch.exitAdvice, xAxisPtr, yAxisPtr, REG);
		yAxisPtr += ptIndentLrg;
		addDataAxis(doc, 'Next Review On : ', NORM, BLD, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, (xMaxPos - (2 * (xAxisPtr + brdrMARGIN))), L);
		xAxisPtr += 100;
		addDataAxis(doc, dateFrmtr(disch.nxtReview), NORM, REG, BLACK, xAxisPtr, yAxisPtr, (xMaxPos - (2 * (brdrMARGIN + brdrMARGIN))), L);
		yAxisPtr += ptIndentLrg;
		xAxisPtr = brdrMARGIN;
		addDataAxis(doc, 'To Consult With : ', NORM, BLD, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, (xMaxPos - (2 * (xAxisPtr + brdrMARGIN))), L);
		xAxisPtr += 100;
		addDataAxis(doc, 'Dr ' + disch.nxtReviewDoc, NORM, REG, BLACK, xAxisPtr, yAxisPtr, (xMaxPos - (2 * (brdrMARGIN + brdrMARGIN))), L);
		xAxisPtr = brdrMARGIN;
		yAxisPtr += (2.5 * ptIndentLrg);
		addDataAxis(doc, 'Signature of the Medical Officer', NORM, BLD, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, (xMaxPos - (2 * (xAxisPtr + brdrMARGIN))), L);
		addDataAxis(doc, 'Signature of the Patient/Attendant', NORM, BLD, BLACK, xAxisPtr + brdrMARGIN, yAxisPtr, (xMaxPos - (2 * (xAxisPtr + brdrMARGIN))), R);
		doc.pipe(response);
		doc.end();
	}
}	
