import fs from "fs";
import keypress from 'keypress';
import { getFuzzySuggestionsForEach } from "./levenshtein.js";
import { brailleMap } from "./brailleMap.js";
import { Trie } from "./tries.js";
import wordListPath from 'word-list';

const dictionary = JSON.parse(fs.readFileSync("./dictionary.json", "utf-8"));
const dicwords = fs.readFileSync(wordListPath, 'utf8').split('\n');
const trie = new Trie();

// lowercase all words in the dictionary
dicwords.forEach(word => trie.insert(word.toLowerCase()));

// Set up keypress listener on stdin
keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();

// Current state
let activeKeys = new Set();
let currentWord = [];
let words = [];
let timeout = null;
let wordsuggestions = [];
let node = trie.root;

// Clear the console and show initial prompt
console.clear();
console.log("Braille Typing Mode - Press keys 1-6 simultaneously for braille input");
console.log("Press SPACE to complete a word, ESC to exit");
console.log("Current input: ");
let potentialWord = []
// Function to process the current chord when keys are released
function processChord() {
  if (activeKeys.size > 0) {
    const sortedChord = Array.from(activeKeys).sort().join("");
    currentWord.push(sortedChord);
    
    // Display current input
    console.clear();
    console.log("Braille Typing Mode - Press keys 1-6 simultaneously for braille input");
    console.log("Press SPACE to complete a word, ESC to exit");
    console.log("Current word:", currentWord.join(" "));
    
    // Get suggestions for the latest character
    const suggestions = getFuzzySuggestionsForEach([sortedChord], dictionary);
    if (suggestions.length > 0 && suggestions[0].length > 0) {
      console.log(`Latest character suggestions:`);
      suggestions[0].slice(0, 3).forEach(suggestion => {
        console.log(`- ${suggestion.letter} (distance: ${suggestion.distance})`);
      });
    }
    
    // If we have enough characters, show word suggestions too
    if (currentWord.length > 1) {
      // Get suggestions for the entire word pattern
      const mostLikelyChars = [];

      for (const pattern of currentWord) {
        const suggestions = getFuzzySuggestionsForEach([pattern], dictionary);
        if (suggestions.length > 0 && suggestions[0].length > 0) {
          // Add the most likely character (lowest distance)
          mostLikelyChars.push(suggestions[0][0].letter);
        }
      }
      potentialWord = [...mostLikelyChars];
      console.log("Word suggestions:");
      console.log(`- ${potentialWord.join('')} (best guess based on characters)`);
    }    
    activeKeys.clear();
  }
}

function suggestionsForWord(word) {
  // Clear previous suggestions
  wordsuggestions.length = 0;
  
  // Reset node to start from root
  let currentNode = trie.root;
  
  // Navigate to the node representing our word
  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    if (!currentNode.children[char]) {
      break;
    }
    currentNode = currentNode.children[char];
  }

  if (currentNode.isEndOfWord) {
    wordsuggestions.push(word);
  }

  function findSuggestions(node, prefix) {
    if (node.isEndOfWord && prefix !== word) {
      wordsuggestions.push(prefix);
    }
    for (const [char, child] of Object.entries(node.children)) {
      findSuggestions(child, prefix + char);
    }
  }

  findSuggestions(currentNode, word);

  console.log("Word suggestions:", wordsuggestions);
  return wordsuggestions;
}
// Process when space is pressed to complete a word
function completeWord() {
  if (potentialWord.length > 0) {
    const wordToCheck = potentialWord.join('').toLowerCase();
    suggestionsForWord(wordToCheck);
    words.push([...potentialWord]);

    console.log("\nWord completed:", potentialWord.join("")); // Changed from join(" ")
    console.log("All words:", words.map(w => w.join("")).join(" | ")); // Changed from join(" ")
    currentWord = []; // Also reset currentWord here
    potentialWord = [];
  }
}
// Handle keypress events
process.stdin.on('keypress', (ch, key) => {
  // Exit on ESC or ctrl+c
  if (key && (key.name === 'escape' || (key.ctrl && key.name === 'c'))) {
    console.log('\nExiting...');
    process.exit();
  }
  
  // Process space to complete a word
  if (key && key.name === 'space') {

    // potentialWord.forEach((word) => {
    //   suggestionsForWord(word);
    // });

    completeWord();
    return;
  }
  
  // Handle number keys 1-6 for braille input
  if (ch && /[1-6]/.test(ch)) {
    // Add key to active chord
    activeKeys.add(ch);
    
    // Clear previous timeout if exists
    if (timeout) {
      clearTimeout(timeout);
    }
    
    // Set timeout to process chord after a short delay (allows chord formation)
    timeout = setTimeout(() => {
      processChord();
    }, 300); // 300ms delay allows time to press multiple keys
  }
});

console.log("Start typing (press keys 1-6)...");