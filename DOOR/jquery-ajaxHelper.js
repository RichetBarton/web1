var AjaxHelper = function () {


    var resultAjax;
    var isError = false;
    var ErrorMessage;
    var swfu;
    var working = false;
    var workingSTime = 0;
    var workingEnTime = 0;

    this.CallAjaxResult = function () {

        return resultAjax;
    }





    this.CallAjaxPost = function (url, queryJsonType, callbackFunction, strParam) {

        if (!working) {

            working = true;
            var nowTime = new Date();
            workingSTime = String(nowTime.getFullYear()) + String((nowTime.getMonth() + 1)) + String(nowTime.getDate()) + String(nowTime.getHours()) + String(nowTime.getMinutes()) + String(nowTime.getSeconds());
            workingEnTime = workingSTime;
            var path = url;
            var result;

            $.ajax({
                type: "POST"
			, url: path
			, data: queryJsonType
			, cache: true
			, dataType: "json"
			, success: function (data) {

			    isError = false;

			    resultAjax = data;

			    working = false;

			}
			, error: function (status, error,data) {
			    //console.log(data);
                console.log(error);
			    isError = true;
			    resultAjax = data;

			    working = false;
			    //alert("에러가 발생 하였습니다.");
			}, complete: function () {

			    working = false;

			    workingEnTime = parseFloat(workingSTime) + 1;
			    if (callbackFunction == null) {
			        callBackAjax();
			    }
			    else {
			        if (strParam != undefined && strParam != null) {
			            eval(callbackFunction + "(" + strParam + ");");
			        }
			        else {
			            eval(callbackFunction + "();");
			        }
			    }

			}
            });

            //        } else {
            //            alert("이전 요청에 대한 데이터를 처리중 입니다.잠시후 다시 시도해 주세요");
        }


    };

    this.CallAjaxText = function (url, queryJsonType, callbackFunction) {

        if (!working) {

            working = true;
            var nowTime = new Date();
            workingSTime = String(nowTime.getFullYear()) + String((nowTime.getMonth() + 1)) + String(nowTime.getDate()) + String(nowTime.getHours()) + String(nowTime.getMinutes()) + String(nowTime.getSeconds());
            workingEnTime = workingSTime;
            var path = url;
            var result;

            $.ajax({
                type: "POST"
			, url: path
			, data: queryJsonType
			, cache: true
			, success: function (data) {

			    isError = false;

			    resultAjax = data;

			    working = false;

			}
			, error: function (data) {
			    isError = true;
			    resultAjax = data;

			    working = false;
			    //alert("에러가 발생 하였습니다.");
			}, complete: function () {

			    working = false;

			    workingEnTime = parseFloat(workingSTime) + 1;
			    if (callbackFunction == null)
			        callBackAjax();
			    else
			        eval(callbackFunction + "();");

			}
            });

            //        } else {
            //            alert("이전 요청에 대한 데이터를 처리중 입니다.잠시후 다시 시도해 주세요");
        }


    };


}

                                                                                               