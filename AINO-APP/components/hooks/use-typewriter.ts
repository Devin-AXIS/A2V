"use client"

import { useState, useEffect } from 'react';

export function useTypewriter(text: string, speed: number = 50) {
const [displayText, setDisplayText] = useState('');

useEffect(() => {
  let i = 0;
  if (text) {
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, speed);
    
    return () => {
      clearInterval(typingInterval);
    };
  } else {
      setDisplayText('');
  }
}, [text, speed]);

return displayText;
}
