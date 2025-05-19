"use client";

import type React from "react";

import { useState, useEffect, useRef,useCallback,useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrailleKeyboard } from "@/components/braille-keyboard";
import { SuggestionPanel } from "@/components/suggestion-panel";
import { BrailleDisplay } from "@/components/braille-display";
import ExamplePattern from "@/components/example-pattern";
import {
  findSimilarWordsUsingTrie,
  getFuzzySuggestionsForEach
} from "@/lib/suggestion-engine";
import {
  initializeDictionaryTrie,
  newBrailleDictionary,
} from "@/lib/braille-dictionary";
import { Info } from "lucide-react";
import { Trie } from "../lib/suggestion-engine";

export default function BrailleTypingPlatform() {
  const [inputText, setInputText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [lastWord, setLastWord] = useState("");
  const [algorithm, setAlgorithm] = useState<"trie" | "levenshtein">("trie");
  const inputRef = useRef<HTMLInputElement>(null);
  const [wordDiclist, setWordDiclist] = useState<string[]>([]);

  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);

  const completeChordRef = useRef(new Set());
  const lastSpeechTimeRef = useRef(0);

  const [uploadedWordlist, setUploadedWordlist] = useState<string[]>([]);
const [activeWordlist, setActiveWordlist] = useState<"default" | "uploaded">("default");
const [uploadedFileName, setUploadedFileName] = useState<string>("");
const activeList = activeWordlist === "default" ? wordDiclist : uploadedWordlist;
const BRAILLE_KEYS = useMemo(() => ["a", "s", "d", "j", "k", "l"], []);
const letterToNumberMap = useMemo(() => ({
  "a": "1",
  "s": "2", 
  "d": "3",
  "j": "4",
  "k": "5",
  "l": "6"
}as Record<string, string>), []);

  // let synth = window.speechSynthesis as SpeechSynthesis;
  const trieRef = useRef<Trie>(initializeDictionaryTrie());

  // Focus input on page load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    if (typeof window !== 'undefined') {
      setSynth(window.speechSynthesis);
    }
  

    // Fetch the word list file
    fetch("/word-list.txt")
      .then((response) => response.text())
      .then((content) => {
        const lines = content.split("\n");
        const wordArray = lines
          .map((line) => line.trim())
          .filter((word) => word !== "");
        console.log("Word list loaded:", wordArray);
        setWordDiclist(wordArray);

        // Also update the trie with these words
        const newTrie = new Trie();

        // Then add new words
        for (const word of wordArray) {
          newTrie.insert(word.toLowerCase());
        }

        trieRef.current = newTrie;
      })
      .catch((error) => {
        console.error("Error loading dictionary:", error);
      });
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    setUploadedFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const lines = content.split("\n");
      const wordArray = lines
        .map((line) => line.trim())
        .filter((word) => word !== "");
      
      console.log(`Uploaded wordlist with ${wordArray.length} words`);
      setUploadedWordlist(wordArray);
      
      // Also update the trie with new words
      const uploadedTrie = new Trie();
      for (const word of wordArray) {
        uploadedTrie.insert(word.toLowerCase());
      }
      
      // Auto-switch to uploaded wordlist
      setActiveWordlist("uploaded");
      
      // Update the trie reference
      if (activeWordlist === "uploaded") {
        trieRef.current = uploadedTrie;
      }
    };
    
    reader.readAsText(file);
  };
  
  // Add this function to switch between wordlists
  const switchWordlist = (type: "default" | "uploaded") => {
    setActiveWordlist(type);
    
    // Update the trie reference based on selection
    if (type === "default") {
      // Use the original trie with ONLY default words
      const defaultTrie = new Trie();
      for (const word of wordDiclist) {
        defaultTrie.insert(word.toLowerCase());
      }
      trieRef.current = defaultTrie;
      console.log(`Switched to default dictionary with ${wordDiclist.length} words`);
    } else if (type === "uploaded" && uploadedWordlist.length > 0) {
      // Use the trie with ONLY uploaded words
      const uploadedTrie = new Trie();
      for (const word of uploadedWordlist) {
        uploadedTrie.insert(word.toLowerCase());
      }
      trieRef.current = uploadedTrie;
      console.log(`Switched to uploaded dictionary with ${uploadedWordlist.length} words`);
    }
  }  

  const processChord = useCallback(
    (chord: string) => {
      const character = newBrailleDictionary[chord];

      if (character) {
        // Add the character to the input text and process suggestions together
        setInputText((prev) => {
          const updatedText = prev + character;
          const dicWords = updatedText.split(" ");
          const currentWord = dicWords[dicWords.length - 1];

          console.log("Current word:", currentWord, "Last word:", lastWord);

          // Convert to lowercase for case-insensitive matching
          const searchWord = currentWord.toLowerCase();
          console.log("Finding suggestions for:", searchWord);

          // Always update suggestions for the current word as you type
          let similarWords: string[] = [];


          if (
            trieRef.current &&
            typeof trieRef.current.insert === "function" &&
            activeList.length > 0
          ) {
            similarWords = findSimilarWordsUsingTrie(
              searchWord,
              trieRef.current,
              activeList
            );
          }

          if (
            similarWords.length === 0 &&
            searchWord.length >= 1 &&
            searchWord.length <= 2 &&
            activeList.length > 0
          ) {
            console.log(
              "No suggestions found, falling back to prefix matching"
            );
            similarWords = activeList
              .filter((word) => word.toLowerCase().startsWith(searchWord))
              .slice(0, 5);
          }

          console.log("Found suggestions:", similarWords);
          setSuggestions(similarWords.slice(0, 5));
          setSelectedSuggestion(-1);

          // Always update the last word
          setLastWord(currentWord);

          return updatedText;
        });
      } else {

        const formattedChord = chord.replace(/,/g, '');
  
        // Log the comparison for debugging
        console.log(`Original chord: "${chord}", Formatted chord: "${formattedChord}"`);
      
        // Same pattern for fuzzy suggestions
        const char = getFuzzySuggestionsForEach([formattedChord], newBrailleDictionary);

        if (char.length > 0 && char[0].length > 0) {
          const bestMatch = char[0][0];

          if (bestMatch.distance <= 2) {
            console.log(
              `Using best match: ${bestMatch.letter} (distance: ${bestMatch.distance})`
            );

            setInputText((prev) => {
              const updatedText = prev + bestMatch.letter;
              const words = updatedText.split(" ");
              const currentWord = words[words.length - 1];

              if (currentWord && currentWord !== lastWord) {
                setLastWord(currentWord);

                const searchWord = currentWord.toLowerCase();
                console.log("Finding suggestions for:", searchWord);

               const similarWords: string[] = findSimilarWordsUsingTrie(
                  searchWord,
                  trieRef.current,
                  activeList
                );

                console.log("Found suggestions:", similarWords);
                setSuggestions(similarWords.slice(0, 5));
                setSelectedSuggestion(-1);
              }

              return updatedText;
            });
          } else {
            console.log(
              `No suitable match found (best distance: ${bestMatch.distance})`
            );
          }
        } else {
          console.log(`Invalid chord: ${chord} - No suggestions available`);
        }
      }
    },
    [activeList, lastWord]
  );

  useEffect(() => {
    const pressedKeys = new Set<string>();
    let chordInProgress = false;
  
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 's' && e.ctrlKey) {
        e.preventDefault(); 
        
        if (synth && inputText.trim()) {
          synth.cancel();
          
          const utterThis = new SpeechSynthesisUtterance(inputText);
          utterThis.rate = 1.0;
          utterThis.lang = "en-IN";
          
          synth.speak(utterThis);
        }
        return;
      }
    
      const specialKeys = ['Backspace', 'Enter', 'Tab', 'Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Control'];
      if (specialKeys.includes(e.key)) {
        return;
      }
    
      // If it's a letter key that's not in BRAILLE_KEYS, prevent it
      if (e.key.length === 1 && /[a-zA-Z]/.test(e.key) && !BRAILLE_KEYS.includes(e.key.toLowerCase())) {
        e.preventDefault();
        console.log(`Key ${e.key} blocked - not a valid Braille key`);
        
        if (synth) {
          synth.cancel(); // Cancel any ongoing speech
        }
        return;
      }
      
  
      if (BRAILLE_KEYS.includes(e.key.toLowerCase())) {
        e.preventDefault();
        
        console.log(`Key pressed: ${e.key}`);
        pressedKeys.add(e.key.toLowerCase());
        
        if (!chordInProgress && pressedKeys.size === 1) {
          chordInProgress = true;
          completeChordRef.current.clear();
        }
        
        const numberKey = letterToNumberMap[e.key.toLowerCase()];
        if (numberKey) {
          completeChordRef.current.add(numberKey);
          console.log(`Letter key ${e.key} mapped to ${numberKey}`);
        }
      }
    };
  
    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      if (BRAILLE_KEYS.includes(e.key.toLowerCase())) {

        pressedKeys.delete(e.key.toLowerCase());
        
        if (pressedKeys.size === 0 && chordInProgress) {

          const currentChord = Array.from(completeChordRef.current).sort().join(",");          
          setTimeout(() => {
            console.log(`Processing number-based chord: ${currentChord}`);
            processChord(currentChord);
            chordInProgress = false;
          }, 10);
        }
      }
    };
  
    window.addEventListener("keydown", handleGlobalKeyDown);
    window.addEventListener("keyup", handleGlobalKeyUp);
  
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
      window.removeEventListener("keyup", handleGlobalKeyUp);
    };
  }, [processChord, BRAILLE_KEYS, letterToNumberMap, synth]);

  // Handle keydown events for input
  const handleKeyDown = (e: React.KeyboardEvent) => {
  
    if (e.key === "Backspace" && inputText.length <= 1) {
      setSuggestions([]);
      setSelectedSuggestion(-1);
    }
  
  
    if (e.key === "Tab") {
      e.preventDefault();
      if (suggestions.length > 0 && synth) {
        // Update the selected suggestion
        const nextIndex = (selectedSuggestion + 1) % suggestions.length;
        setSelectedSuggestion(nextIndex);
        // Cancel any existing speech
        synth.cancel();
        
        const now = Date.now();
        if (now - lastSpeechTimeRef.current > 200) {
          const utterThis = new SpeechSynthesisUtterance(suggestions[nextIndex]);
          utterThis.rate = 1.3;
          utterThis.lang = "en-IN";
          synth.speak(utterThis);
          lastSpeechTimeRef.current = now;
        }
      }
    }
  
    // Handle enter to select suggestion
    if (e.key === "Enter" && selectedSuggestion >= 0) {
      e.preventDefault();
      applySuggestion(suggestions[selectedSuggestion]);
    }
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputText(newValue);
    
    // Clear suggestions when input is empty
    if (newValue === '') {
      setSuggestions([]);
      setSelectedSuggestion(-1);
      return;
    }
    
    // Extract the current word being typed
    const words = newValue.split(" ");
    const currentWord = words[words.length - 1];
    
    if (currentWord) {
      // Convert to lowercase for case-insensitive matching
      const searchWord = currentWord.toLowerCase();
      console.log("Input changed, finding suggestions for:", searchWord);
      
      // Get suggestions for the current word
      let similarWords: string[] = [];
      if (
        trieRef.current &&
        typeof trieRef.current.insert === "function" &&
        activeList.length > 0
      ) {
        similarWords = findSimilarWordsUsingTrie(
          searchWord,
          trieRef.current,
          activeList
        );
      }
      
      // Add fallback for short words with no suggestions
      if (
        similarWords.length === 0 &&
        searchWord.length >= 1 &&
        searchWord.length <= 2 &&
        activeList.length > 0
      ) {
        similarWords = activeList
          .filter((word) => word.toLowerCase().startsWith(searchWord))
          .slice(0, 5);
      }
      
      console.log("Found suggestions on input change:", similarWords);
      setSuggestions(similarWords.slice(0, 5));
      setSelectedSuggestion(-1);
    }
  };
  // Apply selected suggestion
  const applySuggestion = (suggestion: string) => {
    const words = inputText.split(" ");
    words[words.length - 1] = suggestion;

    // Update input text
    setInputText(words.join(" ") + " ");

    // Clear suggestions
    setSuggestions([]);
    setSelectedSuggestion(-1);

    // Focus back on input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Clear input text and focus back on input
  const clearInput = () => {
    setInputText("");
    // setSuggestions([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">
            Braille Auto-Correct System
          </h1>
          <p className="text-gray-600">
            Type in QWERTY Braille format and get real-time suggestions
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main typing area - takes up 2/3 of the space on larger screens */}
          <Card className="md:col-span-2 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Braille Input</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Algorithm:</span>
                  <select
                    value={algorithm}
                    onChange={(e) =>
                      setAlgorithm(e.target.value as "levenshtein" | "trie")
                    }
                    className="text-sm border rounded p-1"
                  >
                    {/* <option value="levenshtein">Levenshtein</option> */}
                    <option value="trie">Trie-based</option>
                  </select>
                </div>

              </div>
              <CardDescription>
                Type Braille patterns using the keyboard mapping shown on the
                right
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="text-lg p-4 font-mono"
                  placeholder="Start typing..."
                  aria-label="Braille input"
                />
                {suggestions.length > 0 && (
                  <SuggestionPanel
                    suggestions={suggestions}
                    selectedIndex={selectedSuggestion}
                    onSelect={applySuggestion}
                  />
                )}
              </div>
  <div className="mt-4 border-t pt-4">
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium">Custom Dictionary</h3>
        <span className="text-xs text-gray-500">txt file allowed</span>
      </div>
      <div className="flex gap-3">
      <Button 
        variant={activeWordlist === "default" ? "default" : "outline"} 
        size="sm" 
        onClick={() => switchWordlist("default")}
        disabled={activeWordlist === "default"}
      >
        Default
      </Button>
      <Button 
        variant={activeWordlist === "uploaded" ? "default" : "outline"} 
        size="sm" 
        onClick={() => switchWordlist("uploaded")}
        disabled={activeWordlist === "uploaded" || uploadedWordlist.length === 0}
      >
        Custom
      </Button>
    </div>
  </div>
  
  <div className="flex items-center gap-2 mt-2">
    <div className="relative flex-1">
      <Input 
        type="file" 
        accept=".txt"
        id="wordlist-upload"
        className="absolute inset-0 opacity-0 cursor-pointer" 
        onChange={handleFileUpload}
      />
      <div className="border rounded flex items-center h-9 px-3 text-sm">
        <span className="truncate flex-1">
          {uploadedFileName || "Choose a wordlist file (.txt)"}
        </span>
      </div>
    </div>
    <Button variant="outline" size="sm" onClick={() => document.getElementById('wordlist-upload')?.click()}>
      Browse
    </Button>
  </div>
  
  <div className="mt-2 text-xs text-gray-500">
    <p>
      {activeWordlist === "default" 
        ? `Using default dictionary (${wordDiclist.length} words)`
        : `Using custom dictionary: ${uploadedFileName} (${uploadedWordlist.length} words)`
      }
    </p>
  </div>
</div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                </div>
                <Button variant="outline" size="sm" onClick={clearInput}>
                  Clear
                </Button>
              </div>

              <BrailleDisplay text={inputText} />
            </CardContent>
          </Card>

          {/* Keyboard reference - takes up 1/3 of the space on larger screens */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>Keyboard Reference</CardTitle>
              <CardDescription>QWERTY to Braille mapping</CardDescription>
            </CardHeader>
            <CardContent>
              <BrailleKeyboard />

              <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 text-blue-500" />
                  <div>
                    <p className="font-medium text-blue-700">How to use:</p>
                    <ul className="mt-1 space-y-1 list-disc list-inside text-blue-700">
                      <li>Type using the keyboard mapping</li>
                      <li>
                        Press{" "}
                        <kbd className="px-1 py-0.5 bg-white rounded border">
                          Tab
                        </kbd>{" "}
                        to cycle through suggestions
                      </li>
                      <li>
                        Press{" "}
                        <kbd className="px-1 py-0.5 bg-white rounded border">
                          Enter
                        </kbd>{" "}
                        to accept a suggestion
                      </li>
                      <li>
                        Press{" "}
                        <kbd className="px-1 py-0.5 bg-white rounded border">
                          Ctrl + S
                        </kbd>{" "}
                        to read the input text aloud
                      </li>
                      <li>Click on a suggestion to apply it</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Algorithm explanation */}
        {/* <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>Algorithm Implementation</CardTitle>
            <CardDescription>Technical details of the auto-correct and suggestion system</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="levenshtein">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="levenshtein">Levenshtein Distance</TabsTrigger>
                <TabsTrigger value="trie">Trie-Based Approach</TabsTrigger>
              </TabsList>
              <TabsContent value="levenshtein" className="p-4 bg-gray-50 rounded-md mt-2">
                <h3 className="font-medium mb-2">Levenshtein Distance Algorithm</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Calculates the minimum number of single-character edits (insertions, deletions, or substitutions)
                  required to change one word into another.
                </p>
                <h4 className="font-medium text-sm mt-3 mb-1">Advantages:</h4>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  <li>Handles typos, missing characters, and extra characters</li>
                  <li>Works well for finding similar words</li>
                  <li>Simple to understand and implement</li>
                </ul>
                <h4 className="font-medium text-sm mt-3 mb-1">Complexity:</h4>
                <p className="text-sm text-gray-700">Time: O(m×n) where m and n are the lengths of the two strings</p>
              </TabsContent>
              <TabsContent value="trie" className="p-4 bg-gray-50 rounded-md mt-2">
                <h3 className="font-medium mb-2">Trie-Based Approach</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Uses a prefix tree (trie) data structure to efficiently store and retrieve words, combined with search
                  algorithms to find similar words.
                </p>
                <h4 className="font-medium text-sm mt-3 mb-1">Advantages:</h4>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  <li>Efficient for prefix matching and auto-completion</li>
                  <li>Fast lookup times for exact matches</li>
                  <li>Scales well with large dictionaries</li>
                </ul>
                <h4 className="font-medium text-sm mt-3 mb-1">Complexity:</h4>
                <p className="text-sm text-gray-700">
                  Lookup Time: O(k) where k is the length of the word being looked up
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card> */}
        <ExamplePattern />
      </div>
    </div>
  );
}
