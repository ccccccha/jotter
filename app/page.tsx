'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const streamTextRef = useRef<HTMLDivElement>(null);
  const contentDataRef = useRef<Array<{
    element: HTMLElement;
    originalText: string;
    textContentLower: string;
  }>>([]);

  useEffect(() => {
    if (streamTextRef.current) {
      const contentChildren = Array.from(streamTextRef.current.children).filter(el => 
        el.tagName === 'SPAN' && 
        !el.classList.contains('hashtag-bubble') && 
        !el.classList.contains('inline-search-bar')
      ) as HTMLElement[];
      
      contentDataRef.current = contentChildren.map(el => ({
        element: el,
        originalText: el.textContent || '',
        textContentLower: (el.textContent || '').toLowerCase()
      }));
    }
  }, []);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    const contentData = contentDataRef.current;
    
    contentData.forEach(({ element, originalText }) => {
      element.innerHTML = originalText;
      element.classList.remove('strong-match-pink', 'single-match-light-pink');
      element.style.color = '';
    });
    
    if (query === '') return;
    
    const matchedData = contentData.filter(({ textContentLower }) => 
      textContentLower.includes(query)
    );
    
    if (matchedData.length === 1) {
      matchedData[0].element.classList.add('single-match-light-pink');
    }
    
    matchedData.forEach(({ element, originalText, textContentLower }) => {
      if (textContentLower.startsWith(query) && query.length > 0) {
        const isExactMatch = textContentLower === query;
        const isNearFullMatch = query.length / textContentLower.length > 0.9;

        if (isExactMatch || isNearFullMatch) {
          element.classList.add('strong-match-pink');
          element.classList.remove('single-match-light-pink');
          element.innerHTML = originalText;
          return;
        }
        
        const prefix = originalText.substring(0, searchQuery.trim().length);
        const remainder = originalText.substring(searchQuery.trim().length);
        element.innerHTML = `<span class="typed-match">${prefix}</span>${remainder}`;
      } else {
        const safeQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`(${safeQuery})`, 'gi');
        const highlightedHtml = originalText.replace(regex, (match) => `<span class="typed-match">${match}</span>`);
        element.innerHTML = highlightedHtml;
      }
    });
  }, [searchQuery]);

  const handleTryBeta = () => {
    router.push('/dashboard');
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=Inter:wght@400;800;900&family=Pixelify+Sans:wght@700&family=Handlee&family=Quicksand:wght@500;700&display=swap');

        .font-classic { font-family: 'Playfair Display', serif; }
        .font-modern { font-family: 'Inter', sans-serif; }
        .font-pixelify { font-family: 'Pixelify Sans', sans-serif; }
        .font-apple { font-family: 'Handlee', cursive; }
        .font-quicksand { font-family: 'Quicksand', sans-serif; }

        .stream-text {
            font-size: 4.8vw; 
            line-height: 1.4;
            color: #333333; 
            word-wrap: break-word;
        }
        
        @media (min-width: 768px) {
            .stream-text {
                font-size: 2.8vw; 
                line-height: 1.5;
            }
        }

        .style-classic {
            font-family: 'Playfair Display', serif;
            font-style: italic;
            font-weight: 400;
            color: #333333; 
        }
        .style-inter-chunk {
            font-family: 'Inter', sans-serif;
            font-weight: 900;
            text-transform: uppercase;
            color: #333333; 
        }
        .style-inter-normalcase {
            font-family: 'Inter', sans-serif;
            font-weight: 900;
            text-transform: none;
            color: #333333; 
        }
        .style-inter-normal-weight {
            font-family: 'Inter', sans-serif;
            font-weight: 400;
            text-transform: none; 
            color: #333333; 
        }
        .style-pixelify-chunk-lower {
            font-family: 'Pixelify Sans', sans-serif;
            font-weight: 700;
            color: #333333;
            line-height: 1.2;
        }
        .style-quicksand-chunk {
            font-family: 'Quicksand', sans-serif;
            font-weight: 700;
            color: #333333; 
            line-height: 1.2;
        }
        .style-homemade-apple-chunk {
            font-family: 'Handlee', cursive;
            font-weight: 400;
            color: #333333; 
            line-height: 1.1;
            padding: 0 4px;
            transform: rotate(0.5deg); 
            display: inline-block;
        }

        .typed-match {
            background-color: transparent; 
            color: #db2777;
            font-weight: 900 !important;
            display: inline;
        }
        
        .strong-match-pink {
            color: #db2777 !important; 
        }
        .strong-match-pink .typed-match {
            font-weight: inherit !important;
            color: inherit !important;
        }
        
        .single-match-light-pink {
            color: #f472b6 !important;
            transition: color 0.2s;
        }
        .single-match-light-pink .typed-match {
            color: #db2777 !important;
            font-weight: 900 !important;
        }

        .inline-search-bar {
            display: inline-flex;
            align-items: center;
            vertical-align: middle;
            width: 176px;
            height: 2.4rem;
            margin: 0 0.5rem;
            padding: 0 0.8rem;
            border-radius: 9999px;
            background: rgba(0, 0, 0, 0.05); 
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(0, 0, 0, 0.1);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transform: translateY(-0.1rem);
        }

        .inline-search-bar svg {
            color: rgba(0, 0, 0, 0.5); 
            width: 1rem; 
            height: 1rem;
            margin-right: 0.5rem;
        }

        @media (max-width: 768px) {
            .inline-search-bar {
                width: 120px;
                height: 1.8rem;
                padding: 0 0.5rem;
            }
            .inline-search-bar svg {
                width: 0.7rem; 
                height: 0.7rem;
            }
            .inline-search-bar input {
                font-size: 0.6rem;
            }
        }
        
        .hashtag-bubble {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.4rem 0.8rem;
            margin: 0 0.6rem;
            border-radius: 9999px;
            font-size: 1rem; 
            line-height: 1;
            font-family: 'Inter', sans-serif;
            font-weight: 700;
            text-transform: lowercase;
            letter-spacing: 0.05em;
            transform: translateY(-0.1rem);
            white-space: nowrap; 
        }
        
        @media (max-width: 768px) {
            .hashtag-bubble {
                font-size: 0.8rem; 
                padding: 0.3rem 0.6rem;
                margin: 0 0.4rem;
            }
        }
        
        .bubble-startup {
            background-color: #333333; 
            color: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); 
        }
        .bubble-plan {
            background-color: #333333; 
            color: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); 
        }

        .cta-glass-panel {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(0, 0, 0, 0.1);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15); 
        }
      `}</style>

      <div className="bg-white min-h-screen text-black overflow-x-hidden selection:bg-black selection:text-white">
        <div className="max-w-[90rem] mx-auto px-6 md:px-12 relative h-screen flex flex-col">
          
          {/* Header */}
          <header className="flex justify-between items-center py-8 z-30 shrink-0">
            <h1 className="text-xl font-modern font-bold tracking-tighter">JOTTER.</h1>
            <a href="/login" className="text-sm font-modern underline underline-offset-4 decoration-gray-700 hover:text-gray-600 transition-colors cursor-pointer">
              Log in
            </a>
          </header>

          {/* Main Layout */}
          <main className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-8 items-center h-full pb-10">
            
            {/* Left Column: Stream of Consciousness */}
            <div className="md:col-span-8 lg:col-span-8 relative z-10">
              <div className="stream-text" ref={streamTextRef}>
                
                <span className="style-inter-normalcase">
                  Why do my best ideas show up in the shower instead of at my desk?
                </span>
                {' '}
                <span className="style-quicksand-chunk">
                  That imposter syndrome hit hard this morning, but I shipped the feature anyway.
                </span>
                {' '}
                <span className="style-classic">
                  Planning to spend next summer in Mallorca
                </span>
                {' '}
                
                <span className="hashtag-bubble bubble-plan">
                  #vacation
                </span>

                <div className="inline-search-bar">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Find ideas..." 
                    className="bg-transparent w-full placeholder-gray-700 text-sm focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {' '}
                
                <span className="style-pixelify-chunk-lower">
                  Just learned the real hack to selling; it's never the script, it's the timing and the confidence.
                </span>
                {' '}
                
                <span className="style-inter-normal-weight">
                  Caught myself checking if Mia laughed at my joke more than everyone else.
                </span>
                {' '}
                
                <span className="hashtag-bubble bubble-startup">
                  #crush
                </span>
                {' '}
                
                <span className="style-classic">
                  If I can just automate that one tedious client report, I gain 3 hours a week.
                </span>
                {' '}
                
                <span className="hashtag-bubble bubble-plan">
                  #productivity
                </span>
                {' '}
                
                <span className="style-quicksand-chunk">
                  My best pivot came from a nap at 2 am, 15 mins.
                </span>

              </div>
            </div>

            {/* Right Column: CTA Panel */}
            <div className="md:col-span-4 lg:col-span-4 flex justify-end items-center h-full">
              
              <div className="cta-glass-panel p-8 rounded-2xl w-full max-w-sm ml-auto">
                <h2 className="font-modern text-2xl font-bold mb-2">
                  Capture the chaos.
                </h2>
                <p className="font-classic italic text-gray-600 mb-8 text-lg">
                  Your best ideas don't happen in a spreadsheet.
                </p>
                
                <div className="space-y-3">
                  {/* Try Beta Button - Pink */}
                  <button 
                    type="button" 
                    onClick={handleTryBeta}
                    className="w-full bg-pink-600 text-white font-modern font-extrabold uppercase tracking-wide text-sm px-6 py-4 rounded-lg hover:bg-pink-700 transition-all transform active:scale-95"
                  >
                    Try Beta Now →
                  </button>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
                  </div>
                  <span className="text-xs font-modern text-gray-600">2,000+ thinkers waiting</span>
                </div>
              </div>

            </div>

            {/* Mobile CTA */}
            <div className="md:hidden mt-8">
              <button 
                onClick={handleTryBeta}
                className="w-full bg-pink-600 text-white font-modern font-bold uppercase px-6 py-4 rounded-lg hover:bg-pink-700 transition-colors"
              >
                Try Beta Now →
              </button>
            </div>

          </main>

        </div>
      </div>
    </>
  );
}