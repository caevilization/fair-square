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
        title: "Fair Arbitration",
        description:
            "Receive a detailed report and arbitration results, ensuring every contributor is recognized fairly.",
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
        <div className="h-screen bg-dark-bg flex items-center px-[8%] relative overflow-hidden font-exo">
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,211,105,0.1),transparent_50%)]" />

            {/* 左侧法官图片 */}
            <div className="w-1/3 h-full relative z-10">
                <div className="w-full h-full bg-[url('/assets/images/judge-full.png')] bg-contain bg-bottom bg-no-repeat" />
            </div>

            {/* 右侧内容 */}
            <div className="w-2/3 h-full flex flex-col justify-center pl-[8%] relative z-10">
                {/* 标题区域 */}
                <div className="flex flex-col mb-12">
                    <h1 className="text-7xl font-extrabold text-white mb-8 relative">
                        <span className="relative z-10">How it </span>
                        <span className="bg-gradient-to-r from-highlight-from to-highlight-to bg-clip-text text-transparent relative z-10">
                            Works
                        </span>
                        <span className="relative z-10">?</span>
                        <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-2 h-16 bg-gradient-to-b from-highlight-from to-highlight-to rounded-full" />
                    </h1>
                    <h3 className="text-5xl font-normal text-white">
                        It's super easy to keep your team, fair and square, with
                        us.
                    </h3>
                </div>

                {/* 面板区域 */}
                <div className="bg-dark-card rounded-lg shadow-lg p-12">
                    {/* 图片区域 */}
                    <div className="flex gap-8 mb-12">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className={`w-1/3 aspect-square rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer hover:scale-105 ${
                                    index === currentSlide
                                        ? "ring-4 ring-gradient-to-r from-highlight-from to-highlight-to"
                                        : ""
                                }`}
                                style={{
                                    borderImage:
                                        index === currentSlide
                                            ? "linear-gradient(to right top, #FFD369, #F93A3A) 1"
                                            : "none",
                                    borderStyle:
                                        index === currentSlide
                                            ? "solid"
                                            : "none",
                                    borderWidth:
                                        index === currentSlide ? "4px" : "0",
                                }}
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
                    <div className="relative pb-8">
                        <Carousel
                            ref={carouselRef}
                            autoplay
                            autoplaySpeed={10000}
                            dots={{ className: "custom-dots" }}
                            afterChange={handleSlideChange}
                            className="font-exo"
                        >
                            {steps.map((step, index) => (
                                <div key={index} className="font-exo">
                                    <h2 className="text-6xl font-normal text-white mb-8 font-exo">
                                        {step.title}
                                    </h2>
                                    <p className="text-4xl text-white mb-8 font-exo">
                                        {step.description}
                                    </p>
                                </div>
                            ))}
                        </Carousel>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Screen2;
