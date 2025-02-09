import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, message } from "antd";
import CustomModal from "@/components/CustomModal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Screen1 from "./Screen1";
import Screen2 from "./Screen2";
import Screen3 from "./Screen3";

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-dark-bg font-exo">
            <Navbar />
            <Screen1 />
            <Screen2 />
            <Screen3 />
            <Footer />
        </div>
    );
};

export default LandingPage;
