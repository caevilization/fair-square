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
            "Resolve contribution disputes with fair, AI-driven arbitration. Foster a healthier open-source ecosystem by ensuring every contributor's efforts are recognized and valued.",
    },
    {
        icon: AcademicCapIcon,
        title: "School Projects",
        description:
            "Promote collaboration with transparent contribution tracking. Empower students to work together effectively by providing clear insights into individual efforts and team dynamics.",
    },
    {
        icon: RocketLaunchIcon,
        title: "Startups",
        description:
            "Build trust with equitable equity distribution. Attract top talent and align team goals by ensuring fair and transparent reward systems based on measurable contributions.",
    },
    {
        icon: BuildingOffice2Icon,
        title: "Big Companies",
        description:
            "Enhance productivity with fair performance evaluations. Drive employee engagement and retention by implementing objective, data-driven assessments that recognize and reward true impact.",
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
                index % 2 === 0 ? "translate-y-4" : "-translate-y-4"
            } font-exo`}
            style={{
                background: "rgba(57, 62, 70, 0.5)",
                backdropFilter: "blur(10px)",
                boxShadow: isHovered
                    ? "0 0 20px rgba(255, 211, 105, 0.3)"
                    : "none",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex flex-col items-center justify-center h-full py-8 font-exo">
                {!isHovered ? (
                    <>
                        <div className="relative">
                            <div
                                className="absolute inset-0 bg-gradient-to-tr from-highlight-from to-highlight-to rounded-full opacity-20 blur-xl"
                                style={{
                                    transform: "scale(0.8)",
                                }}
                            />
                            <Icon className="w-24 h-24 text-white mb-4 relative z-10" />
                        </div>
                        <h3 className="text-4xl text-white font-bold mt-4 font-exo">
                            {title}
                        </h3>
                    </>
                ) : (
                    <div className="w-full text-left transform scale-105 transition-transform duration-300 font-exo px-4">
                        <h3 className="text-4xl text-white font-bold mb-6 font-exo">
                            {title}
                        </h3>
                        <p className="text-2xl text-white font-exo">
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
        <div className="h-screen bg-dark-bg flex items-center px-[8%] relative overflow-hidden font-exo">
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,211,105,0.1),transparent_50%)]" />

            {/* 左侧内容 */}
            <div className="w-2/3 flex flex-col justify-center pr-[8%] relative z-10">
                {/* 标题区域 */}
                <div className="flex flex-col mb-16">
                    <h1 className="text-7xl font-extrabold text-white mb-8 relative">
                        <span className="relative z-10">What are the </span>
                        <span className="bg-gradient-to-r from-highlight-from to-highlight-to bg-clip-text text-transparent relative z-10">
                            Use Cases
                        </span>
                        <span className="relative z-10">?</span>
                        <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-2 h-16 bg-gradient-to-b from-highlight-from to-highlight-to rounded-full" />
                    </h1>
                    <h3 className="text-5xl font-normal text-white opacity-80">
                        Reshape everywhere Git can cover, with fair incentive
                        distribution powered by AI.
                    </h3>
                </div>

                {/* 场景网格 */}
                <div className="relative">
                    <div className="grid grid-cols-2 gap-8">
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
            </div>

            {/* 右侧握手图片 */}
            <div className="w-1/3 h-full">
                <div className="w-full h-full bg-[url('/assets/images/handshake.png')] bg-contain bg-bottom bg-no-repeat" />
            </div>
        </div>
    );
};

export default Screen3;
