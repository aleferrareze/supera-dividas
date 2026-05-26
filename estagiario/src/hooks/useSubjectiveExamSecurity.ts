import { useEffect } from 'react';

export function useSubjectiveExamSecurity(
  isExamActive: boolean,
  onViolation: () => void
) {
  useEffect(() => {
    if (!isExamActive) return;

    const requestFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch { /* ignored */ }
    };
    requestFullscreen();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) onViolation();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) onViolation();
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    // Block dev tools and navigation shortcuts only — text editing (Ctrl+A/C/V/Z) stays allowed
    const handleKeyDown = (e: KeyboardEvent) => {
      const blocked = [
        e.key === 'F12',
        (e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()),
        e.key === 'PrintScreen',
        (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p',
        (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f',
        (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u',
        e.altKey && e.key === 'Tab',
      ];
      if (blocked.some(Boolean)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, [isExamActive, onViolation]);
}
