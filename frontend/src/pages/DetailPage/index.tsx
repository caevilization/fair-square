import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
    judgeApi,
    type JudgeDetail,
    type Appeal,
    type Decision,
    type Message,
} from "@/services/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
    Descriptions,
    Collapse,
    Avatar,
    Button,
    message,
    Spin,
    Radio,
    Select,
    Progress,
    Input,
    Tooltip,
} from "antd";
import "./styles.css";
import {
    UserOutlined,
    CheckCircleOutlined,
    AuditOutlined,
} from "@ant-design/icons";
import CustomModal from "@/components/CustomModal";
import confetti from "canvas-confetti";
import ReactLoading from "react-loading";

// Custom TextArea Component
const CustomTextArea: React.FC<{
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minRows?: number;
    maxRows?: number;
}> = ({ value, onChange, placeholder, minRows = 3, maxRows = 6 }) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const handleInput = () => {
        if (textareaRef.current) {
            const textarea = textareaRef.current;
            textarea.style.height = "auto";
            const newHeight = Math.min(
                Math.max(textarea.scrollHeight, minRows * 24), // 24px per row
                maxRows * 24
            );
            textarea.style.height = `${newHeight}px`;
        }
    };

    React.useEffect(() => {
        handleInput();
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent text-white placeholder-gray-400 resize-none outline-none min-h-[72px] max-h-[144px]"
            onInput={handleInput}
        />
    );
};

const DetailPage: React.FC = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [judgeDetail, setJudgeDetail] = useState<JudgeDetail | null>(null);
    const [appeals, setAppeals] = useState<Appeal[]>([]);
    const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
    const [decisionReason, setDecisionReason] = useState("");
    const [appealType, setAppealType] = useState<"long" | "short">("long");
    const [selectedContributor, setSelectedContributor] = useState<string>("");
    const [appealReason, setAppealReason] = useState("");
    const [messageInput, setMessageInput] = useState("");
    const [isAppealModalVisible, setIsAppealModalVisible] = useState(false);
    const [decisions, setDecisions] = useState<Decision[]>([]);
    const [selectedContributorForDecision, setSelectedContributorForDecision] =
        useState<string>("");
    // const [hoveredContributor, setHoveredContributor] = useState<string>("");
    const [consensusProgress, setConsensusProgress] = useState<number>(40);
    const [isSuccessModalVisible, setIsSuccessModalVisible] =
        useState<boolean>(false);
    const [isDistributing, setIsDistributing] = useState(true);
    const [distributedMembers, setDistributedMembers] = useState<Set<string>>(
        new Set()
    );
    const [isJudgeLoading, setIsJudgeLoading] = useState(false);
    const [judgeMessage, setJudgeMessage] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    // TODO: Delete this
    useEffect(() => {
        console.log(judgeMessage, distributedMembers);
    }, []);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    useEffect(() => {
        if (isSuccessModalVisible) {
            // Change state after 3 seconds
            const timer = setTimeout(() => {
                setIsDistributing(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isSuccessModalVisible]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [detailRes, appealsRes, decisionsRes] = await Promise.all([
                judgeApi.getJudgeDetail(id!),
                judgeApi.getAppeals(id!),
                judgeApi.getDecisions(id!),
            ]);
            setJudgeDetail(detailRes);
            setAppeals(appealsRes);
            setDecisions(decisionsRes);
            if (appealsRes.length > 0) {
                setSelectedAppeal(appealsRes[0]);
                // Get messages of the selected appeal
                const messagesRes = await judgeApi.getAppealMessages(
                    id!,
                    appealsRes[0].id
                );
                setMessages(messagesRes);
            }
        } catch (error) {
            message.error("Failed to fetch data");
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitDecision = (decision: string) => {
        if (decision === "approve") {
            setConsensusProgress(100);
            setIsSuccessModalVisible(true);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
            });
        }
    };

    const handleCreateAppeal = async () => {
        if (!id || !selectedContributor || !appealReason) {
            message.warning("Please complete all appeal information");
            return;
        }

        try {
            await judgeApi.createAppeal(id, {
                type: appealType,
                contributorId: selectedContributor,
                reason: appealReason,
            });
            message.success("Appeal created successfully");
            setIsAppealModalVisible(false);
            fetchData();
        } catch (error) {
            message.error("Failed to create appeal");
            console.error("Failed to create appeal:", error);
        }
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedAppeal) {
            return;
        }

        try {
            const newMessage = await judgeApi.createAppealMessage(
                id!,
                selectedAppeal.id,
                messageInput
            );
            setMessages((prev) => [...prev, newMessage]);
            setMessageInput("");
        } catch (error) {
            message.error("Failed to send message");
        }
    };

    // Check if contributor has made a decision
    const hasContributorDecided = (contributorId: string) => {
        return decisions.some(
            (decision) => decision.createdBy.id === contributorId
        );
    };

    // Calculate consensus progress
    // const calculateConsensusProgress = () => {
    //     if (!judgeDetail?.consensus.members.length) return 0;
    //     const decidedCount = decisions.length;
    //     return Math.round(
    //         (decidedCount / judgeDetail.consensus.members.length) * 100
    //     );
    // };

    const handleTxClick = (memberId: string) => {
        console.log(memberId);
        window.open(
            "https://suiscan.xyz/mainnet/tx/AVk6xB47NkqxtHDVz7WDXnKbq5vsWgJX1BjEjhhxw1z8",
            "_blank"
        );
    };

    const handleJudgeArbitration = async () => {
        if (!selectedAppeal) return;

        const initialMessage =
            "Received evaluation request, reading related discussions";
        setJudgeMessage(initialMessage);
        setIsJudgeLoading(true);

        // Add initial message to the message list
        const initialJudgeMessage: Message = {
            id: Date.now().toString(),
            content: initialMessage,
            timestamp: new Date().toISOString(),
            votes: 0,
            vetoes: 0,
            user: {
                name: "Judge",
                avatar: "/assets/images/judge-avatar.png",
            },
        };
        setMessages((prev) => [...prev, initialJudgeMessage]);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000);

            const response = await fetch(
                "http://54.145.197.118:3000/e0e10e6f-ff2b-0d4c-8011-1fc1eee7cb32/message",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        text: "Please generate standard arbitration format content",
                    }),
                    signal: controller.signal,
                }
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error("Network request failed");
            }

            const data = await response.json();
            if (data && Array.isArray(data) && data.length > 0) {
                const judgeResponse = data[0].text;
                setJudgeMessage(judgeResponse);

                // Update judge message in the message list
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === initialJudgeMessage.id
                            ? { ...msg, content: judgeResponse }
                            : msg
                    )
                );
            }
        } catch (error: any) {
            if (error.name === "AbortError") {
                message.error("Request timed out, please try again later");
            } else {
                message.error("Failed to get judge evaluation");
            }
            setJudgeMessage(null);
            // Remove failed message
            setMessages((prev) =>
                prev.filter((msg) => msg.id !== initialJudgeMessage.id)
            );
        } finally {
            setIsJudgeLoading(false);
        }
    };

    const handleVoteMessage = async (messageId: string) => {
        if (!id || !selectedAppeal) return;

        try {
            const response = await judgeApi.voteMessage(
                id,
                selectedAppeal.id,
                messageId
            );
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === messageId
                        ? {
                              ...msg,
                              votes: response.votes,
                              vetoes: response.vetoes,
                          }
                        : msg
                )
            );
            message.success("Vote submitted successfully");
        } catch (error) {
            message.error("Failed to submit vote");
        }
    };

    const handleVetoMessage = async (messageId: string) => {
        if (!id || !selectedAppeal) return;

        try {
            const response = await judgeApi.vetoMessage(
                id,
                selectedAppeal.id,
                messageId
            );
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === messageId
                        ? {
                              ...msg,
                              votes: response.votes,
                              vetoes: response.vetoes,
                          }
                        : msg
                )
            );
            message.success("Vetoed successfully");
        } catch (error) {
            message.error("Failed to veto");
        }
    };

    if (loading || !judgeDetail) {
        return (
            <div className="min-h-screen bg-dark-bg font-exo flex items-center justify-center">
                <ReactLoading
                    type="bars"
                    color="#ffd369"
                    height={100}
                    width={100}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-bg font-exo">
            <Navbar />
            <div className="pt-24 px-4 sm:px-[8%] md:px-[15%] pb-20 max-w-[1920px] mx-auto">
                {/* PART 1 */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-center sm:text-left">
                        <span className="text-white">Judge Detail of </span>
                        <span className="bg-gradient-to-r from-highlight-from to-highlight-to bg-clip-text text-transparent">
                            {judgeDetail.projectBrief.name}
                        </span>
                    </h1>
                    <img
                        src="/assets/images/cyber-scale.png"
                        alt="Cyber Scale"
                        className="h-32 md:h-48"
                    />
                </div>

                {/* Project Brief */}
                <div className="mb-12">
                    <h3 className="text-2xl text-white font-bold mb-6">
                        Project Brief
                    </h3>
                    <div className="bg-dark-card rounded-lg p-6">
                        <Descriptions
                            column={{ xs: 1, sm: 2, md: 3 }}
                            className="custom-descriptions"
                            items={[
                                {
                                    key: "1",
                                    label: "Name",
                                    children: judgeDetail.projectBrief.name,
                                },
                                {
                                    key: "2",
                                    label: "Github Stars",
                                    children: judgeDetail.projectBrief.stars,
                                },
                                {
                                    key: "3",
                                    label: "Status",
                                    children: judgeDetail.projectBrief.status,
                                },
                                {
                                    key: "4",
                                    label: "Commits",
                                    children: judgeDetail.projectBrief.commits,
                                },
                                {
                                    key: "5",
                                    label: "Repo Link",
                                    children: (
                                        <a
                                            href={
                                                judgeDetail.projectBrief
                                                    .repoLink
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-highlight-from hover:text-highlight-to transition-colors"
                                        >
                                            {judgeDetail.projectBrief.repoLink}
                                        </a>
                                    ),
                                },
                                {
                                    key: "6",
                                    label: "Language",
                                    children: judgeDetail.projectBrief.language,
                                },
                                {
                                    key: "7",
                                    label: "Last Update",
                                    children:
                                        judgeDetail.projectBrief.lastUpdate,
                                },
                            ]}
                        />
                    </div>
                </div>

                {/* Progress Tree */}
                <div className="mb-20">
                    <h3 className="text-2xl text-white font-bold mb-6">
                        Progress Tree
                    </h3>
                    <div className="relative">
                        <div className="absolute left-[0.5625rem] top-[1.125rem] bottom-0 w-1 bg-gradient-to-b from-highlight-from to-highlight-to rounded-full" />
                        <div className="space-y-4">
                            {judgeDetail.progressTree.map(
                                (milestone, index) => (
                                    <div
                                        key={milestone.id}
                                        className="relative"
                                    >
                                        <div className="absolute left-0 top-[1.125rem] w-5 h-5 bg-highlight-from rounded-full" />
                                        <div className="pl-8">
                                            <Collapse
                                                defaultActiveKey={
                                                    index === 0
                                                        ? [milestone.id]
                                                        : []
                                                }
                                                items={[
                                                    {
                                                        key: milestone.id,
                                                        label: (
                                                            <span>
                                                                Milestone{" "}
                                                                {index + 1} -{" "}
                                                                {milestone.name}{" "}
                                                                (
                                                                {
                                                                    milestone.squares
                                                                }{" "}
                                                                sqrs,{" "}
                                                                {
                                                                    milestone.percentage
                                                                }
                                                                %)
                                                            </span>
                                                        ),
                                                        children: (
                                                            <div className="space-y-6 text-white">
                                                                <div>
                                                                    <p className="font-bold mb-2">
                                                                        Description
                                                                    </p>
                                                                    <p className="text-gray-300">
                                                                        {
                                                                            milestone.description
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold mb-4">
                                                                        Allocation
                                                                        for
                                                                        milestone
                                                                    </p>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        {milestone.allocations.map(
                                                                            (
                                                                                allocation,
                                                                                index
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    className="bg-dark-card rounded-lg p-4 space-y-2"
                                                                                >
                                                                                    <div className="flex items-center gap-4">
                                                                                        <Avatar
                                                                                            src={
                                                                                                allocation.avatar
                                                                                            }
                                                                                            size={
                                                                                                40
                                                                                            }
                                                                                        />
                                                                                        <div>
                                                                                            <p className="font-bold">
                                                                                                {
                                                                                                    allocation.name
                                                                                                }
                                                                                            </p>
                                                                                            <p className="text-sm text-gray-400">
                                                                                                {
                                                                                                    allocation.email
                                                                                                }
                                                                                            </p>
                                                                                        </div>
                                                                                        <div className="ml-auto text-right">
                                                                                            <p className="font-bold text-highlight-from">
                                                                                                {
                                                                                                    allocation.percentage
                                                                                                }

                                                                                                %
                                                                                            </p>
                                                                                            <p className="text-sm text-gray-400">
                                                                                                {
                                                                                                    allocation.squares
                                                                                                }{" "}
                                                                                                sqrs
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <p className="text-sm text-gray-300">
                                                                                        {
                                                                                            allocation.contribution
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ),
                                                    },
                                                ]}
                                                className="custom-collapse"
                                            />
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Appeals */}
                <div className="mb-12">
                    <h3 className="text-2xl text-white font-bold mb-6">
                        Appeals
                    </h3>
                    <div className="bg-dark-card rounded-lg p-4 md:p-6">
                        <div className="flex flex-col lg:flex-row lg:divide-x lg:divide-gray-700">
                            {/* Appeal List */}
                            <div className="w-full lg:w-1/4 lg:pr-6 mb-6 lg:mb-0">
                                <div className="space-y-4">
                                    {appeals.map((appeal) => (
                                        <div
                                            key={appeal.id}
                                            className={`p-4 rounded-lg cursor-pointer transition-colors ${
                                                selectedAppeal?.id === appeal.id
                                                    ? "bg-gray-700"
                                                    : "hover:bg-gray-700"
                                            }`}
                                            onClick={() =>
                                                setSelectedAppeal(appeal)
                                            }
                                        >
                                            <p className="font-bold text-white mb-4">
                                                {appeal.title}
                                            </p>
                                            <div className="flex justify-between gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-2">
                                                        PRO{" "}
                                                        {appeal.pro.percentage}%
                                                    </p>
                                                    <div className="flex gap-1">
                                                        {appeal.pro.users.map(
                                                            (user) => (
                                                                <Avatar
                                                                    key={
                                                                        user.id
                                                                    }
                                                                    src={
                                                                        user.avatarUrl
                                                                    }
                                                                    size="small"
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-2">
                                                        CON{" "}
                                                        {appeal.con.percentage}%
                                                    </p>
                                                    <div className="flex gap-1">
                                                        {appeal.con.users.map(
                                                            (user) => (
                                                                <Avatar
                                                                    key={
                                                                        user.id
                                                                    }
                                                                    src={
                                                                        user.avatarUrl
                                                                    }
                                                                    size="small"
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-4 border-t border-gray-700 mt-4">
                                    <button
                                        className="text-highlight-from hover:text-highlight-to transition-colors underline"
                                        onClick={() =>
                                            setIsAppealModalVisible(true)
                                        }
                                    >
                                        + Add New Appeal
                                    </button>
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 lg:pl-6">
                                {selectedAppeal ? (
                                    <div className="flex flex-col h-[500px] lg:h-[600px]">
                                        <div className="pb-4 border-b border-gray-700">
                                            <h4 className="text-xl text-white font-bold">
                                                {selectedAppeal.title}
                                            </h4>
                                        </div>
                                        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                                            {messages.map((msg) => (
                                                <div
                                                    key={msg.id}
                                                    className="flex items-start gap-3 mb-4"
                                                >
                                                    <Avatar
                                                        src={msg.user.avatar}
                                                        icon={
                                                            !msg.user
                                                                .avatar && (
                                                                <UserOutlined />
                                                            )
                                                        }
                                                        className={
                                                            msg.user.name ===
                                                            "Judge"
                                                                ? "bg-highlight-from"
                                                                : ""
                                                        }
                                                    />
                                                    <div className="flex-1">
                                                        <div className="bg-dark-card rounded-lg p-4">
                                                            {msg.user.name ===
                                                                "Judge" &&
                                                            isJudgeLoading ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Spin size="small" />
                                                                    <span className="text-white">
                                                                        {
                                                                            msg.content
                                                                        }
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-white">
                                                                    {
                                                                        msg.content
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <span
                                                                className="text-gray-400 hover:text-highlight-from cursor-pointer"
                                                                onClick={() =>
                                                                    handleVoteMessage(
                                                                        msg.id
                                                                    )
                                                                }
                                                            >
                                                                Agree{" "}
                                                                {msg.votes > 0
                                                                    ? `(${msg.votes})`
                                                                    : ""}
                                                            </span>
                                                            <span
                                                                className="text-gray-400 hover:text-highlight-from cursor-pointer"
                                                                onClick={() =>
                                                                    handleVetoMessage(
                                                                        msg.id
                                                                    )
                                                                }
                                                            >
                                                                Object{" "}
                                                                {msg.vetoes > 0
                                                                    ? `(${msg.vetoes})`
                                                                    : ""}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="pt-4 border-t border-gray-700">
                                            <div className="bg-dark-card rounded-lg p-4">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Tooltip title="Call fair judge">
                                                            <Button
                                                                icon={
                                                                    <AuditOutlined />
                                                                }
                                                                className="flex items-center justify-center w-8 h-8 bg-transparent border-none text-gray-400 hover:text-highlight-from hover:bg-gray-700 transition-colors"
                                                                onClick={
                                                                    handleJudgeArbitration
                                                                }
                                                                disabled={
                                                                    isJudgeLoading
                                                                }
                                                            />
                                                        </Tooltip>
                                                    </div>
                                                    <CustomTextArea
                                                        value={messageInput}
                                                        onChange={
                                                            setMessageInput
                                                        }
                                                        placeholder="Type your message here..."
                                                        minRows={3}
                                                        maxRows={6}
                                                    />
                                                    <div className="flex justify-end mt-4">
                                                        <Button
                                                            onClick={
                                                                handleSendMessage
                                                            }
                                                            className="w-24 lg:w-[15%] bg-[#2c333d] text-white hover:text-highlight-from border-none"
                                                        >
                                                            Send
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-[500px] lg:h-[600px]">
                                        <p className="text-gray-400">
                                            Select an appeal to view messages
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Consensus */}
                <div>
                    <h3 className="text-2xl text-white font-bold mb-6">
                        Consensus
                    </h3>
                    <div className="bg-dark-card rounded-lg p-4 md:p-6 space-y-8">
                        {/* Progress */}
                        <div>
                            <p className="font-bold text-white mb-4">
                                Progress
                            </p>
                            <div className="relative">
                                <Progress
                                    percent={consensusProgress}
                                    strokeColor={{
                                        from: "#ffd369",
                                        to: "#f93a3a",
                                    }}
                                    className="custom-progress"
                                    showInfo={false}
                                />
                                <div
                                    className="threshold-marker"
                                    style={{
                                        left: `${judgeDetail?.consensus.threshold || 80}%`,
                                    }}
                                />
                                <div
                                    className="threshold-label"
                                    style={{
                                        left: `${judgeDetail?.consensus.threshold || 80}%`,
                                    }}
                                >
                                    Threshold: 80%
                                </div>
                                <p className="text-center text-white mt-8">
                                    40% agreed, needs 40% more to reach the
                                    consensus
                                </p>
                            </div>
                        </div>

                        {/* Members */}
                        <div>
                            <p className="font-bold text-white mb-4">Members</p>
                            <div className="flex flex-wrap gap-4 md:gap-6">
                                {judgeDetail?.consensus.members.map(
                                    (member) => {
                                        const hasDecided =
                                            hasContributorDecided(member.id);
                                        const isSelected =
                                            selectedContributorForDecision ===
                                            member.id;

                                        return (
                                            <div
                                                key={member.id}
                                                className={`flex items-center gap-3 min-w-[200px] cursor-pointer ${
                                                    isSelected
                                                        ? "bg-dark-card border border-highlight-from rounded-lg p-2"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setSelectedContributorForDecision(
                                                        isSelected
                                                            ? ""
                                                            : member.id
                                                    )
                                                }
                                            >
                                                <div
                                                    className={`relative ${
                                                        hasDecided
                                                            ? "p-0.5 rounded-full bg-gradient-to-r from-highlight-from to-highlight-to"
                                                            : "p-0.5 rounded-full border-2 border-white"
                                                    }`}
                                                >
                                                    <Avatar
                                                        src={member.avatar}
                                                        size={36}
                                                        className="border-2 border-dark-bg"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">
                                                        {member.name}
                                                    </p>
                                                    <p className="text-sm text-gray-400">
                                                        {member.percentage}%
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>

                        {/* My Decision */}
                        <div>
                            <p className="font-bold text-white mb-4">
                                My Decision
                            </p>
                            <div className="flex flex-col gap-4">
                                <Button
                                    type="primary"
                                    onClick={() =>
                                        handleSubmitDecision("approve")
                                    }
                                    className="h-auto py-3 whitespace-normal text-left font-bold bg-gradient-to-r from-highlight-from to-highlight-to hover:from-highlight-to hover:to-highlight-from border-none"
                                >
                                    Approve
                                </Button>
                                <Button
                                    ghost
                                    onClick={() =>
                                        handleSubmitDecision("reject")
                                    }
                                    className="h-auto py-3 whitespace-normal text-left border-white text-white hover:text-highlight-from hover:border-highlight-from"
                                >
                                    Reject
                                </Button>
                            </div>
                            {selectedContributorForDecision && (
                                <div className="mt-4">
                                    <Input.TextArea
                                        value={decisionReason}
                                        onChange={(e) =>
                                            setDecisionReason(e.target.value)
                                        }
                                        placeholder="Please enter your decision reason..."
                                        className="custom-input"
                                        rows={4}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Appeal Modal */}
            <CustomModal
                title="Add New Appeal"
                open={isAppealModalVisible}
                onCancel={() => setIsAppealModalVisible(false)}
            >
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Type
                        </label>
                        <Radio.Group
                            value={appealType}
                            onChange={(e) => setAppealType(e.target.value)}
                        >
                            <Radio value="long">Long</Radio>
                            <Radio value="short">Short</Radio>
                        </Radio.Group>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Contributor
                        </label>
                        <Select
                            value={selectedContributor}
                            onChange={setSelectedContributor}
                            className="w-full"
                            placeholder="Select a contributor"
                        >
                            {judgeDetail.progressTree[0]?.allocations.map(
                                (allocation) => (
                                    <Select.Option
                                        key={allocation.id}
                                        value={allocation.id}
                                    >
                                        {allocation.name}
                                    </Select.Option>
                                )
                            )}
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Reason
                        </label>
                        <CustomTextArea
                            value={appealReason}
                            onChange={setAppealReason}
                            placeholder="Enter your reason..."
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button
                            type="primary"
                            onClick={handleCreateAppeal}
                            className="bg-gradient-to-r from-highlight-from to-highlight-to border-none text-white hover:text-white"
                        >
                            Submit
                        </Button>
                    </div>
                </div>
            </CustomModal>

            {/* Success Modal */}
            <CustomModal
                title={
                    isDistributing
                        ? "Fair Rewards Distributing"
                        : "Consensus Reached!"
                }
                visible={isSuccessModalVisible}
                onCancel={() => {
                    setIsSuccessModalVisible(false);
                    setIsDistributing(true);
                    setDistributedMembers(new Set());
                }}
                footer={null}
            >
                <div className="space-y-6">
                    {isDistributing ? (
                        <div className="flex flex-col items-center gap-8">
                            <ReactLoading
                                type="bars"
                                color="#ffd369"
                                height={50}
                                width={50}
                            />
                            <div className="w-full space-y-4">
                                {judgeDetail?.consensus.members.map(
                                    (member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Avatar src={member.avatar} />
                                                <span>{member.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>Tx Sending</span>
                                                <ReactLoading
                                                    type="bubbles"
                                                    color="#ffd369"
                                                    height={20}
                                                    width={20}
                                                />
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-8">
                            <CheckCircleOutlined
                                style={{ fontSize: "48px", color: "#52c41a" }}
                            />
                            <div className="text-center">
                                <h2 className="text-lg font-bold">
                                    Total{" "}
                                    {judgeDetail?.consensus.members.length}{" "}
                                    contributors,{" "}
                                    {judgeDetail.progressTree.reduce(
                                        (total, milestone) =>
                                            total + milestone.squares,
                                        0
                                    )}{" "}
                                    <span className=" text-highlight-from hover:text-highlight-to transition-colors">
                                        $SQUARE
                                    </span>{" "}
                                    tokens distributed
                                </h2>
                            </div>
                            <div className="w-full space-y-4">
                                {judgeDetail?.consensus.members.map(
                                    (member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between cursor-pointer hover:bg-dark-card p-2 rounded-lg transition-colors"
                                            onClick={() =>
                                                handleTxClick(member.id)
                                            }
                                        >
                                            <div className="flex items-center gap-2">
                                                <Avatar src={member.avatar} />
                                                <span>{member.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-green-500">
                                                <span>Sent</span>
                                                <CheckCircleOutlined />
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </CustomModal>

            {appeals.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                    No pending repositories
                </div>
            )}

            <Footer />
        </div>
    );
};

export default DetailPage;
