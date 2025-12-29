import * as React from 'react';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import RuneShop from './RuneShop';

const modalClasses = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-black shadow-2xl p-8 outline-none";

export default function ShopModal() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button onClick={handleOpen}>Open Shop</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className={modalClasses}>
            <RuneShop />
        </div>
      </Modal>
    </div>
  );
}
