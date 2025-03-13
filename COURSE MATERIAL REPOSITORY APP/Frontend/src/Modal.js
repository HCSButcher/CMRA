import './Modal.css'

const Modal = ({ show, onClose, children}) => {
    if (!show) return null;
  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className="modal-content" onClick={(e)=>e.stopPropagation()}></div>
      <button className='close-btn' onClick={onClose}>
      </button>
      {children}
    </div>
  );
};

export default Modal
