import React from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "antd";
import { GithubOutlined, DiscordOutlined } from "@ant-design/icons";

const socialLinks = [
    {
        name: "X (Twitter)",
        icon: "X",
        href: "https://x.com/CaesarLynch",
        comingSoon: false,
        className: "h-5 w-5",
    },
    {
        name: "GitHub",
        icon: GithubOutlined,
        href: "https://github.com/caevilization/fair-square",
        comingSoon: false,
        className: "text-xl",
    },
    {
        name: "Discord",
        icon: DiscordOutlined,
        href: "#",
        comingSoon: true,
        className: "text-xl",
    },

    {
        name: "Whitepaper",
        icon: DocumentTextIcon,
        href: "#",
        comingSoon: true,
        className: "h-5 w-5",
    },
];

const footerLinks = [
    {
        title: "Product",
        links: [
            { name: "Features", href: "#" },
            { name: "Pricing", href: "#" },
            { name: "Documentation", href: "#" },
        ],
    },
    {
        title: "Company",
        links: [
            { name: "About", href: "#" },
            { name: "Blog", href: "#" },
            { name: "Careers", href: "#" },
        ],
    },
    {
        title: "Resources",
        links: [
            { name: "Community", href: "#" },
            { name: "Contact", href: "#" },
            { name: "Terms of Service", href: "#" },
        ],
    },
];

const Footer: React.FC = () => {
    return (
        <footer className="bg-dark-bg border-t border-gray-800">
            <div className="mx-auto max-w-7xl px-[5%] md:px-[8%] py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12">
                    {/* Logo and social links */}
                    <div className="md:col-span-2">
                        <div className="flex items-center">
                            <h2 className="text-white text-2xl md:text-3xl font-bold">
                                Fair²
                            </h2>
                        </div>
                        <p className="mt-4 text-gray-400 text-sm md:text-base max-w-md">
                            Empowering open-source communities with intelligent
                            analysis and fair evaluation mechanisms for better
                            contribution recognition.
                        </p>
                        <p className="mt-2 text-highlight-from text-sm md:text-base font-semibold">
                            Fair Square is a 100% open-source project
                        </p>
                        <div className="mt-6 flex space-x-6">
                            {socialLinks.map((item) => (
                                <Tooltip
                                    key={item.name}
                                    title={item.comingSoon ? "Coming Soon" : ""}
                                    color="#222831"
                                >
                                    <a
                                        href={item.href}
                                        className={`text-gray-400 hover:text-white transition-colors ${
                                            item.comingSoon
                                                ? "cursor-not-allowed opacity-50"
                                                : ""
                                        }`}
                                        onClick={(e) =>
                                            item.comingSoon &&
                                            e.preventDefault()
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <span className="sr-only">
                                            {item.name}
                                        </span>
                                        {item.icon === "X" ? (
                                            <span className="font-bold text-xl inline-flex items-center justify-center h-5">
                                                𝕏
                                            </span>
                                        ) : React.isValidElement(item.icon) ? (
                                            <span className="inline-flex items-center justify-center">
                                                {item.icon}
                                            </span>
                                        ) : (
                                            <item.icon
                                                className={item.className}
                                                aria-hidden="true"
                                            />
                                        )}
                                    </a>
                                </Tooltip>
                            ))}
                        </div>
                    </div>

                    {/* Footer links */}
                    {footerLinks.map((group) => (
                        <div key={group.title}>
                            <h3 className="text-white font-semibold mb-4">
                                {group.title}
                            </h3>
                            <ul className="space-y-3">
                                {group.links.map((link) => (
                                    <li key={link.name}>
                                        <a
                                            href={link.href}
                                            className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
                                        >
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-12 pt-8 border-t border-gray-800">
                    <p className="text-gray-400 text-sm text-center">
                        © {new Date().getFullYear()} Fair Square. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
