**For the CLI (cli-based/) approach:**

# Braille Auto-Correct CLI

A command-line tool for typing in QWERTY Braille and getting real-time spelling suggestions using a Trie-based search and custom dictionaries.

## Features

- Type in QWERTY Braille format
- Real-time spelling suggestions and autocorrect
- Fast Trie-based search
- Customizable dictionary

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm

### Installation

```bash
cd cli-based
npm install
```

### Usage

```bash
node index.js
```

Follow the on-screen instructions to type Braille and receive suggestions.

### Files

- `index.js`: Main CLI entry point
- `brailleMap.js`: Braille character mappings
- `dictionary.json`: Word dictionary
- `levenshtein.js`: Levenshtein distance implementation
- `tries.js`: Trie data structure

## Customization

You can add or modify words in `dictionary.json` to expand the autocorrect capabilities.


**For the Web App (braille_typer/) approach:**

# Braille Auto-Correct System (Web App)

A Next.js web application for QWERTY Braille typing with real-time spelling suggestions, powered by Trie-based search and custom dictionaries. Designed for accessibility and optimized for visually impaired users.

## Features

- QWERTY Braille typing interface
- Real-time spelling suggestions and autocorrect
- Trie-based fast search
- Custom word list (`public/word-list.txt`)
- Accessible and responsive UI
- Deployable on Vercel

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation

```bash
cd braille_typer
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

### File Structure

- `src/app/`: Main Next.js app code
- `src/components/`: UI components
- `src/lib/`: Core logic (Trie, suggestion engine, etc.)
- `public/word-list.txt`: Custom dictionary

## Deployment

Deploy easily on [Vercel](https://braille-typing.vercel.app/) or any platform supporting Next.js.
