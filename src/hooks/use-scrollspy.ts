import { useState, useEffect, useCallback } from 'react';

interface UseScrollspyOptions {
  offset?: number;
  rootMargin?: string;
  threshold?: number | number[];
}

export const useScrollspy = (
  sectionIds: string[],
  options: UseScrollspyOptions = {}
) => {
  const [activeId, setActiveId] = useState<string>('');

  const {
    offset = 80,
    rootMargin = `-${offset}px 0px -60% 0px`,
    threshold = [0.1, 0.3, 0.6]
  } = options;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        
        if (visible?.target?.id) {
          setActiveId(visible.target.id);
        }
      },
      { 
        rootMargin,
        threshold
      }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [sectionIds, rootMargin, threshold]);

  return { activeId };
};
