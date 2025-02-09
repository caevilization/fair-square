import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { judgeApi, type Repository } from "@/services/api";
import { message } from "antd";
import ReactLoading from "react-loading";

const ListPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [repositories, setRepositories] = useState<Repository[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await judgeApi.listJudges();
                setRepositories(data);
            } catch (error) {
                message.error("Failed to fetch repository list");
                console.error("Failed to fetch repositories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg font-exo flex items-center justify-center">
                <ReactLoading
                    type="bars"
                    color="#ffd369"
                    height={100}
                    width={100}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-bg font-exo">
            <Navbar />
            <div className="pt-24 px-4 sm:px-[8%] md:px-[15%] pb-20 max-w-[1920px] mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
                    Live Feed
                </h1>

                <div className="space-y-4">
                    {repositories.map((repo) => (
                        <div
                            key={repo.id}
                            className="bg-dark-card rounded-lg p-6 relative hover:bg-opacity-80 transition-all"
                        >
                            {/* Status Badge */}
                            <div className="absolute top-4 right-4">
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        repo.status === "handshaking"
                                            ? "bg-highlight-from/20 text-highlight-from"
                                            : "bg-gray-700 text-gray-300"
                                    }`}
                                >
                                    {repo.status}
                                </span>
                            </div>

                            {/* Repository Name and GitHub Link */}
                            <div className="flex items-center gap-3 mb-4">
                                <h2 className="text-2xl font-bold text-white">
                                    {repo.name}
                                </h2>
                                <a
                                    href={`https://github.com/${repo.owner}/${repo.name}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </a>
                            </div>

                            {/* Repository Info */}
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    {/* Contributors */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            {repo.contributors
                                                .slice(0, 3)
                                                .map((contributor) => (
                                                    <img
                                                        key={contributor.id}
                                                        src={contributor.avatar}
                                                        alt={contributor.name}
                                                        className="w-8 h-8 rounded-full border-2 border-dark-card"
                                                    />
                                                ))}
                                        </div>
                                        {repo.contributors.length > 3 && (
                                            <span className="text-gray-400 text-sm">
                                                +{repo.contributors.length - 3}
                                            </span>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 text-highlight-from">
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                                />
                                            </svg>
                                            {repo.totalCommits.toLocaleString()}{" "}
                                            commits
                                        </div>
                                        <div className="flex items-center gap-1 text-highlight-from">
                                            <svg
                                                className="w-5 h-5"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            {repo.consensusProgress}% consensus
                                        </div>
                                    </div>
                                </div>

                                {/* Last Updated */}
                                <p className="text-gray-400 text-sm">
                                    Last analyzed:{" "}
                                    {new Date(
                                        repo.lastAnalyzed
                                    ).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Detail Button */}
                            <div className="flex justify-end mt-4">
                                <Link
                                    to={`/detail/${repo.id}`}
                                    className="inline-flex items-center text-white hover:text-highlight-from transition-colors"
                                >
                                    View Details
                                    <span className="ml-1">→</span>
                                </Link>
                            </div>
                        </div>
                    ))}

                    {repositories.length === 0 && (
                        <div className="text-center text-gray-400 py-8">
                            No repositories to process
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ListPage;
