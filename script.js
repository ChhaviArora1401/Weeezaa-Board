
var board, pointer;    // Board and pointer elements.
var boardX, boardY;       // Coordinates.
var nextX, nextY;
var saveX, saveY;
var posX, posY;
var offsetX = 75;         // Offset of viewport on pointer.
var offsetY = 70;
var questionFld, replyFld;     // Question and reply form fields.
var inReply = false;    // Status flags.
var inContact = false;
var response;             // Response to spell out.
var nextChar;             // Next character to move to.
var step = 5;       // Used for movement.
var timeout = 20;
var pause = 200;
var angle;
var timerID;

// Board positions, each letter and number has position. In addition, other
// symbols are used for other areas of the board:
// ! = 'yes', ~ = 'no', ^ = 'goodbye', _ = rest position, and a space is a blank spot on the board.

var chars = "abcdefghijklmnopqrstuvwxyz1234567890!~^_ ";

// Set up character positions.

posX = new Array(110, 157, 205, 251, 297, 339, 381, 432, 468, 499, 540, 579, 625,
  132, 180, 217, 265, 309, 349, 375, 417, 462, 510, 557, 599, 636,
  179, 223, 268, 317, 356, 400, 440, 480, 520, 563,
  154, 596, 396, 387, 382);

posY = new Array(217, 191, 173, 157, 149, 144, 145, 143, 151, 163, 173, 192, 214,
  278, 246, 231, 222, 210, 207, 206, 209, 214, 226, 242, 261, 288,
  354, 354, 354, 354, 354, 354, 354, 354, 354, 354,
  40, 42, 451, 170, 280);

window.onload = init;

// Initialize everything.

function init() {
  var i;
  // Initialize board and pointer.
  board = document.getElementById("board");
  boardX = getPageOffsetLeft(board);
  boardY = getPageOffsetTop(board);
  pointer = document.getElementById("pointer");
  i = chars.indexOf("_");
  moveElTo(pointer, boardX + posX[i] - offsetX, boardY + posY[i] - offsetY);
  pointer.style.visibility = "visible";
  // Get the question and reply fields.
  questionFld = document.getElementById("question");
  replyFld = document.getElementById("reply");
}

function back() {
  replyFld.value = "";
}
// These functions handle the movement of the pointer when revealing a response.

function handsOn() {
  inContact = true;
}

function handsOff() {
  inContact = false;
  if (inReply) {
    saveX = getElLeft(pointer);
    saveY = getElTop(pointer);
    shakepointer();
  }
}

function startReply() {
  // Start revealing a response.
  response += "_";
  if (!inContact) {
    saveX = getElLeft(pointer);
    saveY = getElTop(pointer);
    shakepointer();
  }
  if (getNext()) {
    inReply = true;
    movepointer();
  }
  else
    inReply = false;
}

function endReply() {
  // Done revealing the response.
  nextChar = "";
  inReply = false;
}

function getNext() {
  var i;
  // Find the next character to move to.
  if (response == "")
    return false;
  nextChar = response.substr(0, 1)
  response = response.substr(1);
  for (i = 0; i < chars.length; i++)
    if (chars.charAt(i) == nextChar.toLowerCase()) {
      nextX = posX[i];
      nextY = posY[i];
      return true;
    }
  return false;
}

function movepointer() {
  var i, dx, dy, last, theta;
  // If no reply to give, return.
  if (!inReply)
    return;
  // If mouse is on pointer, move it.
  if (inContact) {
    // Move pointer toward the designated character.
    dx = boardX + nextX - getElLeft(pointer) - offsetX;
    dy = boardY + nextY - getElTop(pointer) - offsetY;
    theta = Math.round(Math.atan2(-dy, dx) * 180 / Math.PI);
    if (theta < 0)
      theta += 360;
    // If we reached the character, pause and start on the next one.
    if (Math.abs(dx) < step && Math.abs(dy) < step) {
      // Finish the move and add the character to the reply display.
      moveElBy(pointer, dx, dy);
      if (nextChar == "!")
        replyFld.value = "YES";
      else if (nextChar == "~")
        replyFld.value = "NO";
      else if (nextChar == "^")
        replyFld.value = "GOOD BYE";
      else if (nextChar != "_")
        replyFld.value += nextChar.toUpperCase();
      // Circle if next character is the same as the last.
      last = nextChar;
      if (getNext()) {
        if (nextChar == last) {
          angle = 0;
          timerID = window.setTimeout('circlepointer()', pause);
        }
        else
          timerID = window.setTimeout('movepointer()', pause);
        return;
      }
      // End movement if no more characters in reply.
      else {
        endReply();
        return;
      }
    }

    // If not, move it.
    else if (theta > 23 && theta <= 68)
      moveElBy(pointer, step, -step);
    else if (theta > 68 && theta <= 113)
      moveElBy(pointer, 0, -step);
    else if (theta > 113 && theta <= 158)
      moveElBy(pointer, -step, -step);
    else if (theta > 158 && theta <= 203)
      moveElBy(pointer, -step, 0);
    else if (theta > 203 && theta <= 248)
      moveElBy(pointer, -step, step);
    else if (theta > 248 && theta <= 293)
      moveElBy(pointer, 0, step);
    else if (theta > 293 && theta <= 338)
      moveElBy(pointer, step, step);
    else
      moveElBy(pointer, step, 0);
  }

  // Set up next call.
  timerID = window.setTimeout('movepointer()', timeout);
}

function circlepointer() {
  var x, y;
  // Mouse on pointer?
  if (!inContact) {
    timerID = window.setTimeout('circlepointer()', timeout);
    return;
  }
  // Move the pointer in a small circle.
  x = getElLeft(pointer) + step * Math.cos(angle);
  y = getElTop(pointer) - step * Math.sin(angle);
  moveElTo(pointer, x, y);
  angle += Math.PI / 10;
  if (angle < 2 * Math.PI)
    timerID = window.setTimeout('circlepointer()', timeout);
  else
    movepointer();
}
function shakepointer() {
  var dx, dy, x, y;
  // Mouse on pointer?
  if (inContact)
    return;
  // Randomly move pointer around it's original position.
  dx = Math.floor(Math.random() * 5) - 2;
  dy = Math.floor(Math.random() * 5) - 2;
  x = saveX + dx;
  y = saveY + dy;
  moveElTo(pointer, x, y);
  timerID = window.setTimeout('shakepointer()', timeout);
}

// This handles the analysis of a question and generates a response.
// Lists of responses by category.
var none = new Array("ask", "ask me", "i am here", "fear not", "speak",
  "speak to me", "i hear", "i await");

var days = new Array("sunday", "monday", "tuesday", "wednesday", "thursday",
  "friday", "saturday");

var months = new Array("january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november",
  "december");

var seasons = new Array("spring", "summer", "fall", "winter");

var times = new Array("never", "soon", "very soon", "tomorrow", "next week",
  "not now", "later", "in time", "not yet", "midnight",
  "at the proper time", "during the day", "at night");

var people = new Array("a friend", "a stranger", "yourself", "no one",
  "an associate", "one to be feared", "a liar",
  "an imposter", "one unknown", "some one familiar",
  "one dear", "unseen hands", "a trusted one", "an enemy",
  "one close", "an old friend", "one from your past");

var places = new Array("far away", "close", "very near", "someplace new",
  "not here", "at a crossroads", "a familiar place",
  "near water", "location unknown", "a dark place");

var other = new Array("cannot say", "cannot tell", "unknown", "ask later",
  "not known", "not seen", "leave me now", "maybe later",
  "future hazy", "too dark", "not clear", "unclear");

var die = new Array("Long life", "Life will be long", "You shall live");

var placement = new Array("Success", "You will get it", "successful", "work hard", "dont give up", "bright future");

function consult() {
  var question, words, r;
  var i, today;
  // Stop any current animation.
  if (timerID)
    clearTimeout(timerID);
  response = "";
  inReply = false;
  // Clear any current reply.
  replyFld.value = "";
  // Make up a response based on keywords in the question.
  question = questionFld.value;
  question = clean(question);
  words = question.split(" ");
  r = Math.random();
  // No question?
  if (question == "") {
    response = pickFromList(none);
    startReply();
    return false;
  }

  // Look for two words surrounding 'or' and pick one at random.
  if (words.length >= 3)
    for (i = 0; i < words.length - 3; i++)
      if (words[i + 1] == "or") {
        if (r < .5)
          response = words[i];
        else
          response = words[i + 2];
        startReply();
        return false;
      }

  // At random, give an ambiguous response.

  if (r < .1)
    response = pickFromList(other);
  // Time related question?
  else if (inList(words, "day")) {         // Pick a random day.
    if (r < .7)
      response = pickFromList(days);
    else
      response = pickFromList(times);
  }
  else if (inList(words, "month")) {    // Pick a random month.
    if (r < .7)
      response = pickFromList(months);
    else
      response = pickFromList(times);
  }
  else if (inList(words, "time"))            // Pick random time.
    response = Math.floor(Math.random() * 12) + 1;
  else if (inList(words, "when")) {          // Pick a random time.
    if (r < .3)
      response = pickFromList(days);
    if (r < .4)
      response = pickFromList(months);
    if (r < .5)
      response = pickFromList(seasons);
    else
      response = pickFromList(times);
  }

  else if (inList(words, "long") &&
    (inList(words, "life")) ||
    (inList(words, "cancer") ||
      inList(words, "life") ||
      inList(words, "die") ||
      inList(words, "killed"))) {    // Pick a random response.
    response = pickFromList(die);
  }

  // Asking for a number?
  else if (inList(words, "how") &&
    (inList(words, "few") ||
      inList(words, "often") ||
      inList(words, "many") ||
      inList(words, "much"))) {
    response = Math.round(Math.random() * 10) + 1;    // Give a one or two digit
    if (response != 10 && r < .5)                     // random number.
      response += Math.round(Math.random() * 10);
  }

  // Asking about a person?
  else if (inList(words, "who")) {
    response = pickFromList(people);
  }

  // Asking about a place?
  else if (inList(words, "where"))
    response = pickFromList(places);

  // Asking about a thing?
  else if (inList(words, "what"))
    response = pickFromList(other);

  // Yes or no question?
  else if (inList(words, "am") ||
    inList(words, "is") ||
    inList(words, "are") ||
    inList(words, "does") ||
    inList(words, "do") ||
    inList(words, "can") ||
    inList(words, "will") ||
    inList(words, "may") ||
    inList(words, "could") ||
    inList(words, "would") ||
    inList(words, "should")) {
    if (r < .5)
      response = "!";
    else
      response = "~";
  }

  else if (inList(words, "job") ||
    inList(words, "placement") ||
    inList(words, "future") ||
    inList(words, "career") ||
    inList(words, "business") ||
    inList(words, "internship") ||
    inList(words, "work")) {
    response = pickFromList(placement);
  }

  // All else failed, give a nice, ambiguous response.
  if (response == "")
    response = pickFromList(other);

  // Start the animation.
  startReply();
}

function abortReply() {
  var i;
  // Stop any current animation.

  if (timerID)
    clearTimeout(timerID);
  response = "";
  inReply = false;

  // Reset pointer.

  i = chars.indexOf("_");
  moveElTo(pointer, boardX + posX[i] - offsetX, boardY + posY[i] - offsetY);
}

// Utility functions.

function clean(s) {
  var i, c, t;
  var letters = "abcdefghijklmnopqrstuvwxyz";
  // Convert string to lower case.
  t = s.toLowerCase();
  // Expand any contractions.
  s = "";
  for (i = 0; i < t.length; i++) {
    if (t.substr(i, 2) == "'s") {
      s += " is";
      i++;
    }
    else if (t.substr(i, 2) == "'t") {
      s += " not";
      i++;
    }
    else if (t.substr(i, 3) == "'ll") {
      s += " will";
      i += 2;
    }
    else
      s += t.substr(i, 1);
  }

  // Replace any non-letters with spaces.

  t = "";
  for (i = 0; i < s.length; i++) {
    c = s.substr(i, 1);
    if (letters.indexOf(c) >= 0)
      t += c;
    else
      t += " ";
  }
  return t;
}

function inList(list, word) {
  var i;
  // Return true if the given word is in the list.
  for (i = 0; i < list.length; i++)
    if (list[i] == word)
      return true;
  return false;
}

function pickFromList(list) {
  var r;
  // Return a random word from a list.
  r = Math.floor(Math.random() * list.length);
  return list[r];
}

// Positioning utility functions.

function getPageOffsetLeft(el) {
  // Return the true x coordinate of an element relative to the page.
  return el.offsetLeft + (el.offsetParent ? getPageOffsetLeft(el.offsetParent) : 0);
}

function getPageOffsetTop(el) {
  // Return the true y coordinate of an element relative to the page.
  return el.offsetTop + (el.offsetParent ? getPageOffsetTop(el.offsetParent) : 0);
}

function getElLeft(el) {
  // Returns an element's x-coordinate.
  return parseInt(el.style.left, 10);
}

function getElTop(el) {
  // Returns an element's y-coordinate.
  return parseInt(el.style.top, 10);
}

function moveElTo(el, x, y) {
  // Move an element to the specified coordinates.
  el.style.left = x + "px";
  el.style.top = y + "px";
}

function moveElBy(el, dx, dy) {
  // Move an element by the specified offsets.
  el.style.left = (getElLeft(el) + dx) + "px";
  el.style.top = (getElTop(el) + dy) + "px";
}