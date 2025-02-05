import React from "react";
import Navbar from "@/components/Navbar";
import Screen1 from "./Screen1";
import Screen2 from "./Screen2";
import Screen3 from "./Screen3";

const LandingPage: React.FC = () => {
    return (
        <div className="bg-dark-bg font-exo">
            <Navbar />
            <Screen1 />
            <Screen2 />
            <Screen3 />
        </div>
    );
};

export default LandingPage;
