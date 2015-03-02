// Common Scripts Javascript File

// Document Ready
$(document).ready(function () {
    
    SideBarHeight();
    AddpatientForm();
    SliderSideBar();
    ServiceCheck();
    ResetTime();
    ViewStatusOnEdit();
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
        $('.btn_View').popover();
    })
    $('#btnAddPatient').click(function () {
        
        $('.FramePatient').attr('src','1000.html');
    });

    $('.CalAge').focusout(function () {
        
        var currentDate = new Date();
        var dob = $('.CalAge').val();
        var arr = dob.split('/');
		var age = currentDate.getFullYear() - arr[2] ;
		if ( age ) 
			$('#FormAge').val( age + ' years');
		else
			$('#FormAge').val( 'less than a year');	

    });
	
	var currentFullDate = new Date();
		var dd = currentFullDate.getDate() ;
		var yy = currentFullDate.getFullYear() ;
		var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
		var today = dd+' - '+monthNames[currentFullDate.getMonth()]+' - '+yy;
		$('#CurrentDate').text(today);
	  
});

// Window Loads
$(window).load(function () {

    
});

// Window Resize
$(window).resize(function () {
    SideBarHeight();
});


// Finds height of the sidebar with respect to Header and Footer and the size of the screen
function SideBarHeight() {

    var WindowHeight = $(window).height();
    var WindowWidth = $(window).width();

    var HeaderHeight = $('.header').height();
    var FooterHeight = $('.Footer_Fixed').height();
     
    var SideBarHeight = (WindowHeight - ( + FooterHeight + 7));
    var IFrame = (WindowHeight - (HeaderHeight + FooterHeight + 4));
    $('.SideBar_Content').css('height', SideBarHeight + 'px');
    $('.ParentIframeContainer').css('height', SideBarHeight + 'px');
    
    
    //alert(WindowHeight);
    //alert(HeaderHeight);
    //alert(FooterHeight);
    //alert(SideBarHeight);
/* Fix height of the window  - 20px to iframe*/
    var IFrameHeight = WindowHeight - (0);
    var IFrameWidth = WindowWidth  -300;
    $('.FramePatient').css('height', IFrame + 'px');
    //$('.FramePatient').css('width', IFrameWidth + 'px');
   // $('#result').css('width', IFrameWidth + 'px');
    //$('#leftAjaxContent').css('height', SideBarHeight + 'px');
    //$('#leftAjaxContent').css('width', IFrameWidth + 'px');
    

    //$('.leftcolumn').css('width', IFrameWidth + 'px');
};

//function AjaxLoadAddPatient() {

//    $('#btnAddPatient').click(function () {
//        $('#leftAjaxContent').load('1000.html');

//    });
//};



function AddpatientForm() {

    $.fn.serializeObject = function () {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };
    $('form').submit(function () {
        if ($('.FormField').hasClass('has-error')) {
            //alert('Has Error in page');
          
        }
        else {
            //alert('sucess');

            $('#itcsdata').val(JSON.stringify($('form').serializeObject()));
			
			return true;
        }
        
    });
    //$("#PatientAddForm").submit(function (event) {
    //    $("#results").html('');
    //    var formData = $(this).serializeArray();
    //    alert(formData);
    //    $.each(formData, function (i, field) {
    //        $("#results").append(field.name + ":" + field.value + "\n");
    //    });
    //    alert($("#results").html());
    //    event.preventDefault();
    //});
    

}
//function ExceptionValidations(input){
//    if ( input == "1" )
//		$('.Inpatient_Panel').css('display','block');
//	else
//		$('.Inpatient_Panel').css('display','none');
 
// }
 


function SliderSideBar() {
    
    
    $('.FramePatient').css('padding-right', '300px');
    $('.SliderControl').click(function () {
        
        var ifclass = $('.SliderControl.plus').hasClass('icon-show');
        if (ifclass == true) {
            
            $('.SideBar_Content').css('right', '0px');
            $('.SliderControl.minus').addClass('icon-show');
            $('.SliderControl.plus').removeClass('icon-show');
            $('.FramePatient').css('padding-right', '300px');
            
        }
        else {
            
            $('.SideBar_Content').css('right', '-300px');
            $('.SliderControl.minus').removeClass('icon-show');
            $('.SliderControl.plus').addClass('icon-show');
            $('.FramePatient').css('padding-right', '0px');
        }

    });
}

function ServiceCheck() {
    $('#ServiceStatus .btn').click(function () {
        valofstatus = $(this).children('input').val();
        
        if (valofstatus == 'Yes') {
			$('#FormAddServiceCost').attr('disabled', 'disabled');
            $('.CostCheck').addClass('ActiveCost');
        }
        else {
            $('#FormAddServiceCost').removeAttr("disabled");
            $('.CostCheck').removeClass('ActiveCost');
        }
    });
}

function ResetTime() {
    $('.Reset').click(function () {
    $(this).parent().parent().find('.WeekTime input').val("");
    });
}


function ViewStatusOnEdit() {
	$('.DoctorView .CheckCol .fa-pencil-square').click(function () {
		$('.DoctorStatusCheck').removeClass('InactiveRow');
    });
    
}

