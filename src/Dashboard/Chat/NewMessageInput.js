import React, { useRef } from "react";
import { BsSend } from "react-icons/bs";
import { FiPaperclip } from "react-icons/fi";

const NewMessageInput = ({
  value,
  onChange,
  onSend,
  onKeyDown,
  onFileUpload
}) => {
  const fileRef = useRef(null);

  return (
    <div className="new_message_input_container">
      <div className="input_box_wrapper">
        <button
          type="button"
          className="file_button"
          onClick={() => fileRef.current.click()}
        >
          <FiPaperclip size={18} />
        </button>

        <input
          type="file"
          ref={fileRef}
          style={{ display: "none" }}
          onChange={(e) => onFileUpload(e.target.files[0])}
        />

        <input
          className="new_message_input"
          placeholder="Send a message..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
        />

        <button
          type="button"
          className="new_message_icon_container"
          onClick={onSend}
        >
          <BsSend />
        </button>
      </div>
    </div>
  );
};

export default NewMessageInput;