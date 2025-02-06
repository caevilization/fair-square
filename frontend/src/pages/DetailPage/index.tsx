import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Descriptions, Collapse, Avatar, Button } from "antd";
import "./styles.css"; // 我们稍后会创建这个文件

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

// 模拟数据，实际应从后端获取
const projectData = {
    name: "Fair Square",
    stars: 128,
    status: "In Progress",
    commits: 256,
    repoLink: "https://github.com/username/fair-square",
    language: "TypeScript",
    lastUpdate: "2024-02-28",
};

const milestones = [
    {
        id: 1,
        name: "MVP",
        squares: 3200,
        percentage: 24,
        description:
            "Initial release with core features including repository analysis and basic contribution tracking.",
        allocations: [
            {
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
                name: "Felix Chen",
                email: "felix@example.com",
                percentage: 45,
                contribution:
                    "Implemented core analysis engine and API endpoints",
                squares: 1440,
            },
            {
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
                name: "Sarah Zhang",
                email: "sarah@example.com",
                percentage: 55,
                contribution:
                    "Developed frontend interface and data visualization",
                squares: 1760,
            },
        ],
    },
    // 可以添加更多里程碑
];

// Appeals 模拟数据
const appeals = [
    {
        id: 1,
        title: "#1 Short for Mr.Monthly in Stage 1",
        pro: {
            percentage: 32,
            users: [
                {
                    id: 1,
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
                },
                {
                    id: 2,
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
                },
            ],
        },
        con: {
            percentage: 43,
            users: [
                {
                    id: 3,
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
                },
                {
                    id: 4,
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tom",
                },
            ],
        },
        messages: [
            {
                id: 1,
                user: {
                    name: "John Doe",
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
                },
                content:
                    "I think we should consider the monthly contribution pattern.",
                votes: 12,
                vetoes: 3,
                timestamp: "2024-02-28T10:00:00Z",
            },
            {
                id: 2,
                user: {
                    name: "Lisa Wang",
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
                },
                content: "But the weekly metrics show more accurate results.",
                votes: 8,
                vetoes: 5,
                timestamp: "2024-02-28T10:05:00Z",
            },
        ],
    },
    // 可以添加更多 appeals
];

// Consensus 模拟数据
const consensusData = {
    progress: 64,
    threshold: 80,
    members: [
        {
            id: 1,
            name: "John Doe",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
            percentage: 25,
            confirmed: true,
        },
        {
            id: 2,
            name: "Lisa Wang",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
            percentage: 35,
            confirmed: false,
        },
        {
            id: 3,
            name: "Mike Chen",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
            percentage: 40,
            confirmed: true,
        },
    ],
};

const DetailPage: React.FC = () => {
    const [selectedAppeal, setSelectedAppeal] = useState(appeals[0]);
    const [messageInput, setMessageInput] = useState("");

    // const items: CollapseProps["items"] = milestones.map((milestone) => ({
    //     key: milestone.id,
    //     label: (
    //         <span>
    //             Milestone {milestone.id} - {milestone.name} ({milestone.squares}{" "}
    //             sqrs, {milestone.percentage}%)
    //         </span>
    //     ),
    //     children: (
    //         <div className="space-y-6 text-white">
    //             <div>
    //                 <p className="font-bold mb-2">Description</p>
    //                 <p className="text-gray-300">{milestone.description}</p>
    //             </div>
    //             <div>
    //                 <p className="font-bold mb-4">Allocation for milestone</p>
    //                 <div className="space-y-4">
    //                     {milestone.allocations.map((allocation, index) => (
    //                         <div
    //                             key={index}
    //                             className="bg-dark-card rounded-lg p-4 space-y-2"
    //                         >
    //                             <div className="flex items-center gap-4">
    //                                 <Avatar src={allocation.avatar} size={40} />
    //                                 <div>
    //                                     <p className="font-bold">
    //                                         {allocation.name}
    //                                     </p>
    //                                     <p className="text-sm text-gray-400">
    //                                         {allocation.email}
    //                                     </p>
    //                                 </div>
    //                                 <div className="ml-auto text-right">
    //                                     <p className="font-bold text-highlight-from">
    //                                         {allocation.percentage}%
    //                                     </p>
    //                                     <p className="text-sm text-gray-400">
    //                                         {allocation.squares} sqrs
    //                                     </p>
    //                                 </div>
    //                             </div>
    //                             <p className="text-sm text-gray-300">
    //                                 {allocation.contribution}
    //                             </p>
    //                         </div>
    //                     ))}
    //                 </div>
    //             </div>
    //         </div>
    //     ),
    // }));

    return (
        <div className="min-h-screen bg-dark-bg font-exo">
            <Navbar />
            <div className="pt-24 px-4 sm:px-[8%] md:px-[15%] pb-20 max-w-[1920px] mx-auto">
                {/* 第一部分：标题和天平图 */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-center sm:text-left">
                        <span className="text-white">Judge Detail of </span>
                        <span className="bg-gradient-to-r from-highlight-from to-highlight-to bg-clip-text text-transparent">
                            {projectData.name}
                        </span>
                    </h1>
                    <img
                        src="/assets/images/cyber-scale.png"
                        alt="Cyber Scale"
                        className="h-32 md:h-48"
                    />
                </div>

                {/* 第二部分：项目简介 */}
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
                                    children: projectData.name,
                                },
                                {
                                    key: "2",
                                    label: "Github Stars",
                                    children: projectData.stars,
                                },
                                {
                                    key: "3",
                                    label: "Status",
                                    children: projectData.status,
                                },
                                {
                                    key: "4",
                                    label: "Commits",
                                    children: projectData.commits,
                                },
                                {
                                    key: "5",
                                    label: "Repo Link",
                                    children: (
                                        <a
                                            href={projectData.repoLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-highlight-from hover:text-highlight-to transition-colors"
                                        >
                                            {projectData.repoLink}
                                        </a>
                                    ),
                                },
                                {
                                    key: "6",
                                    label: "Language",
                                    children: projectData.language,
                                },
                                {
                                    key: "7",
                                    label: "Last Update",
                                    children: projectData.lastUpdate,
                                },
                            ]}
                        />
                    </div>
                </div>

                {/* 第三部分：进度树 */}
                <div className="mb-20">
                    <h3 className="text-2xl text-white font-bold mb-6">
                        Progress Tree
                    </h3>
                    <div className="relative">
                        {/* 渐变线 */}
                        <div className="absolute left-[0.5625rem] top-[1.125rem] bottom-0 w-1 bg-gradient-to-b from-highlight-from to-highlight-to rounded-full" />

                        {/* 里程碑列表 */}
                        <div className="space-y-4">
                            {milestones.map((milestone, index) => (
                                <div key={milestone.id} className="relative">
                                    {/* 时间轴圆点 */}
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
                                                            {milestone.id} -{" "}
                                                            {milestone.name} (
                                                            {milestone.squares}{" "}
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
                            ))}
                        </div>
                    </div>
                </div>

                {/* 第四部分：Appeals */}
                <div className="mb-12">
                    <h3 className="text-2xl text-white font-bold mb-6">
                        Appeals
                    </h3>
                    <div className="bg-dark-card rounded-lg p-4 md:p-6">
                        {/* 移动端布局 */}
                        <div className="flex flex-col lg:flex-row lg:divide-x lg:divide-gray-700">
                            {/* Appeal List */}
                            <div className="w-full lg:w-1/4 lg:pr-6 mb-6 lg:mb-0">
                                <div className="space-y-4">
                                    {appeals.map((appeal) => (
                                        <div
                                            key={appeal.id}
                                            className={`p-4 rounded-lg cursor-pointer transition-colors ${
                                                selectedAppeal.id === appeal.id
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
                                                                        user.avatar
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
                                                                        user.avatar
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
                                    <button className="text-highlight-from hover:text-highlight-to transition-colors underline">
                                        + Add New Appeal
                                    </button>
                                </div>
                            </div>

                            {/* 聊天区 */}
                            <div className="flex-1 lg:pl-6">
                                <div className="flex flex-col h-[500px] lg:h-[600px]">
                                    {/* 聊天标题 */}
                                    <div className="pb-4 border-b border-gray-700">
                                        <h4 className="text-xl text-white font-bold">
                                            {selectedAppeal.title}
                                        </h4>
                                    </div>

                                    {/* 聊天内容区 */}
                                    <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                                        <div className="space-y-6">
                                            {selectedAppeal.messages.map(
                                                (message) => (
                                                    <div
                                                        key={message.id}
                                                        className="flex items-start gap-4"
                                                    >
                                                        <Avatar
                                                            src={
                                                                message.user
                                                                    .avatar
                                                            }
                                                            size={32}
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                <span className="font-bold text-white">
                                                                    {
                                                                        message
                                                                            .user
                                                                            .name
                                                                    }
                                                                </span>
                                                                <span className="text-sm text-gray-400">
                                                                    {new Date(
                                                                        message.timestamp
                                                                    ).toLocaleTimeString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-300 mb-2 break-words">
                                                                {
                                                                    message.content
                                                                }
                                                            </p>
                                                            <div className="flex gap-4">
                                                                <button className="text-sm text-gray-400 hover:text-highlight-from transition-colors">
                                                                    Vote (
                                                                    {
                                                                        message.votes
                                                                    }
                                                                    )
                                                                </button>
                                                                <button className="text-sm text-gray-400 hover:text-highlight-from transition-colors">
                                                                    Veto (
                                                                    {
                                                                        message.vetoes
                                                                    }
                                                                    )
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    {/* 输入区 */}
                                    <div className="pt-4 border-t border-gray-700">
                                        <div className="bg-dark-card rounded-lg p-4">
                                            <div className="flex flex-col">
                                                <CustomTextArea
                                                    value={messageInput}
                                                    onChange={setMessageInput}
                                                    placeholder="Type your message here..."
                                                    minRows={3}
                                                    maxRows={6}
                                                />
                                                <div className="flex justify-end mt-4">
                                                    <Button className="w-24 lg:w-[15%] bg-[#2c333d] text-white hover:text-highlight-from border-none">
                                                        Send
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 第五部分：Consensus */}
                <div>
                    <h3 className="text-2xl text-white font-bold mb-6">
                        Consensus
                    </h3>
                    <div className="bg-dark-card rounded-lg p-4 md:p-6 space-y-8">
                        {/* Members */}
                        <div>
                            <p className="font-bold text-white mb-4">Members</p>
                            <div className="flex flex-wrap gap-4 md:gap-6">
                                {consensusData.members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center gap-3 min-w-[200px]"
                                    >
                                        <div
                                            className={`relative ${
                                                member.confirmed
                                                    ? "p-0.5 rounded-full bg-gradient-to-r from-highlight-from to-highlight-to"
                                                    : "p-0.5 rounded-full border-2 border-white"
                                            }`}
                                        >
                                            <Avatar
                                                src={member.avatar}
                                                size={36}
                                                className={
                                                    member.confirmed
                                                        ? "border-2 border-dark-bg"
                                                        : "border-2 border-dark-bg"
                                                }
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
                                ))}
                            </div>
                        </div>

                        {/* My Decision */}
                        <div>
                            <p className="font-bold text-white mb-4">
                                My Decision
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    type="primary"
                                    className="h-auto py-3 whitespace-normal text-left font-bold bg-gradient-to-r from-highlight-from to-highlight-to hover:from-highlight-to hover:to-highlight-from border-none"
                                >
                                    I'm done with it. If final result diffs less
                                    than 5%, I think we can proceed.
                                </Button>
                                <Button
                                    ghost
                                    className="h-auto py-3 whitespace-normal text-left border-white text-white hover:text-highlight-from hover:border-highlight-from"
                                >
                                    I OBJECT. Call the manual team to solve.
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default DetailPage;
