'use client';

import uniqid from 'uniqid';
import { useEffect, useState } from 'react';
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
// import useArtistProfile from '@/hooks/useGetArtistProfile';

const UploadModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const uploadModal = useUploadModal();
  const { user } = useUser();
  // const artistProfile = useArtistProfile();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  // const [artistProfile, setArtistProfile] = useState('');
  const { register, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues: {
      artist: '',
      title: '',
      genre: '',
      song: null,
      image: null,
    },
  });

  // const handleFileSelect = (file: File | null) => {
  //   if (file) {
  //     // You can now upload this file using Supabase, etc.
  //   }
  // };

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

  // useEffect(() => {
  //   if (artistProfile?.artist_name) {
  //     setValue('artist', artistProfile.artist_name);
  //   }
  // }, [artistProfile, setValue]);

  // useEffect(() => {
  //   if (!user) return;

  //   const fetchArtist = async () => {
  //     const { data, error } = await supabaseClient
  //       .from('artists')
  //       .select('*')
  //       .eq('id', user.id)
  //       .single();

  //     if (error) {
  //       console.error(error);
  //     } else {
  //       setArtistProfile(data);
  //       console.log(artistProfile);
  //     }
  //   };

  //   fetchArtist();
  // }, [user]);

  return (
    <Modal
      title="Add a song"
      description="Upload a music file"
      isOpen={uploadModal.isOpen}
      onChange={onChange}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        Song Title
        <Input
          id="title"
          disabled={isLoading}
          {...register('title', { required: true })}
          placeholder="Enter song name here"
        />
        <div
          className="
            flex
            gap-y-1
            text-neutral-300"
        >
          <label
            className="
              font-semibold"
          >
            Artist Name: &nbsp;
          </label>
          {/* <span>{artistProfile?.artist_name}</span> */}
          <input type="hidden" {...register('artist', { required: true })} />
        </div>
        <div className="flex flex-col gap-y-1">
          <label
            htmlFor="genre"
            className="text-sm font-semibold text-neutral-300"
          >
            Genre
          </label>
          <select
            id="genre"
            disabled={isLoading}
            {...register('genre', { required: true })}
            className="bg-neutral-800 text-white border border-neutral-600 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Select a genre</option>
            <option value="rock">Rock</option>
            <option value="pop">Pop</option>
            <option value="hiphop">Hip-Hop</option>
            <option value="electronic">Electronic</option>
            <option value="jazz">Jazz</option>
            <option value="classical">Classical</option>
            <option value="country">Country</option>
            <option value="metal">Metal</option>
            <option value="folk">Folk</option>
            <option value="other">Other</option>
          </select>
        </div>
        <FileInput
          id="song"
          label="Select a song file"
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
