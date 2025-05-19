type BrailleKeyboardProps = Record<string, never>; 

export function BrailleKeyboard({}: BrailleKeyboardProps) {
  // QWERTY to Braille mapping reference
  const brailleMapping = [
    { key: "a", dot: "1", position: "top-left" },
    { key: "d", dot: "2", position: "middle-left" },
    { key: "s", dot: "3", position: "bottom-left" },
    { key: "j", dot: "4", position: "top-right" },
    { key: "k", dot: "5", position: "middle-right" },
    { key: "l", dot: "6", position: "bottom-right" },
  ]

  // Common Braille patterns
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Left Hand</h3>
          <div className="grid grid-cols-1 gap-2">
            {brailleMapping.slice(0, 3).map((item) => (
              <div key={item.key} className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center border rounded-md bg-gray-100 font-bold">
                  {item.key.toUpperCase()}
                </div>
                <span className="text-sm">
                  Dot {item.dot} <span className="text-gray-500">({item.position})</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Right Hand</h3>
          <div className="grid grid-cols-1 gap-2">
            {brailleMapping.slice(3).map((item) => (
              <div key={item.key} className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center border rounded-md bg-gray-100 font-bold">
                  {item.key.toUpperCase()}
                </div>
                <span className="text-sm">
                  Dot {item.dot} <span className="text-gray-500">({item.position})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
