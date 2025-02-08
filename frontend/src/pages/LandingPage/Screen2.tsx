import React, { useRef, useState } from "react";
import { Carousel } from "antd";
import type { CarouselRef } from "antd/es/carousel";

const steps = [
    {
        title: "Submit Your Project",
        description:
            "Share your GitHub repository or project details with us. Our system will analyze contributions and activity.",
        image: "/assets/images/step1.png",
    },
    {
        title: "AI-Driven Analysis",
        description:
            "Using advanced AI, we evaluate code quality, documentation, and collaboration to assess contributions.",
        image: "/assets/images/step2.png",
    },
    {
        title: "Fair Evaluation",
        description:
            "Receive a detailed report and Evaluation results, ensuring every contributor is recognized fairly.",
        image: "/assets/images/step3.png",
    },
];

const Screen2: React.FC = () => {
    const carouselRef = useRef<CarouselRef>(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleSlideChange = (current: number) => {
        setCurrentSlide(current);
    };

    const handleImageClick = (index: number) => {
        carouselRef.current?.goTo(index);
        setCurrentSlide(index);
    };

    return (
        <div className="h-screen bg-dark-bg flex flex-col md:flex-row items-center px-[5%] md:px-[8%] relative overflow-hidden font-exo">
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,211,105,0.1),transparent_50%)]" />

            {/* 左侧法官图片 - 移动端隐藏 */}
            <div className="hidden md:block w-1/3 h-full relative z-10">
                <div className="absolute inset-0 bg-[url('/assets/images/judge-full.png')] bg-contain bg-bottom bg-no-repeat opacity-90" />
            </div>

            {/* 右侧内容 */}
            <div className="w-full md:w-2/3 h-full flex flex-col md:justify-center md:pl-[8%] relative z-10 py-8 md:py-0">
                {/* 标题区域 */}
                <div className="flex flex-col mb-6">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 md:mb-6 relative">
                        <span className="relative z-10">How it </span>
                        <span className="bg-gradient-to-r from-highlight-from to-highlight-to bg-clip-text text-transparent relative z-10">
                            Works
                        </span>
                        <span className="relative z-10">?</span>
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-highlight-from to-highlight-to rounded-full" />
                    </h1>
                    <h3 className="text-xl md:text-3xl font-normal text-white">
                        It's super easy to keep your team, fair and square, with
                        us.
                    </h3>
                </div>

                {/* 面板区域 */}
                <div className="bg-dark-card rounded-lg shadow-lg p-3 md:p-8">
                    {/* 图片区域 */}
                    <div className="grid grid-cols-3 gap-2 md:gap-6 mb-4 md:mb-8">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className={`aspect-[4/3] rounded-lg md:rounded-xl overflow-hidden transition-all duration-300 cursor-pointer hover:scale-105 ${
                                    index === currentSlide
                                        ? "ring-2 ring-highlight-from"
                                        : ""
                                }`}
                                onClick={() => handleImageClick(index)}
                            >
                                <img
                                    src={step.image}
                                    alt={step.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>

                    {/* 文字轮播区域 */}
                    <div className="relative pb-6">
                        <Carousel
                            ref={carouselRef}
                            autoplay
                            autoplaySpeed={10000}
                            dots={{ className: "custom-dots" }}
                            afterChange={handleSlideChange}
                            className="font-exo"
                        >
                            {steps.map((step, index) => (
                                <div
                                    key={index}
                                    className="text-center md:text-left px-2 md:px-0"
                                >
                                    <h2 className="text-lg md:text-4xl font-normal text-white mb-2 md:mb-6">
                                        {step.title}
                                    </h2>
                                    <p className="text-sm md:text-2xl text-white opacity-80">
                                        {step.description}
                                    </p>
                                </div>
                            ))}
                        </Carousel>
                    </div>
                </div>

                {/* 移动端底部图片 */}
                <div className="md:hidden w-full mt-8">
                    <div className="w-full h-[40vh] bg-[url('/assets/images/judge2.png')] bg-contain bg-center bg-no-repeat" />
                </div>
            </div>
        </div>
    );
};

export default Screen2;
