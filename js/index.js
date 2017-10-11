var checkCnt = 0;
var timerID;

function init(timer) {
	if (navigator.userAgent.match(/Android/i) 
		|| navigator.userAgent.match(/iPhone/i)
 		|| navigator.userAgent.match(/iPad/i)) {
		changeFontSize(document.documentElement.clientWidth);
 	}
	if (timer) {
		startTimer();
	}
}

function copyInput(element) {
	document.getElementById('vfile').innerHTML = element.value.replace("C:\\fakepath\\", "");
	document.getElementById('upload').submit();
}

function enableSubmit() {
	document.getElementById('remove').onclick = function() {
			document.getElementById('rmlist').submit();
		}
	document.getElementById('remove').style.background = '#5da9f6';
}

function disableSubmit() {
	document.getElementById('remove').onclick = 'null';
	document.getElementById('remove').style.background = 'lightgrey';
}

function toggleSubmit(checkbox) {
	if (checkbox.checked) {
		if (checkCnt++ <= 0) {
			enableSubmit();
		}
	} else {
		if (--checkCnt <= 0) {
			disableSubmit();
		}
	}
}

function enterKey() {
	document.getElementById('login').submit();
}

function checkKeyPress(evt, key, fn) {
	if (evt.keyCode == key) {
		fn();
	}
}

function changeFontSize(w) {
	var all = document.getElementsByTagName("*");
	
	for (var i = 0; i < all.length; i++) {
		all[i].style.fontSize = (w * 0.03) + "px";
	}
}

function startTimer() {
	timerID = setTimeout(refreshPage, 1000 * 60 * 5);
//	document.documentElement.onmousemove = resetTimer;
//	document.documentElement.addEventListener('touchstart', resetTimer, false);
}

//function resetTimer() {
//	clearTimeout(timerID);
//	timerID = setTimeout(refreshPage, 1000 * 60 * 5);	
//}

function refreshPage() {
	location.reload();
}