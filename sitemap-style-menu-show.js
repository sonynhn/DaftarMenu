document.write('<a href="http://jamtanganqu.com" style="font-size: 10px; text-decoration:none; color: #660000;float:right;margin-top:-5px;">Jam Tangan Original</a>')
function getID(a) {
	return document.getElementById(a);}
var head = document.getElementsByTagName('head')[0],
	tocContainer = getID('feedContainer'),
	feedNav = getID('feedNav'),
	orderByer = getID('orderFeedBy'),
	labelSorter = getID('labelSorter'),
	input = getID('postSearcher').getElementsByTagName('input')[0],
	resultDesc = getID('resultDesc'),
	nextPage, feedArchive, startPage = 0;

function cropFeed(a, b) {
	var str = a.split("<");
	for (var i = 0; i < str.length; i++) {
		if (str[i].indexOf(">") != -1) {
			str[i] = str[i].substring(str[i].indexOf(">") + 1, str[i].length);
		}
	}
	str = str.join(" ");
	str = str.substring(0, b - 1);
	return str;}
function showLabels(json) {
	var cat = json.feed.category, skeleton = "";
	skeleton  = "<select id='labelSorter' onchange='changeSort(this.value);'>";
	skeleton += "<option value='' selected>KATEGORI...</option>";
	for (var i = 0; i < cat.length; i++) {
		skeleton += "<option value='" + decodeURIComponent(cat[i].term) + "'>" + cat[i].term.toUpperCase() + "</option>";
	}
	skeleton += "</select>";
	labelSorter.innerHTML = skeleton;}
function showFeedList(json) {
	var entries = json.feed.entry, entry, postTitle, postUrl, postImage, postContent, commentNum, skeleton = "";
	if (typeof (json.feed.entry) !== 'undefined') {
		for (var i = 0; i < tocConfig.feedNum; i++) {
			entry = (entries) ? entries[i] : "", nextPage = "";
			if (i == json.feed.entry.length) {
				break;
			}
			postTitle = entry.title.$t;
			for (var j = 0; j < entry.link.length; j++) {
				if (entry.link[j].rel == 'alternate') {
					postUrl = entry.link[j].href;
					break;
				}
			}
			for (var k = 0; k < json.feed.link.length; k++) {
				if (json.feed.link[k].rel == 'next') {
					nextPage = json.feed.link[k].href;
				}
			}
			for (var l = 0; l < entry.link.length; l++) {
				if (entry.link[l].rel == 'replies' && entry.link[l].type == 'text/html') {
					commentNum = entry.link[l].title;
					break;
				}
			}
			if ("content" in entry) {
				postContent = entry.content.$t;
			} else if ("summary" in entry) {
				postContent = entry.summary.$t;
			} else {
				postContent = "";
			}
			if ("media$thumbnail" in entry) {
				postImage = entry.media$thumbnail.url.replace(/\/s[0-9]+\-c/, "\/s" + tocConfig.thumbWidth + "-c");
			} else {
				postImage = tocConfig.noImage.replace(/\/s[0-9]+\-c/, "\/s" + tocConfig.thumbWidth + "-c");
			}
			skeleton += "<li><div class='inner'>";
			skeleton += "<a href='" + postUrl + "' target='_blank'><img style='width:" + tocConfig.thumbWidth + "px;height:" + tocConfig.thumbWidth + "px;' src='" + postImage + "' alt='" + postTitle + "' /></a>";
			skeleton += "<a class='toc-title' href='" + postUrl + "' target='_blank'>" + postTitle + "</a><strong> - (" + commentNum + ")</strong><br>";
			skeleton += "<div class='news-text'>" + cropFeed(postContent, tocConfig.numChars) + "&hellip;<br style='clear:both;'/></div>";
			skeleton += "</div></li>";}
		if (input.value !== '' && window.location.hash == '#search') {
			resultDesc.innerHTML = "<span>Hasil penelusuran untuk kata kunci <strong>&quot;" + input.value + "&quot;</strong></span>";
		} else {
			resultDesc.innerHTML = "";}
		feedContainer.innerHTML += skeleton;
		if (nextPage) {
			if (window.location.hash && window.location.hash !== '#0') {
				skeleton = "<a href='javascript:initResult(2);' class='next'>" + tocConfig.navText + "</a>";
			} else {
				skeleton = "<a href='javascript:initResult(1);' class='next'>" + tocConfig.navText + "</a>";
			}
		} else {
			skeleton = "<a href='#top' class='front'>" + tocConfig.frontText + "</a>";
		}
		feedNav.innerHTML = skeleton;
		input.value = '';
		labelSorter.getElementsByTagName('select')[0].removeAttribute('disabled');
		orderByer.removeAttribute('disabled');
	} else {
		feedContainer.innerHTML = "";
		alert(tocConfig.noResult);
		feedNav.innerHTML = "<a href='?reload=true'>" + tocConfig.frontText + "</a>";
		searchDesc.innerHTML = "";}}
function initResult(archive) {
	var p, param;
	if (archive == 1) {
		p = nextPage.indexOf("?");
		param = nextPage.substring(p);
	} else if (archive == 2) {
		p = nextPage.indexOf("?");
		param = nextPage.substring(p).replace(/\?/, '/-/' + window.location.hash.substr(1) + '?');
	} else {
		param = "?start-index=1&max-results=" + tocConfig.feedNum + "&orderby=" + orderByer.value + "&alt=json-in-script";}
	param += "&callback=showFeedList";
	updateScript(param);}
function removeScript() {
	var oldScript = getID('temporer-script');
		oldScript.parentNode.removeChild(oldScript);}
function buildLabels() {
	var s = document.createElement('script');
		s.type = "text/javascript";
		s.src = tocConfig.url + "/feeds/posts/summary?max-results=0&alt=json-in-script&callback=showLabels";
	head.appendChild(s);}
function updateScript(tail) {
	if (startPage == 1) {
		removeScript();}
	feedNav.innerHTML = tocConfig.loading;
	if (tocConfig.labelName !== false) {
		feedArchive = tocConfig.url + "/feeds/posts/summary/-/" + tocConfig.labelName + tail;
	} else {
		feedArchive = tocConfig.url + "/feeds/posts/summary" + tail;}
	var toc_script = document.createElement('script');
		toc_script.type = 'text/javascript';
		toc_script.src = feedArchive;
		toc_script.id = 'temporer-script';
	head.appendChild(toc_script);
	startPage = 1;}
function changeSort(label) {
	removeScript();
	tocContainer.innerHTML = "";
	feedNav.innerHTML = tocConfig.loading;
	var newScript = document.createElement('script'),
		labSorter = labelSorter.getElementsByTagName('select')[0],
		l = (label !== 0) ? '/-/' + label : '';
	newScript.type = 'text/javascript';
	newScript.id = 'temporer-script';
	newScript.src = tocConfig.url + '/feeds/posts/summary' + l + '?alt=json-in-script&max-results=' + tocConfig.feedNum + '&orderby=' + orderByer.value + '&callback=showFeedList';
	head.appendChild(newScript);
	labSorter.disabled = true;
	orderByer.disabled = true;
	window.location.hash = label;}
function searchPost() {
	removeScript();
	tocContainer.innerHTML = "";
	resultDesc.innerHTML = "";
	feedNav.innerHTML = tocConfig.searching;
	var newScript = document.createElement('script');
		newScript.type = 'text/javascript';
		newScript.id = 'temporer-script';
		newScript.src = tocConfig.url + '/feeds/posts/summary?alt=json-in-script&orderby=published&q=' + input.value + '&max-results=9999&callback=showFeedList';
	head.appendChild(newScript);
	window.location.hash = '#search';
	return false;}
getID('postSearcher').onsubmit = function() {
	return searchPost();}
orderByer.onchange = function() {
	changeSort(0);}
labelSorter.getElementsByTagName('select')[0].onchange = function() {
	changeSort(this.value);}
window.onload = function() {
	initResult(0);
	buildLabels();
	window.location.hash = '#0';}