marked.setOptions({
  	highlight: function (code, lang) {
  		if (lang) return hljs.highlightAuto(code, [lang]).value;
  		else return hljs.highlightAuto(code).value;
	}
});

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		switch (request.mode) {
  			case 'markdown':
				sendResponse({
					resultHtml: request.itemHTML.replace(/\`\`\`(.+?)\`\`\`/g, function ($0) {
						codeBlock = $0.replace(/(\<br\>)/ig, "\n");
						codeBlock = codeBlock.replace(/&lt;/g,"<");
						codeBlock = codeBlock.replace(/&gt;/g,">");
				    	return marked(codeBlock);
					})
				});
    		break

  			case 'gist':
                httpReq('GET', request.gistHref+'.json', {tmp: 'kyky'}, function(response) {
                    sendResponse({
                        gistJson: JSON.parse(response)
                    })
                });
				return true;
    		break
		}
	}
);

function httpReq(method, url, params, callBack) {
    var request = new XMLHttpRequest();
    request.open(method, url, true);
    request.onload = function() {callBack(request.response)};
    request.send(JSON.stringify(params));
}