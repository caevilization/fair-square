import React, { useState } from "react";
import { Tooltip, Drawer } from "antd";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
    const [hoveredTab, setHoveredTab] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const menuItems = [
        { key: "live", label: "Live Feed" },
        { key: "manifesto", label: "Manifesto", disabled: true },
    ];

    return (
        <div className="fixed top-0 left-0 right-0 z-20 px-[5%] md:px-[8%] h-24 md:h-28 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center">
                <h1 className="text-white text-3xl md:text-4xl font-bold hover:text-highlight-from transition-colors">
                    Fair²
                </h1>
            </Link>

            {/* 桌面端导航菜单 */}
            <div className="hidden md:flex items-center gap-12">
                <div className="flex items-center gap-8">
                    {menuItems.map((item) => (
                        <Tooltip
                            key={item.key}
                            title="Coming Soon"
                            open={hoveredTab === item.key}
                            color="#222831"
                        >
                            <span
                                className={`text-xl cursor-pointer ${
                                    item.disabled
                                        ? "text-gray-500"
                                        : "text-white"
                                }`}
                                onMouseEnter={() => setHoveredTab(item.key)}
                                onMouseLeave={() => setHoveredTab(null)}
                            >
                                {item.label}
                            </span>
                        </Tooltip>
                    ))}
                </div>
                {/* <span className="text-white text-xl cursor-pointer border-b-2 border-white hover:border-highlight-from transition-colors">
                    Log in
                </span> */}
            </div>

            {/* 移动端菜单按钮 */}
            <div className="md:hidden">
                <Bars3Icon
                    className="w-8 h-8 text-white cursor-pointer"
                    onClick={() => setIsDrawerOpen(true)}
                />
            </div>

            {/* 移动端抽屉菜单 */}
            <Drawer
                placement="right"
                onClose={() => setIsDrawerOpen(false)}
                open={isDrawerOpen}
                width={280}
                styles={{
                    header: { display: "none" },
                    body: {
                        padding: 0,
                        background: "#222831",
                    },
                }}
            >
                <div className="flex flex-col h-full bg-dark-bg text-white p-6">
                    {menuItems.map((item) => (
                        <Tooltip
                            key={item.key}
                            title="Coming Soon"
                            color="#222831"
                        >
                            <div
                                className={`py-4 border-b border-gray-700 text-lg font-medium ${
                                    item.disabled
                                        ? "text-gray-500"
                                        : "text-white cursor-pointer hover:text-highlight-from"
                                } transition-colors`}
                            >
                                {item.label}
                            </div>
                        </Tooltip>
                    ))}
                </div>
            </Drawer>
        </div>
    );
};

export default Navbar;
