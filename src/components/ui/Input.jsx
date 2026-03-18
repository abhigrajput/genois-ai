import React from 'react';

const Input = ({
  label, error, helper, icon,
  className = '', ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full bg-dark-700 border rounded-lg px-4 py-2.5
            text-gray-100 placeholder-gray-500 text-sm
            transition-all duration-200 outline-none
            ${error
              ? 'border-danger focus:border-danger focus:shadow-lg focus:shadow-danger/20'
              : 'border-dark-500 focus:border-primary focus:shadow-lg focus:shadow-primary/10'
            }
            ${icon ? 'pl-10' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {helper && !error && <p className="text-xs text-gray-500">{helper}</p>}
    </div>
  );
};

export default Input;
