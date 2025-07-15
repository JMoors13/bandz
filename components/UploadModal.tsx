'use client';

import uniqid from 'uniqid';
import { useState } from 'react';
import useUploadModal from '@/hooks/useUploadModal';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useUser } from '@/hooks/useUser';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';

import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import FileInput from './FileInput';

const UploadModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const uploadModal = useUploadModal();
  const { user } = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  const { register, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues: {
      artist: '',
      title: '',
      song: null,
      image: null,
    },
  });

  const handleFileSelect = (file: File | null) => {
    if (file) {
      console.log('Selected file:', file.name);
      // You can now upload this file using Supabase, etc.
    }
  };

  const onChange = (open: boolean) => {
    if (!open) {
      reset();
      uploadModal.onClose();
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true);

      const imageFile = values.image?.[0];
      const songFile = values.song?.[0];

      if (!imageFile || !songFile || !user) {
        toast.error('Missing fields');
        return;
      }

      const uniqueId = uniqid();

      // Upload Song
      const { data: songData, error: songError } = await supabaseClient.storage
        .from('songs')
        .upload(`song-${values.title}-${uniqueId}`, songFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (songError) {
        setIsLoading(false);
        console.log(songError);
        return toast.error('Failed song upload.');
      }

      // Upload Image
      const { data: imageData, error: imageError } =
        await supabaseClient.storage
          .from('images')
          .upload(`image-${values.title}-${uniqueId}`, imageFile, {
            cacheControl: '3600',
            upsert: false,
          });

      if (imageError) {
        setIsLoading(false);
        return toast.error('Failed image upload.');
      }

      const { error: supabaseError } = await supabaseClient
        .from('songs')
        .insert({
          artist_id: user.id,
          title: values.title,
          artist: values.artist,
          image_path: imageData.path,
          song_path: songData.path,
        });

      if (supabaseError) {
        setIsLoading(false);
        return toast.error(supabaseError.message);
      }

      router.refresh();
      setIsLoading(false);
      toast.success('Song created!');
      reset();
      uploadModal.onClose();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Add a song"
      description="Upload a music file"
      isOpen={uploadModal.isOpen}
      onChange={onChange}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        <Input
          id="title"
          disabled={isLoading}
          {...register('title', { required: true })}
          placeholder="Song title"
        />
        <Input
          id="artist"
          disabled={isLoading}
          {...register('artist', { required: true })}
          placeholder="Artist"
        />
        <FileInput
          id="song"
          label="Select a song"
          accept="audio/*"
          onChange={(e) => {
            // Update form manually
            setValue('song', e.target.files);
          }}
        />
        <FileInput
          id="image"
          label="Select a cover image"
          accept="image/*"
          onChange={(e) => {
            setValue('image', e.target.files);
          }}
        />

        <Button className="cursor-pointer" disabled={isLoading} type="submit">
          Upload
        </Button>
      </form>
    </Modal>
  );
};

export default UploadModal;
