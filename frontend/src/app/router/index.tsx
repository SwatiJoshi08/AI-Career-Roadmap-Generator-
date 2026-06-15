import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900">
        <h1 className="text-4xl font-bold tracking-tight">AI Career Roadmap Generator</h1>
        <p className="mt-4 text-lg text-slate-600">Work in Progress</p>
      </div>
    )
  }
]);
