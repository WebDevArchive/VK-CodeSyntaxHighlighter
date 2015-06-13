/* Utils */
function httpPost(url, params, callBack) {
    return new Promise(function(resolve, reject) {
        var request = new XMLHttpRequest();
        request.open('POST', url, true);
        request.onload = function() {callBack(request.response)};
        request.send(JSON.stringify(params));
    });
}

function selectGistHref(gistInfo) {
	gistInfoA = gistInfo.getElementsByTagName("A")[0];
    var range=document.createRange();
    range.selectNode(gistInfoA);
    window.getSelection().addRange(range);
}

function copyToClipboard(text){
    var copyDiv = document.createElement('div');
    copyDiv.contentEditable = true;
    document.body.appendChild(copyDiv);
    copyDiv.innerHTML = text;
    copyDiv.unselectable = "off";
    copyDiv.focus();
    document.execCommand('SelectAll');
    document.execCommand("Copy", false, null);
    document.body.removeChild(copyDiv);
}

/* Events */
document.getElementById('gistForm').addEventListener('submit', function (event) {
    event.preventDefault();
    var gistCode = document.getElementById('gistCode').value;
    if (!gistCode) {
    	alert("Этот код слишком идеальный для gist. \nПопробуйте другой.");
    	return false;
    }

    var data = {
        "description": "Gist from «VK CodeSyntaxHighlighter»",
        "public": true,
        "files": {}
    };
    var fileName = document.getElementById('gistFileName').value;
    if (!fileName) fileName = "file.md";
    data.files[fileName] = {
        "content": document.getElementById('gistCode').value
    }

    httpPost('https://api.github.com/gists', data, function(response) {
        gistJson = JSON.parse(response);
        var gistInfo = document.createElement('div');
        gistInfo.setAttribute("class", "gistInfo");
        gistInfo.innerHTML = '<a href="'+gistJson.html_url+'">'+gistJson.html_url+'</a>';
		gistInfo.addEventListener('click', function (event) {
    		selectGistHref(this);
    		copyToClipboard(this.innerHTML);
		});
		document.getElementById("gistForm").appendChild(gistInfo);
        selectGistHref(gistInfo);
    });
});
document.getElementById("gistCode").focus();