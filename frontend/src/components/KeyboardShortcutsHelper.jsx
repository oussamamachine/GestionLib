import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Command } from 'lucide-react';
import Button from './Button';

/**
 * KeyboardShortcutsHelper - Shows keyboard shortcuts when user presses "?"
 * Accessible modal with common shortcuts for navigation and actions
 */
export default function KeyboardShortcutsHelper() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Open shortcuts modal when user presses "?"
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Don't trigger if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          return;
        }
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Close with Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const shortcuts = [
    {
      category: 'Navigation',
      items: [
        { keys: ['Tab'], description: 'Navigate between elements' },
        { keys: ['Shift', 'Tab'], description: 'Navigate backwards' },
        { keys: ['Enter'], description: 'Activate button or link' },
        { keys: ['Esc'], description: 'Close modal or dialog' },
      ]
    },
    {
      category: 'Actions',
      items: [
        { keys: ['Ctrl', 'S'], description: 'Save form (if applicable)' },
        { keys: ['Ctrl', 'K'], description: 'Focus search bar' },
        { keys: ['/'], description: 'Focus search bar' },
      ]
    },
    {
      category: 'Help',
      items: [
        { keys: ['?'], description: 'Show this shortcuts panel' },
      ]
    }
  ];

  if (!isOpen) {
    // Show hint button in bottom-right corner
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-6 right-6 z-40 bg-white text-gray-700 rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 hover:border-primary-300 group"
        onClick={() => setIsOpen(true)}
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="w-5 h-5 group-hover:text-primary-600 transition-colors" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[80vh] overflow-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Command className="w-6 h-6" />
                  <h2 id="shortcuts-title" className="text-xl font-bold">
                    Keyboard Shortcuts
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                  aria-label="Close shortcuts panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {shortcuts.map((section, idx) => (
                  <div key={idx} className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                      {section.category}
                    </h3>
                    <div className="space-y-2">
                      {section.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-gray-700">{item.description}</span>
                          <div className="flex gap-1">
                            {item.keys.map((key, keyIdx) => (
                              <React.Fragment key={keyIdx}>
                                {keyIdx > 0 && (
                                  <span className="text-gray-400 mx-1">+</span>
                                )}
                                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded shadow-sm">
                                  {key}
                                </kbd>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Press <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded">?</kbd> anytime to show this panel
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to register custom keyboard shortcuts
 * Usage: useKeyboardShortcut('ctrl+s', () => handleSave())
 */
export function useKeyboardShortcut(shortcut, callback, deps = []) {
  useEffect(() => {
    const handleKeyPress = (e) => {
      const keys = shortcut.toLowerCase().split('+');
      const pressedKeys = [];
      
      if (e.ctrlKey || e.metaKey) pressedKeys.push('ctrl');
      if (e.shiftKey) pressedKeys.push('shift');
      if (e.altKey) pressedKeys.push('alt');
      pressedKeys.push(e.key.toLowerCase());
      
      const match = keys.every(key => pressedKeys.includes(key)) && 
                    keys.length === pressedKeys.length;
      
      if (match) {
        // Don't trigger if user is typing
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          return;
        }
        e.preventDefault();
        callback(e);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, deps);
}
