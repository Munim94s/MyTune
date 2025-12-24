import { createContext, useContext, useEffect, useRef } from 'react';
import LocomotiveScroll from 'locomotive-scroll';

const ScrollContext = createContext(null);

export const useScroll = () => {
    return useContext(ScrollContext);
};

export const ScrollProvider = ({ children }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        const scroll = new LocomotiveScroll({
            el: document.querySelector('[data-scroll-container]'),
            smooth: true,
            lenisOptions: {
                lerp: 0.1,
                duration: 1.2,
                smoothWheel: true,
            },
        });

        scrollRef.current = scroll;

        return () => {
            if (scroll) {
                scroll.destroy();
            }
        };
    }, []);

    return (
        <ScrollContext.Provider value={scrollRef.current}>
            {children}
        </ScrollContext.Provider>
    );
};
