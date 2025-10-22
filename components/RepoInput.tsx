
import React from 'react';

interface RepoInputProps {
    repoUrl: string;
    setRepoUrl: (url: string) => void;
    onVisualize: (url: string) => void;
    isLoading: boolean;
}

export const RepoInput: React.FC<RepoInputProps> = ({ repoUrl, setRepoUrl, onVisualize, isLoading }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onVisualize(repoUrl);
    };

    return (
        <div className="p-4 bg-gray-800 border-b border-gray-700">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="Enter a public GitHub repository URL (e.g., https://github.com/facebook/react)"
                    className="flex-grow p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    disabled={isLoading}
                >
                    {isLoading ? 'Analyzing...' : 'Visualize'}
                </button>
            </form>
        </div>
    );
};
