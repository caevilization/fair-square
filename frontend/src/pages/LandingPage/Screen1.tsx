import React, { useState, useEffect } from "react";
import { Button } from "antd";

const TARGET_NUMBER = 14029;
const ANIMATION_DURATION = 2000; // 2秒
const FRAME_RATE = 60; // 每秒60帧

const Screen1: React.FC = () => {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // 检查元素是否在视口中
            const element = document.getElementById("projects-count");
            if (element && !hasAnimated) {
                const rect = element.getBoundingClientRect();
                const isInViewport =
                    rect.top >= 0 && rect.bottom <= window.innerHeight;

                if (isInViewport) {
                    startAnimation();
                    setHasAnimated(true);
                }
            }
        };

        const startAnimation = () => {
            const steps = Math.floor(ANIMATION_DURATION / (1000 / FRAME_RATE));
            let current = 0;
            let frame = 0;

            const easeOutQuart = (x: number): number => {
                const threshold = 0.75; // 在75%处开始减速
                if (x < threshold) {
                    // 前3/4使用线性增长
                    return x / threshold;
                } else {
                    // 后1/4使用更强的缓动效果
                    x = (x - threshold) / (1 - threshold);
                    return 0.75 + (1 - Math.pow(1 - x, 6)) * 0.25;
                }
            };

            const animate = () => {
                if (frame < steps) {
                    const progress = frame / steps;
                    const easedProgress = easeOutQuart(progress);
                    current = Math.round(TARGET_NUMBER * easedProgress);
                    setCount(current);
                    frame++;
                    requestAnimationFrame(animate);
                } else {
                    setCount(TARGET_NUMBER);
                }
            };

            requestAnimationFrame(animate);
        };

        // 初始检查
        handleScroll();
        // 添加滚动监听
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [hasAnimated]);

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* 法官图片容器 - 居中定位 */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[40%] h-screen">
                <div className="w-full h-full bg-[url('/assets/images/judge.png')] bg-contain bg-bottom bg-no-repeat" />
            </div>

            {/* 文本内容层 */}
            <div className="relative z-10 flex justify-between w-full h-screen px-[8%]">
                {/* 左侧文本块容器 */}
                <div className="w-[30%] flex flex-col h-full relative">
                    {/* Block 1 - 左上，稍微往上 */}
                    <div className="mt-[35vh] relative">
                        <h2 className="text-white text-4xl font-normal mb-6 lg:text-3xl md:text-2xl">
                            • Team Code Analysis
                        </h2>
                        <p className="text-white text-2xl mb-6 lg:text-xl md:text-lg">
                            Submit your GitHub repository, and our Fair² AI
                            analyzes Git history to evaluate code quality and
                            collaboration.
                        </p>
                        {/* 热点分析矢量图 */}
                        <div className="absolute -right-[70px] top-[80%] w-[140px] h-[140px] bg-[url('/assets/images/analysis-circles.png')] bg-contain bg-center bg-no-repeat z-20" />
                    </div>
                    {/* Block 3 - 左下 */}
                    <div className="mt-auto mb-[7vh]">
                        <p className="text-white text-2xl font-bold lg:text-xl md:text-lg">
                            Empowered by Eliza
                        </p>
                    </div>
                </div>

                {/* 右侧文本块容器 */}
                <div className="w-[30%] flex flex-col h-full text-right">
                    {/* Block 2 - 右上 */}
                    <div className="mt-[25vh] flex flex-col items-end">
                        <h1 className="text-white text-5xl font-extrabold mb-6 lg:text-4xl md:text-3xl whitespace-nowrap">
                            MEET YOUR AI JUDGE
                        </h1>
                        <h2 className="text-white text-3xl font-normal mb-6 lg:text-2xl md:text-xl">
                            Transparent, Fair, and Unbiased Contribution
                            Arbitration
                        </h2>
                        <Button className="bg-gradient-to-r from-highlight-from to-highlight-to border-none text-white text-2xl font-bold px-7 py-5 rounded cursor-pointer transition-transform hover:translate-y-[-2px] hover:text-white">
                            START ARBITRATION →
                        </Button>
                    </div>
                    {/* Block 4 - 右下 */}
                    <div className="mt-auto mb-[7vh]">
                        <h1
                            id="projects-count"
                            className="text-white text-5xl font-extrabold mb-6 lg:text-4xl md:text-3xl"
                        >
                            {count.toLocaleString()}+
                        </h1>
                        <p className="text-white text-2xl font-bold lg:text-xl md:text-lg">
                            Projects Resolved
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Screen1;
