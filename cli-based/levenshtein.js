import { distance } from "fastest-levenshtein";

function levenshteinDistance(inputdots, dictionary) {
  const suggestions = [];

  const normalizedInput = inputdots.split("").join(",");

  for (const [dots, letter] of Object.entries(dictionary)) {
    const distances = distance(normalizedInput, dots);
    suggestions.push({
      letter: letter,
      distance: distances,
    });
  }

  suggestions.sort((a, b) => a.distance - b.distance);
  
  return suggestions.slice(0, 3);
}

export function getFuzzySuggestionsForEach(inputDotsArray, dictionary) {
  return inputDotsArray.map(dot => levenshteinDistance(dot, dictionary));
}
