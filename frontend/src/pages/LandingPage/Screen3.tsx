import React, { useState } from "react";
import { Card } from "antd";
import {
    CodeBracketIcon,
    AcademicCapIcon,
    RocketLaunchIcon,
    BuildingOffice2Icon,
} from "@heroicons/react/24/outline";

interface ScenarioCardProps {
    icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
    title: string;
    description: string;
    index: number;
}

const scenarios = [
    {
        icon: CodeBracketIcon,
        title: "Open Source",
        description:
            "Resolve contribution disputes with AI-driven arbitration. Ensure every contributor's efforts are recognized and valued.",
    },
    {
        icon: AcademicCapIcon,
        title: "School Projects",
        description:
            "Promote collaboration with transparent tracking. Help students work effectively by showing individual efforts and team dynamics.",
    },
    {
        icon: RocketLaunchIcon,
        title: "Startups",
        description:
            "Build trust with fair equity distribution. Attract talent by rewarding measurable contributions transparently.",
    },
    {
        icon: BuildingOffice2Icon,
        title: "Big Companies",
        description:
            "Boost productivity with fair evaluations. Engage employees by recognizing and rewarding true impact.",
    },
];

const ScenarioCard: React.FC<ScenarioCardProps> = ({
    icon: Icon,
    title,
    description,
    index,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Card
            className={`h-full bg-dark-card border-none transition-all duration-500 hover:scale-105 hover:z-10 ${
                index % 2 === 0 ? "md:translate-y-3" : "md:-translate-y-3"
            } font-exo`}
            style={{
                background: "rgba(57, 62, 70, 0.5)",
                backdropFilter: "blur(10px)",
                boxShadow: isHovered
                    ? "0 0 15px rgba(255, 211, 105, 0.3)"
                    : "none",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex flex-col items-center justify-center h-full py-4 font-exo">
                {!isHovered ? (
                    <>
                        <div className="relative">
                            <div
                                className="absolute inset-0 bg-gradient-to-tr from-highlight-from to-highlight-to rounded-full opacity-20 blur-lg"
                                style={{
                                    transform: "scale(0.8)",
                                }}
                            />
                            <Icon className="w-16 h-16 text-white mb-2 relative z-10" />
                        </div>
                        <h3 className="text-2xl text-white font-bold mt-2 font-exo">
                            {title}
                        </h3>
                    </>
                ) : (
                    <div className="w-full text-left transform scale-105 transition-transform duration-300 font-exo px-3">
                        <h3 className="text-2xl text-white font-bold mb-2 font-exo">
                            {title}
                        </h3>
                        <p className="text-lg text-white font-exo">
                            {description}
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
};

const Screen3: React.FC = () => {
    return (
        <div className="min-h-screen bg-dark-bg flex flex-col md:flex-row items-start md:items-center px-[5%] md:px-[8%] relative overflow-hidden font-exo">
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,211,105,0.1),transparent_50%)]" />

            {/* 左侧内容 */}
            <div className="w-full md:w-2/3 flex flex-col md:pr-[8%] relative z-10 pt-24 md:pt-0">
                {/* 标题区域 */}
                <div className="flex flex-col mb-6 md:mb-8">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 md:mb-6 relative">
                        <span className="relative z-10">What are the </span>
                        <span className="bg-gradient-to-r from-highlight-from to-highlight-to bg-clip-text text-transparent relative z-10">
                            Use Cases
                        </span>
                        <span className="relative z-10">?</span>
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-highlight-from to-highlight-to rounded-full" />
                    </h1>
                    <h3 className="text-xl md:text-3xl font-normal text-white opacity-80">
                        Reshape everywhere Git can cover, with fair incentive
                        distribution powered by AI.
                    </h3>
                </div>

                {/* 场景网格 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-20 md:pb-0">
                    {scenarios.map((scenario, index) => (
                        <ScenarioCard
                            key={index}
                            icon={scenario.icon}
                            title={scenario.title}
                            description={scenario.description}
                            index={index}
                        />
                    ))}
                </div>
            </div>

            {/* 右侧握手图片 - 移动端隐藏 */}
            <div className="hidden md:block w-1/3 h-screen relative z-10">
                <div className="absolute inset-0 bg-[url('/assets/images/handshake.png')] bg-contain bg-center bg-no-repeat" />
            </div>
        </div>
    );
};

export default Screen3;
