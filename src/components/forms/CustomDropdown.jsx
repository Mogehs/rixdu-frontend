import React, { useState, useRef, useEffect } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { IoSearch } from 'react-icons/io5';

const CustomDropdown = ({
  label,
  options,
  value,
  onChange,
  name,
  placeholder = 'Select...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange({ target: { name, value: option } });
    setIsOpen(false);
    setSearchTerm('');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='relative' ref={dropdownRef}>
      {label && (
        <label className='block text-[var(--color-dark)] mb-1'>{label}</label>
      )}
      <div
        className='w-full p-3 border border-[var(--color-border)] rounded-lg bg-white cursor-pointer flex items-center justify-between'
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-[var(--color-dark)]' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        <IoIosArrowDown
          className={`text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {isOpen && (
        <div className='absolute z-50 w-full mt-1 bg-white border border-[var(--color-border)] rounded-lg shadow-lg'>
          <div className='p-2 border-b border-[var(--color-border)]'>
            <div className='relative'>
              <input
                type='text'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder='Search...'
                className='w-full pl-8 pr-3 py-1.5 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]'
              />
              <IoSearch className='absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400' />
            </div>
          </div>
          <div className='max-h-48 overflow-y-auto'>
            {filteredOptions.map((option) => (
              <div
                key={option}
                className='px-3 py-2 hover:bg-gray-100 cursor-pointer text-[var(--color-dark)]'
                onClick={() => handleSelect(option)}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
