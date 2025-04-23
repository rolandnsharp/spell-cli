# Spell

A minimalist terminal-based app to train your **spelling**, **vocabulary**, and **touch typing** — all at once.

## What It Does

- 🔠 You type vocabulary words — but the moment you begin, the word disappears.
- 🧠 This unique mechanic forces you to **recall the full spelling from memory**.
- 🔁 You can configure the number of correct repetitions required before moving on.
- 📚 Definitions are fetched automatically to deepen your understanding.
- ✅ Clean, centered interface with visual feedback in **red** and **green** for instant correction.
- ⌨️ Designed for **touch typists** — no mouse needed, just your keyboard and focus.

## Usage

Run the trainer:
```bash
spell
```

Add a new word:
```bash
spell yourNewWord
```

Repeat each word `n` times before moving to the next (for extra drilling):
```bash
spell -r 3
```

Delete the current word (once mastered):
```bash
# While inside the trainer:
Ctrl+D
```

## Installation

Link the script globally:
```bash
sudo ln -s /full/path/to/index.js /usr/local/bin/spell
chmod +x /full/path/to/index.js
```

## Data

- Words are saved in `spellingList.txt` in your current directory.
- Internet is required to fetch word definitions.

---

### Why Use Spell?

This is not just a spelling app — it's a **brain training tool** for:
- Building muscle memory through typing
- Retaining vocabulary
- Improving spelling accuracy

Give it a try. Your fingers — and your vocabulary — will thank you.
