'use client';

import {
    createContext,
    useContext,
    useRef,
    useState,
    useEffect,
} from 'react';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
    const audioRef = useRef(null);

    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queue, setQueue] = useState([]);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const playSong = (song, newQueue = null) => {
        if (newQueue) {
            setQueue(newQueue);
        }

        // If it's the same song and it's already playing, just return
        if (currentSong?._id === song._id && audioRef.current && isPlaying && !newQueue) {
            return;
        }

        // If it's the same song but paused, resume it
        if (currentSong?._id === song._id && audioRef.current && !isPlaying) {
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(err => console.error("Playback error:", err));
            return;
        }

        // Stop previous
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = ""; // Clear src to stop loading
        }

        const audio = new Audio(song.audioFile);
        audio.volume = volume;
        
        audio.ontimeupdate = () => {
            setCurrentTime(audio.currentTime);
        };
        
        audio.onloadedmetadata = () => {
            setDuration(audio.duration);
        };

        audio.onended = () => {
            playNext();
        };

        audio.play()
            .then(() => {
                setIsPlaying(true);
                setCurrentSong(song);
                audioRef.current = audio;
            })
            .catch(e => {
                console.error("Audio play error", e);
                setIsPlaying(false);
            });
    };

    const playNext = (currentQueue = queue, song = currentSong) => {
        if (!currentQueue || currentQueue.length === 0 || !song) return;
        const currentIndex = currentQueue.findIndex(s => s._id === song._id);
        if (currentIndex === -1) return;
        
        const nextIndex = (currentIndex + 1) % currentQueue.length;
        playSong(currentQueue[nextIndex], currentQueue);
    };

    const playPrevious = () => {
        if (!queue || queue.length === 0 || !currentSong) return;
        
        // If we are more than 3 seconds in, restart the song
        if (audioRef.current && audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0;
            return;
        }

        const currentIndex = queue.findIndex(s => s._id === currentSong._id);
        if (currentIndex === -1) return;
        
        const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
        playSong(queue[prevIndex], queue);
    };

    const pauseSong = () => {
        if (!audioRef.current) return;
        audioRef.current.pause();
        setIsPlaying(false);
    };

    const resumeSong = () => {
        if (!audioRef.current) return;
        audioRef.current.play();
        setIsPlaying(true);
    };

    const seekTo = (time) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const changeVolume = (newVolume) => {
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    const stopSong = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
        setCurrentSong(null);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    return (
        <PlayerContext.Provider
            value={{
                currentSong,
                isPlaying,
                volume,
                currentTime,
                duration,
                playSong,
                pauseSong,
                resumeSong,
                stopSong,
                playNext,
                playPrevious,
                seekTo,
                changeVolume,
                setQueue,
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => useContext(PlayerContext);