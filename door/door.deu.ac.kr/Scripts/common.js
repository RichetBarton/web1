function OpenPopup(URL, popupName, Pwidth, Pheight, left, top, scroll) {
    //alert('12222');
    var iMyWidth = (window.screen.width - Pwidth) / 2;
    var iMyHeight = (window.screen.height - Pheight) / 2 - 20;
    var objWin = window.open(URL, popupName, "width=" + Pwidth + ", height=" + Pheight + " resizable=yes, left=" + left + ",top=" + top + ",screenX=" + iMyWidth + ",screenY=" + iMyHeight + ", scrollbars=" + (scroll === undefined ? "auto" : scroll));
    if (objWin !== null)
        objWin.focus();
    return objWin;
}

//모바일 기기 퀵메뉴노출
if (navigator.userAgent.match(/iPad/i) !== null || navigator.userAgent.match(/iPhone|iPod|Android|Windows CE|BlackBerry|Symbian|Windows Phone|webOS|Opera Mini|Opera Mobi|POLARIS|IEMobile|lgtelecom|nokia|SonyEricsson/i) !== null || navigator.userAgent.match(/LG|SAMSUNG|Samsung/) !== null) {
    $(document).ready(function () {
        $("#quick").css("display", "none");
        $("#icon_box").css("left", "0");
        $("#navigation").css("margin-right", "10px");
    });
} else {
    ''
}

var HtmlSelect = function (name, fromNum, toNum, selectedValue) {
    var htmlString = $.stringFormat("<select name={0}>", name);
    for (var i = fromNum; i <= toNum; i++) {
        if (i === selectedValue)
            htmlString += $.stringFormat("<option value={0} selected='selected'>{1}</option>", i, i);
        else
            htmlString += $.stringFormat("<option value={0}>{1}</option>", i, i);
    }
    htmlString += $.stringFormat("</select>");
    return htmlString;
}

//ID값 Blank (ex: InputDefaultByID('id1','id2','id3',.....)
var InputDefaultByID = function () {
    for (var i = 0; i < arguments.length; i++) {
        $("#" + arguments[i]).val("");
    }
}

//아이디중복체크
var common_ajax = new AjaxHelper();
var common_resultData;
var DuplicateIDCheck = function (targetID, resultData) {

    common_resultData = resultData;

    common_ajax.CallAjaxPost("/CustomerAdmin/DuplicateCheckUserID", { paramUserID: targetID }, "CompleteDuplicateCheckUserID");
};

//아이디중복체크완료
var CompleteDuplicateCheckUserID = function () {
    var result = common_ajax.CallAjaxResult();

    if (result > 0) {
        alert("이미 사용중 입니다.");
        if (common_resultData !== null) eval(common_resultData + "=false");

    } else {
        alert("사용가능한 아이디 입니다.");
        if (common_resultData !== null) eval(common_resultData + "=true");
    }

};

//file 업로드 등록 start
var common_fileInfo = function () {
    this.fileName;
    this.fileNewName;
    this.fileSize;
    this.fileType;
};
var common_fileAjax = new AjaxHelper();
var _common_fileInfo = new Array();
var common_id;
var common_deleteUrl;
var common_refName;
var SetFileUpload = function (id, uploadUrl, deleteUrl, queLayer, refName, fileSizeLimit, fileTypeExts) {
    fileSizeLimit = fileSizeLimit === undefined || fileSizeLimit === null ? 0 : fileSizeLimit;
    fileTypeExts = fileTypeExts === undefined || fileTypeExts === null ? "*.*" : fileTypeExts;
    common_id = id;
    common_deleteUrl = deleteUrl;
    common_refName = refName;
    $("#" + id).uploadify({
        queueID: queLayer,
        buttonClass: 'btn_file',
        buttonImage: '/Scripts/uploadify/btn_upload.gif',
        swf: '/Scripts/uploadify/uploadify.swf',
        fileSizeLimit: fileSizeLimit,
        uploader: uploadUrl,
        width: 72,
        height: 20,
        fileTypeExts: fileTypeExts,
        auto: true,
        removeCompleted: true,
        onSelectError: function (obj) {
            this.queueData.errorMsg = "파일용량 또는 파일유형을 확인해 주세요.";
        },

        onUploadSuccess: function (fileObj, data, response) {
            if ($("#fileonlyone").length > 0) {
                setTimeout("$('#file_upload').hide();", 1000);
            }
            var isPush = true;
            for (var i = 0; i < _common_fileInfo.length; i++) {
                if (fileObj.name === _common_fileInfo[i].fileName) {
                    isPush = false;
                    break;
                }
            }
            if (isPush) {
                var temp = new common_fileInfo();
                temp.fileName = fileObj.name;
                temp.fileSize = fileObj.size;
                temp.fileType = fileObj.type;
                temp.fileNewName = data;
                _common_fileInfo.push(temp);



                var _html = "";
                _html += $.stringFormat("<div><input type='hidden' name='fileName' value='{0}'/>", temp.fileName);
                _html += $.stringFormat("<input type='hidden' name='fileNewName' value={0}/>", temp.fileNewName);
                _html += $.stringFormat("<input type='hidden' name='fileSize' value='{0}'/>", temp.fileSize);
                _html += $.stringFormat("<input type='hidden' name='fileType' value='{0}'/>", temp.fileType);
                _html += $.stringFormat("<span>{0}</span><a href='#' onclick='return {1}' class='uFileDelete' style='margin-left:5px'>삭제</a></div>", temp.fileName, refName + ".uploadCancel(this);");
                $("#" + id).parent().append(_html);
            }

        },
        onUploadError: function (a, b, c, d) {

            if (d !== "Cancelled") {
                alert("파일 업로드 에러!!");
            }
        }, onCancel: function (obj) {

            for (var i = 0; i < _common_fileInfo.length; i++) {

                if (obj.name === _common_fileInfo[i].fileName) {
                    _common_fileInfo[i].fileName = null;
                }
            }
        }

    });


};
//파일업로드 확장(업로드)
SetFileUpload.prototype.upload = function () {
    $("#" + common_id).uploadify('upload', '*');
};
//파일업로드 확장(삭제)
SetFileUpload.prototype.uploadCancel = function (e) {
    commonFileDeleteObj = e;
    common_fileAjax.CallAjaxPost(common_deleteUrl, { paramFileNewName: $(e).parent().find("input[name='fileNewName']").val() }, "CommonCompleteUploadCancel");
    return false;
};
//파일업로드 확장(파일정보리턴)
SetFileUpload.prototype.getFileInfo = function () {
    var rsFileInfo = new Array();
    for (var i = 0; i < _common_fileInfo.length; i++) {

        if (_common_fileInfo[i].fileName !== null) {
            var temp = new common_fileInfo();
            temp.fileName = _common_fileInfo[i].fileName;
            temp.fileNewName = _common_fileInfo[i].fileNewName;
            temp.fileSize = _common_fileInfo[i].fileSize;
            temp.fileType = _common_fileInfo[i].fileType;
            rsFileInfo.push(temp);
        }
    }
    return rsFileInfo;
};

//파일업로드 확장(파일리스트)
SetFileUpload.prototype.getFileList = function (url, id) {
    common_fileAjax.CallAjaxPost(url, { id: id }, "CommonCompleteFileList");
};

//파일업로드 확장(삭제)
SetFileUpload.prototype.deleteFile = function (obj, id) {
    if (confirm("해당 파일을 삭제합니다.")) {
        $(obj).parent().remove();
        common_fileAjax.CallAjaxPost("/Common/FileDelete", { paramFileId: id }, "CommonCompleteDeleteFile");
    }
    return false;
};


var commonFileDeleteObj;
//파일업로드 취소
function CommonCompleteUploadCancel() {
    var result = common_fileAjax.CallAjaxResult();

    if (!result) {
        $(commonFileDeleteObj).parent().remove();
        if ($("#fileonlyone").length > 0) {
            $("#file_upload").show();
        }
    }
};

function CommonCompleteDeleteFile() {
    var result = common_fileAjax.CallAjaxResult();
    if ($("#fileonlyone").length > 0) {
        $("#file_upload").show();
    }
}

function CommonCompleteFileList() {
    var result = common_fileAjax.CallAjaxResult();

    var html = "";
    if (result !== null && result.length > 0) {
        for (var i = 0; i < result.length; i++) {
            html += $.stringFormat("<div><span><a href='{0}'>{1}</a></span><a href='#' onclick='return {2}' class='uFileDelete' style='margin-left:5px'>삭제</a></div>"
            , result[i].FileUrl
            , result[i].OriginFileName
            , common_refName + ".deleteFile(this," + result[i].FileNo + ");");

        }
        $("#" + common_id).parent().append(html);
        if ($("#fileonlyone").length > 0) {
            $("#file_upload").hide();
        }
    }
};

//fileupload end

//#############################################################################
//*****************************유효성체크*****************************
//#############################################################################
$(function () {
    //$(document).on("keypress", ".isNumeric", function (e) {
    //    if ((e.keyCode < 8 || e.keyCode > 9) && (e.keyCode < 48 || e.keyCode > 57)) { return false; }
    //}).keyup(function (e) {
    //    if ($(this).val() !== null && $(this).val() !== '' && e.keyCode !== 9) {
    //        $(this).val($(this).val().replace(/[^0-9]/g, ''));
    //    }
    //});
    $(".isNumeric").css("imeMode", "disabled");
    $("body").on("keydown", "input.isNumeric", function (e) {
        if ((e.keyCode < 8 || e.keyCode > 9) && (e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 && e.keyCode > 105)) { Prevent(); }
    }).on("keyup", "input.isNumeric", function (e) {
        if ($(this).val() != null && $(this).val() != '' && e.keyCode != 9 && (e.keyCode < 37 && e.keyCode > 40)) {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
        }
    }).on("change", "input.isNumeric", function () {
        if (isNaN(parseInt($(this).val(), 10))) {
            $(this).val(0);
        }
    }).on("click", "input.isNumeric", function () {
        $(this)[0].select();
    });
});

String.prototype.isssn = function () {

    var first = new Array(6);
    var second = new Array(7);
    var total = 0;
    var tmp = 0;

    if (this.length !== 13)
        return false;
    else {
        for (i = 1; i < 7; i++)
            first[i] = this.substring(i - 1, i);

        for (i = 1; i < 8; i++)
            second[i] = this.substring(6 + i - 1, i + 6);

        for (i = 1; i < 7; i++) {
            if (i < 3)
                tmp = Number(second[i]) * (i + 7);
            else if (i >= 3)
                tmp = Number(second[i]) * ((i + 9) % 10);

            total = total + Number(first[i]) * (i + 1) + tmp;
        }

        if (Number(second[7]) !== ((11 - (total % 11)) % 10))
            return false;
    }
    return true;
}

/*
사용자 정보
id : 사용자 ID
flag : 교수/조교 타입
*/
function fnStudentInfo(id, flag) {
    $("#divStudentDetail").hide();
    if (flag === null || flag === undefined) {
        flag = false;
    }
    common_ajax.CallAjaxText("/Common/UserDetail", { userno: id, IsProfessor: flag }, "StudentDetail");

}

function StudentDetail() {
    var result = common_ajax.CallAjaxResult();
    $("#divStudentDetail").html(result);
    $("#divStudentDetail").addClass("layer");
    $("#divStudentDetail").show();
}

function closeLayer(id) {

    $("#" + id).hide();
}

function centerLayerShow(id, a) {
    //var aa = (document.body.scrollTop + (window.innerHeight / 2));
    //var x = (window.innerWidth - $("#" + id).width()) / 2;
    //var y = (aa - ($("#" + id).height() / 2));
    //$("#" + id).css("top", y);
    //$("#" + id).css("left", x);
    $("#" + id).css("position","fixed");
    $("#" + id).css("width", "50%");
    $("#" + id).css("margin", "0 auto");
    //$("#" + id).css("background-color", "#999;");
    $("#" + id).css("top", "20%");
    //$("#" + id).css("margin-top", "-50px");
    $("#" + id).css("left", "50%");
    $("#" + id).css("margin-left", "-25%");
    $("#" + id).css("max-height", "50%");
    $("#" + id).css("overflow", "auto");
    $("#" + id).show();
}

$(document).ready(function () {
    //MoveQuickMenuLeftPosition();//20140124 삭제
    var winH = $(window).height(); //20140321 추가
    $("#quick").css("height", winH); //20140321 추가

    var currentPosition = parseInt($(".quickClass").css("top"));
    $(window).scroll(function () {
        var position = $(window).scrollTop(); // 현재 스크롤바의 위치값을 반환합니다. 
        $(".quickClass").stop().animate({ "top": position + currentPosition + "px" }, 300);
    });

    $("body").on("click", "#btn_studentinfo_close_1", function () {

        $("#divStudentDetail").hide();
    });

    $("body").on("click", "#btn_studentinfo_close_2", function () {

        $("#divStudentDetail").hide();
    });

    if (fngetCookie("LoginID") !== "") {
        $("#logId").val(fngetCookie("LoginID"));
        $("#logId").css("background", "#e9e9e9");
        $("#rememberMe").attr("checked", "checked");
    }

    //    if (document.cookie !== "") {
    //        $("#logId").val(document.cookie);
    //        $("#rememberMe").attr("checked", "checked");
    //    }


    $("body").on("click", "#btn_Login", function () {

        if ($("#logId").val() === "") {
            messageBox("아이디(학번)을 입력하세요.", 1);
            return false;
        }
        if ($("#logPw").val() === "") {
            messageBox("비밀번호를 입력하세요.", 1);
            return false;
        }

        if ($("#rememberMe").is(":checked") === true) {
            fnsetCookie("LoginID", $("#logId").val(), 1);
            //document.cookie = $("#logId").val();
        }
        else {
            fnsetCookie("LoginID", "", -1);
            //document.cookie = "";
        }
        document.forms["frm_login"].submit();

    });



    $("body").on("click", "#btn_LoginCert", function () {

        if ($("#logId").val() === "") {
            messageBox("아이디(학번)을 입력하세요.", 1);
            return false;
        }
        if ($("#logPw").val() === "") {
            messageBox("비밀번호를 입력하세요.", 1);
            return false;
        }

    });




    $("input.focus-select").on("click", function () {
        $(this)[0].select();
    });

    //다운로드 아이콘 클릭시 팝업창 보이기닫기
    $(".down_btn").click(
        function () {
            $(".down_list_wrap").css("display", "none");
            $(this).parent().find(".down_list_wrap").css("display", "block");
            Prevent();
        });
    $(".pop_close").click(function () {
        $(".down_list_wrap").css("display", "none");
    });
});

//20140124 삭제
/*
window.onresize = function () {
MoveQuickMenuLeftPosition();
}*/


function fngetCookie(name) {
    var nameOfCookie = name + "=";
    var x = 0;

    while (x <= document.cookie.length) {
        var y = (x + nameOfCookie.length);
        if (document.cookie.substring(x, y) === nameOfCookie) {
            if ((endOfCookie = document.cookie.indexOf(";", y)) === -1)
                endOfCookie = document.cookie.length;
            return unescape(document.cookie.substring(y, endOfCookie));
        }
        x = document.cookie.indexOf("", x) + 1;
        if (x === 0) break;
    }
    return "";
}

function fnsetCookie(name, value, expire) {
    var todayDate = new Date();
    todayDate.setDate(todayDate.getDate() + expire);
    todayDate.setHours(0, 0, 0, 0);

    document.cookie = name + "=" + escape(value) + "; path=/; expires=" + todayDate.toGMTString() + ";"
}

//20140124 삭제
/*
function MoveQuickMenuLeftPosition() {
var footer = document.getElementById("footWrap");
var width = 0;
if (footer === null) {
width = 1024;
}
else {
width = footer.offsetWidth;
}

var varLeft = (width / 2) + 550;
//alert(varLeft)
if (document.getElementById("quick") !== null)
//document.getElementById("quick").style.left = varLeft + "px";//20140124 삭제
}
*/

function IDPWSearch() {
    window.open('/Account/IDPWSearch', "IDPWSearch", "width=445, height=480, scrollbars=no");
//    window.open('http://mytu.tu.ac.kr/Common/ViewForm/IdPwSearch.aspx', "IDPWSearch", "width=350, height=410, scrollbars=yes");
}

function MemberJoinMove() {
    window.location = "/Account/MemberJoinStep1";
}

function onlineSurvey() {
    window.open('/Community/OnlineSurvey', "OnlineSurvey", "width=440, height=480, scrollbars=yes");
}

function imageOver() {
}

function imageOut() {
}

// formElement 좌우공백제거
function formTrim() {
    $.each($("input[type=text]"), function (i, obj) {
        if (obj.id !== "") {
            var trim = $.trim($(this).val());
            $(this).val(trim);
        }
    })
    $.each($("input[type=hidden]"), function (i, obj) {
        if (obj.id !== "") {
            var trim = $.trim($(this).val());
            $(this).val(trim);
        }
    })
}

// 브라우저 확대/축소
function fnZoomSetting(cuurval) {
    var iZoomDefault = 1.00;
    var iZoomVal = 0.04;
    var bodyObj = $("#wrapper");
    //var bodyObj = $("body");
    var iZoomCuur = parseFloat(bodyObj.attr("zCurr") || iZoomDefault, iZoomDefault);

    iZoomCuur += cuurval;
    if (iZoomCuur > 1.4 || iZoomCuur < 0.8) {
        return;
    }

    if ($.browser.msie) {
        bodyObj.css("zoom", String(iZoomCuur));
    } else {
        bodyObj.css({
            '-webkit-transform': 'scale(' + iZoomCuur + ')',
            '-webkit-transform-origin': '0 0',

            '-moz-transform': 'scale(' + iZoomCuur + ')',
            '-moz-transform-origin': '0 0',

            '-o-transform': 'scale(' + iZoomCuur + ')',
            '-o-transform-origin': '0 0'
        });
    }
    bodyObj.attr("zCurr", iZoomCuur);
}

// 배열요소 삭제
Array.prototype.removeIndex = function (index) {
    this.splice(index, 1);
    return this;
}

// 모달팝업 : 2013-03-04 추가
function OpenModal(url, SearchParams, features) {
    try {
        var raised = "raised";
        var Settings = { dialogWidth: "100px", dialogHeight: "100px", center: "1", dialogHide: 0, edge: raised, resizable: 0, scroll: 0, status: "1", unadorned: 0 };

        var strFeatures = "";

        if (features.dialogWidth) Settings.dialogWidth = features.dialogWidth;
        if (features.dialogHeight) Settings.dialogHeight = features.dialogHeight;
        if (features.center && features.center !== 1) Settings.center = features.center;
        if (features.dialogHide && features.dialogHide !== 1) Settings.dialogHide = features.dialogHide;
        if (features.resizable && features.resizable !== 0) Settings.resizable = features.resizable;
        if (features.scroll && features.scroll !== 0) Settings.scroll = features.scroll;
        if (features.status && features.status !== 0) Settings.status = features.status;

        // Window파라미터에 대한 예외처리 추가.
        if (!$.isWindow(SearchParams)) {
            for (var pa in SearchParams) {
                SearchParams[pa.toString()] = escape(SearchParams[pa.toString()].toString());
            }
        }

        strFeatures = JSONToString(Settings).replace(/{|}/g, "").replace(/:\s*/g, ":").replace(/,\s*/g, ";").replace(/\"/g, "");
    }
    catch (e) { console.log(e);}

    return window.showModalDialog(url, SearchParams, strFeatures);
}

// 오픈 팝업
function WinOpen(url, features, name) {
    var oNewWindow = null;
    try {
        var Settings = { width: 100, height: 100, left: 0, top: 0, status: 0, toolbar: 0, location: 0, menubar: 0, directories: 0, resizable: 0, scrollbars: 0 };

        var strFeatures = "";
        var iLeft = (screen.width - features.width) / 2;
        var iTop = (screen.height - features.height) / 2;

        if (features.width) Settings.width = features.width;
        if (features.height) Settings.height = features.height;
        if (features.status && features.status !== 0) Settings.status = features.status;
        if (features.toolbar && features.toolbar !== 0) Settings.toolbar = features.toolbar;
        if (features.menubar && features.menubar !== 0) Settings.menubar = features.menubar;
        if (features.resizable && features.resizable !== 0) Settings.resizable = features.resizable;
        if (features.scrollbars && features.scrollbars !== 0) Settings.scrollbars = features.scrollbars;
        Settings.left = iLeft;
        Settings.top = iTop;

        strFeatures = JSONToString(Settings).replace(/{|}/g, "").replace(/:\s*/g, "=").replace(/\"/g, "");

        oNewWindow = window.open(url, name, strFeatures, false);
    }
    catch (e) { console.log(e);}

    return oNewWindow;
}

// 스트링 -> Json 2013-03-04 추가.
function JSONToString(object) {
    var results = [];
    for (var property in object) {
        if (typeof (object[property]) === "object") {
            results.push(JSONToString(object[property]));
        }
        else {
            var value = object[property];
            results.push(property.toString() + ": \"" + value + "\"");
        }
    }

    return '{' + results.join(', ') + '}';
}
/*디예대하면서 추가한 스크립트*/
function Prevent() {
    try {
        if (event.preventDefault) {
            event.preventDefault();
            return false;
        }
    }
    catch (e) { console.log(e);    }
}
function setLeftMenuFocus(menuNumber, separator, cid) {
    if (menuNumber === 1) {
        //퀴즈, 시험의 평가화면
        //퀴즈, 시험의 평가목록화면
        if (separator === 'Q') {
            $("ul.left_menu li").removeClass("current-left");
            $("ul.left_menu li a[href='/LMS/Exam/StaffQuizList/" + cid + "']").parent().addClass("current-left");
        }
        else if (separator === 'E') {
            $("ul.left_menu li").removeClass("current-left");
            $("ul.left_menu li a[href='/LMS/Exam/StaffExamList/" + cid + "']").parent().addClass("current-left");
        }
    }
}

function full_screen_open(url, winName) {

    var isNav = (navigator.appName === "Netscape") ? 1 : 0;
    var isIE = (navigator.appName.indexOf("Microsoft") !== -1) ? 1 : 0;
    var isMac = (navigator.platform.indexOf("Mac") > -1) ? 1 : 0;
    var isWin = (navigator.platform.indexOf("Win") > -1) ? 1 : 0;
    var opts = "toolbar=no,location=no,directories=no,status=no,scrollbars=no,resizable=no,copyhistory=no,menubar=no,fullscreen=yes";

    if (isNav) {
        //크롬 사파리 파폭도 여기 잡힌다. 파폭은 잘된다 아이폰도 여기 잡힌다. 아이폰은 잘된다.
        opts = opts + ",width=" + (screen.availWidth - 12) + ",height=" + (screen.availHeight - 65);
    } else if (isIE) {
        opts = opts + ",left=0,top=0";
        if (isMac) {
            opts = opts + ",width=" + (screen.availWidth - 13) + ",height=" + (screen.availHeight - 32);
        } else if (isWin) {
            opts = opts + ",width=" + (screen.availWidth - 12) + ",height=" + (screen.availHeight - 25);
        } else {
            opts = opts + ",width=" + screen.availWidth + ",height=" + screen.availHeight;
        }
    } else {
        opts = "fullscreen=yes";
    }

    opts = opts + ",width=" + (screen.availWidth - 12) + ",height=" + (screen.availHeight - 65);

    var newWin = window.open(url, winName, opts);
    //if (parseInt(navigator.appVersion) >= 4) {
    //}
}


var quicMenuOpen = true;
// var interval;

function openQuickMenu(bool) {
    $("#dv_quickMenus, #tr_quickshow, #tr_quickhide").hide();
    if (bool) {
        $("#dv_quickMenus, #tr_quickhide").show();
        quickcook('X');
    }
    else {
        $("#tr_quickshow").show();
        quickcook('O');
    }
}




function clickLeftMenu(urlPageKey) {
    //if (urlPageKey === '' || urlPageKey === null) return;
    //window.open("../sub/" + urlPageKey + ".html", "_self")
}

function reactionInputFocus(field_id) {
    $("#" + field_id).focus(function () {
        $(this).val('');
    }).blur(function () {
        // if ($(this).val === "") {$(this).val("0"); }
    })
}

function cap(a, u, f, cb) {
    a.CallAjaxPost(u, $("#" + f).serialize(), cb);
}
function capd(a, u, d, cb) {
    a.CallAjaxPost(u, d, cb);
}
function fsubmit(fid) {
    fid = fid || "mainForm";
    if ($("#" + fid).length > 0) {
        $("#" + fid).submit();
    }
    Prevent();
}
function botScroll() {
    //if ($(document).height() > $(window).height()) {
    //    $("#footerCon").hide();
    //}
    //if ($(window).scrollTop() + $(window).height() == $(document).height()) {
    //    $("#footerCon").show();
    //}
}
function showajaxing(msg) {
    msg = msg || "처리중입니다.처리중입니다. <br />잠시만 기다려 주세요.";
    $("#ajaxing .msg").html(msg);
    $("#ajaxing").html(msg).show();
}
function ajaxresult() {
    try {
        if (_ajax != undefined && _ajax != null) {
            return _ajax.CallAjaxResult();
        }
        else if (ajax != undefined && ajax != null) {
            return ajax.CallAjaxResult();
        }
    }
    catch (e) {
        if (ajax != undefined && ajax != null) {
            return ajax.CallAjaxResult();
        }
    }
    return null;
}
function getInt(v) {
    if (isNaN(parseInt(v, 10)))
        return 0;
    return parseInt(v, 10);
}
function popup(url, popid, w, h, _fid, full) {
    full = full == undefined || full == null ? "" : full ? ",fullscreen=yes" : "";
    var win = window.open("", popid, "width=" + w + ", height=" + h + ", scrollbars=yes, resizable=yes" + full);
    if (win == null) {
        msg("팝업차단을 해제해 주세요.");
    }
    else {
        var f = document.getElementById(_fid == undefined || _fid == null ? "frmpop" : _fid);
        var wn = window.name || "lms_parent";
        var action = $(f).attr("action");
        f.action = url;
        f.target = popid;
        f.method = "post";
        f.submit();
        f.action = action;
        f.target = wn;
        if (wn == "lms_parent") {
            $(f).removeAttr("target");
        }
        win.focus();
        setTimeout(function () {
            if (win.document.location.href == "about:blank") {
                win.close();
            }
        }, 2000);
    }
}
function popup2(url, popid, w, h, _fid, full) {
    full = full == undefined || full == null ? "" : full ? ",fullscreen=yes" : "";
    var win = window.open(url, popid, "width=" + w + ", height=" + h + ", scrollbars=yes, resizable=yes" + full);
    if (win == null) {
        msg("팝업차단을 해제해 주세요.");
    }
    //else {
    //    var f = document.getElementById(_fid == undefined || _fid == null ? "frmpop" : _fid);
    //    var wn = window.name || "lms_parent";
    //    var action = $(f).attr("action");
    //    f.action = url;
    //    f.target = popid;
    //    f.method = "post";
    //    f.submit();
    //    f.action = action;
    //    f.target = wn;
    //    if (wn == "lms_parent") {
    //        $(f).removeAttr("target");
    //    }
    //    win.focus();
    //    setTimeout(function () {
    //        if (win.document.location.href == "about:blank") {
    //            win.close();
    //        }
    //    }, 2000);
    //}
}
var _vd_cn;
var _vd_dn;
var _vd_dt;
var _vd_dst;
var _vd_dd;
var _vd_df;
var _vd_dw;
var _vd_dh;
var _vd_fid;
var _vd_inningno;
function viewDoor(cn, dn, dt, dst, dd, df, dw, dh, fid, inningno, astatus) {
    inningno = inningno || 0;
    dd = decodeURIComponent(dd);
    fid = fid || "frmpop";
    if (inningno > 0 && dn == 0) {
        alert("강의컨텐츠가 없습니다.", 1);
    }
    else if (inningno > 0 && (dt != 0 || (dst != 1 && dst != 2 && dst != 3 && dst != 4 && dst != 6))) {
        alert("출석인정용 콘텐츠가 아닙니다.\n관리자에게 문의바랍니다.");
    }
    else if (astatus == 'CLAT001' || inningno < 1) {
        if (dt == 0) {
            $("#doorviewDoorNo").val(dn);
            $("#doorviewCourseNo").val(cn);
            if ($("#doorviewInningNo").length > 0) {
                $("#doorviewInningNo").val(inningno);
            }
            if (dst == 0) {
                //logDoor();
                _updateAjax.CallAjaxPost("/Door/DoorViewHistory", { DoorNo: dn,CourseNo: cn }, "cbempty");
                if ($("#textDoorData").length < 1 || ($("#textDoorData").text() || "") == "") {
                    window.open(dd);
                }
                else {
                    window.open($("#textDoorData").text());
                }
            }
            else {
                popup2("/Door/DoorView?DoorNo=" + dn + "&InningNo=" + inningno +"&CoursesNo="+cn, "door_doorview", dw + 50, dh + 70, fid);
            }
        }
        else {
            if (dst == 0) {
                window.open(dd);
            }
            else if (dst == 5) {
                commondownload(df);
            }
            _updateAjax.CallAjaxPost("/Door/DoorViewHistory", { DoorNo: dn,CourseNo:cn }, "cbempty");
        }
    } else {
        _vd_cn = cn;
        _vd_dn = dn;
        _vd_dt = dt;
        _vd_dst = dst;
        _vd_dd = dd;
        _vd_df = df;
        _vd_dw = dw;
        _vd_dh = dh;
        _vd_fid = fid;
        _vd_inningno = inningno;
        $.ajax({
            url: '/Common/GetLAState',
            type: 'post',
            data: { InningNo: _vd_inningno },
            success: function (rtn) {
                if (rtn.Code == 1000) {
                    cbviewDoor();
                }
                else {
                    $("#btnlakey").text("인증코드 전송");
                    $("#latimebox1").hide();
                    $("html,body").addClass("lock");
                    $("#lakey").val("");
                    $(".pop1").show();
                }
            }, error: function (e) {
                console.log(e.responseText);
                alert("운영자에게 문의해주세요.");
            }
        });
    }
    Prevent();
}
function cbviewDoor() {
    if (_vd_dt == 0) {
        $("#doorviewCourseNo").val(_vd_cn);
        $("#doorviewDoorNo").val(_vd_dn);
        if ($("#doorviewInningNo").length > 0) {
            $("#doorviewInningNo").val(_vd_inningno);
        }
        if (_vd_dst == 0) {
            //logDoor();
            _updateAjax.CallAjaxPost("/Door/DoorViewHistory", { DoorNo: _vd_dn,CourseNo :_vd_cn }, "cbempty");
            if ($("#textDoorData").length < 1 || ($("#textDoorData").text() || "") == "") {
                window.open(_vd_dd);
            }
            else {
                window.open($("#textDoorData").text());
            }
        }
        else {
            //popup("/Door/DoorView", "door_doorview", _vd_dw + 50, _vd_dh + 70, _vd_fid);
            popup2("/Door/DoorView?DoorNo=" + _vd_dn + "&InningNo=" + _vd_inningno + "&CoursesNo=" + _vd_cn, "door_doorview", _vd_dw + 50, _vd_dh + 70, _vd_fid);
        }
    }
    else {
        if (_vd_dst == 0) {
            window.open(_vd_dd);
        }
        else if (_vd_dst == 5) {
            commondownload(_vd_df);
        }
        _updateAjax.CallAjaxPost("/Door/DoorViewHistory", { DoorNo: _vd_dn,CourseNo: _vd_cn }, "cbempty");
    }
    Prevent();
}
var _vd_tm1;
var _vd_tmsec;
function sendlakey() {
    $("#btnlakey").hide();
    $.ajax({
        url: '/Common/SendLAKey',
        type: 'post',
        data: { InningNo: _vd_inningno },
        success: function (rtn) {
            $("#btnlakey").show();
            if (rtn.Code == 1000) {
                $("#btnlakey").text("인증코드 재전송");
                $("#lblrtime").text("(남은 시간 2분 59초)");
                $("#btntimeplus, #btnlearnauth").show();
                clearInterval(_vd_tm1);
                _vd_tmsec = 179;
                _vd_tm1 = setInterval(fnsendlatimer, 1000);
                $("#latimebox1").show();
                $("#lakey").focus();
                $("#btnpopmsgok").unbind();
                msg("인증번호를 전송하였습니다.");
            }
            else {
                console.log(isComplete);
                alert("운영자에게 문의해주세요.");
            }
        }, error: function (e) {
            $("#btnlakey").show();
            console.log(e.responseText);
            alert("운영자에게 문의해주세요.");
        }
    });
}
function pluslearnauthtime() {
    $.ajax({
        url: '/Common/PlusLATime',
        type: 'post',
        data: { InningNo: _vd_inningno },
        success: function (rtn) {
            if (rtn.Code == 1000) {
                $("#btnlakey").text("인증코드 재전송");
                $("#lblrtime").text("(남은 시간 2분 59초)");
                $("#btntimeplus, #btnlearnauth").show();
                clearInterval(_vd_tm1);
                _vd_tmsec = 179;
                _vd_tm1 = setInterval(fnsendlatimer, 1000);
                $("#latimebox1").show();
                $("#lakey").focus();
                $("#btnpopmsgok").unbind();
                msg("인증시간을 연장하였습니다.");
            }
            else {
                console.log(isComplete);
                alert("운영자에게 문의해주세요.");
            }
        }, error: function (e) {
            console.log(e.responseText);
            alert("운영자에게 문의해주세요.");
        }
    });
}
function confirmlearnauth() {
    if ($("#lakey").val().length != 6) {
        $("#lakey").focus();
        msg('6자리의 인증코드를 입력 후 확인을 클릭해주세요.');
    } else {
        $.ajax({
            url: '/Common/ConfirmLAKey',
            type: 'post',
            data: { k: $("#lakey").val(), InningNo: _vd_inningno },
            success: function (rtn) {
                if (rtn.Code == 1000) {
                    if (rtn.Obj == 2) {
                        $("#btnpopmsgok").unbind();
                        msg("인증이 실패하였습니다.<br />다시 확인해주세요.");
                    } else if (rtn.Obj == 3) {
                        $("#btnpopmsgok").unbind();
                        msg("유효기간이 만료되었습니다.<br />인증코드 재전송으로 다시 진행해주세요.");
                    } else if (rtn.Obj == 1) {
                        clearInterval(_vd_tm1);
                        $("#btnpopmsgok").unbind().on("click", function () {
                            cbviewDoor();
                            $('html,body').removeClass('lock'); $('.popmsg').hide();
                            $('.pop1').hide();
                        });
                        msg("인증이 성공하였습니다.<br />확인 버튼을 클릭하시면 학습이 가능합니다.");
                    }
                }
                else {
                    console.log(isComplete);
                    alert("운영자에게 문의해주세요.");
                }
            }, error: function (e) {
                console.log(e.responseText);
                alert("운영자에게 문의해주세요.");
            }
        });
    }
}
function msg(msg) {
    $("#popmsgtext").html(msg);
    $("html,body").addClass("lock");
    $(".popmsg").show();
}
function fnsendlatimer() {
    _vd_tmsec--;
    if (_vd_tmsec < 1) {
        clearInterval(_vd_tm1);
        $("#btntimeplus,#btnlearnauth").hide();
    }
    if (_vd_tmsec > 59) {
        $("#lblrtime").text("(남은 시간 " + (parseInt(_vd_tmsec / 60)) + "분 " + (_vd_tmsec % 60) + "초)");
    } else {
        $("#lblrtime").text("(남은 시간 " + (_vd_tmsec) + "초)");
    }
}

function cbempty() {

}
var _updateAjax = new AjaxHelper();
function commondownload(fno) {
    if (fno > 0) {
        $("#ifrdown").attr("src", "/common/filedownload/" + fno.toString());
    }
    Prevent();
}
function closepagepop() {
    $(".pagepopbox, .layerbox").hide();
    Prevent();
}
function addpocket(aj, dno, cno) {
    capd(aj, "/door/doorpocket", { DoorNo: dno, CatCode: cno }, "cbpocket");
    Prevent();
}
function cbpocket() {
    if (confirm("나의 DOOR에 저장이 완료되었습니다.\n나의 관심DOOR로 이동하시겠습니까?")) {
        location.href = "/MyPage/LikeDoor";
    }
    else {
        try {
            fsubmit();
        }
        catch (e) { }
    }
    $(".pagepopbox").hide();
}
function goLRoom(cno) {
    window.location = "/LMS/LectureRoom/Main/" + cno;
}
var OpenPopup = function (URL, popupName, Pwidth, Pheight, left, top, scroll) {
    var iMyWidth = (window.screen.width - Pwidth) / 2;
    var iMyHeight = (window.screen.height - Pheight) / 2 - 20;
    var objWin = window.open(URL, popupName, "width=" + Pwidth + ", height=" + Pheight + " resizable=yes, left=" + left + ",top=" + top + ",screenX=" + iMyWidth + ",screenY=" + iMyHeight + ", scrollbars=" + (scroll == undefined || scroll == "auto" ? "yes" : scroll));
    if (objWin != null)
        objWin.focus();
    return objWin;
}
$(document).ready(function () {
    var currentPosition = parseInt($("#quickMenuCon").css("top"));

    var scrollSet = function () {
        var position = $(document).scrollTop(); // 현재 스크롤바의 위치값을 반환합니다.
        $("#quickMenuCon").stop().animate({ "top": position + currentPosition + "px" }, 100);
    };

    currentPosition = 0;
    scrollSet();

    $(document).scroll(function () {
        var position = $(document).scrollTop(); // 현재 스크롤바의 위치값을 반환합니다.
        $("#quickMenuCon").stop().animate({ "top": 0 + "px" }, 100);
    });

    $(document).change(function () {
        console.log("-------------- checked -----------");
    })


    $("#btn_quick").toggle(function () {

        var size = $(window).width() - 29;
        var currentPosition = parseInt($("#quickMenuCon").css("top"));
        document.getElementById("quickMenuCon").setAttribute("style", "left:" + size + "px; top:" + currentPosition + "px;");
        this.src = "/Content/images/main/quick_menu_001.png";
    }, function () {
        var size = $(window).width() - 120;
        var currentPosition = parseInt($("#quickMenuCon").css("top"));
        document.getElementById("quickMenuCon").setAttribute("style", "left:" + size + "px; top:" + currentPosition + "px;");
        this.src = "/Content/images/main/quick_menu_002.png";
        });

});


function LayerPopup(Type) {

    if ($('input[name="ck_userid"]:checked').length <= 0) {
        alert("선택된 항목이 없습니다.");
        return false;
    }

    var Users = "";
    var Userstxt = "";
    for (var i = 0; i < $('input[name="ck_userid"]:checked').length; i++) {
        if (i == 0) {
            Users = $('input[name="ck_userid"]:checked').eq(i).next().val();
            Userstxt = $('input[name="ck_userid"]:checked').eq(i).next().next().val();
        }
        else {
            Users += "," + $('input[name="ck_userid"]:checked').eq(i).next().val();
            Userstxt += "," + $('input[name="ck_userid"]:checked').eq(i).next().next().val();
        }
    }

    $.ajax({
        type: "GET"
        , url: "/Community/" + Type
        , dataType: "html"
        , success: function (result) {
            $("#" + Type).html(result);
            $("#" + Type).bPopup();
            $("#" + Type).find("#selectUser").val(Userstxt);
            $("#" + Type).find("#strUserNo").val(Users);
        }
    });

}
function commonCommunity(t, unos, unames) {
    var Type = t == "mail" ? "LayerMail" : t == "message" ? "LayerMessage" : t == "sms" ? "LayerSMS" : "";
    if (Type != "") {
        $.ajax({
            type: "GET"
            , url: "/Community/" + Type
            , dataType: "html"
            , success: function (result) {
                $("#" + Type).html(result);
                $("#" + Type).bPopup();
                $("#" + Type).find("#selectUser").val(unames);
                $("#" + Type).find("#strUserNo").val(unos);
                //$("#" + Type).css({ "margin": "0 auto", "position": "fixed", "z-index": "1001" }).show();
            }
        });
    }
    Prevent();
}
function getBytes(v, nocrtrim) {
    nocrtrim = nocrtrim == undefined || nocrtrim == null ? false : nocrtrim;
    if (v == null) {
        return 0;
    }
    v = $.trim(v);
    if (!nocrtrim) {
        v = v.replace(/[\r\n]/gi, '').replace(/[\n]/gi, '');
    }
    var stringByteLength = 0;
    stringByteLength = (function (s, b, i, c) {
        for (b = i = 0; c = s.charCodeAt(i++); b += c >> 11 ? 2 : c >> 7 ? 2 : 1);
        return b
    })(v);
    return stringByteLength;
}
var _ajaxGetHtmlidx = 1;
function ajaxGetHtml(url, data, _index) {
    _ajaxGetHtmlidx = _index || 1;
    $.ajax({
        type: "POST",
        url: url,
        //dataType: "json",
        data: data,
        success: function (data) {
            switch (_ajaxGetHtmlidx) {
                case 1:
                    ajaxPastHtml(data);
                    break;
                case 2:
                    ajaxPastHtml2(data);
                    break;
                case 3:
                    ajaxPastHtml3(data);
                    break;
                case 4:
                    ajaxPastHtml4(data);
                    break;
                case 5:
                    ajaxPastHtml5(data);
                    break;
            }
        },
        error: function (e) {
            alert('실행 중 오류가 발생되었습니다.');
        }
    });
}
function mangeduc() {
    OpenPopup("/Common/DoorUserCat", "doorusercat", 500, 400, 0, 0);
    Prevent();
}
function openerrefresh() {
    try {
        opener.Refresh();
    } catch(e){}
}
function doorreg(dno) {
    $("#door_DoorNo").val(dno);
    popup("/Door/DoorReg", "doorreg", 820, 700, "doorForm");
    Prevent();
}
function isEmpty(_id, bFocus) {
    _id = _id || "phd";
    bFocus = bFocus || false;
    if ($("#" + _id).length < 1 || $.trim($("#" + _id).val()) == "") {
        if (bFocus) {
            $("#" + _id).focus();
        }
        return true;
    }
    return false;
}
function getCheck(id) {
    var rtn = "";
    $.each($("input[name='" + id + "']:checked"), function (i, r) {
        rtn += "," + $(r).val();
    });
    return rtn != "" ? rtn.substr(1) : rtn;
}
function savealert(msg, bParentRefresh, bClose, bSubmit) {
    msg = msg || "저장하였습니다.";
    bClose = bClose || false;
    bParentRefresh = bParentRefresh || false;
    bSubmit = bSubmit || false;
    if (bParentRefresh) {
        try {
            opener.Refresh();
        }
        catch (e) { }
    }
    alert(msg);
    if (bClose) {
        closepop();
    }
    else if (bSubmit) {
        fsubmit();
    }
}
function closepop() {
    self.close();
}
function addDoor(uno, selectone, includeLRoom) {
    includeLRoom = includeLRoom || "N";
    selectone = selectone || false;
    OpenPopup("/Common/DoorSelect/" + uno.toString() + "?SO=" + (selectone ? "Y" : "N") + "&includeLRoom=" + includeLRoom, 'doorselect', 750, 600, 0, 0, 'auto');
    Prevent();
}
function showajaxing(msg) {
    $("#ajaxing .msg").html("처리중입니다. <br />잠시만 기다려 주세요.");
    if ((msg || "") != "") {
        $("#ajaxing .msg").html(msg);
    }
    $(".layerbox").css({ "top": ($(window).height() / 2) - ($(".layerbox").height() / 2) - 100 });
    if ($("#popupwindow").length > 0) {
        $("#ajaxing").css("width", $(window).width() * 0.7);
    }
    $("#layerbg, #ajaxing").show();
}
function hideajaxing() {
    $("#layerbg, #ajaxing").hide();
}
function batchcheckall(c, cb) {
    $(c).parents("table").find("tr.data td.check input[type='checkbox']").prop("checked", $(c).prop("checked"));
    if (cb != undefined && cb != null) {
        eval(cb);
    }
}
function getbatchcheck(boxobj) {
    var rtn = "";
    $.each($(boxobj).find("tr.data td.check input:checked"), function (i, r) {
        rtn += ";" + $(r).val();
    });
    return rtn == "" ? "" : rtn.substr(1);
}
function courselinkdbupdate(cno) {
    if (confirm("학사정보를 업데이트하시겠습니까?")) {
        var _ajaxLINKDB = new AjaxHelper();
        capd(_ajaxLINKDB, "/common/updatelinkdb", { UPTYPE: "CU", CNO: cno }, "cbcourselinkdbupdate");
    }
    Prevent();
}
function courselecturelinkdbupdate(cno, classno) {
    if (confirm("수강신청정보를 업데이트하시겠습니까?")) {
        var _ajaxLINKDB = new AjaxHelper();
        capd(_ajaxLINKDB, "/common/updatelinkdb", { UPTYPE: "CLU", CNO: cno, ClassNo: classno }, "cbcourselecturelinkdbupdate");
    }
    Prevent();
}
function checkflash() {
    if ($("object.swfupload").length < 1) {
        setTimeout(function () {
            $("#flashdown").click();
        }, 500);
    }
}