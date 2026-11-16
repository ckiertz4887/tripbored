import { useEffect, useRef, useState } from "react";

type ConfirmProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

type PromptProps = {
  title: string;
  message?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmProps) {
  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="dialog-title">{title}</h3>
        <p className="dialog-message">{message}</p>
        <div className="dialog-actions">
          <button className="btn-tool" onClick={onCancel}>{cancelLabel}</button>
          <button className="btn-tool btn-tool-confirm" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export function PromptDialog({
  title,
  message,
  defaultValue = "",
  confirmLabel = "Save",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: PromptProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.select();
  }, []);

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="dialog-title">{title}</h3>
        {message && <p className="dialog-message">{message}</p>}
        <input
          ref={inputRef}
          className="dialog-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onConfirm(value);
            if (e.key === "Escape") onCancel();
          }}
        />
        <div className="dialog-actions">
          <button className="btn-tool" onClick={onCancel}>{cancelLabel}</button>
          <button className="btn-tool btn-tool-confirm" onClick={() => onConfirm(value)}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
