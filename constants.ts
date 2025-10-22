
import type { CustomizationOptions } from './types';

export const initialCustomizationOptions: CustomizationOptions = {
    layout: 'force',
    nodeColors: {
        repo: '#1E90FF',       // DodgerBlue
        folder: '#FFD700',     // Gold
        file: '#98FB98',       // PaleGreen
        language: '#FF6347',   // Tomato
        dependency: '#8A2BE2', // BlueViolet
    },
    linkStyle: {
        color: '#4A5568',      // gray-600
        strokeWidth: 1.5,
    },
};
