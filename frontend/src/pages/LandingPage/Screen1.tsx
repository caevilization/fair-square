import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, message } from "antd";
import CustomModal from "@/components/CustomModal";
import TypewriterTitle from "@/components/TypewriterTitle";

const TARGET_NUMBER = 14029;
const ANIMATION_DURATION = 2000; // 2秒
const FRAME_RATE = 60; // 每秒60帧

const Screen1: React.FC = () => {
    const navigate = useNavigate();
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [repoUrl, setRepoUrl] = useState("");

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

    const handleStartEvaluation = async () => {
        if (!repoUrl) {
            message.warning("Please enter a repository URL");
            return;
        }

        try {
            // TODO: Call backend API to start Evaluation
            message.success("Evaluation started successfully");
            setIsModalVisible(false);
            navigate("/list");
        } catch (error) {
            message.error("Failed to start Evaluation");
            console.error("Failed to start Evaluation:", error);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* 法官图片容器 - 居中定位 */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-full md:w-[80%] lg:w-[50%] h-[60vh] md:h-screen opacity-30 md:opacity-100">
                <div className="w-full h-full bg-[url('/assets/images/judge.png')] bg-contain bg-bottom bg-no-repeat" />
            </div>

            {/* 文本内容层 */}
            <div className="relative z-10 flex flex-col md:flex-row justify-between w-full h-screen px-[5%] md:px-[8%]">
                {/* 移动端主标题块 - 仅在移动端显示 */}
                <div className="md:hidden w-full flex flex-col items-center mt-[12vh] mb-8">
                    <div className="text-center max-w-[320px]">
                        <TypewriterTitle className="text-white text-4xl font-extrabold mb-4" />
                    </div>
                    <h2 className="text-white text-xl font-normal mb-6 text-center max-w-[320px]">
                        Transparent, Fast, and Unbiased Contribution Evaluation
                    </h2>
                    <Button
                        className="bg-gradient-to-r from-highlight-from to-highlight-to border-none text-white text-lg font-bold px-5 py-3 rounded cursor-pointer transition-transform hover:translate-y-[-2px] hover:text-white"
                        onClick={() => setIsModalVisible(true)}
                    >
                        START Evaluation →
                    </Button>
                </div>

                {/* 左侧文本块容器 */}
                <div className="w-full md:w-[30%] flex flex-col h-full relative">
                    {/* Block 1 - 左上，稍微往上 */}
                    <div className="mt-[10vh] md:mt-[35vh] relative">
                        <h2 className="text-white text-xl md:text-4xl font-normal mb-3 md:mb-6">
                            • Team Code Analysis
                        </h2>
                        <p className="text-white text-base md:text-2xl mb-3 md:mb-6 opacity-80">
                            Submit your GitHub repository, and our Fair² AI
                            analyzes Git history to evaluate code quality and
                            collaboration.
                        </p>
                        {/* 热点分析矢量图 - 移动端隐藏 */}
                        <div className="hidden md:block absolute -right-[70px] top-[80%] w-[140px] h-[140px] bg-[url('/assets/images/analysis-circles.png')] bg-contain bg-center bg-no-repeat z-20" />
                    </div>
                    {/* Block 3 - 左下 */}
                    <div className="mt-4 mb-4 md:mt-auto md:mb-[7vh]">
                        <p className="text-white text-base md:text-2xl font-bold opacity-80">
                            Empowered by Eliza
                        </p>
                    </div>
                </div>

                {/* 右侧文本块容器 - 桌面端显示 */}
                <div className="hidden md:flex w-[30%] flex-col h-full text-right">
                    {/* Block 2 - 右上 */}
                    <div className="mt-[20vh] flex flex-col items-end">
                        <div className="text-right">
                            <TypewriterTitle className="text-white text-5xl font-extrabold mb-6" />
                        </div>
                        <h2 className="text-white text-3xl font-normal mb-6 whitespace-nowrap">
                            Transparent, Fast, and Unbiased
                            <br />
                            Contribution Evaluation
                        </h2>
                        <Button
                            className="bg-gradient-to-r from-highlight-from to-highlight-to border-none text-white text-2xl font-bold px-7 py-5 rounded cursor-pointer transition-transform hover:translate-y-[-2px] hover:text-white"
                            onClick={() => setIsModalVisible(true)}
                        >
                            START Evaluation →
                        </Button>
                    </div>
                    {/* Block 4 - 右下 */}
                    <div className="mt-auto mb-[7vh]">
                        <h1
                            id="projects-count"
                            className="text-white text-5xl font-extrabold mb-6"
                        >
                            {count.toLocaleString()}+
                        </h1>
                        <p className="text-white text-2xl font-bold">
                            Projects Resolved
                        </p>
                    </div>
                </div>

                {/* 统计数据 - 移动端显示在底部 */}
                <div className="md:hidden w-full mt-auto mb-8 text-center">
                    <h1
                        id="projects-count-mobile"
                        className="text-white text-4xl font-extrabold mb-3"
                    >
                        {count.toLocaleString()}+
                    </h1>
                    <p className="text-white text-lg font-bold">
                        Projects Resolved
                    </p>
                </div>
            </div>

            {/* Evaluation Modal */}
            <CustomModal
                title="Start Evaluation"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
            >
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Repository URL
                        </label>
                        <Input
                            placeholder="https://github.com/username/repository"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button
                            type="primary"
                            onClick={handleStartEvaluation}
                            className="bg-gradient-to-r from-highlight-from to-highlight-to border-none text-white hover:text-white"
                        >
                            Submit
                        </Button>
                    </div>
                </div>
            </CustomModal>
        </div>
    );
};

export default Screen1;
