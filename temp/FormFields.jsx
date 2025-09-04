import React, { useRef, useEffect } from 'react';

// Define components first as normal functions
const InputFieldComponent = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
}) => {
  // Create a ref for the input element
  const inputRef = useRef(null);

  // Store the cursor position
  const cursorPositionRef = useRef(null);

  // Function to maintain cursor position after re-render
  useEffect(() => {
    // Only run if input has focus
    if (document.activeElement === inputRef.current) {
      // Store current selection
      const selectionStart = inputRef.current.selectionStart;
      const selectionEnd = inputRef.current.selectionEnd;

      // Store in ref for persistence
      cursorPositionRef.current = { start: selectionStart, end: selectionEnd };

      // Use setTimeout to restore cursor position after render
      setTimeout(() => {
        if (inputRef.current && cursorPositionRef.current) {
          const { start, end } = cursorPositionRef.current;
          inputRef.current.setSelectionRange(start, end);
        }
      }, 0);
    }
  }, [value]); // Run whenever value changes

  return (
    <div className='mb-4'>
      <label
        htmlFor={id}
        className='block text-sm font-medium text-gray-700 mb-2'
      >
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name || id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        ref={inputRef}
        className='w-full p-3 border outline-none border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition'
      />
    </div>
  );
};

const TextAreaFieldComponent = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  name,
}) => {
  // Create a ref for the textarea element
  const textareaRef = useRef(null);

  // Store the cursor position
  const cursorPositionRef = useRef(null);

  // Function to maintain cursor position after re-render
  useEffect(() => {
    // Only run if textarea has focus
    if (document.activeElement === textareaRef.current) {
      // Store current selection
      const selectionStart = textareaRef.current.selectionStart;
      const selectionEnd = textareaRef.current.selectionEnd;

      // Store in ref for persistence
      cursorPositionRef.current = { start: selectionStart, end: selectionEnd };

      // Use setTimeout to restore cursor position after render
      setTimeout(() => {
        if (textareaRef.current && cursorPositionRef.current) {
          const { start, end } = cursorPositionRef.current;
          textareaRef.current.setSelectionRange(start, end);
        }
      }, 0);
    }
  }, [value]); // Run whenever value changes

  return (
    <div className='mb-4'>
      <label
        htmlFor={id}
        className='block text-sm font-medium text-gray-700 mb-2'
      >
        {label}
      </label>
      <textarea
        id={id}
        name={name || id}
        placeholder={placeholder}
        rows='3'
        value={value}
        onChange={onChange}
        ref={textareaRef}
        className='w-full p-3 border outline-none border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition'
      ></textarea>
    </div>
  );
};

const FileUploadFieldComponent = ({ id, label, helpText, name, onChange }) => (
  <div>
    <label
      htmlFor={id}
      className='block text-sm font-medium text-gray-700 mb-2'
    >
      {label}
    </label>
    <div className='flex items-center justify-center w-full'>
      <label
        htmlFor={id}
        className='flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition'
      >
        <div className='flex flex-col items-center justify-center pt-5 pb-6'>
          <svg
            className='w-8 h-8 mb-4 text-gray-500'
            aria-hidden='true'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 20 16'
          >
            <path
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2'
            />
          </svg>
          <p className='mb-2 text-sm text-gray-500'>
            <span className='font-semibold'>Click to upload</span> or drag and
            drop
          </p>
          <p className='text-xs text-gray-500'>{helpText}</p>
        </div>
        <input
          id={id}
          name={name || id}
          type='file'
          className='hidden'
          onChange={onChange}
        />
      </label>
    </div>
  </div>
);

// Then use React.memo to wrap them, with display names for debugging
export const InputField = React.memo(InputFieldComponent);
InputField.displayName = 'InputField';

export const TextAreaField = React.memo(TextAreaFieldComponent);
TextAreaField.displayName = 'TextAreaField';

export const FileUploadField = React.memo(FileUploadFieldComponent);
FileUploadField.displayName = 'FileUploadField';
