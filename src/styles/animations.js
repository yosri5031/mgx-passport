// src/styles/animations.js
export const fadeIn = {
  from: { opacity: 0 },
  to: { opacity: 1 }
};

export const slideUp = {
  from: { transform: 'translateY(20px)', opacity: 0 },
  to: { transform: 'translateY(0)', opacity: 1 }
};

export const pulse = {
  '0%': { transform: 'scale(1)' },
  '50%': { transform: 'scale(1.05)' },
  '100%': { transform: 'scale(1)' }
};

export const spin = {
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' }
};

export const animationConfig = {
  duration: '300ms',
  timing: 'ease-in-out',
  fill: 'forwards'
};