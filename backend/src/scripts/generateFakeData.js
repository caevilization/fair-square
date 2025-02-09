require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/database");
const {
    Repository,
    Contributor,
    Milestone,
    Contribution,
    Appeal,
    AppealMessage,
    Decision,
} = require("../models");
const logger = require("../config/logger");

// Example repository data
const repositories = [
    {
        name: "web3-wallet",
        owner: "defi-labs",
        description: "A secure and user-friendly Web3 wallet implementation",
        stars: 2891,
        language: "TypeScript",
        topics: ["web3", "blockchain", "wallet", "ethereum"],
    },
    {
        name: "quantum-ml",
        owner: "quantum-research",
        description: "Quantum computing algorithms for machine learning tasks",
        stars: 1567,
        language: "Python",
        topics: ["quantum-computing", "machine-learning", "algorithms"],
    },
    {
        name: "green-cloud",
        owner: "eco-tech",
        description: "Energy-efficient cloud computing solutions",
        stars: 892,
        language: "Go",
        topics: ["cloud", "sustainability", "green-computing"],
    },
    {
        name: "smart-city-iot",
        owner: "urban-innovations",
        description: "IoT platform for smart city infrastructure",
        stars: 3421,
        language: "Rust",
        topics: ["iot", "smart-city", "infrastructure"],
    },
    {
        name: "neural-art-engine",
        owner: "creative-ai",
        description: "AI-powered digital art generation framework",
        stars: 4267,
        language: "Python",
        topics: ["ai", "digital-art", "machine-learning"],
    },
    {
        name: "blockchain-security",
        owner: "cyber-security",
        description: "Blockchain security protocols and threat analysis",
        stars: 1234,
        language: "Java",
        topics: ["blockchain", "security", "cryptography"],
    },
    {
        name: "ai-assistant",
        owner: "intelligent-systems",
        description: "AI-powered virtual assistant for customer support",
        stars: 5678,
        language: "JavaScript",
        topics: ["ai", "chatbot", "customer-support"],
    },
    {
        name: "data-analytics",
        owner: "data-science",
        description: "Data analytics platform for business insights",
        stars: 9012,
        language: "R",
        topics: ["data-analytics", "business-intelligence", "statistics"],
    },
    {
        name: "cybernetic-systems",
        owner: "robotics-engineering",
        description: "Cybernetic systems for robotics and automation",
        stars: 3456,
        language: "C++",
        topics: ["cybernetics", "robotics", "automation"],
    },
];

// 示例贡献者数据
const contributors = [
    {
        name: "Alex Chen",
        githubUsername: "alexc",
        email: "alex.chen@github.com",
        avatarUrl: "https://avatars.githubusercontent.com/u/1",
    },
    {
        name: "Sarah Miller",
        githubUsername: "sarahm",
        email: "sarah.miller@github.com",
        avatarUrl: "https://avatars.githubusercontent.com/u/2",
    },
    {
        name: "David Kumar",
        githubUsername: "davidk",
        email: "david.kumar@github.com",
        avatarUrl: "https://avatars.githubusercontent.com/u/3",
    },
    {
        name: "Emma Wilson",
        githubUsername: "emmaw",
        email: "emma.wilson@github.com",
        avatarUrl: "https://avatars.githubusercontent.com/u/4",
    },
    {
        name: "Michael Zhang",
        githubUsername: "michaelz",
        email: "michael.zhang@github.com",
        avatarUrl: "https://avatars.githubusercontent.com/u/5",
    },
    {
        name: "Lisa Brown",
        githubUsername: "lisab",
        email: "lisa.brown@github.com",
        avatarUrl: "https://avatars.githubusercontent.com/u/6",
    },
    {
        name: "James Wilson",
        githubUsername: "jamesw",
        email: "james.wilson@github.com",
        avatarUrl: "https://avatars.githubusercontent.com/u/7",
    },
    {
        name: "Sophia Lee",
        githubUsername: "sophial",
        email: "sophia.lee@github.com",
        avatarUrl: "https://avatars.githubusercontent.com/u/8",
    },
    {
        name: "Olivia Smith",
        githubUsername: "olivias",
        email: "olivia.smith@github.com",
        avatarUrl: "https://avatars.githubusercontent.com/u/9",
    },
    {
        name: "Ethan Johnson",
        githubUsername: "ethanj",
        email: "ethan.johnson@github.com",
        avatarUrl: "https://avatars.githubusercontent.com/u/10",
    },
    {
        name: "Ava Brown",
        githubUsername: "avab",
        email: "ava.brown@github.com",
        avatarUrl: "https://avatars.githubusercontent.com/u/11",
    },
    {
        name: "Noah Davis",
        githubUsername: "noahd",
        email: "noah.davis@github.com",
        avatarUrl: "https://avatars.githubusercontent.com/u/12",
    },
    {
        name: "Mia Garcia",
        githubUsername: "miag",
        email: "mia.garcia@github.com",
        avatarUrl: "https://avatars.githubusercontent.com/u/13",
    },
    {
        name: "Lucas Martinez",
        githubUsername: "lucasm",
        email: "lucas.martinez@github.com",
        avatarUrl: "https://avatars.githubusercontent.com/u/14",
    },
    {
        name: "Isabella Thompson",
        githubUsername: "isabellat",
        email: "isabella.thompson@github.com",
        avatarUrl: "https://avatars.githubusercontent.com/u/15",
    },
    {
        name: "William Hernandez",
        githubUsername: "williamh",
        email: "william.hernandez@github.com",
        avatarUrl: "https://avatars.githubusercontent.com/u/16",
    },
    {
        name: "Oliver Young",
        githubUsername: "olivery",
        email: "oliver.young@github.com",
        avatarUrl: "https://avatars.githubusercontent.com/u/18",
    },
    {
        name: "Amelia King",
        githubUsername: "amelial",
        email: "amelia.king@github.com",
        avatarUrl: "https://avatars.githubusercontent.com/u/19",
    },
    {
        name: "Benjamin Scott",
        githubUsername: "benjamins",
        email: "benjamin.scott@github.com",
        avatarUrl: "https://avatars.githubusercontent.com/u/20",
    },
    {
        name: "Charlotte Nguyen",
        githubUsername: "charlotten",
        email: "charlotte.nguyen@github.com",
        avatarUrl: "https://avatars.githubusercontent.com/u/21",
    },
    {
        name: "Henry Hill",
        githubUsername: "henryh",
        email: "henry.hill@github.com",
        avatarUrl: "https://avatars.githubusercontent.com/u/22",
    },
    {
        name: "Ella Green",
        githubUsername: "ellag",
        email: "ella.green@github.com",
        avatarUrl: "https://avatars.githubusercontent.com/u/23",
    },
    {
        name: "Liam Adams",
        githubUsername: "liama",
        email: "liam.adams@github.com",
        avatarUrl: "https://avatars.githubusercontent.com/u/24",
    },
    {
        name: "Aria Baker",
        githubUsername: "ariab",
        email: "aria.baker@github.com",
        avatarUrl: "https://avatars.githubusercontent.com/u/25",
    },
];

// Generate random number
const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// Randomly select n elements from an array
const randomPick = (arr, n) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
};

// Generate random date
const randomDate = (start, end) => {
    return new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
};

// Generate random commit information
const generateCommits = (count) => {
    const commits = [];
    for (let i = 0; i < count; i++) {
        commits.push({
            hash: Math.random().toString(36).substring(2, 15),
            message: `feat: ${
                ["Add", "Update", "Improve", "Fix", "Refactor"][random(0, 4)]
            } ${
                [
                    "authentication system",
                    "performance optimization",
                    "error handling",
                    "user interface",
                    "documentation",
                    "test coverage",
                    "API endpoints",
                    "database schema",
                ][random(0, 7)]
            }`,
            date: randomDate(new Date(2023, 0, 1), new Date()),
            filesChanged: random(1, 10),
            additions: random(10, 200),
            deletions: random(5, 100),
        });
    }
    return commits;
};

async function generateFakeData() {
    try {
        // Connect to database
        await connectDB();
        logger.info("Connected to database");

        // Clear existing data
        await Promise.all([
            Repository.deleteMany({}),
            Contributor.deleteMany({}),
            Milestone.deleteMany({}),
            Contribution.deleteMany({}),
            Appeal.deleteMany({}),
            AppealMessage.deleteMany({}),
            Decision.deleteMany({}),
        ]);
        logger.info("Cleared existing data");

        // Create contributors
        const createdContributors = await Contributor.create(
            contributors.map((c) => ({
                ...c,
                totalSquares: 0,
                repositories: [],
            }))
        );
        logger.info(`Created ${createdContributors.length} contributors`);

        // Create repositories and related data
        for (const repo of repositories) {
            // Create repository
            const repository = await Repository.create({
                url: `https://github.com/${repo.owner}/${repo.name}`,
                name: repo.name,
                owner: repo.owner,
                status: ["analyzing", "handshaking", "completed"][random(0, 2)],
                localPath: `/tmp/${repo.owner}_${repo.name}`,
                sizeInMB: random(1, 8),
                totalCommits: random(100, 500),
                totalSquares: 0,
                description: repo.description,
                stars: repo.stars,
                language: repo.language,
                topics: repo.topics,
            });

            // Randomly select 3-5 contributors for the repository
            const repoContributors = randomPick(
                createdContributors,
                random(3, 5)
            );

            // Create 2-4 milestones
            const milestoneCount = random(2, 4);
            for (let i = 0; i < milestoneCount; i++) {
                const milestone = await Milestone.create({
                    repositoryId: repository._id,
                    title: `Milestone ${i + 1}: ${
                        [
                            "Initial Release",
                            "Core Features",
                            "Performance Optimization",
                            "Security Enhancement",
                            "UI/UX Improvement",
                            "Database Refactoring",
                            "Error Handling",
                            "Code Cleanup",
                            "Documentation Update",
                            "Testing Framework",
                            "Deployment Automation",
                            "Monitoring Integration",
                            "Logging Enhancement",
                            "Backup and Recovery",
                            "Scalability Improvement",
                            "Accessibility Features",
                            "Internationalization",
                            "Localization",
                            "Compliance and Governance",
                            "User Feedback Integration",
                            "Analytics and Insights",
                        ][random(0, 19)]
                    }`,
                    description: `Focusing on ${
                        [
                            "implementing core functionality",
                            "improving system performance",
                            "enhancing security features",
                            "refining user experience",
                            "expanding API capabilities",
                            "refactoring database schema",
                            "handling errors and exceptions",
                            "cleaning up codebase",
                            "updating documentation",
                            "implementing testing framework",
                            "automating deployment process",
                            "integrating monitoring tools",
                            "enhancing logging capabilities",
                            "developing backup and recovery process",
                            "improving scalability",
                            "adding accessibility features",
                            "internationalizing the application",
                            "localizing the application",
                            "ensuring compliance and governance",
                            "integrating user feedback",
                            "providing analytics and insights",
                        ][random(0, 19)]
                    }`,
                    squareReward: random(1000, 3000),
                    startCommit: Math.random().toString(36).substring(2, 15),
                    endCommit: Math.random().toString(36).substring(2, 15),
                    startDate: randomDate(
                        new Date(2023, 0, 1),
                        new Date(2023, 5, 1)
                    ),
                    endDate: randomDate(new Date(2023, 6, 1), new Date()),
                    status: ["pending", "analyzing", "completed"][random(0, 2)],
                });

                // Create contribution records for each contributor
                for (const contributor of repoContributors) {
                    const squares = random(100, 1000);
                    const contribution = await Contribution.create({
                        milestoneId: milestone._id,
                        repositoryId: repository._id,
                        contributorId: contributor._id,
                        squareCount: squares,
                        commits: generateCommits(random(5, 15)),
                    });

                    // Update contributor's total score
                    await Contributor.findByIdAndUpdate(contributor._id, {
                        $inc: { totalSquares: squares },
                        $addToSet: { repositories: repository._id },
                    });

                    // Update repository's total score
                    await Repository.findByIdAndUpdate(repository._id, {
                        $inc: { totalSquares: squares },
                        $addToSet: { memberIds: contributor._id },
                    });
                }

                // Create 0-2 appeals for each milestone
                const appealCount = random(0, 2);
                for (let j = 0; j < appealCount; j++) {
                    const appeal = await Appeal.create({
                        repositoryId: repository._id,
                        milestoneId: milestone._id,
                        title: `${
                            [
                                "Reevaluation",
                                "Request for Review",
                                "Contribution Adjustment",
                                "Distribution Correction",
                            ][random(0, 3)]
                        } ${
                            [
                                "Code Complexity",
                                "Documentation Workload",
                                "Technical Decision Impact",
                                "Team Collaboration",
                            ][random(0, 3)]
                        }`,
                        type: ["long", "short"][random(0, 1)],
                        reason: `${
                            [
                                "Considering the project's",
                                "Based on the team's",
                                "From a technical perspective",
                                "Based on historical data",
                            ][random(0, 3)]
                        } ${
                            [
                                "Long-term Maintenance Cost",
                                "Knowledge Transfer Contribution",
                                "Architecture Improvement Impact",
                                "Quality Assurance Input",
                            ][random(0, 3)]
                        }`,
                        status: "open",
                        createdBy:
                            repoContributors[
                                random(0, repoContributors.length - 1)
                            ]._id,
                        proVotes: [],
                        conVotes: [],
                    });

                    // Randomly select 2-4 contributors for voting
                    const voters = randomPick(repoContributors, random(2, 4));

                    // Ensure at least one pro vote and one con vote
                    const proVoter = voters[0];
                    const conVoter = voters[1];
                    await Appeal.findByIdAndUpdate(appeal._id, {
                        $push: {
                            proVotes: {
                                contributorId: proVoter._id,
                                timestamp: new Date(),
                            },
                        },
                    });
                    await Appeal.findByIdAndUpdate(appeal._id, {
                        $push: {
                            conVotes: {
                                contributorId: conVoter._id,
                                timestamp: new Date(),
                            },
                        },
                    });

                    // Randomly vote for the remaining voters
                    for (let k = 2; k < voters.length; k++) {
                        const voter = voters[k];
                        if (random(0, 1)) {
                            await Appeal.findByIdAndUpdate(appeal._id, {
                                $push: {
                                    proVotes: {
                                        contributorId: voter._id,
                                        timestamp: new Date(),
                                    },
                                },
                            });
                        } else {
                            await Appeal.findByIdAndUpdate(appeal._id, {
                                $push: {
                                    conVotes: {
                                        contributorId: voter._id,
                                        timestamp: new Date(),
                                    },
                                },
                            });
                        }
                    }

                    // Create 1-2 messages for the appeal
                    const messageCount = random(1, 2);
                    for (let m = 0; m < messageCount; m++) {
                        await AppealMessage.create({
                            appealId: appeal._id,
                            contributorId:
                                repoContributors[
                                    random(0, repoContributors.length - 1)
                                ]._id,
                            content: `${
                                [
                                    "I believe the contribution metrics should consider",
                                    "Looking at the commit history,",
                                    "Based on the project requirements,",
                                    "Considering the technical complexity,",
                                    "Analyzing the project's overall performance,",
                                    "Evaluating the team's collaboration and communication,",
                                    "Assessing the project's alignment with company goals,",
                                    "Reviewing the project's budget and resource allocation,",
                                    "Examining the project's risk management strategies,",
                                    "Considering the project's scalability and maintainability,",
                                    "Investigating the project's security and compliance,",
                                    "Assessing the project's user experience and interface,",
                                    "Evaluating the project's data analytics and insights,",
                                    "Reviewing the project's DevOps and deployment,",
                                    "Analyzing the project's testing and quality assurance,",
                                    "Considering the project's continuous integration and delivery,",
                                    "Examining the project's infrastructure and architecture,",
                                    "Assessing the project's cloud and containerization,",
                                    "Evaluating the project's microservices and APIs,",
                                    "Reviewing the project's machine learning and AI,",
                                ][random(0, 19)]
                            } ${
                                [
                                    "the time spent on code review and mentoring.",
                                    "the effort put into documentation and testing.",
                                    "the impact of architectural decisions made.",
                                    "the challenges overcome in implementation.",
                                    "the quality of the codebase and its maintainability.",
                                    "the effectiveness of the project's testing strategies.",
                                    "the project's compliance with industry standards.",
                                    "the project's potential for future growth and expansion.",
                                    "the project's alignment with emerging technologies.",
                                    "the project's ability to adapt to changing requirements.",
                                    "the project's scalability and performance optimization.",
                                    "the project's security and vulnerability management.",
                                    "the project's user experience and accessibility.",
                                    "the project's data analytics and business intelligence.",
                                    "the project's DevOps and continuous delivery.",
                                    "the project's testing and quality control.",
                                    "the project's infrastructure and scalability.",
                                    "the project's cloud and containerization strategy.",
                                    "the project's microservices and API design.",
                                    "the project's machine learning and AI integration.",
                                ][random(0, 19)]
                            }`,
                            votes: [],
                            vetoes: [],
                        });
                    }
                }
            }
        }

        logger.info("Successfully generated fake data");
        process.exit(0);
    } catch (error) {
        logger.error("Error generating fake data:", error);
        process.exit(1);
    }
}

// Run the data generation script
generateFakeData();
