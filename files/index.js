var wdaApp = new vkSyntaxHighlighter({
	markdown: {
	    parse: true,
	    theme: 'github'
	},
	gistlinks: {
	    parse: true,
	    collapsed: false
	}
});

function vkSyntaxHighlighter(options) {
	var rootElement;
	var isActive = false;
	var isGistCssReady = false;

	function highlightObserve(fn) {
		var mo = new MutationObserver( function(mutations) {
			for (var i=0, lenMutations=mutations.length; i<lenMutations; i++) {
				if (!isActive) {
					mo.disconnect();
					return false;
				}
				fn(mutations[i].target);
			}
		});
		mo.observe(rootElement, {
			'childList': true,
			'subtree': true
		});
	}

	function highlightCallback () {
		searchLoop('wall_post_text');
		searchLoop('wall_reply_text');
		searchLoop('bp_text');
		searchLoop('im_msg_text');
	}

	function searchLoop (itemClass) {
// TODO: review classes
		var itemClassHighlighted = 'wda-' + itemClass + '-highlighted';
		var itemClassHighlightedNot = '.' + itemClass + ':not(.' + itemClassHighlighted + ')';
		var items = rootElement.querySelectorAll(itemClassHighlightedNot);
		if (!items) return;
		for (var i=0, lenItems=items.length; i<lenItems; i++) {
			if (items[i].className.indexOf(itemClassHighlighted) >= 0) return;
			items[i].className += ' ' + itemClassHighlighted + ' wdaCode-highlighted';

			// inline mardown-code with ```
	     	if (items[i].innerHTML.match(/```(.+?)```/gmi)) processMarkdown(items[i]);

			// links to gist
			var gistHrefItems = items[i].querySelectorAll('a[href^="/away.php?to=https%3A%2F%2Fgist.github.com"]');
			for (var j=0, lenGistHrefItems=gistHrefItems.length; j<lenGistHrefItems; j++) processGistLink(gistHrefItems[j]);
		}
	}

	function processMarkdown (item) {
		// TODO: review "read more" link.
		// delete "read more" link.
		var resultHtml = item.innerHTML.replace(/\<br\>\<a\sclass\=\"wall_.+?_more.+?\<\/a\>/ig, "");
		item.innerHTML = resultHtml.replace(/(\<span.+?display.+?\>)(.+?)(\<\/span\>)/ig, "$2");
		// outer span + start parser
		item.innerHTML = item.innerHTML.replace(/\`\`\`(.+?)\`\`\`/g, function ($0) {
			chrome.runtime.sendMessage({itemHTML: $0, mode: 'markdown'}, function(response) {
				item.querySelector('.wdaCode-markdown').innerHTML = response.resultHtml;
			});
			return '<span class="wdaCode-markdown">' + $0 + '</span>';
		});
	}

	function processGistLink(item) {
		// TODO: review "title"
		if (!item.getAttribute(title)) item.setAttribute("title", decodeURIComponent(item.href.replace(/https\:\/\/vk\.com\/away\.php\?to\=/ig, "")).split(/[&]/g)[0]);
		chrome.runtime.sendMessage({mode: 'gist', gistHref: item.title}, function(response) {
			var gistJson = response.gistJson;
			var gistDiv = document.createElement('div');
			gistDiv.innerHTML = gistJson.div;
			var gistMetaDiv = gistDiv.querySelector('.gist-meta');
			gistMetaDiv.parentNode.removeChild(gistMetaDiv);
			item.parentNode.insertBefore(gistDiv, item.nextSibling);
			// append gist styles (once)
			if (!isGistCssReady) appendGistCss(gistJson.stylesheet);
		});
	}

	function appendGistCss(href) {
		var gistCss=document.createElement("link");
		gistCss.setAttribute("rel", "stylesheet");
		gistCss.setAttribute("type", "text/css");
		gistCss.setAttribute("href", href);
		gistCss.setAttribute("id", "gistCss");
		document.getElementsByTagName("head")[0].appendChild(gistCss);
		gistCssReady = true;
	}

	function stop () {
		isActive = false;
	}

	function run () {
		if (isActive) return false;
		rootElement = document.getElementById('page_body');
		isActive = true;
		highlightCallback();
		highlightObserve(highlightCallback);
		return true;
	}

	function stop () {
		alert('stop');
	}

	document.addEventListener('DOMContentLoaded', function () {
		run();
	}, false);


	return {
	    run: run,
	    stop: stop
	};
}