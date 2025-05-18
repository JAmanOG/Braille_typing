class TrieNode {
    constructor() {
      this.children = {};
      this.isEndOfWord = false;
    }
  }
  
  class Trie {
    constructor() {
      this.root = new TrieNode();
    }
  
    insert(word) {
      let node = this.root;
      for (let i = 0; i < word.length; i++) {
        let char = word[i];
        if (!node.children[char]) {
          node.children[char] = new TrieNode();
        }
        node = node.children[char];
      }
      node.isEndOfWord = true;
    }
  
    search(word) {
      let node = this.root;
  
      for (let i = 0; i < word.length; i++) {
        let char = word[i];
  
        if (!node.children[char]) {
          return false;
        }
        node = node.children[char];
      }
      return node.isEndOfWord;
    }
  
    startsWith(prefix) {
      let node = this.root;
      for (let i = 0; i < prefix.length; i++) {
        let char = prefix[i];
        if (!node.children[char]) {
          return false;
        }
        node = node.children[char];
      }
      return true;
    }

    // endWith(prefix) {
    //   let node = this.root;
    //   for (let i = 0; i < prefix.length; i++) {
    //     let char = prefix[i];
    //     if (!node.children[char]) {
    //       return false;
    //     }
    //     node = node.children[char];
    //   }
    //   return node.isEndOfWord;
    // }

    // between(prefix, suffix) {
    //   let node = this.root;
    //   for (let i = 0; i < prefix.length; i++) {
    //     let char = prefix[i];
    //     if (!node.children[char]) {
    //       return false;
    //     }
    //     node = node.children[char];
    //   }
    //   for (let i = 0; i < suffix.length; i++) {
    //     let char = suffix[i];
    //     if (!node.children[char]) {
    //       return false;
    //     }
    //     node = node.children[char];
    //   }
    //   return true;
    // }

    // betterThan(prefix, suffix) {
    //   let node = this.root;
    //   for (let i = 0; i < prefix.length; i++) {
    //     let char = prefix[i];
    //     if (!node.children[char]) {
    //       return false;
    //     }
    //     node = node.children[char];
    //   }
    //   for (let i = 0; i < suffix.length; i++) {
    //     let char = suffix[i];
    //     if (!node.children[char]) {
    //       return false;
    //     }
    //     node = node.children[char];
    //   }
    //   return true;
    // }

    // lessThan(prefix, suffix) {
    //   let node = this.root;
    //   for (let i = 0; i < prefix.length; i++) {
    //     let char = prefix[i];
    //     if (!node.children[char]) {
    //       return false;
    //     }
    //     node = node.children[char];
    //   }
    //   for (let i = 0; i < suffix.length; i++) {
    //     let char = suffix[i];
    //     if (!node.children[char]) {
    //       return false;
    //     }
    //     node = node.children[char];
    //   }
    //   return true;
    // }
    
  }
  
export { Trie, TrieNode };