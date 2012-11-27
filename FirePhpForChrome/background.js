
var storage = chrome.storage.local;
var USE_FIREPHP = false;


//程序载入
if(chrome.tabs.onUpdated) {
  chrome.tabs.onUpdated.addListener(FirePhpAnalysis);
};

//整理数据到数组
function processWfHeaders(headersRaw) {
  var headers = headersRaw.split("\n");
  headers.sort();
  var headersWf = [];
  for(var i in headers) {
    console.log(headers[i]);
    var m = headers[i].match(/^X-Wf-1-(\d+)-1-(\d+): (\d+)\|(.*)\|/i);
    if(m) {
    console.log(headers[i])
      headersWf.push([m[1], m[2], m[3], eval(m[4])]);
    }

  }
  return headersWf;
}

//主要处理函数
function FirePhpAnalysis(tabId, change, tab) {
  //判断是否启动调试
  storage.get('active', function(FirePHP) {USE_FIREPHP = FirePHP.active;});

  if (USE_FIREPHP == false) {
    chrome.pageAction.setTitle({
      'tabId':tabId,
      'title': 'FirePHP未启动'
    });
    chrome.pageAction.setIcon({
      'tabId':tabId,
      'path':"icon/!!.png"
    });
    chrome.pageAction.show(tabId);
    return;
  };

  var isChromePath = tab.url.match("chrome://");
  var isChromeExt = tab.url.match("chrome-extension://");
  var isFilePath = tab.url.match("file://");
  var isAboutPage = tab.url.match("about:");
  var isAbove = isChromePath || isChromeExt || isFilePath || isAboutPage;

  if(!isAbove) {
    //初始化图标
    chrome.pageAction.setTitle({
      'tabId':tabId,
      'title': '...'
    });
    chrome.pageAction.setIcon({
      'tabId':tabId,
      'path':"icon/!.png"
    });

    if(change.status == "complete") {

      var xhr = new XMLHttpRequest();
          xhr.open("HEAD", tab.url, true);
          xhr.setRequestHeader("X-FirePHP", "0.4.4");
          xhr.setRequestHeader("X-FirePHP-Version", "0.4.4");
          xhr.send();

      xhr.onreadystatechange = function() {
        if(xhr.readyState == 4) {
          if(xhr.getAllResponseHeaders()) {

            var headers = xhr.getAllResponseHeaders();
            var headersWf = processWfHeaders(headers);

            if(headersWf.length) {
              //动态设置图标
              var hc = headersWf.length.toString();
              chrome.pageAction.setTitle({
                'tabId':tabId,
                'title': hc
              });
              if (hc>10) {hc = '10+';}
              chrome.pageAction.setIcon({
                'tabId':tabId,
                'path':"icon/"+hc+".png"
              });

              console.log('开始输出:')
              console.log(headersWf)

              storage.set({'yLog': headersWf}, function(){});

              for(var i in headersWf) {
                console.log(headersWf[i]);
                console.log('\n\n')
              }
            } else {
              chrome.pageAction.setTitle({
                'tabId':tabId,
                'title': ''
              });
              storage.set({'yLog': ""}, function(){});
            }
          } else {
              storage.set({'yLog': ""}, function(){});
          }//DATA CORRECT
        }//XHR STATE == 4
      }//XHR HANDLE
    }//TAB CHANGE
  }//URL CORRECT

  chrome.pageAction.show(tabId);
};