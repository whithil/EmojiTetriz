
import type { EmojiSet, CustomMinoData } from "./tetris-constants";
import { TETROMINO_TYPES, DEFAULT_EMOJI_SET } from "./tetris-constants";

export interface ShareableData {
  emojiSet: EmojiSet;
  customMinoesData?: CustomMinoData[];
}

export const encodeShareableData = (data: ShareableData): string => {
  try {
    const jsonString = JSON.stringify(data);
    // First, URI-encode the string to handle multi-byte characters, then Base64 encode.
    return btoa(encodeURIComponent(jsonString));
  } catch (error) {
    console.error("Error encoding shareable data:", error);
    return "";
  }
};

export const decodeShareableData = (encodedString: string): ShareableData | null => {
  try {
    // First, Base64 decode, then URI-decode the string.
    const jsonString = decodeURIComponent(atob(encodedString));
    const decoded = JSON.parse(jsonString) as Partial<ShareableData>;

    // Validate emojiSet part
    if (!decoded.emojiSet) {
      console.error("Decoded data missing emojiSet");
      return null;
    }

    const validatedEmojiSet: EmojiSet = { ...DEFAULT_EMOJI_SET };
    let emojiSetIsValid = true;
    for (const type of TETROMINO_TYPES) {
      if (decoded.emojiSet[type] && typeof decoded.emojiSet[type] === 'string' && decoded.emojiSet[type]!.length > 0 && decoded.emojiSet[type]!.length <= 2) {
        validatedEmojiSet[type] = decoded.emojiSet[type]!;
      } else {
        // If a specific emoji is invalid or missing, it will use the default from validatedEmojiSet.
        // To be stricter, one could set emojiSetIsValid = false here.
        // For now, we allow partial emoji sets to be "completed" by defaults.
      }
    }
    // Check if all tetrominos types are present in the source, even if we use defaults
    if (TETROMINO_TYPES.some(type => !decoded.emojiSet![type])) {
      // This indicates a malformed original emojiSet if it doesn't even have keys for all types.
      // However, our loop above ensures validatedEmojiSet is complete.
      // If strict validation is needed, this could be an error point.
    }

    const result: ShareableData = { emojiSet: validatedEmojiSet };

    // Validate and include customMinoesData if present
    if (decoded.customMinoesData) {
      if (Array.isArray(decoded.customMinoesData) && decoded.customMinoesData.every(mino => 
          typeof mino === 'object' && mino !== null &&
          typeof mino.id === 'string' &&
          typeof mino.name === 'string' &&
          typeof mino.emoji === 'string' && mino.emoji.length > 0 && mino.emoji.length <=2 &&
          Array.isArray(mino.shape) &&
          mino.shape.every(row => Array.isArray(row) && row.every(cell => typeof cell === 'number'))
        )) {
        result.customMinoesData = decoded.customMinoesData as CustomMinoData[];
      } else {
        console.warn("Decoded customMinoesData is present but malformed. Ignoring.");
      }
    }
    
    return result;
  } catch (error) {
    console.error("Error decoding shareable data:", error);
    return null;
  }
};
