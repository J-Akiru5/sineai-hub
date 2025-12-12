import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';

export default function BubbleMenu({ editor, tippyOptions = {}, children }) {
    const [visible, setVisible] = useState(false);
    const [posRaw, setPosRaw] = useState(null);
    const [pos, setPos] = useState({ left: 0, top: 0 });
    const menuRef = useRef(null);

    useEffect(() => {
        if (!editor) return;

        const update = () => {
            try {
                const { from, to, empty } = editor.state.selection;
                if (empty || from === to) {
                    setVisible(false);
                    return;
                }

                const posIndex = Math.floor((from + to) / 2);
                const coords = editor.view.coordsAtPos(posIndex);
                // coords.left/top are page (viewport) coordinates — use fixed positioning
                const left = Math.round(coords.left);
                const top = Math.round(coords.top);
                const bottom = Math.round(coords.bottom);

                // keep on-screen (basic clamp)
                const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
                const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
                const clampedLeft = Math.min(Math.max(8, left), vw - 8);
                // store raw coords; final top will be calculated after measuring menu height
                setPosRaw({ left: clampedLeft, top, bottom });
                setVisible(true);
            } catch (e) {
                setVisible(false);
            }
        };

        editor.on('selectionUpdate', update);
        editor.on('focus', update);
        editor.on('blur', () => setVisible(false));
        update();

        return () => {
            if (!editor) return;
            editor.off('selectionUpdate', update);
            editor.off('focus', update);
            editor.off('blur', () => setVisible(false));
        };
    }, [editor]);

    // position menu so its bottom sits a few pixels above the selection
    useLayoutEffect(() => {
        if (!posRaw || !menuRef.current) return;
        const margin = 8;
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const clampedLeft = Math.min(Math.max(8, posRaw.left), vw - 8);
        // Set the anchor Y to posRaw.top (page coordinate). We'll translateY(-100%) so the menu sits above.
        setPos({ left: clampedLeft, top: posRaw.top - margin });
    }, [posRaw]);

    if (!editor) return null;

    return visible ? (
        <div ref={menuRef} style={{ position: 'fixed', left: pos.left + 'px', top: pos.top + 'px', zIndex: 99999, transform: 'translate(-50%, -100%)', pointerEvents: 'auto' }}>
            {children}
        </div>
    ) : null;
}
