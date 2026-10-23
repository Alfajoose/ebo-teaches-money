import {createContext, useContext} from 'react';

/**
 * House rule for the cast episodes: nothing animates scale — only translation and rotation.
 * Shared props read this flag and swap their scale-based effects (coin flips, growing
 * text, squashes, page flips) for move/rotate equivalents.
 */
export const NoScaleContext = createContext(false);
export const useNoScale = () => useContext(NoScaleContext);
