import React from 'react';
import { BookOpen, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-slate-800">
              Chronicle
            </span>
            <span className="text-slate-400 text-xs font-normal">
              — Modern MERN Stack Blogging Platform
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link to="/" className="hover:text-slate-900 transition-colors">
              Explore
            </Link>
            <a
              href="http://localhost:5000/api-docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-brand-600 transition-colors"
            >
              Swagger API Docs
            </a>
          </div>

          <p className="text-xs text-slate-400 flex items-center gap-1">
            Built with MERN Stack (Node.js, Express, MongoDB, React, Tailwind CSS)
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
