/**
 * @file This file imports the JSON data for placeholder images and exports it
 * as a typed array for use throughout the application.
 */
import data from './placeholder-images.json';

// Defines the structure for a single placeholder image object.
export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// Exports the array of placeholder images.
export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
