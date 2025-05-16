import readline from "readline-sync";
import fs from "fs";
import { getFuzzySuggestionsForEach } from "./levenshtein.js";

const dictionary = JSON.parse(fs.readFileSync("./dictionary.json", "utf-8"));
import { brailleMap } from "./brailleMap.js";

function splitOnNonIncreasing(str) {
  if (!str) return [];

  let result = [];
  let current = str[0];

  for (let i = 1; i < str.length; i++) {
    if (str[i] > str[i - 1]) {
      current += str[i];
    } else {
      result.push(current);
      current = str[i];
    }
  }

  result.push(current);
  return result;
}

while (true) {
  const input = readline.question(
    "Enter the braille dots (1-6) or 'exit' to quit: "
  );
  if (input.toLowerCase() === "exit") {
    break;
  }

  const cleanedInput = input.replace(/\s+/g, "");
  if (!cleanedInput) {
    console.log("Invalid input. Please enter braille dots (1-6).");
    continue;
  }

  const splitletter = splitOnNonIncreasing(cleanedInput);
  console.log("Split letters:", splitletter);

  const suggestions = getFuzzySuggestionsForEach(splitletter, dictionary);

  if (suggestions.length === 0) {
    console.log("No suggestions found.");
  } else {
    console.log("Did you mean:");
    suggestions.forEach((group, index) => {
      console.log(`For input "${splitletter[index]}"`);
      group.forEach((suggestion) => {
        console.log(
          `- ${suggestion.letter} (distance: ${suggestion.distance})`
        );
      });
    });
  }

  console.log("Levenshtein distance suggestions:", suggestions);
  console.log("--------------------------------------------------");
  console.log("Press 'Enter' to continue or type 'exit' to quit.");
  const continueInput = readline.question();
  if (continueInput.toLowerCase() === "exit") {
    break;
  }
}
