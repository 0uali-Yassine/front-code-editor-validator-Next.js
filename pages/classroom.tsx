import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, FileText, Clock, User } from "lucide-react";
import useSWR from 'swr';
import CheckEditor from '../components/check-editor';
import CodeEditore from '../components/code-editore';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { SectionType } from '../types';

// Define the data structure
interface ClassRoomData {
  page: {
    _id: string;
    title: string;
  };
  sections: SectionType[];
  sectionWithCode: {
    isCorrect: 'Correct' | 'Incorrect' | 'Pending';
    _id: string;
  }[];
  userId: string;
}

const fetcherWithToken = async (url: string) => {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important: include cookies in the request
  });

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    const info = await res.json();
    (error as any).info = info;
    (error as any).status = res.status;
    throw error;
  }

  return res.json();
};

const ClassRoom: React.FC = () => {
  const router = useRouter();
  const [lectourse, setLectourse] = useState<SectionType[]>([]);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [quiz, setQuiz] = useState<SectionType[]>([]);
  const [showLectures, setShowLectures] = useState<boolean>(true);
  const [showAssignments, setShowAssignments] = useState<boolean>(false);
  const [showQuizzes, setShowQuizzes] = useState<boolean>(false);

  const [pageTitle, setPageTitle] = useState<string>('');
  const [pageDescription, setPageDescription] = useState<string>('');
  const [typeSection, setTypeSection] = useState<string>('');

  // Data handling with better error handling
  const { data, error, isValidating, mutate } = useSWR<ClassRoomData>(
    '/api/student-content',
    fetcherWithToken,
    {
      onError: (err) => {
        console.error('SWR Error:', err);
      },
      revalidateOnFocus: false,
      dedupingInterval: 5000
    }
  );

  useEffect(() => {
    if (data?.sections && data.sections.length > 0) {
      setPageTitle(data.sections[0].title);
      setPageDescription(data.sections[0].description);
      setTypeSection(data.sections[0].type);
    }
  }, [data?.sections]);

  useEffect(() => {
    if (data?.sections && Array.isArray(data.sections)) {
      setLectourse(data.sections.filter(sect => sect.type === "lecture"));
      setSections(data.sections.filter(sect => sect.type === "exercise"));
      setQuiz(data.sections.filter(sect => sect.type === "quiz"));
    }
  }, [data?.sections]);

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

  if (!data && !error) return <div className="p-8">Loading...</div>;
  if (error) return (
    <div className="p-8 text-red-500">
      <p>Failed to load data. Please try again.</p>
      <p className="text-sm mt-2">{String(error)}</p>
      <button 
        onClick={() => mutate()}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-white">
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
        <div className='flex gap-4 justify-between'>
          <Link href='/home'>
            <a className="text-blue-500">Back home</a>
          </Link>
          <button onClick={logOut} className='bg-red-500 hover:bg-red-400 px-4 py-2 rounded text-white'>
            Log out
          </button>
          <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
            <User className="h-6 w-6 text-gray-600" />
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="relative w-64 border-r overflow-y-auto bg-gray-50">
          {/* Navigation controls moved to top of sidebar */}
          <div className="flex gap-2 items-center border-b bg-white w-[90%] text-sm">
            <ChevronLeft className="h-5 w-5 bg-gray-100 rounded-md text-gray-600 cursor-pointer" />
            <span className="text-gray-700 font-medium">{data?.page?.title}</span>
            <ChevronRight className="h-5 w-5 bg-gray-100 rounded-md text-gray-600 cursor-pointer" />
          </div>

          {/* Lecture */}
          <div className="relative w-64 border-r overflow-y-auto">
            <div
              onClick={() => setShowLectures(!showLectures)}
              className="p-3 border-b cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Lecture</span>
                {showLectures ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </div>
            </div>

            {showLectures &&
              lectourse.map((lecture, key) => (
                <div
                  key={key}
                  onClick={() => {
                    setPageTitle(lecture.title);
                    setPageDescription(lecture.description);
                    setTypeSection(lecture.type);
                  }}
                  className="flex cursor-pointer hover:bg-gray-100 items-center p-3 border-b border-gray-200"
                >
                  <FileText className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-gray-700">{lecture.title}</span>
                </div>
              ))}
          </div>
          
          {/* Assignment */}
          <div className="relative w-64 border-r overflow-y-auto">
            <div
              onClick={() => setShowAssignments(!showAssignments)}
              className="p-3 border-b cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Assignment</span>
                {showAssignments ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </div>
            </div>

            {showAssignments &&
              sections.map((sect, key) => (
                <div
                  key={key}
                  onClick={() => {
                    setPageTitle(sect.title);
                    setPageDescription(sect.description);
                    setTypeSection(sect.type);
                  }}
                  className="flex gap-3 cursor-pointer hover:bg-gray-100 items-center p-3 border-b border-gray-200"
                >
                  <FileText className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-gray-700">{sect.title}</span>
                  {
                    data?.sectionWithCode.length === 0 ? (
                      <Clock className='text-gray-400 h-5 w-5' />
                    ) : (
                      data?.sectionWithCode[0].isCorrect === "Correct" ? (
                        <Clock className='text-green-400 h-5 w-5' />
                      ) : (
                        data?.sectionWithCode[0].isCorrect === "Incorrect" ? (
                          <Clock className='text-red-400 h-5 w-5' />
                        ) : (
                          <Clock className='text-yellow-400 h-5 w-5' />
                        )
                      )
                    )
                  }
                </div>
              ))}
          </div>
          
          {/* Quiz */}
          <div className="relative w-64 border-r overflow-y-auto">
            <div
              onClick={() => setShowQuizzes(!showQuizzes)}
              className="p-3 border-b cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Quiz</span>
                {showQuizzes ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </div>
            </div>

            {showQuizzes &&
              quiz.map((q, key) => (
                <div key={key}>
                  <div
                    onClick={() => {
                      setPageTitle(q.title);
                      setPageDescription(q.description);
                      setTypeSection(q.type);
                    }}
                    className="flex items-center hover:bg-gray-100 cursor-pointer p-3 border-b border-gray-200"
                  >
                    <FileText className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-700">{q.title}</span>
                  </div>
                </div>
              ))}
          </div>

          <div>
            <div className="flex items-center p-3 border-b border-gray-200">
              <div className="h-6 w-6 bg-black rounded mr-2 flex items-center justify-center text-white text-xs">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              <span className="text-gray-700">First Program</span>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Top navigation moved here */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700 font-medium">{pageTitle}</span>
            <div>
              <button className="ml-2 bg-gray-100 text-black hover:bg-gray-200 rounded-md p-1">
                <ChevronUp className="h-5 w-5" />
              </button>
              <button className="ml-2 bg-gray-100 text-black hover:bg-gray-200 rounded-md p-1">
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mb-8 text-red-400">
            <div
              className="mb-8"
              dangerouslySetInnerHTML={{ __html: pageDescription }}
            />
          </div>
          
          {typeSection !== "exercise" ? (
            <CodeEditore />
          ) : (
            data && sections.length > 0 && (
              <CheckEditor data={data} Sections={sections} onChange={mutate} />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassRoom;