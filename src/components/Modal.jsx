import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Reusable modal using the native HTML <dialog> element
// Rendered via portal into #modal so it sits above all other content
export default function Modal({ children, open, onClose }) {
  const dialog = useRef();

  // Open/close the native dialog and lock body scroll while it's open
  useEffect(() => {
    const modal = dialog.current;
    if (open) {
      modal.showModal();
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    } else {
      modal.close();
      document.body.style.overflow = ''; // Re-enable scrolling
    }

    return () => {
      document.body.style.overflow = ''; // Cleanup on unmount
    };
  }, [open]);

  // Close when clicking outside the dialog box using coordinate-based detection
  function handleCloseCart(event) {
    const rect = dialog.current.getBoundingClientRect();
    const clickedOutside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (clickedOutside) onClose();
  }

  return createPortal(
    <dialog
      ref={dialog}
      className="bg-[#67AE6E] top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] absolute p-8 inset-60 rounded-2xl shadow-lg backdrop:bg-black/50 w-full max-w-2xl"
      onClick={handleCloseCart}
    >
      {children}
    </dialog>,
    document.getElementById('modal')
  );
}