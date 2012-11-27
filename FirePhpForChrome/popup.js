var storage = chrome.storage.local;
var message = document.querySelector('#message');
var yLog = document.querySelector('#log');
var yURL = document.querySelector('#url');

var state = document.querySelector('#switch');
var hide = document.querySelector('#hide');
var about = document.querySelector('#about');
var notice = document.querySelector('#noticebox');


//初始化
window.addEventListener('load', LoadInitData);
//切换按钮
state.addEventListener('click', SwitchActive);
//隐藏按钮
hide.addEventListener('click', function(){
	notice.style.display='none';
});
//关于按钮
about.addEventListener('click', function(){
    message.innerHTML = '<a href="http://weibo.com/luofei614" target="_blank">@luofei614</a>童鞋不经意提到PHP调试神器在Chrome战斗力略微有点渣，作为Chrome Fans果断开撸，于是就有了这个插件(<a href="http://soulteary.com/2012/11/27/firephp-chrome-for-sae.html" target="_blank">使用说明</a>)。欢迎在微博 <a href="http://weibo.com/firendless" target="_blank">@soulteary</a>对插件问题留言. inspire by firephp & github, best regard.';
	notice.className = 'notice';
	notice.style.display='block';
});



function SwitchActive(){

	storage.get('active', function(FirePHP) {
		if(FirePHP.active == true) {
			storage.set({'active': false}, function(){});
			state.value="开启调试功能";
	        message.innerText = '禁用FirePHP调试功能.';
			notice.className = 'notice enable';
		}else{
			storage.set({'active': true}, function(){});
	        message.innerText = '启用FirePHP调试功能.';
			state.value="暂停调试功能";
			notice.className = 'notice disable';
		}
	});
	notice.style.display='block';
}


function LoadInitData(){

	//获取调试数据
	storage.get('active', function(FirePHP) {
		if(FirePHP.active == true) {
			state.value="暂停调试功能";
			notice.className = 'notice enable';
		}else{
			state.value="开启调试功能";
			notice.className = 'notice disable';
		}
	});
	//初始化YLOG显示
	yLog.style.display='none';
	//获取调试数据
	storage.get('yLog', function(FirePHP) {
		if(FirePHP.yLog) {
			if(FirePHP.yLog !== "") {
				yLog.innerHTML = '<h3><a href="javascript:(0)" title="">调试信息</a></h3>'+echoHTML(FirePHP.yLog,'<ul>','</ul>');
				yLog.style.display='block';
			}
			else{
				yLog.innerHTML = '';
				yLog.style.display='none';
			}
		}


	});

	//输出表单
	function echoHTML(data,PREFIX,ENDFIX){
		var strHTML = PREFIX;

		for (var i = data.length - 1; i >= 0; i--) {
			var liType = $(data[i][3][0].Type, '', ' class="'+data[i][3][0].Type.toLowerCase()+'"');
				strHTML += '<li'+liType+'><a href="javascript:(0)" title="">';
			result = '';
			nums = -1;
			//判断类型
			if (data[i][3][1] instanceof Array) {
				ev(data[i][3])
				// console.log( result  );

				if (data[i][3][0].Type = 'TABLE') {
					//输出函数
					var row = [];
						row[0] = '';
					strHTML += '<div class="intro">';
					strHTML += '<table class="exception">';
					for (var mm in data[i][3][1]) {
						if(data[i][3][1][mm] instanceof Array){
							for (var aa in data[i][3][1][mm]) {
								row[aa] = '';
								for(bb in data[i][3][1][mm][aa]){
									if (aa==0) {
										row[aa] += '<th>'+data[i][3][1][mm][aa][bb]+'</th>';
									}else{
										row[aa] += '<td>'+data[i][3][1][mm][aa][bb]+'</td>';
									}
								}

							}

							strHTML += '<tr>';
							strHTML += row.join('</tr><tr>');
							strHTML += '</tr>';
						}

					}
					strHTML += '</table>';
					strHTML += '</div>';
					
				}

			}else if (typeof data[i][3][1] == 'boolean') {
				ev(data[i][3])
				// console.log( result  );
			}else if (typeof data[i][3][1] == 'string') {
				var spLbl = $(data[i][3][0].Label, $(data[i][3][1],'',data[i][3][1]), data[i][3][0].Label+': '+data[i][3][1]);
				strHTML += '<div class="log">'+spLbl+'</div>';
			}else if (typeof data[i][3][1] == 'number') {
				ev(data[i][3])
				// console.log( result  );
			}else if (data[i][3][1] instanceof Object) {
				ev(data[i][3])
				// console.log( result );

				var clsClass = $(data[i][3][1].Class, '', data[i][3][1].Class);
				//EXCEPTION::TABLE
				strHTML += '<div class="intro">';
				if ("Exception" == clsClass) {
					var cntMsg = $(data[i][3][1].Message, '', data[i][3][1].Message)
					strHTML += '<div>'+clsClass+': '+cntMsg+'</div>';
					//输出表格头
					strHTML += '<table class="exception"><tr><th>File</th><th>Line</th><th>Instruction</th></tr>';
					strHTML += '<tr><td>'+data[i][3][1].File+'</td><td>'+data[i][3][1].Line+'</td><td>'+data[i][3][1].Type+' '+data[i][3][1].Class+'()</td></tr>';
					//输出表格内容
					for (var jj = data[i][3][1].Trace.length - 1; jj >= 0; jj--) {
						var argu = result;
							result = '';
						ev(data[i][3][1].Trace[jj].args);
						strHTML += '<tr><td>'+data[i][3][1].Trace[jj].file+'</td><td>'+data[i][3][1].Trace[jj].line+'</td><td>'+result+'</td></tr>';
						result = argu;
					}
					strHTML += '</table>';
					//有调用CLASS
				}else if(clsClass !== ''){
					//输出函数
					var cntFile = $(data[i][3][0].File, '', data[i][3][0].File);
					var cntLine = $(data[i][3][0].Line, '', data[i][3][0].Line);
					var cntIntr = clsClass +'->'+ data[i][3][1].Function+'(';
						if(data[i][3][1].Args){
							var argu = result;
								result = '';
							ev(data[i][3][1].Args);
							cntIntr += result;
							result = argu;
						}
						cntIntr += ')';

					strHTML += '<table class="exception"><tr><th>File</th><th>Line</th><th>Instruction</th></tr>';
					strHTML += '<tr><td>'+cntFile+'</td><td>'+cntLine+'</td><td>'+cntIntr+'</td></tr>';
					//输出表格内容
					for (var jj = data[i][3][1].Trace.length - 1; jj >= 0; jj--) {
						var argu = result;
							result = '';
						ev(data[i][3][1].Trace[jj].args);
						strHTML += '<tr><td>'+data[i][3][1].Trace[jj].file+'</td><td>'+data[i][3][1].Trace[jj].line+'</td><td>'+data[i][3][1].Trace[jj].function+'('+result+')</td></tr>';
						result = argu;
					}
					strHTML += '</table>';
				}else{
					//输出其他的对象
					strHTML += '<div class="log precode">';
					strHTML += $(data[i][3][0].Label, '', data[i][3][0].Label+': ');
					strHTML += result;
					strHTML += '</div>';
				}
				strHTML += '</div>';

				var clsFile = $(data[i][3][0].File, ' hide', '');
				var cntFile = $(data[i][3][0].File, '', data[i][3][0].File);
					strHTML += '<div class="file'+clsFile+'">'+cntFile+'</div>';

				var clsLine = $(data[i][3][0].Line, ' hide', '');
				var cntLine = $(data[i][3][0].Line, '', data[i][3][0].Line);
					strHTML += '<div class="line'+clsLine+'">'+cntLine+'</div>';

			}


			strHTML += '</a></li>';


		}
		strHTML += ENDFIX;
		yLog.style.display='block';
		return strHTML;
	}

	//ev 传入OBJECT
	function ev(oo,self){
		nums++;
		for(var xx in oo){
			var last = !(xx==oo.length-1);
				result += '\n'+space()+xx+': ';

			if (oo[xx] instanceof Array) {
				result += '[';
				arguments.callee(oo[xx]);
				result += space()+']';
				// 'key1'=>'val1', 'key2'=>array('0'=>array('0'=>'v1', '1'=>'v2'), '1'=>'v3')
				nums--;
			}else if (typeof oo[xx] == 'boolean') {
				result += space()+oo[xx];
			}else if (typeof oo[xx] == 'string') {
				result += '"' + oo[xx] + '"';
			}else if (typeof oo[xx] == 'number') {
				result += oo[xx];
			}else if (oo[xx] instanceof Object) {
				result += '{';
				arguments.callee(oo[xx]);
				result += space()+'}';
				nums--;
			}
			if (last) {result+=','};
		}
		result += '\n';

		//补全空格
		function space(){
			var str='';
			for(var i=0;i<nums*2;i++){
				str+='\t';//' ';
			}
			return str;
		}
	}

	//ev 传入OBJECT
	function _ev(oo){
		nums++;
		for(var xx in oo){
			var last = !(xx==oo.length-1);
				result += '\n'+space()+xx+': ';
			if (oo[xx] instanceof Array) {
				result += '[';
				arguments.callee(oo[xx]);
				result += space()+']';
				nums--;
			}else if (typeof oo[xx] == 'boolean') {
				result += space()+oo[xx];
			}else if (typeof oo[xx] == 'string') {
				result += '"' + oo[xx] + '"';
			}else if (typeof oo[xx] == 'number') {
				result += oo[xx];
			}else if (oo[xx] instanceof Object) {
				result += '{';
				arguments.callee(oo[xx]);
				result += space()+'}';
				nums--;
			}
			if (last) {result+=','};
		}
		result += '\n';
		//补全空格
		function space(){
			var str='';
			for(var i=0;i<nums*4;i++){
				str+=' ';
			}
			return str;
		}
	}



	//为了节约点代码
	function $(obj, none, has){
		return (typeof(obj)=='undefined' || obj =='' ?none:has);
	}

	//获取URL参数
	function getURL(url){
		var query = url[0];
		if (query.indexOf("?") == 0){query = query.substring(1);}
		else{
			yURL.style.display='none';
			return;
		}
		query = query.split("&");
		var strHTML = '<h3><a href="javascript:(0)" title="">请求参数</a></h3><ul>';
			strHTML +='<li><a href="javascript:(0)" title="">全部参数: '+url[0]+'</a></li>';
		for (i in query){
			var pair = query[i].split("=");
				strHTML += '<li><a href="javascript:(0)" title="">参数: '+pair[0]+ ' 数值: '+ decodeURIComponent(pair[1]) +'</a></li>';
		}
		strHTML += '</ul>';

		yURL.style.display='block';
		yURL.innerHTML = strHTML;
	}
	chrome.tabs.executeScript(null, {code: 'document.location.search'}, getURL);
}









