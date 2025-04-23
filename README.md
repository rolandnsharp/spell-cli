# Spell

A minimalist terminal-based app to help you **master spelling and vocabulary** through repetition and precision.

## Features

- 🔤 Practice spelling words from a customizable list.
- 📚 Automatically fetches definitions to improve vocabulary.
- 🔁 Repeat words multiple times to reinforce memory (`-r` or `--repeat`).
- ✅ Clean, centered interface with visual feedback.
- ⌨️ Fully keyboard-controlled; perfect for touch typists.
- 🧠 Delete mastered words with `Ctrl+D`.

## Usage

To run the trainer:
```bash
spell
```

To add a new word:
```bash
spell yourNewWord
```

To drill each word `n` times before moving to the next:
```bash
spell -r 3
```

## Notes

- Words are stored in a file named `spellingList.txt` in the current directory.
- Internet is required for fetching definitions.
- This tool is ideal for focused, repetition-based learning.

## Installation

Link the script globally:
```bash
sudo ln -s /full/path/to/index.js /usr/local/bin/spell
```

Ensure it's executable:
```bash
chmod +x /full/path/to/index.js
```

---

Happy spelling and word mastering! 🌟
