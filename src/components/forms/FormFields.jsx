import React, { useEffect, useRef } from 'react';

// InputField component
const InputFieldComponent = ({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required,
  cursorPositionRef,
  disabled,
}) => {
  const inputRef = useRef(null);

  // Restore cursor position after re-render
  useEffect(() => {
    // Check if cursor position needs to be restored
    if (
      inputRef.current &&
      cursorPositionRef?.current &&
      cursorPositionRef.current[name] !== undefined
    ) {
      const cursorPos = cursorPositionRef.current[name];

      // Only restore cursor position after the component has re-rendered with the new value
      // Using requestAnimationFrame ensures we do this after browser paint
      requestAnimationFrame(() => {
        // Make sure the input still exists and focus is not lost
        if (inputRef.current) {
          // Focus the input if it's not already focused
          if (document.activeElement !== inputRef.current) {
            inputRef.current.focus();
          }

          // Only try to set selection range for input types that support it
          // Month, date, time, color, etc. don't support selection ranges
          const unsupportedTypes = [
            'month',
            'date',
            'time',
            'color',
            'range',
            'file',
          ];
          if (!unsupportedTypes.includes(inputRef.current.type)) {
            try {
              // Set selection range to maintain cursor position
              inputRef.current.setSelectionRange(cursorPos, cursorPos);
            } catch (error) {
              console.warn(
                `Could not set selection range for input type ${inputRef.current.type}`,
                error
              );
            }
          }
        }
      });
    }
  }, [value, name, cursorPositionRef]);

  return (
    <div className='mb-4'>
      <label
        htmlFor={id}
        className='block text-sm font-medium text-gray-700 mb-1'
      >
        {label} {required && <span className='text-red-500'>*</span>}
      </label>

      <input
        ref={inputRef}
        id={id}
        name={name}
        type={type}
        className={`w-full p-2 border rounded-md ${
          error ? 'border-red-500' : 'border-gray-300'
        } focus:outline-none focus:ring-2 focus:ring-primary`}
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => {
          // Call the provided onChange handler
          onChange(e);
          // Don't lose focus
          e.target.focus();
        }}
        disabled={disabled}
      />

      {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
    </div>
  );
};

// TextAreaField component
const TextAreaFieldComponent = ({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  error,
  required,
  rows = 3,
  cursorPositionRef,
  disabled,
}) => {
  const textareaRef = useRef(null);

  // Restore cursor position after re-render
  useEffect(() => {
    // Check if cursor position needs to be restored
    if (
      textareaRef.current &&
      cursorPositionRef?.current &&
      cursorPositionRef.current[name] !== undefined
    ) {
      const cursorPos = cursorPositionRef.current[name];

      // Only restore cursor position after the component has re-rendered with the new value
      // Using requestAnimationFrame ensures we do this after browser paint
      requestAnimationFrame(() => {
        // Make sure the textarea still exists and focus is not lost
        if (textareaRef.current) {
          // Focus the textarea if it's not already focused
          if (document.activeElement !== textareaRef.current) {
            textareaRef.current.focus();
          }
          // Set selection range to maintain cursor position
          textareaRef.current.setSelectionRange(cursorPos, cursorPos);
        }
      });
    }
  }, [value, name, cursorPositionRef]);

  return (
    <div className='mb-4'>
      <label
        htmlFor={id}
        className='block text-sm font-medium text-gray-700 mb-1'
      >
        {label} {required && <span className='text-red-500'>*</span>}
      </label>

      <textarea
        ref={textareaRef}
        id={id}
        name={name}
        rows={rows}
        className={`w-full p-2 border rounded-md ${
          error ? 'border-red-500' : 'border-gray-300'
        } focus:outline-none focus:ring-2 focus:ring-primary`}
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => {
          // Call the provided onChange handler
          onChange(e);
          // Don't lose focus
          e.target.focus();
        }}
        disabled={disabled}
      />

      {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
    </div>
  );
};

// FileUploadField component
const FileUploadFieldComponent = ({
  id,
  name,
  label,
  accept = '.pdf,.doc,.docx',
  onChange,
  error,
  helpText,
  required,
  disabled,
}) => {
  const [fileName, setFileName] = React.useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;

    // Update the file name display
    setFileName(file ? file.name : '');

    // Debug what we have
    console.log('FileUploadField change:', {
      hasFile: !!file,
      fileName: file ? file.name : 'No file',
      fileType: file ? file.type : 'n/a',
    });

    // Instead of creating a custom event, pass the original event through
    // This ensures all necessary file data is available
    onChange(e);

    // Maintain focus if possible
    if (e.target) {
      e.target.focus();
    }
  };

  return (
    <div className='mb-4'>
      <label
        htmlFor={id}
        className='block text-sm font-medium text-gray-700 mb-1'
      >
        {label} {required && <span className='text-red-500'>*</span>}
      </label>

      <div className={`flex flex-col w-full`}>
        <div
          className={`flex items-center w-full border rounded-md ${
            error ? 'border-red-500' : 'border-gray-300'
          } p-2`}
        >
          <input
            ref={fileInputRef}
            id={id}
            name={name}
            type='file'
            accept={accept}
            onChange={handleFileChange}
            className='hidden'
            disabled={disabled}
          />
          <button
            type='button'
            onClick={() => fileInputRef.current.click()}
            className='bg-blue-100 text-blue-700 py-1 px-3 rounded hover:bg-blue-200 transition'
            disabled={disabled}
          >
            Choose File
          </button>
          <span className='ml-3 text-gray-500 text-sm truncate flex-1'>
            {fileName || 'No file selected'}
          </span>
        </div>

        {helpText && <p className='text-gray-500 text-xs mt-1'>{helpText}</p>}
      </div>

      {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
    </div>
  );
};

// Wrap components with React.memo for better performance
const InputField = React.memo(InputFieldComponent);
const TextAreaField = React.memo(TextAreaFieldComponent);
const FileUploadField = React.memo(FileUploadFieldComponent);

// Add display names for better debugging
InputField.displayName = 'InputField';
TextAreaField.displayName = 'TextAreaField';
FileUploadField.displayName = 'FileUploadField';

export { InputField, TextAreaField, FileUploadField };
