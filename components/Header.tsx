
import React from 'react';
import { GithubIcon } from './icons/GithubIcon';

export const Header: React.FC = () => {
    return (
        <header className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700 shadow-md">
            <div className="flex items-center">
                <svg width="32" height="32" viewBox="0 0 24 24" className="text-blue-400 mr-2">
                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                    <path fill="currentColor" d="M12 5v3m0 8v3m-7-5h3m8 0h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <h1 className="text-2xl font-bold text-white">RepoViz</h1>
            </div>
            <a href="https://github.com/your-repo/repoviz" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <GithubIcon className="w-7 h-7" />
            </a>
        </header>
    );
};
