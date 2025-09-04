import React, { useState, useRef, useEffect } from 'react';
import { HiChevronDown } from 'react-icons/hi';

const CustomDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select option',
  disabled = false,
  className = '',
  size = 'md',
  variant = 'default',
  searchable = false,
  icon,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  const variants = {
    default:
      'border-gray-300 focus:border-primary focus:ring-primary bg-white hover:border-gray-400',
    primary: 'border-primary focus:border-primary focus:ring-primary bg-white',
    secondary:
      'border-gray-200 focus:border-secondary focus:ring-secondary bg-gray-50 hover:bg-white',
    hero: 'border-gray-300 focus:border-primary focus:ring-primary bg-white hover:border-primary shadow-sm',
  };

  const filteredOptions =
    searchable && searchTerm
      ? options.filter((option) =>
          (typeof option === 'string' ? option : option.label)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      : options;

  const selectedOption = options.find(
    (opt) => (typeof opt === 'string' ? opt : opt.value) === value
  );

  const displayValue = selectedOption
    ? typeof selectedOption === 'string'
      ? selectedOption
      : selectedOption.label
    : placeholder;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (option) => {
    const optionValue = typeof option === 'string' ? option : option.value;
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    } else if (event.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        type='button'
        className={`
          relative w-full text-left cursor-pointer rounded-lg border outline-none 
          focus:ring-2 focus:ring-offset-1 transition-all duration-300
          ${sizes[size]} ${variants[variant]}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}
          ${isOpen ? 'ring-2' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        {...props}
      >
        <div className='flex items-center pr-8'>
          {icon && (
            <span className='mr-2 text-gray-500 flex-shrink-0'>{icon}</span>
          )}
          <span
            className={`block truncate flex-1 ${
              !selectedOption ? 'text-gray-500' : 'text-gray-900'
            }`}
          >
            {displayValue}
          </span>
        </div>
        <span className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
          <HiChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className='absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-auto'>
          {searchable && (
            <div className='p-2 border-b border-gray-200'>
              <input
                ref={searchRef}
                type='text'
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
                placeholder='Search options...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className='py-1'>
            {filteredOptions.length === 0 ? (
              <div className='px-4 py-2 text-sm text-gray-500'>
                {searchable && searchTerm
                  ? 'No options found'
                  : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValue =
                  typeof option === 'string' ? option : option.value;
                const optionLabel =
                  typeof option === 'string' ? option : option.label;
                const isSelected = optionValue === value;

                return (
                  <button
                    key={`${optionValue}-${index}`}
                    type='button'
                    className={`
                      w-full text-left px-4 py-2 text-sm transition-colors duration-150
                      hover:bg-primary hover:text-white focus:outline-none focus:bg-primary focus:text-white
                      ${
                        isSelected
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-gray-900'
                      }
                    `}
                    onClick={() => handleSelect(option)}
                  >
                    <div className='flex items-center'>
                      {option.icon && (
                        <span className='mr-2'>{option.icon}</span>
                      )}
                      <span className='block truncate'>{optionLabel}</span>
                      {isSelected && (
                        <span className='ml-auto text-primary'>✓</span>
                      )}
                    </div>
                    {option.description && (
                      <p className='text-xs text-gray-500 mt-1 truncate'>
                        {option.description}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
