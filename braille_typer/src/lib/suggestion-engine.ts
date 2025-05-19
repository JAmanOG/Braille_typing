
import { distance as newdistance } from "fastest-levenshtein";

export function findSimilarWords(
  input: string,
  dictionary: string[],
  maxDistance = 2
): string[] {
  if (!input) return [];

  const adjustedMaxDistance = input.length <= 2 ? 1 : maxDistance;

  const wordsWithDistances = dictionary.map((word) => ({word,distance: newdistance(input.toLowerCase(), word.toLowerCase())
    }))
    .filter((item) => item.distance <= adjustedMaxDistance);

  wordsWithDistances.sort((a, b) => {
    if (a.distance !== b.distance) {
      return a.distance - b.distance;
    }

    const aLengthDiff = Math.abs(a.word.length - input.length);
    const bLengthDiff = Math.abs(b.word.length - input.length);
    if (aLengthDiff !== bLengthDiff) {
      return aLengthDiff - bLengthDiff;
    }

    return a.word.localeCompare(b.word);
  });

  return wordsWithDistances.map((item) => item.word);
}

export class TrieNode {
  children: Record<string, TrieNode>;
  isEndOfWord: boolean;

  constructor() {
    this.children = {};
    this.isEndOfWord = false;
  }
}

export class Trie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string):void {
    let node = this.root;
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
  }

  search(word:string) {
    let node = this.root;

    for (let i = 0; i < word.length; i++) {
      const char = word[i];

      if (!node.children[char]) {
        return false;
      }
      node = node.children[char];
    }
    return node.isEndOfWord;
  }

  startsWith(prefix: string): string[] {
    let node = this.root;
    for (let i = 0; i < prefix.length; i++) {
      const char = prefix[i];
      if (!node.children[char]) {
        return []; // Prefix not found
      }
      node = node.children[char];
    }
    
    // If we reach here, we found the prefix
    // Now collect all words with this prefix
    const words: string[] = [];
    this._collectWords(node, prefix, words);
    return words;
  }
  private _collectWords(node: TrieNode, prefix: string, words: string[]): void {
    if (node.isEndOfWord) {
      words.push(prefix);
    }
    
    for (const char in node.children) {
      this._collectWords(node.children[char], prefix + char, words);
    }
  }
  }

export function findSimilarWordsUsingTrie(
  input: string,
  trie: Trie,
  dictionary: string[],
  maxDistance = 2
): string[] {
  if (!input) return [];

  const prefixMatches = trie.startsWith(input.toLowerCase());

  if (prefixMatches.length > 0) {
    return prefixMatches.sort((a, b) => a.length - b.length);
  }

  return findSimilarWords(input, dictionary, maxDistance);
}

function levenshteinDistanceletter(
  inputdots: string, 
  dictionary: Record<string, string>
): Array<{letter: string, distance: number}> {
  const suggestions = [];

  const normalizedInput = inputdots.split("").join(",");

  for (const [dots, letter] of Object.entries(dictionary)) {
    const distances = newdistance(normalizedInput, dots);
    suggestions.push({
      letter: letter,
      distance: distances,
    });
  }

  suggestions.sort((a, b) => a.distance - b.distance);
  
  return suggestions.slice(0, 3);
}

export function getFuzzySuggestionsForEach(
  inputDotsArray: string[], 
  dictionary: Record<string, string>
): Array<Array<{letter: string, distance: number}>> {
  return inputDotsArray.map(dot => levenshteinDistanceletter(dot, dictionary));
}
