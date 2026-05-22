import { useEffect, useRef } from 'react';

export function useExamSecurity(
  isExamActive: boolean,
  onViolation: () => void
) {
  const violationCountRef = useRef(0);

  useEffect(() => {
    if (!isExamActive) return;

    // Request fullscreen
    const requestFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch {
        // Fullscreen not supported or denied — continue without it
      }
    };
    requestFullscreen();

    // Fullscreen exit detection
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isExamActive) {
        violationCountRef.current += 1;
        onViolation();
      }
    };

    // Tab visibility change detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        violationCountRef.current += 1;
        onViolation();
      }
    };

    // Block right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Block keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const blocked = [
        // Copy/paste
        (e.ctrlKey || e.metaKey) && ['c', 'v', 'a', 'x', 'u'].includes(e.key.toLowerCase()),
        // Dev tools
        e.key === 'F12',
        (e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()),
        // Print screen
        e.key === 'PrintScreen',
        // Print
        (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p',
        // Find
        (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f',
      ];

      if (blocked.some(Boolean)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Block text selection via keyboard
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('selectstart', handleSelectStart);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('selectstart', handleSelectStart);

      // Exit fullscreen on cleanup
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [isExamActive, onViolation]);
}
