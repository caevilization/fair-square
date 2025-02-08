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
    const navigate = useNavigate();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [repoUrl, setRepoUrl] = useState("");

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
        <div className="min-h-screen bg-dark-bg font-exo">
            <Navbar />

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

            <Screen1 />
            <Screen2 />
            <Screen3 />
            <Footer />
        </div>
    );
};

export default LandingPage;
