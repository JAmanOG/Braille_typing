"use client"

interface SuggestionPanelProps {
  suggestions: string[]
  selectedIndex: number
  onSelect: (suggestion: string) => void
}

export function SuggestionPanel({ suggestions, selectedIndex, onSelect }: SuggestionPanelProps) {
  if (suggestions.length === 0) return null

  return (
    <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-md">
      <ul className="py-1">
        {suggestions.map((suggestion, index) => (
          <li
            key={index}
            className={`px-4 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center ${
              index === selectedIndex ? "bg-blue-50 text-blue-700" : ""
            }`}
            onClick={() => onSelect(suggestion)}
          >
            <span className="font-medium">{suggestion}</span>
            {index === selectedIndex && (
              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">Tab + Enter</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
