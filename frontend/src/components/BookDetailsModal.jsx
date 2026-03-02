import React from 'react';
import Modal from './Modal';
import { Book, User, Calendar, Hash, CheckCircle, XCircle, Info } from 'lucide-react';
import Button from './Button';

export default function BookDetailsModal({ book, isOpen, onClose, onBorrow, isMember }) {
  if (!book) return null;

  const isAvailable = book.copiesAvailable > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book Information">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3 aspect-[2/3] bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
            <Book className="w-16 h-16 text-gray-300" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{book.title}</h2>
              <p className="text-lg text-primary-600 font-medium">{book.author || 'Unknown Author'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Hash className="w-4 h-4" />
                <span>ISBN: {book.isbn || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Info className="w-4 h-4" />
                <span>Category: Fiction</span>
              </div>
            </div>

            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {isAvailable ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              {isAvailable ? `${book.copiesAvailable} Copies Available` : 'Out of Stock'}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          {isMember && (
            <Button 
              disabled={!isAvailable}
              onClick={() => {
                onBorrow(book);
                onClose();
              }}
            >
              Borrow This Book
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
