import React, { useState } from "react";
import { Tooltip } from "antd";

const Navbar: React.FC = () => {
    const [hoveredTab, setHoveredTab] = useState<string | null>(null);

    return (
        <div className="fixed top-0 left-0 right-0 z-20 px-[8%] h-40 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
                <h1 className="text-white text-6xl font-bold">Fair²</h1>
            </div>

            {/* 导航菜单 */}
            <div className="flex items-center gap-16">
                <div className="flex items-center gap-12">
                    <Tooltip
                        title="Coming Soon"
                        open={hoveredTab === "live"}
                        color="#222831"
                    >
                        <span
                            className="text-white text-3xl cursor-pointer"
                            onMouseEnter={() => setHoveredTab("live")}
                            onMouseLeave={() => setHoveredTab(null)}
                        >
                            Live Feed
                        </span>
                    </Tooltip>
                    <Tooltip
                        title="Coming Soon"
                        open={hoveredTab === "manifesto"}
                        color="#222831"
                    >
                        <span
                            className="text-white text-3xl cursor-pointer"
                            onMouseEnter={() => setHoveredTab("manifesto")}
                            onMouseLeave={() => setHoveredTab(null)}
                        >
                            Manifesto
                        </span>
                    </Tooltip>
                </div>
                <span className="text-white text-3xl cursor-pointer border-b-2 border-white hover:border-highlight-from transition-colors">
                    Log in
                </span>
            </div>
        </div>
    );
};

export default Navbar;
