import React from 'react';
import { FileText, Trophy } from "lucide-react";
import { useRouter } from 'next/router';
import Link from 'next/link';

const Home: React.FC = () => {
  const router = useRouter();

  const logOut = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        router.push('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-black rounded-lg flex items-center justify-center mr-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 style={{ fontSize: '25px' }} className="text-md font-medium text-gray-700">First Program</h1>
        </div>
        <div className='flex gap-4'>
          <button onClick={logOut} className='bg-red-500 hover:bg-red-400 px-4 py-2 rounded text-white'>
            Log out
          </button>
          <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
            {/* User icon as fallback */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {/* Banner */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 h-60 bg-blue-100 flex items-center justify-center">
              {/* Placeholder for image */}
              <div className="text-blue-500 text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="mt-2">Course Banner</p>
              </div>
            </div>
            <div className="md:w-2/3 p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-gray-800">Full Stack Coding Bootcamp</h2>
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm font-medium">ONGOING</span>
              </div>
              <p className="mt-4 text-gray-600 leading-relaxed">
                AI tools are everywhere and can boost your productivity, but at Geek Institute, we believe nothing can
                replace the creativity and problem-solving skills of a passionate, skilled Fullstack developer!
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column - Progress */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded mr-3">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-800">Full Stack Coding #1 @Casablanca</h3>
                <div className="ml-auto text-sm text-gray-500">Page: 0 /0</div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "0%" }}></div>
              </div>
              <div className="text-right text-sm text-gray-500 mb-6">0%</div>

              {/* Continue Button */}
              <Link href='/classroom'>
                <a className="inline-block bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition">
                  Continue Learning
                </a>
              </Link>
            </div>
          </div>

          {/* Right Column - Leaderboard */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
                  <h3 className="text-xl font-medium text-gray-800">Leaderboard</h3>
                </div>
                <a href="#" className="text-blue-600 text-sm">
                  See All
                </a>
              </div>

              {/* Leaderboard List */}
              <ul className="space-y-4">
                <li className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xl font-bold text-gray-800 mr-4">1</span>
                    <span className="text-gray-700">Zakaria Samir</span>
                  </div>
                  <span className="text-gray-500">102 xp</span>
                </li>
                <li className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xl font-bold text-gray-800 mr-4">2</span>
                    <span className="text-gray-700">Machi muchkil Ana nsber</span>
                  </div>
                  <span className="text-gray-500">50 xp</span>
                </li>
                <li className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xl font-bold text-gray-800 mr-4">3</span>
                    <span className="text-gray-700">Safi chi deri Akhour</span>
                  </div>
                  <span className="text-gray-500">49 xp</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;