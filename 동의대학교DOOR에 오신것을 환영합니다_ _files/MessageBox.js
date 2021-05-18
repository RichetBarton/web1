function messageBox(str, type, focus) {
    var aa = (document.body.scrollTop + (window.innerHeight / 2));


    //var x = ((window.innerWidth - 300) / 3);
    //var y = (aa - 100) / 2;
    var x = "45%";
    var y = "40%";
    //화면의 높이와 너비를 구한다.
    var maskHeight = $(document).height();
    var maskWidth = $(window).width();
    //마스크의 높이와 너비를 화면 것으로 만들어 전체 화면을 채운다.
    $('#mask').css({ 'width': maskWidth, 'height': maskHeight });

    //애니메이션 효과 - 일단 1초동안 까맣게 됐다가 80% 불투명도로 간다.
    //$('#mask').fadeIn(1000);
    $('#mask').fadeTo(100, 0.3, function () {
        if (arguments.length < 2 || type == null || type == 1) {
            $("div#pop_footer2 button").focus();
        }
        else {
            $("div#pop_footer button").focus();
        }
    });
    if (arguments.length < 2 || type == null || type == 1) {
        $("#msg_alert", "#pop_msg_alert").html(str);
        $("#pop_msg_alert").css("left", x);
        $("#pop_msg_alert").css("top", y); ;
        //$("#pop_msg_alert").show();
        $("#pop_msg_alert").css("display", "block");
    } else {

        $("#msg_info", "#pop_msg_info").html(str);
        $("#pop_msg_info").css("left", x);
        $("#pop_msg_info").css("top", y); ;
        //$("#pop_msg_info").show();
        $("#pop_msg_info").css("display", "block");
        $("div#pop_footer button").focus();

    }
    if (focus != null) {
        $("div#pop_footer2 button, div#pop_footer button").on("click", function () {
            $("#" + focus).focus();
        });
    }

}


function closeMsgLayer(id) {
    event.preventDefault ? event.preventDefault() : event.returnValue = false;
    $("#" + id).hide();
    $('#mask').hide();
    return false;
}