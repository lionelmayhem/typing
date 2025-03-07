import { twoCharWords, threeCharWords, fourCharWords, solutions } from "./words.js";

let wordsList = [];
let currentWordIndex = 0;
let firstRowWordIndex = 0;
let inputHistory = [];
let currentInput = "";
let wordsConfig = 10;
let timeConfig = 30;
let time = timeConfig;
let timer = null;
let testActive = false;
let testMode = "words";
let testStart, testEnd;
let isComposing = false;
let activeText = "";
let wordCorrectChars = [];

function setFocus(foc) {
	if (foc) {
		$("#top").addClass("focus");
		$("#bottom").addClass("focus");
		$("body").css("cursor", "none");
	} else {
		startCaretAnimation();
		$("#top").removeClass("focus");
		$("#bottom").removeClass("focus");
		$("body").css("cursor", "default");
	}
}

function initWords() {
	testActive = false;
	currentWordIndex = 0;
	wordsList = [];
	inputHistory = [];
	currentInput = "";

	// CALCULATING fixed solutions 2x + 3y + 4z = targetLength
	// let s = [];
	// let targetLength = 200;
	// for (let twoCount = Math.floor(targetLength / 6); twoCount <= Math.floor(targetLength / 2); twoCount++) {
	// 	const excludeTwoCountLength = targetLength - twoCount * 2;
	// 	for (
	// 		let threeCount = Math.floor(excludeTwoCountLength / 12);
	// 		threeCount <= Math.floor(excludeTwoCountLength / 4);
	// 		threeCount++
	// 	) {
	// 		const remainingLength = excludeTwoCountLength - threeCount * 3;
	// 		if (remainingLength % 4 === 0) {
	// 			const fourCount = remainingLength / 4;
	// 			if (
	// 				fourCount > 14 &&
	// 				threeCount > 10 &&
	// 				twoCount > threeCount &&
	// 				twoCount * 2 + threeCount * 3 + fourCount * 4 === targetLength
	// 			)
	// 				s.push({ twoCount, threeCount, fourCount });
	// 		}
	// 	}
	// }
	// console.log(s);

	if (testMode == "time") {
	} else if (testMode == "words") {
		let existingWords = new Set();
		const solution = solutions[wordsConfig][Math.floor(Math.random() * solutions[wordsConfig].length)];

		addRandomWords(solution.twoCount, twoCharWords, existingWords, wordsList);
		addRandomWords(solution.threeCount, threeCharWords, existingWords, wordsList);
		addRandomWords(solution.fourCount, fourCharWords, existingWords, wordsList);

		// Fisher-Yates shuffle
		for (let i = wordsList.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[wordsList[i], wordsList[j]] = [wordsList[j], wordsList[i]];
		}
	} else if (testMode == "custom") {
	}
	showWords();
}

function addRandomWords(count, wordArray, existingWords, wordsList) {
	if (count > wordArray.length) {
		throw new Error("Not enough uniques words available");
	}
	for (let i = 0; i < count; i++) {
		let randomWord;
		do {
			randomWord = wordArray[Math.floor(Math.random() * wordArray.length)];
		} while (existingWords.has(randomWord));
		wordsList.push(randomWord);
		existingWords.add(randomWord);
	}
}

function addWord() {
	let randomWord = words[Math.floor(Math.random() * words.length)];
	wordsList.push(randomWord);
	let w = "<div class='word'>";
	for (let c = 0; c < randomWord.length; c++) {
		w += "<letter>" + randomWord.charAt(c) + "</letter>";
	}
	w += "</div>";
	$("#words").append(w);
}

function showWords() {
	$("#words").empty();
	$("#firstRow").empty();
	$("#inputDisplay").empty();
	let currentLineWidth = 0;
	const containerWidth = parseInt($("#centerContent").css("max-width"));
	const letterWidth = parseFloat(getComputedStyle(document.documentElement).fontSize);
	const wordSpacing = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--word-margin")) * 2;
	// console.log(containerWidth, letterWidth, wordSpacing);

	// create words and track which ones fit in first row
	for (let i = 0; i < wordsList.length; i++) {
		let wordDiv = $("<div class='word'></div>");
		for (let c = 0; c < wordsList[i].length; c++) {
			wordDiv.append($("<letter>" + wordsList[i].charAt(c) + "</letter>"));
		}

		// Add word to either firstRow or words div based on width
		const wordWidth = wordsList[i].length * letterWidth + wordSpacing;
		if (currentLineWidth + wordWidth <= containerWidth) {
			$("#firstRow").append(wordDiv);
			currentLineWidth += wordWidth;
		} else {
			$("#words").append(wordDiv);
		}
	}

	// inputDisplay initialization
	firstRowWordIndex = 0;
	newWord();
	updateCaretPosition();
}

function updateFirstRowCurrentWord() {
	$("#firstRow .word").removeClass("current");
	$($("#firstRow .word")[firstRowWordIndex]).addClass("current");
	$("#inputDisplay .word").removeClass("current");
	$($("#inputDisplay .word")[firstRowWordIndex]).addClass("current").removeClass("error");
	// $("#inputDisplay .word").each(function (index) {
	// 	console.log(`Word ${index}:`, $(this)[0].outerHTML);
	// });
}

function newWord() {
	$("#inputDisplay").append("<div class='word'><letter></letter></div>");
	updateFirstRowCurrentWord();
}

function deleteWord() {
	$("#inputDisplay .word").last().remove();
	updateFirstRowCurrentWord();
}

function highlightBadWord() {
	$("#inputDisplay .word").last().addClass("error");
}

function hideCaret() {
	$("#caret").addClass("hidden");
}

function showCaret() {
	$("#caret").removeClass("hidden");
	startCaretAnimation();
}

function stopCaretAnimation() {
	$("#caret").css("animation-name", "none");
	$("#caret").css("background-color", "var(--caret-color)");
}

function startCaretAnimation() {
	$("#caret").css("animation-name", "caretFlash");
}

function showTimer() {
	$("#timerWrapper").css("opacity", 1);
}

function hideTimer() {
	$("#timerWrapper").css("opacity", 0);
}

function updateCaretPosition() {
	let caret = $("#caret");
	let inputLen = currentInput.length;
	let lastLetter = $("#inputDisplay .word.current letter, #inputDisplay .word.current active-letter").last();
	let lastLetterPos = lastLetter.position();
	let letterHeight = lastLetter.height();

	const newPos = {
		top: lastLetterPos.top - letterHeight / 4,
		left: lastLetterPos.left - caret.width() / 2 + (inputLen > 0 ? lastLetter.width() : 0),
	};
	caret.css(newPos);
	// update input's position to match caret's (with tuning)
	$("#wordsInput").css({
		...newPos,
		top: newPos.top + 20,
	});
}

function calculateStats() {
	if (testMode == "words") {
		if (inputHistory.length != wordsList.length) return;
	}
	let correctChars = 0;
	let incorrectChars = 0;
	let totalChars = 0;
	let missedChars = 0;
	for (let i = 0; i < inputHistory.length; i++) {
		totalChars += wordsList[i].length;
		for (let c = 0; c < inputHistory[i].length; c++) {
			if (inputHistory[i][c] === wordsList[i][c]) {
				correctChars++;
			} else {
				incorrectChars++;
			}
		}
		if (inputHistory[i].length < wordsList[i].length) {
			missedChars += wordsList[i].length - inputHistory[i].length;
		}
	}
	let testSeconds = (testEnd - testStart) / 1000;
	let wpm = 0;
	if (testMode == "time") {
		wpm = Math.round(correctChars * (60 / timeConfig));
	} else if (testMode == "words" || testMode == "custom") {
		wpm = Math.round(correctChars * (60 / testSeconds));
	}
	$("#liveWpm .group .val").text(wpm);
	let totalTyped = correctChars + incorrectChars;
	let acc;
	if (totalTyped > totalChars) {
		acc = Math.round((correctChars / totalTyped) * 100);
	} else {
		acc = Math.round((correctChars / totalChars) * 100);
	}
	let key = correctChars + "/" + (incorrectChars + missedChars);
	console.log({ totalChars, correctChars, missedChars, incorrectChars });
	return { wpm: wpm, acc: acc, key: key };
}

function liveWPM() {
	let testNow = Date.now();
	let testSeconds = (testNow - testStart) / 1000;
	let correctChars = wordCorrectChars.reduce((sum, count) => sum + count, 0);
	let wpm = correctChars * (60 / testSeconds);
	console.log("test seconds:", testSeconds);
	console.log("LIVE correct chars:", correctChars);
	if ($("#liveWpm").css("opacity") == 0) {
		$("#liveWpm").css("opacity", 1);
	}
	$("#liveWpm .group .val").text(Math.round(wpm));
}

function showResult() {
	testEnd = Date.now();
	let stats = calculateStats();
	$("#liveWpm").css("opacity", 0);
	$("#liveWpm").addClass("hidden");
	$("#firstRow .word.current").removeClass("current");
	$("#inputDisplay .word.current").removeClass("current");

	$("#middle .result .wpm .val").text(stats.wpm);
	$("#middle .result .acc .val").html(stats.acc + "<span style='font-size: 0.75em'>%</span>");
	$("#middle .result .key .val").text(stats.key);

	testActive = false;
	$("#middle .result")
		.removeClass("hidden")
		.animate({ opacity: 1 }, 0, () => {
			setFocus(false);
		});
	hideCaret();
}

function updateTimer() {
	liveWPM();
	let percent = ((time - 1) / timeConfig) * 100;
	$("#timer")
		.stop(true, true)
		.css("width", 100 - percent + "vw");
}

function restartTest() {
	$("#wordsInput").val("");
	let oldHeight = $("#words").height();
	$("#middle .result").addClass("hidden");
	setFocus(false);
	$("#liveWpm").removeClass("hidden");
	$("#wordsInput").focus();
	initWords();
	testActive = false;
	wordCorrectChars = new Array(wordsList.length).fill(0);
	startCaretAnimation();
	if (testMode == "time") {
		hideTimer();
		setTimeout(function () {
			$("#timer")
				.css("transition", "none")
				.css("width", "0vw")
				.animate({ top: 0 }, 0, () => {
					$("#timer").css("transition", "1s linear");
				});
		}, 250);
		clearInterval(timer);
		timer = null;
		time = timeConfig;
	}
	let newHeight = $("#words").css("height", "fit-content").css("height", "-moz-fit-content").height();
	if (testMode == "words" || testMode == "custom") {
		$("#words")
			.stop(true, true)
			.css("height", oldHeight)
			.animate({ height: newHeight }, 250, () => {
				$("#words").css("height", "fit-content").css("height", "-moz-fit-content");
				updateCaretPosition();
			});
	} else if (testMode == "time") {
		$("#words")
			.stop(true, true)
			.css("height", oldHeight)
			.animate({ height: 78 }, 250, () => {
				updateCaretPosition();
			});
	}
}

function changeCustomText() {
	customText = prompt("Custom text");
	initWords();
}

function timesUp() {
	hideCaret();
	testActive = false;
	showResult();
}

function compareInput(isSpace = false) {
	console.log("COMPARE INPUT CALLED");
	let word = "<letter></letter>"; // for updating caret when input.length = 0
	let currentWord = wordsList[currentWordIndex];
	$("#inputDisplay .word").last().empty();

	// set current word in #firstRow (since it might be padded)
	let cw = "";
	for (let i = 0; i < currentWord.length; i++) {
		cw += "<letter>" + currentWord[i] + "</letter>";
	}
	$("#firstRow .word.current").html(cw);

	// Reset the count for current word position
	wordCorrectChars[currentWordIndex] = 0;

	// console.log({ currentInput, currentWord });
	for (let i = 0; i < currentInput.length; i++) {
		if (currentWord[i] == currentInput[i]) {
			word += '<letter class="correct">' + currentWord[i] + "</letter>";
			if (isSpace) {
				wordCorrectChars[currentWordIndex]++;
			}
		} else {
			if (currentWord[i] == undefined) {
				// extra letter -> pad #firstRow
				word += '<letter class="incorrect extra">' + currentInput[i] + "</letter>";
				$("#firstRow .word.current").append("<letter style='color: transparent'>哈</letter>");
			} else {
				word += '<letter class="incorrect">' + currentInput[i] + "</letter>";
				// original
				// word += '<letter class="incorrect">' + currentInput[i] + "</letter>";
			}
		}
	}
	// is space -> add missing chars
	if (isSpace && currentInput.length < currentWord.length) {
		for (let i = currentInput.length; i < currentWord.length; i++) {
			word += '<letter class="missing">' + currentWord[i] + "</letter>";
		}
	}
	$("#inputDisplay .word.current").html(word);
	// show result if reached last word and input is correct
	if (currentWord == currentInput && currentWordIndex == wordsList.length - 1) {
		inputHistory.push(currentInput);
		currentInput = "";
		showResult();
	}
	// console.log("Current word:", $("#inputDisplay .word.current")[0].outerHTML);
	if (isSpace) {
		liveWPM();
	}
}

$(document).on("click", "#top .config .wordCount .button", (e) => {
	let wrd = e.currentTarget.innerHTML;
	changeWordCount(wrd);
});

function changeWordCount(wordCount) {
	changeMode("words");
	wordsConfig = parseInt(wordCount);
	$("#top .config .wordCount .button").removeClass("active");
	$("#top .config .wordCount .button[wordCount='" + wordCount + "']").addClass("active");
	restartTest();
}

$(document).on("click", "#top .config .time .button", (e) => {
	time = e.currentTarget.innerHTML;
	console.log("time clicked to: ", time);
	changeTimeConfig(time);
});

function changeTimeConfig(time) {
	changeMode("time");
	timeConfig = time;
	$("#top .config .time .button").removeClass("active");
	$("#top .config .time .button[timeConfig='" + time + "']").addClass("active");
	restartTest();
}

$(document).on("click", "#top .config .customText .button", (e) => {
	changeCustomText();
});

$(document).on("click", "#top .config .mode .button", (e) => {
	if ($(e.currentTarget).hasClass("active")) return;
	let mode = e.currentTarget.getAttribute("mode");
	console.log("mode: ", mode);
	changeMode(mode);
});

function changeMode(mode) {
	testMode = mode;
	$("#top .config .mode .button").removeClass("active");
	$("#top .config .mode .button[mode='" + mode + "']").addClass("active");
	if (testMode == "time") {
		$("#top .config .wordCount").addClass("hidden");
		$("#top .config .time").removeClass("hidden");
		$("#top .config .customText").addClass("hidden");
	} else if (testMode == "words") {
		$("#top .config .wordCount").removeClass("hidden");
		$("#top .config .time").addClass("hidden");
		$("#top .config .customText").addClass("hidden");
	} else if (testMode == "custom") {
		$("#top .config .wordCount").addClass("hidden");
		$("#top .config .time").addClass("hidden");
		$("#top .config .customText").removeClass("hidden");
	}
	restartTest();
}

$("#restartTestButton").keypress((event) => {
	if (event.keyCode == 32 || event.keyCode == 13) {
		restartTest();
		$("#wordsInput").focus();
	}
});

$("#restartTestButton").click((event) => {
	restartTest();
});

$("#firstRow, #inputDisplay, #words").click((e) => {
	if ($("#middle .result").hasClass("hidden")) {
		$("#wordsInput").focus();
	}
});

$("#wordsInput").on({
	focus: () => {
		if ($("#middle .result").hasClass("hidden")) showCaret();
	},
	focusout: hideCaret,
});

$("#wordsInput").on("compositionstart", (e) => {
	isComposing = true;
	activeText = e.originalEvent.data;
});

$("#wordsInput").on("compositionupdate", (e) => {
	activeText = e.originalEvent.data;
});

$("#wordsInput").on("compositionend", (e) => {
	// usually this is when enter is pressed after composing
	isComposing = false;
	activeText = "";
	compareInput();
});

function showInput() {
	console.log("SHOW INPUT CALLED");
	// what is shown during composition
	let lastWord = $("#inputDisplay .word").last();
	let letters = "<letter></letter>";
	let currentLen = currentInput.length;
	let activeLen = activeText.length;
	for (let c = 0; c < currentLen - activeLen; c++) {
		letters += "<letter>" + currentInput.charAt(c) + "</letter>";
	}
	for (let c = currentLen - activeLen; c < currentLen; c++) {
		letters += "<active-letter>" + currentInput.charAt(c) + "</active-letter>";
	}
	lastWord.html(letters); // set last word to input
	// console.log("ACTIVE LENGTH:", activeLen);
}

$("#wordsInput").on("input", (e) => {
	// const text = e.target.value;
	// const lastChar = text.slice(-1);
	// const isTradChinese = /[\u4e00-\u9fff\u3105-\u312F]/.test(lastChar);
	// console.log(`"${lastChar}" is ${isTradChinese ? "Trad Chinese" : "Not Trad Chinese"}`);

	if (e.originalEvent.inputType === "deleteContentBackward") {
		console.log("DELETE BUTTON PRESSED"); // when delete pressed, we need to compareInput not showInput
		return;
	}
	if (!$("#wordsInput").is(":focus")) {
		console.log("NOT FOCUSED");
		return;
	}
	if (!testActive) {
		if (currentInput == "" && inputHistory.length == 0) {
			testActive = true;
			stopCaretAnimation();
			testStart = Date.now();
			console.log("TEST STARTED");
			// if (testMode == "time") {
			// 	showTimer();
			// 	updateTimer();
			// 	timer = setInterval(function () {
			// 		time--;
			// 		updateTimer();
			// 		if (time == 0) {
			// 			clearInterval(timer);
			// 			timesUp();
			// 		}
			// 	}, 1000);
			// }
		} else {
			console.log("TEST NOT ACTIVE");
			return;
		}
	}
	currentInput = e.target.value;
	setFocus(true);
	showInput();
	updateCaretPosition();
	// console.log("Current Input:", currentInput);
});

$(window).resize(() => {
	updateCaretPosition();
});

$(document).mousemove(() => {
	setFocus(false);
});

$(document).keydown((event) => {
	// escape
	if (event.key == "Escape") {
		if ($("#commandLineWrapper").hasClass("hidden")) {
			currentCommands = commands;
			showCommandLine();
		} else {
			hideCommandLine();
		}
	}

	if ($("#wordsInput").is(":focus")) {
		// backspace
		if (event.key === "Backspace") {
			if (!testActive) return;
			if (currentInput == "" && inputHistory.length > 0) {
				if (inputHistory[currentWordIndex - 1] === wordsList[currentWordIndex - 1] || firstRowWordIndex === 0) {
					console.log("cannot go back a word");
					return;
				} else {
					if (event.metaKey || event.ctrlKey) {
						currentInput = "";
						inputHistory.pop();
						console.log("went back a word (to start)");
					} else {
						event.preventDefault(); // to prevent deleting an extra letter
						currentInput = inputHistory.pop();
						$("#wordsInput").val(currentInput);
						console.log("went back to word:", currentInput);
					}
					currentWordIndex--;
					firstRowWordIndex--;
					deleteWord();
				}
			} else {
				if (event.metaKey || event.ctrlKey) {
					currentInput = "";
					// wordsInput's value will be changed by the IME, so don't bother?
					// $("#wordsInput").val("");
					console.log("delete current word");
				} else {
					let deleted = currentInput.slice(-1);
					currentInput = currentInput.substring(0, currentInput.length - 1);

					console.log("deleted a letter: %s -> %s", currentInput + deleted, currentInput);
					// console.log("#wordsInput:", $("#wordsInput").val());
					// console.log("current input:", currentInput);
				}
			}
			compareInput();
			updateCaretPosition();
		}

		// space (or enter)
		let isLastWord = $("#firstRow .word.current").is($("#firstRow .word").last());
		if (event.key === " " || (event.key === "Enter" && isLastWord)) {
			event.preventDefault();
			if (!testActive || isComposing || currentInput === "") return;
			$("#wordsInput").val("");
			compareInput(true);
			let currentWord = wordsList[currentWordIndex];

			// if (testMode == "time") {
			// 	let currentTop = $($("#words .word")[currentWordIndex]).position().top;
			// 	let nextTop = $($("#words .word")[currentWordIndex + 1]).position().top;
			// 	if (nextTop > currentTop) {
			// 		// last word of the line
			// 		for (let i = 0; i < currentWordIndex + 1; i++) {
			// 			$($("#words .word")[i]).addClass("hidden");
			// 			// addWordLine();
			// 		}
			// 	}
			// }

			inputHistory.push(currentInput);
			if (currentWord != currentInput) {
				highlightBadWord(); // red underline
				if (currentWordIndex == wordsList.length - 1) {
					showResult();
					console.log("finished test, last word is bad word");
					return;
				}
			}
			if (isLastWord) {
				$("#inputDisplay").empty();
				firstRowWordIndex = 0;
				// fill first row
				const wordsTop = $("#words").children().first().position().top;
				const wordsTopRow = $("#words")
					.children()
					.filter(function () {
						return $(this).position().top === wordsTop;
					});
				$("#firstRow").empty();
				$("#firstRow").append(wordsTopRow);
			} else {
				firstRowWordIndex++;
			}
			currentInput = "";
			currentWordIndex++;
			newWord(); // create new active empty word in #inputDisplay
			updateCaretPosition();
			if (testMode == "time") {
				addWord();
			}
		}
	}
});

let commands = {
	title: "",
	list: [
		{
			id: "changeMode",
			display: "Change mode...",
			subgroup: true,
			exec: () => {
				currentCommands = commandsMode;
				showCommandLine();
			},
		},
		{
			id: "changeTimeConfig",
			display: "Change time config...",
			subgroup: true,
			exec: () => {
				currentCommands = commandsTimeConfig;
				showCommandLine();
			},
		},
		{
			id: "changeWordCount",
			display: "Change word count...",
			subgroup: true,
			exec: () => {
				currentCommands = commandsWordCount;
				showCommandLine();
			},
		},
	],
};

let commandsWordCount = {
	title: "Change word count...",
	list: [
		{
			id: "changeWordCount10",
			display: "10",
			exec: () => changeWordCount("10"),
		},
		{
			id: "changeWordCount25",
			display: "25",
			exec: () => changeWordCount("25"),
		},
		{
			id: "changeWordCount50",
			display: "50",
			exec: () => changeWordCount("50"),
		},
		{
			id: "changeWordCount100",
			display: "100",
			exec: () => changeWordCount("100"),
		},
		{
			id: "changeWordCount200",
			display: "200",
			exec: () => changeWordCount("200"),
		},
	],
};
let commandsMode = {
	title: "Change mode...",
	list: [
		{
			id: "changeModeTime",
			display: "time",
			exec: () => changeMode("time"),
		},
		{
			id: "changeModeWords",
			display: "words",
			exec: () => changeMode("words"),
		},
		{
			id: "changeModeCustom",
			display: "custom",
			exec: () => changeMode("custom"),
		},
	],
};
let commandsTimeConfig = {
	title: "Change time config...",
	list: [
		{
			id: "changeTimeConfig15",
			display: "15",
			exec: () => changeTimeConfig("15"),
		},
		{
			id: "changeTimeConfig30",
			display: "30",
			exec: () => changeTimeConfig("30"),
		},
		{
			id: "changeTimeConfig60",
			display: "60",
			exec: () => changeTimeConfig("60"),
		},
		{
			id: "changeTimeConfig120",
			display: "120",
			exec: () => changeTimeConfig("120"),
		},
	],
};

let currentCommands = commands;

$("#commandLine input").keydown((e) => {
	if (e.keyCode == 13) {
		// enter
		e.preventDefault();
		let command = $(".suggestions .entry.active").attr("command");
		let subgroup = false;
		$.each(currentCommands.list, (i, obj) => {
			if (obj.id == command) {
				obj.exec();
				subgroup = obj.subgroup;
			}
		});
		if (!subgroup) hideCommandLine();
		return;
	}
	if (e.keyCode == 38 || e.keyCode == 40) {
		// up
		let entries = $(".suggestions .entry");
		let activenum = -1;
		$.each(entries, (index, obj) => {
			if ($(obj).hasClass("active")) activenum = index;
		});
		if (e.keyCode == 38) {
			entries.removeClass("active");
			if (activenum == 0) {
				$(entries[entries.length - 1]).addClass("active");
			} else {
				$(entries[--activenum]).addClass("active");
			}
		}
		if (e.keyCode == 40) {
			entries.removeClass("active");
			if (activenum + 1 == entries.length) {
				$(entries[0]).addClass("active");
			} else {
				$(entries[++activenum]).addClass("active");
			}
		}

		return false;
	}
});

$("#commandLine input").keyup((e) => {
	if (e.keyCode == 38 || e.keyCode == 40) return;
	updateSuggestedCommands();
});

function hideCommandLine() {
	$("#commandLineWrapper")
		.stop(true, true)
		.css("opacity", 1)
		.animate(
			{
				opacity: 0,
			},
			100,
			() => {
				$("#commandLineWrapper").addClass("hidden");
			}
		);
	$("#wordsInput").focus();
}

function showCommandLine() {
	if ($("#commandLineWrapper").hasClass("hidden")) {
		$("#commandLineWrapper").stop(true, true).css("opacity", 0).removeClass("hidden").animate(
			{
				opacity: 1,
			},
			100
		);
	}
	$("#commandLine input").val("");
	updateSuggestedCommands();
	$("#commandLine input").focus();
}

function updateSuggestedCommands() {
	let inputVal = $("#commandLine input").val().toLowerCase().split(" ");
	if (inputVal[0] == "") {
		$.each(currentCommands.list, (index, obj) => {
			obj.found = true;
		});
	} else {
		$.each(currentCommands.list, (index, obj) => {
			let foundcount = 0;
			$.each(inputVal, (index2, obj2) => {
				if (obj2 == "") return;
				let re = new RegExp(obj2, "g");
				let res = obj.display.toLowerCase().match(re);
				if (res != null && res.length > 0) {
					foundcount++;
				} else {
					foundcount--;
				}
			});
			if (foundcount > 0) {
				obj.found = true;
			} else {
				obj.found = false;
			}
		});
	}
	displayFoundCommands();
}

function displayFoundCommands() {
	$("#commandLine .suggestions").empty();
	$.each(currentCommands.list, (index, obj) => {
		if (obj.found) {
			$("#commandLine .suggestions").append(
				'<div class="entry" command="' + obj.id + '">' + obj.display + "</div>"
			);
		}
	});
	if ($("#commandLine .suggestions .entry").length == 0) {
		$("#commandLine .separator").css({ height: 0, margin: 0 });
	} else {
		$("#commandLine .separator").css({
			height: "1px",
			"margin-bottom": ".5rem",
		});
	}
	let entries = $("#commandLine .suggestions .entry");
	if (entries.length > 0) {
		$(entries[0]).addClass("active");
	}
	$("#commandLine .listTitle").remove();
	// if(currentCommands.title != ''){
	//   $("#commandLine .suggestions").before("<div class='listTitle'>"+currentCommands.title+"</div>");
	// }
}

document.addEventListener("DOMContentLoaded", () => {
	console.log("DOM loaded");
	restartTest();
	$("#centerContent").removeClass("hidden");
	// $("#centerContent").css("opacity", "0").removeClass("hidden");
	// $("#centerContent").stop(true, true).animate({ opacity: 1 }, 250);
});

// debug use
$(document).on("click", ".button", (e) => {
	console.log("Any button clicked:", e.currentTarget);
});
