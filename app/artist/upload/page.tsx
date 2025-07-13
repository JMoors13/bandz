'use client';

import { useState } from 'react';
import { supabase } from '../../../providers/SupabaseProvider';
import { v4 as uuidv4 } from 'uuid';

export default function UploadSong() {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [genre, setGenre] = useState('');
  const [price, setPrice] = useState(200); // default to $2.00
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file || !title) return alert('Please enter all fields.');

    setUploading(true);

    const filename = `${uuidv4()}.${file.name.split('.').pop()}`;

    // 1. Upload audio to Supabase Storage
    const { data: storageData, error: uploadError } = await supabase.storage
      .from('songs')
      .upload(filename, file);

    if (uploadError) {
      setUploading(false);
      return alert('Upload failed: ' + uploadError.message);
    }

    const fileUrl = supabase.storage.from('songs').getPublicUrl(filename)
      .data.publicUrl;

    // 2. Get user (artist) ID
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 3. Insert song into DB
    const { error: insertError } = await supabase.from('songs').insert({
      artist_id: user?.id,
      title,
      genre,
      price_cents: price,
      audio_file_url: fileUrl,
    });

    setUploading(false);

    if (insertError) alert('Error inserting song: ' + insertError.message);
    else alert('Song uploaded successfully!');
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload a New Song</h1>

      <input
        type="text"
        placeholder="Song Title"
        className="border p-2 w-full mb-2"
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Genre"
        className="border p-2 w-full mb-2"
        onChange={(e) => setGenre(e.target.value)}
      />
      <input
        type="number"
        placeholder="Price (cents)"
        className="border p-2 w-full mb-2"
        value={price}
        onChange={(e) => setPrice(parseInt(e.target.value))}
      />
      <input
        type="file"
        accept="audio/*"
        className="mb-4"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {uploading ? 'Uploading...' : 'Upload Song'}
      </button>
    </div>
  );
}
