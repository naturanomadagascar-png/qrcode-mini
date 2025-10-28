
      const Modal = ({ show, title, children, onClose }) => {
        if (!show) return null;
        return (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "10px",
                width: "450px",
                maxWidth: "90%",
                boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <h2 style={{ marginTop: 0, color: "#1877f2" }}>{title}</h2>
              <div>{children}</div>
              <button
                onClick={onClose}
                style={{
                  marginTop: "20px",
                  padding: "10px 20px",
                  backgroundColor: "#1877f2",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        );
      };
    export default Modal;