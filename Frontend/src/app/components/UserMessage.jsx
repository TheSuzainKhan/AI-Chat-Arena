import React from 'react';

export default function UserMessage({ message }) {
  return (
    <div className="my-5 flex justify-end md:my-6">
      <div className="max-w-[88%] rounded-2xl rounded-br-sm bg-blue-600 px-4 py-3 text-base leading-relaxed text-white shadow-sm sm:max-w-[75%] sm:px-5 sm:py-4">
        {message}
      </div>
    </div>
  );
}
