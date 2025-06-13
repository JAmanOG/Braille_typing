import React from "react";

const ExamplePattern = () => {

    const commonPatterns = [
    { char: "a", pattern: [1, 0, 0, 0, 0, 0], keys: ["a"] },
    { char: "b", pattern: [1, 0, 1, 0, 0, 0], keys: ["a", "s"] },
    { char: "c", pattern: [1, 1, 0, 0, 0, 0], keys: ["a", "j"] },
    { char: "d", pattern: [1, 1, 0, 1, 0, 0], keys: ["a", "j", "k"] },
    { char: "e", pattern: [1, 0, 0, 1, 0, 0], keys: ["a", "k"] },
    { char: "f", pattern: [1, 1, 1, 0, 0, 0], keys: ["a", "s", "j"] },
    { char: "g", pattern: [1, 1, 1, 1, 0, 0], keys: ["a", "s", "j", "k"] },
    { char: "h", pattern: [1, 0, 1, 1, 0, 0], keys: ["a", "s", "k"] },
    { char: "i", pattern: [0, 1, 1, 0, 0, 0], keys: ["s", "j"] },
    { char: "j", pattern: [0, 1, 1, 1, 0, 0], keys: ["s", "j", "k"] },
    { char: "k", pattern: [1, 0, 0, 0, 1, 0], keys: ["a", "d"] },
    { char: "l", pattern: [1, 0, 1, 0, 1, 0], keys: ["a", "s", "d"] },
    { char: "m", pattern: [1, 1, 0, 0, 1, 0], keys: ["a", "d", "j"] },
    { char: "n", pattern: [1, 1, 0, 1, 1, 0], keys: ["a", "d", "j", "k"] },
    { char: "o", pattern: [1, 0, 0, 1, 1, 0], keys: ["a", "d", "k"] },
    { char: "p", pattern: [1, 1, 1, 0, 1, 0], keys: ["a", "s", "d", "j"] },
    { char: "q", pattern: [1, 1, 1, 1, 1, 0], keys: ["a", "s", "d", "j", "k"] },
    { char: "r", pattern: [1, 0, 1, 1, 1, 0], keys: ["a", "s", "d", "k"] },
    { char: "s", pattern: [0, 1, 1, 0, 1, 0], keys: ["s", "d", "j"] },
    { char: "t", pattern: [0, 1, 1, 1, 1, 0], keys: ["s", "d", "j", "k"] },
    { char: "u", pattern: [1, 0, 0, 0, 1, 1], keys: ["a", "d", "l"] },
    { char: "v", pattern: [1, 0, 1, 0, 1, 1], keys: ["a", "s", "d", "l"] },
    { char: "w", pattern: [0, 1, 1, 1, 0, 1], keys: ["s", "j", "k", "l"] },
    { char: "x", pattern: [1, 1, 0, 0, 1, 1], keys: ["a", "d", "j", "l"] },
    { char: "y", pattern: [1, 1, 0, 1, 1, 1], keys: ["a", "d", "j", "k", "l"] },
    { char: "z", pattern: [1, 0, 0, 1, 1, 1], keys: ["a", "d", "k", "l"] },
  ];

  return (
    <div className="space-y-4">
      <div className="m-4 border p-4 rounded-md">
        {" "}
        {/* Added m-4 for outer space, p-4 for inner space, and rounded-md for aesthetics */}
        <h3 className="text-sm font-medium mb-2">Example Patterns</h3>
        <div className="grid grid-cols-5 gap-2">
          {commonPatterns.map((pattern) => (
            <div
              key={pattern.char}
              className="p-2 rounded-md border bg-white flex items-center gap-3"
            >
              <div className="grid grid-cols-2 gap-1 w-8">
                {pattern.pattern.map((dot, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      dot === 1 ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <div>
                <span className="font-medium">{pattern.char}</span>
                <div className="text-xs text-gray-500">
                  {pattern.keys.map((k) => k.toUpperCase()).join(" + ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamplePattern;
