
import type { EmojiSet } from "./tetris-constants";
import { TETROMINO_TYPES, DEFAULT_EMOJI_SET } from "./tetris-constants";

export const encodeEmojiSet = (emojiSet: EmojiSet): string => {
  try {
    const jsonString = JSON.stringify(emojiSet);
    // First, URI-encode the string to handle multi-byte characters, then Base64 encode.
    return btoa(encodeURIComponent(jsonString));
  } catch (error) {
    console.error("Error encoding emoji set:", error);
    return "";
  }
};

export const decodeEmojiSet = (encodedString: string): EmojiSet | null => {
  try {
    // First, Base64 decode, then URI-decode the string.
    const jsonString = decodeURIComponent(atob(encodedString));
    const decodedSet = JSON.parse(jsonString) as Partial<EmojiSet>;

    // Validate structure and content
    let isValid = true;
    const validatedSet: EmojiSet = { ...DEFAULT_EMOJI_SET };

    for (const type of TETROMINO_TYPES) {
      if (decodedSet[type] && typeof decodedSet[type] === 'string' && decodedSet[type]!.length > 0 && decodedSet[type]!.length <= 2) { // Basic emoji length check
        validatedSet[type] = decodedSet[type]!;
      } else {
        // if partial, fill with default. If totally invalid, this helps.
        // for a more robust validation, one might throw an error or mark as invalid.
      }
    }
    // Check if all tetrominos types are present
    if (TETROMINO_TYPES.some(type => !validatedSet[type])) {
      isValid = false;
    }
    
    return isValid ? validatedSet : null;
  } catch (error) {
    console.error("Error decoding emoji set:", error);
    return null;
  }
};

