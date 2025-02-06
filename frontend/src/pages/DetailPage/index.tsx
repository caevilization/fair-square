import React from "react";
import Navbar from "@/components/Navbar";

const DetailPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-dark-bg font-exo">
            <Navbar />
            <div className="pt-24 px-[5%] md:px-[8%]">{/* 内容区域 */}</div>
        </div>
    );
};

export default DetailPage;
