export const getAIName = () => {
  if (typeof window === 'undefined') return "l'Assistant";
  return localStorage.getItem('obsmed-ai-name') || "l'Assistant";
};
