import React from 'react';
import Link from 'next/link';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600">403 - Unauthorized</h1>
          <p className="mt-4 text-gray-600">
            You do not have permission to access this page.
          </p>
          <div className="mt-6">
            <Link href="/">
              <a className="inline-block bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition">
                Return to login
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;