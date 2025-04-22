#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');
const chalk = require('chalk');
const path = require('path');

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const args = process.argv.slice(2);
const repeatIndex = args.findIndex(arg => arg === '-r' || arg === '--repeat');
const repeatCount = (repeatIndex !== -1 && args[repeatIndex + 1]) ? parseInt(args[repeatIndex + 1], 10) : 1;
const inputArg = args.find(arg => !arg.startsWith('-') && isNaN(arg));
const wordToAdd = inputArg && !inputArg.endsWith('.txt') ? inputArg : null;
const filename = 'spellingList.txt';
const filepath = path.resolve(process.cwd(), filename);

if (!fs.existsSync(filepath)) fs.writeFileSync(filepath, '');
if (wordToAdd) {
  fs.appendFileSync(filepath, `\n${wordToAdd}`);
  console.log(chalk.green(`Added "${wordToAdd}" to ${filename}`));
  process.exit(0);
}

const wordList = fs.readFileSync(filepath, 'utf8')
  .split('\n')
  .map(w => w.trim())
  .filter(w => w.length > 0);

let index = 0;
let userInput = '';
let hasStarted = false;
let mode = 'typing';
let currentDefinition = '';
let correctStreak = 0;

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
    // return chalk.gray('(definition unavailable)');
  }
}

function center(text) {
  const width = process.stdout.columns || 80;
  return text.split('\n').map(line => {
    const pad = Math.floor((width - line.length) / 2);
    return ' '.repeat(Math.max(pad, 0)) + line;
  }).join('\n');
}

function display(wordOverride = null, colorFn = chalk.white) {
  const word = wordList[index];
  let displayWord;

  if (wordOverride !== null) {
    displayWord = wordOverride;
  } else if (!hasStarted) {
    displayWord = word;
  } else {
    const typed = userInput;
    const blanks = ' '.repeat(word.length - userInput.length);
    displayWord = typed + blanks;
  }

  process.stdout.write('\x1Bc');
  hideCursor();
  console.log('\n\n\n\n');
  console.log(center(colorFn(displayWord)));
  // console.log('\n' + center(chalk.yellow(`💡 ${currentDefinition}`)));
  // console.log('\n' + center(chalk.gray(`✅ ${correctStreak}/${repeatCount}`)));
}

function flash(colorFn) {
  const word = wordList[index];
  process.stdout.write('\x1Bc');
  hideCursor();
  console.log('\n\n\n\n');
  console.log(center(colorFn(word)));
}

process.stdin.on('keypress', async (str, key) => {
  if (key.sequence === '\u0003') {
    showCursor();
    process.exit();
  }

  if (!hasStarted) hasStarted = true;

  if (mode === 'typing') {
    const word = wordList[index];
    userInput += str;

    if (word.startsWith(userInput)) {
      display();
      if (userInput === word) {
        mode = 'success';
        flash(chalk.green);
        correctStreak++;
        userInput = '';
        hasStarted = false;

        if (correctStreak >= repeatCount) {
          index++;
          correctStreak = 0;
        }

        if (index >= wordList.length) {
          setTimeout(() => {
            process.stdout.write('\x1Bc');
            hideCursor();
            // console.log('\n\n\n' + center(chalk.green('All Done!')));
            showCursor();
            process.exit();
          }, 700);
        } else {
          const nextWord = wordList[index];
          currentDefinition = await getDefinition(nextWord);
          setTimeout(() => {
            mode = 'typing';
            display();
          }, 700);
        }
      }
    } else {
      mode = 'error';
      flash(chalk.red);
      setTimeout(() => {
        userInput = '';
        hasStarted = false;
        mode = 'typing';
        correctStreak = 0;
        display();
      }, 700);
    }
  } else if (key.sequence === '\u0004') { // Ctrl+D
    wordList.splice(index, 1);
    fs.writeFileSync(filepath, wordList.join('\n'));
    if (index >= wordList.length) index = 0;
    if (wordList.length === 0) {
      process.stdout.write('\x1Bc');
      // console.log(chalk.red('No more words left.'));
      showCursor();
      process.exit();
    }
    currentDefinition = await getDefinition(wordList[index]);
    userInput = '';
    hasStarted = false;
    mode = 'typing';
    display();
  }
});

(async () => {
  if (wordList.length > 0) {
    currentDefinition = await getDefinition(wordList[0]);
    display();
  } else {
    // console.log(chalk.red('The spelling list is empty.'));
    showCursor();
    process.exit(0);
  }
})();

process.on('exit', () => {
  showCursor();
});
