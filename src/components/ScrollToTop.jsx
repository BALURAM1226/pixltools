import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll the entire window to top whenever the URL path changes
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant' // Instant is better for page transitions to avoid glitchy scrolling
        });
    }, [pathname]);

    return null;
}
