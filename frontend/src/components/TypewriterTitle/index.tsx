import React, { useState, useEffect } from "react";
import "./styles.css";

const titles = [
    "MEET YOUR AI JUDGE",
    "GIT INCENTIVE LAYER 3.0",
    "RESHAPE OSS GOVERNANCE",
    "FAIR SQUARE, CODE WISE",
    "EMPOWER CONTRIBUTORS",
];

interface TypewriterTitleProps {
    className?: string;
}

const TypewriterTitle: React.FC<TypewriterTitleProps> = ({
    className = "",
}) => {
    const [displayText, setDisplayText] = useState("");
    const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(true);
    const [showCursor, setShowCursor] = useState(true);

    // 处理光标闪烁
    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 530); // 光标闪烁间隔

        return () => clearInterval(cursorInterval);
    }, []);

    // 处理打字效果
    useEffect(() => {
        const currentTitle = titles[currentTitleIndex];
        let timeout: NodeJS.Timeout;

        if (isTyping) {
            // 打字过程
            if (displayText.length < currentTitle.length) {
                timeout = setTimeout(() => {
                    setDisplayText(
                        currentTitle.slice(0, displayText.length + 1)
                    );
                }, 150); // 打字速度
            } else {
                // 完成打字，等待5秒
                timeout = setTimeout(() => {
                    setIsTyping(false);
                }, 5000);
            }
        } else {
            // 删除过程
            if (displayText.length > 0) {
                timeout = setTimeout(() => {
                    setDisplayText(displayText.slice(0, -1));
                }, 50); // 删除速度
            } else {
                // 完成删除，切换到下一句
                setCurrentTitleIndex((prev) => (prev + 1) % titles.length);
                setIsTyping(true);
            }
        }

        return () => clearTimeout(timeout);
    }, [displayText, currentTitleIndex, isTyping]);

    return (
        <h1 className={`typewriter-title ${className}`}>
            {displayText}
            <span
                className={`cursor ${showCursor ? "visible" : "hidden"}`}
                style={{
                    fontSize: "inherit",
                    fontWeight: "inherit",
                    color: "inherit",
                }}
            >
                |
            </span>
            <span
                className={`cursor ${showCursor ? "hidden" : "visible"}`}
                style={{
                    fontSize: "inherit",
                    fontWeight: "inherit",
                    color: "#222831",
                }}
            >
                |
            </span>
        </h1>
    );
};

export default TypewriterTitle;
