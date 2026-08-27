import React, { useEffect } from "react";
import { useStore } from "../context/StoreContext";

export default function Toast() {
  const { toastMessage, hideToast, mailPopup, hidePopup } = useStore();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        hideToast();
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, hideToast]);

  useEffect(() => {
    if (mailPopup) {
      const timer = setTimeout(() => {
        hidePopup();
      }, 5200);
      return () => clearTimeout(timer);
    }
  }, [mailPopup, hidePopup]);

  return (
    <>
      <div
        className={`toast ${toastMessage ? "is-visible" : ""}`}
        data-toast
        role="status"
      >
        {toastMessage}
      </div>

      {mailPopup && (
        <div
          className="mail-popup is-visible"
          data-mail-popup="true"
        >
          <span className="mail-popup__check">✓</span>
          <div>
            <strong>{mailPopup}</strong>
            <small>Thank you for reaching out to VINVERTH.</small>
          </div>
          <button
            type="button"
            aria-label="Close message"
            onClick={hidePopup}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
