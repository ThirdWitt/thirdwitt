import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Mail, Instagram, Disc, X, Menu, Music, DollarSign, Ticket, Activity, ExternalLink, Headphones } from 'lucide-react';

// --- Custom Hooks & Utils ---
const useOnScreen = (options) => {
  const [ref, setRef] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
    }, options);
    if (ref) observer.observe(ref);
    return () => {
      if (ref) observer.unobserve(ref);
    };
  }, [ref, options]);
  return [setRef, visible];
};

// Helper: Format seconds into M:SS
const formatTime = (time) => {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// --- Components ---

// 1. Navigation
const Navbar = ({ setPage, activePage }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-zinc-800 bg-black/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Centered Logo Box - Chrome Effect */}
          <div className="flex-shrink-0 cursor-pointer group relative" onClick={() => setPage('home')}>
            {/* Monochrome Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-600 via-white to-gray-600 rounded-sm opacity-0 group-hover:opacity-100 blur transition-opacity duration-500"></div>
            <div className="relative w-12 h-12 flex items-center justify-center border border-zinc-500 bg-black group-hover:border-white transition-all duration-300 z-10">
              <span className="font-black text-xl tracking-tighter bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent group-hover:from-white group-hover:to-gray-300 transition-all">
                TW
              </span>
            </div>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button 
                onClick={() => setPage('home')}
                className={`px-3 py-2 rounded-sm text-sm font-mono font-bold uppercase tracking-widest transition-all hover:-translate-y-1 ${activePage === 'home' ? 'text-white bg-zinc-800/50 border-b border-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
              >
                Home
              </button>
              <button 
                onClick={() => setPage('pricing')}
                className={`px-3 py-2 rounded-sm text-sm font-mono font-bold uppercase tracking-widest transition-all hover:-translate-y-1 ${activePage === 'pricing' ? 'text-white bg-zinc-800/50 border-b border-gray-300' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
              >
                Pricing & Services
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-400 hover:text-white p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black border-b border-zinc-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button 
              onClick={() => { setPage('home'); setIsOpen(false); }}
              className="block w-full text-left px-3 py-4 text-base font-mono font-bold text-white hover:bg-zinc-900 hover:text-white border-l-2 border-transparent hover:border-white"
            >
              HOME
            </button>
            <button 
              onClick={() => { setPage('pricing'); setIsOpen(false); }}
              className="block w-full text-left px-3 py-4 text-base font-mono font-bold text-white hover:bg-zinc-900 hover:text-white border-l-2 border-transparent hover:border-white"
            >
              PRICING & SERVICES
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

// 2. SoundCloud Player Component (FUNCTIONAL + ACCURATE TIME)
const SoundCloudPlayer = ({ title, genre, audioSrc, link, duration: durationLabel, variant = 'default' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [durationSec, setDurationSec] = useState(0); // Stores actual file duration in seconds
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  const isChrome = variant === 'chrome';

  // Toggle Play/Pause
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(e => console.log("Audio playback failed (likely no file source)", e));
    }
    setIsPlaying(!isPlaying);
  };

  // Handle Time Update
  const onTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
    }
  };

  // Handle Metadata Load (Get Actual Duration from File)
  const onLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio && audio.duration && !isNaN(audio.duration)) {
      setDurationSec(audio.duration);
    }
  };

  // Handle Seek (Clicking the bar)
  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Use actual duration if loaded, otherwise ignore seek
    const totalTime = durationSec > 0 ? durationSec : 0;
    if (totalTime === 0) return;

    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    
    audio.currentTime = percent * totalTime;
    setCurrentTime(audio.currentTime);
  };

  // Handle Audio End
  const onEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  return (
    <div className={`w-full p-4 rounded-sm relative overflow-hidden group mb-4 transition-all duration-500 hover:-translate-y-1 cursor-default ${
      isChrome 
        ? 'bg-gradient-to-br from-zinc-100 via-white to-zinc-300 border border-white shadow-[0_0_25px_rgba(255,255,255,0.15)]' 
        : 'bg-black/80 border border-zinc-800 hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] backdrop-blur-sm'
    }`}>
      
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        preload="metadata"
      />

      {/* Sheen Overlay for Chrome Card (Monochrome) */}
      {isChrome && (
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-white/20 pointer-events-none mix-blend-overlay"></div>
      )}

      {/* Animated Background Bar */}
      <div className={`absolute top-0 left-0 h-full pointer-events-none transition-all duration-[2000ms] ease-linear ${
        isChrome ? 'bg-black/5' : 'bg-zinc-900'
      } ${isPlaying ? 'w-full' : 'w-0'}`} />
      
      <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
        {/* Album Art Placeholder */}
        <div className={`w-full md:w-24 h-24 border flex items-center justify-center flex-shrink-0 transition-colors shadow-lg overflow-hidden relative ${
          isChrome 
            ? 'bg-zinc-200 border-zinc-400' 
            : 'bg-black border-zinc-800 group-hover:border-white'
        }`}>
           {/* CD Reflection Effect - DARKER FOR CHROME CARD */}
           <div className={`absolute inset-0 bg-gradient-to-tr from-transparent to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ${
             isChrome ? 'via-black/50' : 'via-white/40'
           }`}></div>
           
          <Disc className={`w-10 h-10 ${isPlaying ? 'animate-spin' : ''} ${
            isChrome ? 'text-black' : 'text-zinc-600 group-hover:text-white'
          }`} style={{ animationDuration: '3s' }} />
        </div>
        
        {/* Controls & Info */}
        <div className="flex-grow w-full space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`font-black text-base md:text-xl font-mono uppercase tracking-tight transition-colors ${
                isChrome ? 'text-black' : 'text-white group-hover:text-gray-300'
              }`}>{title}</h3>
              <p className={`text-xs font-mono mt-1 uppercase tracking-widest ${
                isChrome ? 'text-zinc-600' : 'text-zinc-500'
              }`}>{genre}</p>
            </div>
            <a href={link} target="_blank" rel="noreferrer" className={`hidden sm:flex items-center gap-1 text-xs font-mono border px-2 py-1 transition-all hover:scale-105 ${
              isChrome 
                ? 'text-zinc-600 border-zinc-400 hover:bg-black hover:text-white hover:border-black' 
                : 'text-zinc-500 hover:text-white border-zinc-800 hover:border-white'
            }`}>
              LISTEN ON SC <ExternalLink size={10} />
            </a>
          </div>

          {/* Waveform Visual (Animation synced to play state) */}
          <div className="h-8 flex items-end space-x-1 opacity-80 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <div 
                key={i} 
                className={`w-1 transition-all duration-100 ${isPlaying ? 'animate-pulse' : ''}`}
                style={{ 
                  height: `${Math.max(20, Math.random() * 100)}%`, 
                  animationDuration: isPlaying ? `${Math.random() * 0.5 + 0.5}s` : '0s', // Only animate if playing
                  backgroundColor: isPlaying && i < (isPlaying ? 50 : 0) 
                    ? (isChrome ? '#000' : '#fff') 
                    : (isChrome ? 'rgba(0,0,0,0.1)' : '#333')
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={togglePlay}
              className={`w-8 h-8 flex items-center justify-center transition-all hover:scale-110 active:scale-95 rounded-sm ${
                isChrome 
                  ? 'bg-black hover:bg-zinc-800 text-white' 
                  : 'bg-white hover:bg-gray-200 text-black hover:text-black'
              }`}
            >
              {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
            </button>
            
            {/* Progress Bar (Functional) */}
            <div 
              onClick={handleSeek}
              className={`h-1 flex-grow cursor-pointer relative group/bar ${
                isChrome ? 'bg-black/10' : 'bg-zinc-900'
              }`}
            >
              {/* Filled Bar */}
              <div 
                className={`h-full relative transition-all duration-75 ease-linear ${
                  isChrome ? 'bg-black' : 'bg-white'
                }`}
                style={{ width: `${(currentTime / (durationSec || 1)) * 100}%` }}
              >
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover/bar:opacity-100 transition-opacity shadow-[0_0_10px_white]"></div>
              </div>
            </div>
            
            {/* Live Timer: M:SS / M:SS (Uses durationProp if real file not loaded yet) */}
            <span className={`text-xs font-mono min-w-[100px] text-right ${
              isChrome ? 'text-zinc-600' : 'text-zinc-500'
            }`}>
              {formatTime(currentTime)} / {durationSec > 0 ? formatTime(durationSec) : durationLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Home Page
const HomePage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    setIsLoaded(true);
    // Force Video Play on mount (fixes some mobile autoplay issues)
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log("Header video play failed", e));
    }
  }, []);

  return (
    <div className="space-y-24 pb-24 relative z-10">
      
      {/* HEADER - VIDEO BACKGROUND & CHROME TEXT (Scrolls over fixed bg) */}
      <header className="flex flex-col items-center pt-20 text-center min-h-[85vh] relative overflow-hidden z-20">
        
        {/* PRIMARY VIDEO BACKGROUND (For Header Only) */}
        <div className="absolute inset-0 z-0 bg-black">
          <video 
              ref={videoRef}
              autoPlay 
              loop 
              muted 
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-center opacity-100"
          >
              <source src="/BgVideo.mp4" type="video/mp4" />
          </video>
            
            {/* BOTTOM FADE MASK - Blends banner into the rest of the site */}
            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none"></div>
        </div>

        {/* HERO CONTENT */}
        {/* FIX: Removed px-4 to allow full width */}
        <div className="relative z-20 w-full flex flex-col items-center">
            
            {/* Main Logo Image */}
            <div className="mb-6 animate-float relative z-20 w-full flex justify-center -mt-4 md:-mt-12">
                {/* DESKTOP LOGO (Horizontal) */}
                {/* FIX: Changed to w-screen to force full width, removed drop-shadow */}
                <img 
                    src="/ChromeLogo.png" 
                    alt="THIRDWITT" 
                    className="hidden md:block w-screen h-auto object-contain"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<h1 class="text-7xl md:text-9xl font-black tracking-tighter text-white">THIRDWITT</h1>`;
                    }}
                />

                {/* MOBILE LOGO (Vertical) */}
                 {/* FIX: Changed to w-screen to force full width, removed drop-shadow */}
                <img 
                    src="/ChromeLogoVertical.png" 
                    alt="THIRDWITT" 
                    className="block md:hidden w-screen h-auto object-contain"
                    onError={(e) => {
                        e.target.style.display = 'none';
                    }}
                />
            </div>
        </div>

        {/* ANIMATED REVEAL TEXT - MOVED TO BOTTOM */}
        <div className="absolute bottom-32 md:bottom-40 left-0 w-full z-30 flex flex-col items-center justify-center">
            
            {/* SCANNER BAR EFFECT */}
            <div className="relative overflow-hidden px-6 py-3">
                <p className={`text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-white to-gray-400 font-mono font-bold text-base md:text-2xl uppercase tracking-[0.2em] transition-opacity duration-700 delay-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                  House / Pop / R&B / Open Format
                </p>
                
                {/* Scanner Bar (Vertical Line) */}
                <div className={`absolute top-0 bottom-0 w-2 md:w-4 bg-white/80 blur-[4px] shadow-[0_0_20px_white] z-40 ${isLoaded ? 'animate-scan-reveal' : 'left-0 opacity-0'}`}></div>
            </div>
            
            <div className={`mt-4 flex items-center justify-center gap-3 transition-opacity duration-1000 delay-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
               <div className="h-px w-8 bg-zinc-700"></div>
               {/* FIX: Removed bg-black/30 and backdrop-blur-sm to remove background */}
               <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-sm">
                  Philadelphia / NYC / Worldwide
               </p>
               <div className="h-px w-8 bg-zinc-700"></div>
            </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 space-y-32 pt-12">
        
        {/* HEADSHOT & ABOUT */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="relative flex items-center justify-center">
             <div className="relative p-[3px] rounded-xl overflow-hidden group w-full max-w-[400px] mx-auto">
                 {/* Monochrome Conic Gradient */}
                 <div className="absolute inset-0 bg-[conic-gradient(from_0deg,theme(colors.gray.500),theme(colors.white),theme(colors.gray.500),theme(colors.white),theme(colors.gray.500))] animate-spin-slow blur-[2px] opacity-80 group-hover:opacity-100 transition-opacity"></div>
                 <div className="relative h-[500px] bg-zinc-900 rounded-[10px] overflow-hidden z-10 grayscale contrast-125 hover:grayscale-0 transition-all duration-500">
                    <img 
                      src="/api/placeholder/600/800" 
                      alt="ThirdWitt DJ Headshot" 
                      className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                          e.target.onerror = null; 
                          e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600 font-mono text-xl">HEADSHOT_IMG</div>';
                      }}
                    />
                    {/* White/Transparent Shine */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                 </div>
             </div>
          </div>

          <div className="space-y-6 p-6 rounded-xl bg-black/40 backdrop-blur-sm border border-white/5">
            <h2 className="text-4xl font-black text-white border-l-4 border-zinc-500 pl-6 uppercase">About ThirdWitt</h2>
            <div className="text-zinc-300 font-mono leading-relaxed space-y-4">
              <p>
                ThirdWitt isn't just a DJ; he's an energy architect. With a seamless blend of House, R&B, Pop, and Open Format gems, he bridges the gap between underground grit and mainstream appeal.
              </p>
              <p>
                Whether commanding a crowded club floor or setting the vibe for an exclusive brand activation, the philosophy remains the same: read the room, break the mold, and keep them moving. No set is ever the same, and every transition tells a story.
              </p>
              {/* Monochrome Accent Text */}
              <p className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-white font-bold animate-pulse">
                // VERSATILE. TECHNICAL. HIGH ENERGY.
              </p>
            </div>
          </div>
        </section>

        {/* DEMO MIXES */}
        <section className="space-y-8 relative z-10 p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-white/5 overflow-hidden">
          <div className="flex items-center gap-4 mb-8 relative z-10">
             <div className="h-px flex-grow bg-zinc-700/50"></div>
             <div className="flex items-center gap-2 text-white group">
                {/* White Hover */}
                <Headphones size={28} className="group-hover:text-white transition-colors" />
                <h2 className="text-3xl font-mono font-black uppercase tracking-tight">Demo Mixes</h2>
             </div>
             <div className="h-px flex-grow bg-zinc-700/50"></div>
          </div>
          
          {/* BACKGROUND TEXT - SPLIT INTO CORNERS */}
          <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden">
             {/* RAW - Top Left Corner */}
             <span className="absolute -top-10 -left-10 text-[12rem] md:text-[16rem] font-black text-white/20 leading-none whitespace-nowrap tracking-tighter rotate-6 opacity-50 blur-[1px]">RAW</span>
             
             {/* ARCHIVES - Bottom Right Corner */}
             <span className="absolute -bottom-10 -right-10 text-[10rem] md:text-[14rem] font-black text-white/20 leading-none whitespace-nowrap tracking-tighter -rotate-6 opacity-50 blur-[1px]">ARCHIVES</span>
          </div>

          <div className="space-y-6 relative z-10">
            <SoundCloudPlayer 
                title="Friday Night Archives Vol. 1" 
                genre="Open Format / Pop Edits / House" 
                duration="45:00"
                // Updated first mix with actual file and link
                audioSrc="https://assets.thirdwitt.com/HouseMixDemo.mp3"
                link="https://soundcloud.com/thirdwitt-364055906/pop-rap-house-remix-set-1?si=4c4098a86d2d4defbf3ba3485987a257&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing"
            />
            <SoundCloudPlayer 
                title="Late Night R&B Sessions" 
                genre="Smooth R&B / Slow Jams / Soul"
                duration="32:15"
                audioSrc="/audio/mix2.mp3"
                link="https://soundcloud.com"
                variant="chrome"
            />
             <SoundCloudPlayer 
                title="Warehouse Warmup 003" 
                genre="Tech House / Minimal / Grooves" 
                duration="58:20"
                audioSrc="/audio/mix3.mp3"
                link="https://soundcloud.com"
            />
          </div>
          
          <div className="text-center pt-8 relative z-10">
            <a href="https://soundcloud.com" target="_blank" rel="noreferrer" className="inline-block border border-zinc-600 text-zinc-400 hover:text-black hover:bg-white hover:border-white px-8 py-3 text-sm font-bold font-mono uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] bg-black/50">
                View Full Library
            </a>
          </div>
        </section>

        {/* LIVE GALLERY - RESTORED (HIDDEN BUT KEPT IN CODE) */}
        {/* <section className="space-y-8 relative z-10">
           <div className="relative">
             <div className="absolute -top-8 -left-8 text-white/10 font-black text-9xl select-none -z-10">LIVE</div>
             <h2 className="text-3xl font-black text-white uppercase text-center">Live Gallery</h2>
           </div>
           
           <div className="relative w-full aspect-video bg-black/50 border border-zinc-700 p-1 group">
             <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 via-transparent to-zinc-200 opacity-20 pointer-events-none"></div>
             
             <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white z-10"></div>
             <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white z-10"></div>
             <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white z-10"></div>
             <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white z-10"></div>

             <div className="w-full h-full bg-zinc-900/50 overflow-hidden relative backdrop-blur-sm">
                <img 
                  src="/api/placeholder/1200/675" 
                  alt="Live at Auction Night" 
                  className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-all duration-700 hover:scale-105 saturate-0 hover:saturate-100"
                  onError={(e) => {
                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-zinc-900"><span class="text-zinc-500 font-mono">AUCTION_NIGHT_PHOTO.jpg</span></div>';
                  }}
                />
                <div className="absolute bottom-4 left-4 bg-white text-black text-xs font-mono px-3 py-1 font-bold">
                  LIVE_EDIT_004
                </div>
             </div>
           </div>
           <p className="text-center font-mono text-zinc-400 text-sm italic">
             "Controlled chaos. The atmosphere was electric."
           </p>
        </section>
        */}

        {/* CONTACT */}
        <section className="border border-zinc-700/50 bg-black/60 backdrop-blur-md p-8 md:p-12 text-center relative overflow-hidden group hover:border-zinc-500 transition-colors duration-500 z-10">
          
          <h2 className="text-4xl font-black text-white mb-6 uppercase">Bookings & Contact</h2>
          <p className="text-zinc-400 font-mono mb-8 max-w-lg mx-auto">
            Ready to bring the energy? Reach out for booking inquiries, collaborations, or just to say hello.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
            <a href="mailto:booking@thirdwitt.com" className="flex items-center justify-center gap-3 bg-white hover:bg-zinc-200 text-black px-8 py-4 font-bold uppercase tracking-wider transition-all hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]">
              <Mail size={20} />
              Email Me
            </a>
            <a href="#" className="flex items-center justify-center gap-3 border border-zinc-600 text-zinc-400 hover:border-white hover:text-white px-8 py-4 font-bold uppercase tracking-wider transition-all hover:-translate-y-1 bg-black/50">
              <Instagram size={20} />
              Instagram
            </a>
          </div>
          
          {/* Monochrome Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-white/10 via-gray-500/10 to-white/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
        </section>

      </div>
    </div>
  );
};

// 4. Pricing Page
const PricingPage = () => {
  return (
    <div className="pt-12 pb-24 max-w-7xl mx-auto px-6 relative z-10">
      
      {/* Header */}
      <div className="text-center mb-20 space-y-4">
        {/* INCREASED FONT SIZE HERE */}
        <h1 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-snug">
          Rates{' '} 
          <span className="relative inline-block">
            {/* Monochrome Gradient */}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-white relative z-10">
              &
            </span>
            {/* Monochrome Underline - FIXED SPACING */}
            <span className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-gray-400 to-white translate-y-0"></span>
          </span>{' '}
          Services
        </h1>
      </div>

      {/* 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMN 1: PRICING */}
        <div className="bg-black/60 backdrop-blur-md border border-zinc-800 p-8 flex flex-col relative overflow-hidden group hover:border-white transition-all hover:-translate-y-2 duration-300">
          <div className="absolute top-0 right-0 bg-zinc-800 px-3 py-1 text-xs font-mono text-zinc-400">STD_RATES</div>
          <div className="mb-6 text-white group-hover:text-gray-300 transition-colors duration-300 origin-left">
            <DollarSign size={48} strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">Pricing Tiers</h3>
          
          <ul className="space-y-6 font-mono text-sm text-zinc-300 flex-grow">
            <li className="flex justify-between items-end border-b border-zinc-800 pb-2 group-hover:border-zinc-600 transition-colors">
              <span>Standard Set (2hrs)</span>
              <span className="text-white font-bold text-lg">$XXX</span>
            </li>
            <li className="flex justify-between items-end border-b border-zinc-800 pb-2 group-hover:border-zinc-600 transition-colors">
              <span>Extended Set (4hrs)</span>
              <span className="text-white font-bold text-lg">$XXX</span>
            </li>
            <li className="flex justify-between items-end border-b border-zinc-800 pb-2 group-hover:border-zinc-600 transition-colors">
              <span>All Night Long</span>
              <span className="text-white font-bold text-lg">$XXX</span>
            </li>
            <li className="flex justify-between items-end border-b border-zinc-800 pb-2 group-hover:border-zinc-600 transition-colors">
              <span>Corporate / Private</span>
              <span className="text-white font-bold text-lg">Inquire</span>
            </li>
          </ul>
          
          <button className="mt-8 w-full py-3 border border-zinc-600 text-zinc-400 hover:text-black hover:bg-white hover:border-white transition-all uppercase font-bold text-sm tracking-widest hover:scale-105">
            Download Rate Card
          </button>
        </div>

        {/* COLUMN 2: DISCOUNT CODE - MONOCHROME TICKET */}
        {/* Changed from cyan/purple to silver/white gradient */}
        <div className="bg-gradient-to-br from-zinc-400/90 via-white/90 to-zinc-400/90 p-8 flex flex-col text-center items-center justify-center relative shadow-[0_0_30px_rgba(255,255,255,0.2)] transform lg:-translate-y-4 hover:scale-105 transition-transform duration-300 z-10 backdrop-blur-md">
          
          {/* Holo Sheen (White) */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent opacity-50"></div>

          {/* Ticket cutout effect */}
          <div className="absolute -left-3 top-1/2 w-6 h-6 bg-black rounded-full"></div>
          <div className="absolute -right-3 top-1/2 w-6 h-6 bg-black rounded-full"></div>

          <div className="relative z-10">
            <Ticket size={56} className="text-black mb-4 mx-auto animate-pulse" />
            <h3 className="text-2xl font-black text-black mb-2 uppercase">Special Offer</h3>
            <p className="text-black/80 font-mono text-sm mb-6">Limited time discount for new venues</p>
            
            <div className="bg-black/90 backdrop-blur-sm text-white p-6 w-full border-2 border-dashed border-white/50 relative hover:border-white transition-colors cursor-copy group/code" onClick={() => navigator.clipboard.writeText('WITT2025')}>
                <p className="text-xs text-zinc-400 uppercase mb-2">Use Code At Booking</p>
                <div className="text-3xl md:text-4xl font-mono font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-white group-hover/code:text-white transition-all">
                WITT2025
                </div>
                <div className="mt-2 text-xs text-zinc-500">Valid until Dec 31st</div>
            </div>
          </div>
        </div>

        {/* COLUMN 3: SERVICES */}
        <div className="bg-black/60 backdrop-blur-md border border-zinc-800 p-8 flex flex-col relative group hover:border-white transition-all hover:-translate-y-2 duration-300">
          <div className="absolute top-0 right-0 bg-zinc-800 px-3 py-1 text-xs font-mono text-zinc-400">CAPABILITIES</div>
          <div className="mb-6 text-white group-hover:text-gray-300 transition-colors duration-300 origin-left">
            <Activity size={48} strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">Services</h3>
          
          <div className="space-y-4 font-mono text-sm text-zinc-300">
             <div className="flex gap-4">
               <span className="text-white font-bold">01.</span>
               <div>
                 <h4 className="text-white font-bold uppercase">Live Mixing</h4>
                 <p className="text-xs text-zinc-500 mt-1">Open format, high energy sets tailored to the room's atmosphere.</p>
               </div>
             </div>
             <div className="flex gap-4">
               <span className="text-gray-400 font-bold">02.</span>
               <div>
                 <h4 className="text-white font-bold uppercase">Music Production</h4>
                 <p className="text-xs text-zinc-500 mt-1">Custom edits, intro/outro cuts, and mashups for fashion/art events.</p>
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// 5. Footer
const Footer = () => (
  <footer className="border-t border-zinc-800 bg-black/90 backdrop-blur-md py-8 mt-auto relative z-20">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="text-zinc-600 font-mono text-xs">
        © 2025 THIRDWITT. ALL RIGHTS RESERVED.
      </div>
      <div className="flex gap-6">
        <Music className="w-5 h-5 text-zinc-600 hover:text-white cursor-pointer transition-colors hover:scale-125" />
        <Instagram className="w-5 h-5 text-zinc-600 hover:text-white cursor-pointer transition-colors hover:scale-125" />
        <Mail className="w-5 h-5 text-zinc-600 hover:text-white cursor-pointer transition-colors hover:scale-125" />
      </div>
    </div>
  </footer>
);

// --- Main App Component ---

const App = () => {
  const [page, setPage] = useState('home');
  const globalVideoRef = useRef(null);

  // Auto-scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  // Force global background video to play on mount
  useEffect(() => {
    if(globalVideoRef.current) {
        globalVideoRef.current.play().catch(e => console.log("Global BG play failed", e));
    }
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-white font-sans selection:bg-gray-400 selection:text-black flex flex-col overflow-x-hidden relative">
      
      {/* Styles for Animations */}
      <style>{`
        /* GLOBAL BACKGROUND COLOR FIX - PREVENTS WHITE OVERSCROLL */
        body {
          background-color: black;
        }

        /* NEW SCANNER ANIMATION */
        @keyframes scan-reveal {
          0% { left: 0%; opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        .animate-scan-reveal {
          animation: scan-reveal 1.5s cubic-bezier(0.77, 0, 0.175, 1) forwards;
        }

        @keyframes wipe-reveal {
          0% { width: 0%; left: 0; }
          50% { width: 100%; left: 0; }
          100% { width: 0%; left: 100%; }
        }
        .animate-wipe-reveal {
          animation: wipe-reveal 1.2s cubic-bezier(0.77, 0, 0.175, 1) forwards;
        }
        @keyframes spin-slow {
            from { transform: rotate(0deg) scale(1.5); }
            to { transform: rotate(360deg) scale(1.5); }
        }
        .animate-spin-slow {
            animation: spin-slow 10s linear infinite; /* Faster rotation for better effect */
        }
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        .animate-float {
            animation: float 6s ease-in-out infinite;
        }
        @keyframes gradient-x {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
            animation: gradient-x 3s ease infinite;
        }
      `}</style>

      {/* GLOBAL FIXED STATIC BACKGROUND VIDEO (Sits behind everything) */}
        <div className="fixed inset-0 z-0 bg-black">
          <video 
              ref={globalVideoRef}
              autoPlay 
              loop 
              muted 
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-center opacity-100"
          >
              <source src="/BgVideo2.mp4" type="video/mp4" />
          </video>
        </div>

      {/* OVERSCROLL BLOCKER - Sits between static bg and header content */}
      <div className="fixed top-0 left-0 w-full h-[50vh] bg-black z-10 pointer-events-none"></div>

      <Navbar setPage={setPage} activePage={page} />
      
      <main className="flex-grow pt-20 relative z-10">
        {page === 'home' ? <HomePage /> : <PricingPage />}
      </main>

      <Footer />
    </div>
  );
};

export default App;