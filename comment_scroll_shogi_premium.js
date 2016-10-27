//********************************************************************************************
/**
 * コメントスクロール(将棋プレミアム)
 * @file		comment_scroll_shogi_premium.js
 * @brief		コメントをニコ生風に流すスクリプト
 * @author		loft
 */
//********************************************************************************************

//フラグ 初期化完了
var _initDone=false;

//フラグ 初回表示完了
var _firstDrawDone=false;

//プレイヤー領域サイズ
var _width = 608;
var _height = 370;

//コメント色
var _color = 'white';

//取得済みコメントリスト
var _list = [];

//描画コメントtop段階定数
var _TOP_LEVEL = 30;

//描画中コメントtop段階リスト
var _topLevelList = [];

//定期処理間隔
var _interval = 500;

//定期処理
timerTick();


//********************************************************************************************
/**
 * @brief		定期処理
 * @author		loft
 *
 * @return		function	
 */
//********************************************************************************************
function timerTick(){
	//コメント取得
	var drawlist = getComment();
	if(Object.keys(drawlist).length == 0){
		setTimeout(timerTick, _interval);//次回
		return;
	}
	
	//初期化
	if(!_initDone){
		init();
		_initDone = true;
	}
	
	//描画
	draw(drawlist);
	
	setTimeout(timerTick, _interval);//次回
}

//********************************************************************************************
/**
 * @brief		初期化
 * @author		loft
 */
//********************************************************************************************
function init(){
	
	var videoExist = true;
	
	//コメント表示エリア指定
	var scrollArea=document.getElementsByClassName('video_container');//要会員
	if(scrollArea.length==0){
		videoExist = false;
		scrollArea=document.getElementsByClassName('main_content');//代替
	}
	
	//独自ID付与
	scrollArea[0].id='comment_scroll_area';

	//エリアサイズ取得
	var obj = $("#comment_scroll_area");
	obj.css("position", "relative");
	obj.css("overflow", "hidden");
	
	var width = ""+obj.css("width");
	var height = ""+obj.css("height");
	_width = width.replace("px","");
	_height = height.replace("px","");
	
	if(!videoExist){
		_height = 800;
		_color = 'black';//白地なので
	}
	logPut('init','width,height=' + _width + ',' + _height);
		
	if(videoExist){
		//お試し
		$('embed').each(function(){
			//$(this).attr('src',$(this).attr('src')+'?wmode=transparent');
		})
	}
}

//********************************************************************************************
/**
 * @brief		コメント取得
 * @author		loft
 */
//********************************************************************************************
function getComment(){
	//コメント取得
	var elements=document.getElementsByClassName('live_comment_content');
	
	//今回表示するコメントのリスト
	var drawlist = [];
	
	//コメント処理
	for(var i=0; i<elements.length; i++){
		var element=elements[i];
		
		//id
		var id=element.id;
		if(id in _list){//取得済みか？
			continue;
		}
		
		//コメント
		var text=element.children[0].innerHTML;
		
		//取得済みリストに追加
		_list[id]=text;
		
		//今回表示するコメントリストに追加
		drawlist[id] = text;
	}
	return drawlist;
}

//********************************************************************************************
/**
 * @brief		描画
 * @author		loft
 * @param[in]	drawlist	
 */
//********************************************************************************************
function draw(drawlist){
	var drawNum = Object.keys(drawlist).length;//要素数
	if(drawNum==0){
		return;
	}
	var i=0;
	for(key in drawlist){
		if(!_firstDrawDone){//大量表示抑制
			if(i < drawNum-4){
				i++;
				continue;
			}
		}
		
		//アニメーション
		var text = drawlist[key];
		animate(key, text);
		
		i++;
	}
	
	//初回描画終わり
	_firstDrawDone=true;
}

//********************************************************************************************
/**
 * @brief		アニメーション
 * @author		loft
 * @return		function	
 */
//********************************************************************************************
function animate(key, text){
	var top = calcTop();
	var obj = $(
			"<pre id='"
		//	"<div id='"
		+	key
		+	"' style='"
		+	"left:" + _width * 1 + "px;"
		+	"position:absolute;"
		+	"top:" + top + "px;"
		+	"color:"+ _color
		+	";font-size:" + '25px'
		+	";font-weight:bold;text-shadow: black 1px 1px 1px;width:100%;z-index:99999;cursor:default'>"
		+	text
		//+	"</div>");
		+	"</pre>");
	
	$("#comment_scroll_area").append(obj);
	var len = text.length;
	var duration = 10000;
	if(len > 10){
		duration -= (len - 10) * 100;
	}
	if(duration < 4000){
		duration = 4000;
	}
	
	var topLevel = Math.floor(top/_TOP_LEVEL);
	_topLevelList[key] = topLevel;
	logPut('animate', key + ' top=' + topLevel);

	var width = obj.width();
	obj.animate(
		{
			left: (parseInt(_width) + parseInt(width) + 100) * -1,
		},
		{
			duration: duration,
			easing: 'linear',
			complete: function(){
				$("#comment_scroll_area").remove("#" + key);
				delete _topLevelList[key];
				logPut('animate', 'remove : ' + key);
			}
		
		}
	);
}
//********************************************************************************************
/**
 * @brief		描画高さ算出
 * @author		loft
 *
 * @return		function	
 */
//********************************************************************************************
function calcTop(){
	var top = 0;
	var cnt = 0;
	
	var drawingTopMax = getDrawingTopMax();//-1 ～
	drawingTopMax += 1;
	if(drawingTopMax > 7){
		drawingTopMax = 1;
	}
	//while(cnt < 100){
		top = Math.floor( Math.random() * _TOP_LEVEL  +  drawingTopMax * _TOP_LEVEL  );
		
		//var topLevel = Math.floor(top/_TOP_LEVEL);
		//var ret = isOnlyTopLevel(topLevel)
		//if(ret){
		//	return top;
		//}
		//cnt++;
	//}
	return top;
}

function getDrawingTopMax(){
	var drawingTopMax = -1;

	for(key in _topLevelList){
		var drawingTopLevel = _topLevelList[key];
		if(drawingTopLevel > drawingTopMax){
			drawingTopMax = drawingTopLevel;
		}
	}
	
	return drawingTopMax;
}

//********************************************************************************************
/**
 * @brief		描画高さレベル重複チェック
 * @author		loft
 *
 * @param[in]	top		未使用
 *
 * @return		function	
 */
//********************************************************************************************
function isOnlyTopLevel(topLevel){
	for(key in _topLevelList){
		var drawingTopLevel = _topLevelList[key];
		if(topLevel == drawingTopLevel){
			return false;//重複有り
		}
	}
	return true;//重複なし
}

//********************************************************************************************
/**
 * @brief		ログ出力
 * @author		loft
 *
 * @param[in]	funcName		
 * @param[in]	str				
 */
//********************************************************************************************
function logPut(funcName, str){
	console.log('[c-loft.com][comment_scroll][' + funcName + '] ' + str);
}
