import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ children, open, onClose }) {
  const dialog = useRef();

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
      document.body.style.overflow = ''; // Cleanup
    };
  }, [open]);

  function handleCloseCart (event) {
    if(event.target === dialog.current) {
        onClose()
    }
  }

  return createPortal(
    <dialog 
      ref={dialog}
      className=" bg-[#67AE6E] top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] absolute  p-8 inset-60 rounded-2xl shadow-lg backdrop:bg-black/50 w-full max-w-2xl"
      onClick={handleCloseCart}
    >
      {children}
    </dialog>,
    document.getElementById('modal')
  );
}