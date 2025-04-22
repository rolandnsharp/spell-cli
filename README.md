spell-cli
A minimalist terminal-based spelling trainer built for touch typing and memory reinforcement. Designed to improve spelling through repetition and muscle memory—without looking at the word once typing begins.

Features:

Displays one word at a time from a local list

Word disappears as soon as typing begins

Red flash + retry on misspellings

Dictionary definition shown while practicing

Simple CLI word adder: spell yourNewWord

Installation:

Clone the repo and link the CLI globally: git clone git@github.com:rolandnsharp/spell-cli.git cd spell-cli npm install npm link

This makes the spell command available globally on your system.

How to Run:

To start the spelling trainer: spell

To add a new word to your spelling list: spell yourNewSpellingWord

Example: spell phenomenon

Requirements:

Node.js v18 or newer

Internet connection (for fetching definitions)

License: MIT License

Made with care by @rolandnsharp