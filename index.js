#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');
const chalk = require('chalk');
const path = require('path');

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const inputArg = process.argv[2];
const wordToAdd = inputArg && !inputArg.endsWith('.txt') ? inputArg : null;
const filename = 'spellingList.txt';
const filepath = path.resolve(process.cwd(), filename);

if (!fs.existsSync(filepath)) fs.writeFileSync(filepath, '');
if (wordToAdd) {
  fs.appendFileSync(filepath, `\n${wordToAdd}`);
  console.log(chalk.green(`Added "${wordToAdd}" to ${filename}`));
  process.exit(0);
}

let wordList = fs.readFileSync(filepath, 'utf8')
  .split('\n')
  .map(w => w.trim())
  .filter(w => w.length > 0);

let index = 0;
let userInput = '';
let hasStarted = false;
let mode = 'typing';
let currentDefinition = '';

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) process.stdin.setRawMode(true);
process.stdin.resume();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function hideCursor() {
  process.stdout.write('\x1B[?25l');
}

function showCursor() {
  process.stdout.write('\x1B[?25h');
}

async function getDefinition(word) {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = await res.json();
    const def = data[0]?.meanings[0]?.definitions[0]?.definition;
    return def || chalk.gray('(no definition found)');
  } catch {
    return chalk.gray('(definition unavailable)');
  }
}

function center(text) {
  const width = process.stdout.columns || 80;
  return text.split('\n').map(line => {
    const pad = Math.floor((width - line.length) / 2);
    return ' '.repeat(Math.max(pad, 0)) + line;
  }).join('\n');
}

function display() {
  const word = wordList[index];
  let displayWord;

  if (!hasStarted) {
    displayWord = word;
  } else {
    const typed = userInput;
    const blanks = '_'.repeat(word.length - userInput.length);
    displayWord = typed + blanks;
  }

  process.stdout.write('\x1Bc'); // clear screen
  hideCursor();
  console.log('\n\n\n\n'); // padding
  console.log(center(displayWord));
  console.log('\n' + center(chalk.yellow(`💡 ${currentDefinition}`)));
}

function flashError() {
  const word = wordList[index];
  process.stdout.write('\x1Bc');
  hideCursor();
  console.log('\n\n\n\n');
  console.log(center(chalk.bgRed.white(word)));
  console.log('\n' + center(chalk.red('Wrong! Try again.')));
}

process.stdin.on('keypress', async (str, key) => {
  if (key.sequence === '\u0003') {
    showCursor();
    process.exit(); // Ctrl+C
  }

  if (key.sequence === '\u0004') { // Ctrl+D to delete current word
    const deletedWord = wordList.splice(index, 1)[0];
    fs.writeFileSync(filepath, wordList.join('\n'));
    userInput = '';
    hasStarted = false;
    mode = 'typing';
    if (index >= wordList.length) {
      process.stdout.write('\x1Bc');
      hideCursor();
      console.log('\n\n\n' + center(chalk.green('All Done!')));
      showCursor();
      process.exit();
    }
    currentDefinition = await getDefinition(wordList[index]);
    process.stdout.write('\x1Bc');
    hideCursor();
    console.log('\n\n\n\n');
    console.log(center(chalk.red(`Deleted "${deletedWord}" from list.`)));
    setTimeout(display, 1000);
    return;
  }

  if (!hasStarted) hasStarted = true;

  if (mode === 'typing') {
    const word = wordList[index];
    userInput += str;

    if (word.startsWith(userInput)) {
      display();
      if (userInput === word) {
        index++;
        userInput = '';
        hasStarted = false;

        if (index >= wordList.length) {
          process.stdout.write('\x1Bc');
          hideCursor();
          console.log('\n\n\n' + center(chalk.green('All Done!')));
          showCursor();
          process.exit();
        }

        const nextWord = wordList[index];
        currentDefinition = await getDefinition(nextWord);
        display();
      }
    } else {
      mode = 'error';
      flashError();
      setTimeout(() => {
        userInput = '';
        hasStarted = false;
        mode = 'typing';
        display();
      }, 700);
    }
  }
});

(async () => {
  if (wordList.length > 0) {
    currentDefinition = await getDefinition(wordList[0]);
    display();
  } else {
    console.log(chalk.red('The spelling list is empty.'));
    showCursor();
    process.exit(0);
  }
})();

process.on('exit', () => {
  showCursor();
});