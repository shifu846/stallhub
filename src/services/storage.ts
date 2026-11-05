import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { decode } from 'base64-arraybuffer';

import { supabase } from './supabase';

const MAX_WIDTH = 1280;

// Compress BEFORE upload (Lecture 7), then store the file remotely and keep only its PUBLIC URL in the row.
// A local file:// URI saved in the database would be meaningless on any other device (Brief 3.4).
export async function uploadPoster(localUri: string, userId: string): Promise<string> {
  const context = ImageManipulator.manipulate(localUri);
  context.resize({ width: MAX_WIDTH });
  const image = await context.renderAsync();
  const result = await image.saveAsync({ compress: 0.7, format: SaveFormat.JPEG, base64: true });
  if (!result.base64) throw new Error('Could not read the compressed image');

  // The folder name is the user id: the storage policy only lets you write inside your own folder.
  const path = `${userId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage.from('posters').upload(path, decode(result.base64), {
    contentType: 'image/jpeg',
  });
  if (error) throw error;
  return supabase.storage.from('posters').getPublicUrl(path).data.publicUrl;
}