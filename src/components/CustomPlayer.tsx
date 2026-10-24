import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  SkipBack, SkipForward, Subtitles, Settings, 
  Loader2
} from "lucide-react";

interface Props {
  src: string;
  poster?: string | null;
  autoPlay?: boolean;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

interface Track {
  id: number;
  name: string;
  lang?: string;
}

export default function CustomPlayer({ src, poster, autoPlay = true, onEnded, onTimeUpdate }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [levels, setLevels] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [showSettings, setShowSettings] = useState(false);
  const [audioTracks, setAudioTracks] = useState<Track[]>([]);
  const [currentAudioTrack, setCurrentAudioTrack] = useState(0);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [textTracks, setTextTracks] = useState<TextTrack[]>([]);
  const [showSubtitlesMenu, setShowSubtitlesMenu] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState(-1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setLoading(true);

    if (Hls.isSupported() && (src.includes('.m3u8') || src.includes('m3u8'))) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLevels(hls.levels);
        setLoading(false);
        if (autoPlay) {
          video.play().catch(() => {});
        }
      });
      
      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentLevel(data.level);
      });
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setLoading(false);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
        if (autoPlay) video.play().catch(() => {});
      });
    } else {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
        if (autoPlay) video.play().catch(() => {});
      });
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
      onTimeUpdate?.(video.currentTime, video.duration);
    };

    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);
    const handleEnded = () => {
      setPlaying(false);
      onEnded?.();
    };
    const handleWaiting = () => setLoading(true);
    const handleCanPlay = () => setLoading(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleCanPlay);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleCanPlay);
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = muted;
  }, [volume, muted]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setMuted(vol === 0);
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setFullscreen(false));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const hours = Math.floor(time / 3600);
    const mins = Math.floor((time % 3600) / 60);
    const secs = Math.floor(time % 60);
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const changeQuality = (level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setCurrentLevel(level);
      setShowSettings(false);
    }
  };

  const changeAudioTrack = (trackId: number) => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = trackId;
      setCurrentAudioTrack(trackId);
      setShowAudioMenu(false);
    }
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-100 h-100 bg-black group"
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-100 h-100"
        poster={poster || undefined}
        playsInline
        onClick={togglePlay}
      />
      
      {loading && (
        <div className="position-absolute top-50 start-50 translate-middle">
          <Loader2 size={40} className="spin text-white" />
        </div>
      )}
      
      {!playing && !loading && (
        <div 
          className="position-absolute top-50 start-50 translate-middle cursor-pointer"
          onClick={togglePlay}
        >
          <div className="d-flex align-items-center justify-content-center rounded-circle" 
               style={{ width: '80px', height: '80px', background: 'rgba(0,0,0,0.7)' }}>
            <Play size={40} fill="white" color="white" />
          </div>
        </div>
      )}
      
      <div 
        className={`position-absolute bottom-0 start-0 w-100 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}
      >
        <div className="px-3 pb-2">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-100"
            style={{ cursor: 'pointer' }}
          />
        </div>
        
        <div className="d-flex align-items-center justify-content-between px-3 pb-3 gap-2">
          <div className="d-flex align-items-center gap-2">
            <button onClick={togglePlay} className="btn btn-link text-white p-1">
              {playing ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button onClick={() => skip(-10)} className="btn btn-link text-white p-1" title="Skip 10s back">
              <SkipBack size={22} />
            </button>
            <button onClick={() => skip(10)} className="btn btn-link text-white p-1" title="Skip 10s forward">
              <SkipForward size={22} />
            </button>
            <div className="d-flex align-items-center gap-2">
              <button onClick={toggleMute} className="btn btn-link text-white p-1">
                {muted || volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                style={{ width: '80px' }}
              />
            </div>
            <span className="text-white small ms-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          <div className="d-flex align-items-center gap-2">
            {hlsRef.current && levels.length > 0 && (
              <div className="position-relative">
                <button 
                  onClick={() => setShowSettings(!showSettings)} 
                  className="btn btn-link text-white p-1"
                  title="Quality"
                >
                  <Settings size={22} />
                </button>
                {showSettings && (
                  <div className="position-absolute bottom-100 end-0 mb-2 bg-dark rounded p-2" style={{ minWidth: '150px' }}>
                    <div className="text-white small mb-1 fw-bold">Quality</div>
                    <button 
                      onClick={() => changeQuality(-1)}
                      className={`btn btn-sm w-100 text-start ${currentLevel === -1 ? 'btn-primary' : 'btn-link text-white'}`}
                    >
                      Auto
                    </button>
                    {[...levels].reverse().map((level, idx) => {
                      const levelIndex = levels.length - 1 - idx;
                      return (
                        <button 
                          key={levelIndex}
                          onClick={() => changeQuality(levelIndex)}
                          className={`btn btn-sm w-100 text-start ${currentLevel === levelIndex ? 'btn-primary' : 'btn-link text-white'}`}
                        >
                          {level.height ? `${level.height}p` : 'Auto'}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            
            {hlsRef.current && (hlsRef.current as any).audioTracks && (hlsRef.current as any).audioTracks.length > 1 && (
              <div className="position-relative">
                <button 
                  onClick={() => setShowAudioMenu(!showAudioMenu)} 
                  className="btn btn-link text-white p-1"
                  title="Audio"
                >
                  <span className="small">AUDIO</span>
                </button>
                {showAudioMenu && (
                  <div className="position-absolute bottom-100 end-0 mb-2 bg-dark rounded p-2" style={{ minWidth: '150px' }}>
                    <div className="text-white small mb-1 fw-bold">Audio</div>
                    {(hlsRef.current as any).audioTracks.map((track: any, idx: number) => (
                      <button 
                        key={idx}
                        onClick={() => changeAudioTrack(idx)}
                        className={`btn btn-sm w-100 text-start ${currentAudioTrack === idx ? 'btn-primary' : 'btn-link text-white'}`}
                      >
                        {track.name || track.lang || `Track ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <button onClick={toggleFullscreen} className="btn btn-link text-white p-1">
              {fullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
