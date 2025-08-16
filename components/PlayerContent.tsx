'use client';

import { Song } from '@/types';

import { BsPauseFill, BsPlayFill } from 'react-icons/bs';
import { AiFillStepBackward, AiFillStepForward } from 'react-icons/ai';
import { HiSpeakerWave, HiSpeakerXMark } from 'react-icons/hi2';
import { useEffect, useState } from 'react';
import useSound from 'use-sound';
import { RefObject } from 'react';
import { useRef } from 'react';

import usePlayer from '@/hooks/usePlayer';

import LikeButton from './LikeButton';
import MediaItem from './MediaItem';
import Slider from './Slider';
import { useSessionContext } from '@supabase/auth-helpers-react';

interface PlayerContentProps {
  song: Song;
  songUrl: string;
}

const PlayerContent: React.FC<PlayerContentProps> = ({ song, songUrl }) => {
  const player = usePlayer();
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { supabaseClient } = useSessionContext();

  const Icon = isPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  const recordPlay = async (songId: string) => {
    const { error } = await supabaseClient.rpc('increment_play_count', {
      p_song_id: songId,
    });
    if (error) console.error(error);
  };

  const trackPlayFromZeroToEighty = ({
    sound,
    songId,
    onValidPlay,
    intervalRef,
  }: {
    sound: any;
    songId: string;
    onValidPlay: () => void;
    intervalRef: RefObject<NodeJS.Timeout | null>;
  }): void => {
    let hasStartedFromZero = false;
    let hasRecorded = false;
    let previousSeek = 0;

    if (!sound) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const currentSeek = sound.seek?.() as number;
      const duration = sound.duration?.() as number;

      if (typeof currentSeek !== 'number' || !duration) return;

      const progress = currentSeek / duration;
      const scrubThreshold = 3; // seconds

      // 🎬 Wait for start at 0:00
      if (!hasStartedFromZero) {
        if (currentSeek <= 2.0) {
          hasStartedFromZero = true;
          previousSeek = currentSeek;
          console.log('▶️ Started from beginning.');
        }

        return;
      }

      // ❌ If user scrubs (jumps)
      const jumpedBackToStart = previousSeek > 10 && currentSeek <= 1;
      const jumped = Math.abs(currentSeek - previousSeek) > scrubThreshold;

      if (jumped && !jumpedBackToStart) {
        console.log('⛔ Scrub detected. Resetting tracking.');
        hasStartedFromZero = false;
        hasRecorded = false;
        previousSeek = 0;
        return;
      }

      previousSeek = currentSeek;
      //TODO fix song_plays table updating correctly
      // ✅ If reaches 80% and hasn't been recorded
      if (!hasRecorded && progress >= 0.1) {
        console.log('🎉 Reached 80% from start without skipping.');
        onValidPlay();
        hasRecorded = true;
      }
    }, 500);
  };

  const onPlayNext = () => {
    if (player.ids.length === 0) {
      return;
    }

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const nextSong = player.ids[currentIndex + 1];

    if (!nextSong) {
      return player.setId(player.ids[0]);
    }

    player.setId(nextSong);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const onPlayPrevious = () => {
    if (player.ids.length === 0) {
      return;
    }

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const previousSong = player.ids[currentIndex - 1];

    if (!previousSong) {
      return player.setId(player.ids[player.ids.length - 1]);
    }

    player.setId(previousSong);
  };

  const [play, { pause, sound }] = useSound(songUrl, {
    volume,
    format: ['mp3'],
    onplay: () => setIsPlaying(true),
    onend: () => {
      setIsPlaying(false);
      onPlayNext();
    },
    onpause: () => setIsPlaying(false),
  });

  useEffect(() => {
    if (!sound || !isPlaying) return;

    trackPlayFromZeroToEighty({
      sound,
      songId: song.id,
      onValidPlay: () => recordPlay(song.id),
      intervalRef,
    });

    const checkDuration = () => {
      const loadedDuration = sound.duration();
      if (loadedDuration && loadedDuration > 0) {
        setDuration(loadedDuration);
      } else {
        setTimeout(checkDuration, 200); // check again in 200ms
      }
    };

    checkDuration();
  }, [sound, isPlaying]);

  useEffect(() => {
    sound?.play();

    return () => {
      sound?.unload();
    };
  }, [sound]);

  useEffect(() => {
    if (!sound) return;

    const updatePosition = () => {
      setPosition(sound.seek() || 0); // current position
      requestAnimationFrame(updatePosition);
    };

    requestAnimationFrame(updatePosition);

    return () => {
      sound.off('load');
    };
  }, [sound]);

  const handlePlay = () => {
    if (!isPlaying) {
      play();
    } else {
      pause();
    }
  };

  const toggleMute = () => {
    if (volume === 0) {
      setVolume(1);
    } else {
      setVolume(0);
    }
  };

  return (
    <>
      <div className="w-full -mt-2">
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400 w-[40px] text-right">
            {formatTime(position)}
          </span>
          <Slider
            value={position}
            max={duration}
            onChange={(value) => {
              sound?.seek(value);
              setPosition(value);
            }}
            // className="flex-grow"
          />
          <span className="text-xs text-neutral-400 w-[40px] text-left">
            {formatTime(duration - position)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 h-full">
        <div
          className="
            flex
            w-full
            justify-start
        "
        >
          <div className="flex items-center gap-x-4">
            <MediaItem data={song} />
            <div
              className="
                hidden
                md:flex
                col-auto
                w-full
                justify-start
                items-center
              "
            >
              <LikeButton songId={song.id} />
            </div>
          </div>
        </div>

        <div
          className="
        flex
        md:hidden
        col-auto
        w-full
        justify-end
        items-center
        gap-x-2
      "
        >
          <div>
            <LikeButton songId={song.id} />
          </div>
          <div
            onClick={handlePlay}
            className="
                h-10
                w-10
                flex
                items-center
                justify-center
                rounded-full
                bg-white
                p-1
                cursor-pointer
            "
          >
            <Icon size={30} className="text-black" />
          </div>
        </div>
        <div
          className="
            hidden
            h-full
            md:flex
            justify-center
            items-center
            w-full
            max-w-[722px]
            gap-x-6
        "
        >
          <AiFillStepBackward
            onClick={onPlayPrevious}
            size={30}
            className="
                text-neutral-400
                cursor-pointer
                hover:text-white
                transition
            "
          />
          <div
            onClick={handlePlay}
            className="
                flex
                items-center
                justify-center
                h-10
                w-10
                rounded-full
                bg-white
                p-1
                cursor-pointer
            "
          >
            <Icon size={30} className="text-black" />
          </div>
          <AiFillStepForward
            onClick={onPlayNext}
            size={30}
            className="
                text-neutral-400
                cursor-pointer
                hover:text-white
                transition
            "
          />
        </div>

        <div className="hidden md:flex w-full justify-end pr-2">
          <div className="flex items-center gap-x-2 w-[120px]">
            <VolumeIcon
              onClick={toggleMute}
              size={30}
              className="cursor-pointer"
            />
            <Slider value={volume} onChange={(value) => setVolume(value)} />
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayerContent;
