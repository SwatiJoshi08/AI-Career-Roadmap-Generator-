import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Zap, Target, BookOpen } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Map className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">AI Career Roadmap</span>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium py-2 px-4">
              Sign In
            </Link>
            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden bg-gray-50 pt-16 pb-32">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            AI-Powered <span className="text-blue-600">Career Roadmap</span> Generator
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto mb-10">
            Get a personalized, evidence-based career roadmap powered by AI. Bridge the gap between your current skills and your dream job.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md text-lg transition-colors shadow-lg shadow-blue-200">
              Get Started
            </Link>
            <Link to="/login" className="bg-white hover:bg-gray-50 text-blue-600 font-bold py-3 px-8 rounded-md text-lg transition-colors border border-blue-200">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How it works</h2>
            <p className="mt-4 text-lg text-gray-500">Three simple steps to your dream career</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">1. Build Profile</h3>
              <p className="text-gray-500">Add your skills, experiences, and evidence to build a comprehensive career profile.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">2. Set Goals & Analyze</h3>
              <p className="text-gray-500">Define your target role and let our AI perform a deep gap analysis on your profile.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">3. Get Roadmap</h3>
              <p className="text-gray-500">Receive a structured, phase-by-phase roadmap tailored specifically for you.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-24 bg-gray-50 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Features</h2>
            <p className="mt-4 text-lg text-gray-500">Everything you need to accelerate your career growth</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">AI Gap Analysis</h3>
              <p className="text-sm text-gray-500">Identify skill shortages against industry job benchmarks instantly.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Dynamic Roadmaps</h3>
              <p className="text-sm text-gray-500">Structured phases, milestones, resources and timeline built for success.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Skill Inventory</h3>
              <p className="text-sm text-gray-500">Log evidence, track levels, and showcase your growth to mentors.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center mb-4">
                <Map className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Mentor Reviews</h3>
              <p className="text-sm text-gray-500">Get feedback from real mentors and placement officers on your progress.</p>
            </div>
          </div>
        </div>
      </div>
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center">
          <div className="flex items-center gap-2 text-gray-500">
            <Map className="w-6 h-6" />
            <span className="font-medium">AI Career Roadmap Generator &copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
