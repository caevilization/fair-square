const request = require("supertest");
const mongoose = require("mongoose");
const express = require("express");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = express();
const {
    Repository,
    Milestone,
    Contribution,
    Contributor,
    Appeal,
    AppealMessage,
    Decision,
} = require("../models");

// Set longer timeout
jest.setTimeout(30000);

let mongoServer;

// Connect to in-memory database before all tests
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

// Disconnect after all tests
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Clean data before each test
beforeEach(async () => {
    await Promise.all([
        Repository.deleteMany({}),
        Milestone.deleteMany({}),
        Contribution.deleteMany({}),
        Contributor.deleteMany({}),
        Appeal.deleteMany({}),
        AppealMessage.deleteMany({}),
        Decision.deleteMany({}),
    ]);
});

describe("Judge API Test", () => {
    let testRepo, testContributor, testMilestone, testAppeal, testMessage;

    // Create basic test data before each test
    beforeEach(async () => {
        // Create test repository
        testRepo = await Repository.create({
            url: "https://github.com/test/repo",
            name: "test-repo",
            owner: "test",
            status: "handshaking",
            localPath: "/tmp/test",
            sizeInMB: 1,
            totalCommits: 100,
            totalSquares: 1000,
        });

        // Create test contributor
        testContributor = await Contributor.create({
            githubUsername: "test-user",
            name: "Test User",
            email: "test@example.com",
            avatarUrl: "https://example.com/avatar.png",
            totalSquares: 1000,
            repositories: [testRepo._id],
        });

        // Create test milestone
        testMilestone = await Milestone.create({
            repositoryId: testRepo._id,
            title: "Initial Milestone",
            description: "Test milestone",
            squareReward: 1000,
            startCommit: "abc",
            endCommit: "def",
            startDate: new Date(),
            endDate: new Date(),
            status: "completed",
        });

        // Create test contribution
        await Contribution.create({
            milestoneId: testMilestone._id,
            repositoryId: testRepo._id,
            contributorId: testContributor._id,
            squareCount: 1000,
            commits: [],
        });

        // Create test appeal
        testAppeal = await Appeal.create({
            repositoryId: testRepo._id,
            milestoneId: testMilestone._id,
            title: "Test Appeal",
            status: "open",
            createdBy: testContributor._id,
            proVotes: [],
            conVotes: [],
        });

        // Create test message
        testMessage = await AppealMessage.create({
            appealId: testAppeal._id,
            contributorId: testContributor._id,
            content: "Test message content",
        });

        // Add express middleware
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        // Simulate authentication middleware
        app.use((req, res, next) => {
            req.user = { _id: testContributor._id };
            next();
        });

        // Load routes
        const judgeRoutes = require("../routes/judge.routes");
        app.use("/api/judges", judgeRoutes);
    });

    describe("GET /api/judges", () => {
        it("should return a list of repositories in handshaking status", async () => {
            const res = await request(app).get("/api/judges");
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].name).toBe("test-repo");
            expect(res.body.data[0].status).toBe("handshaking");
        });

        it("should not return repositories in other statuses", async () => {
            await Repository.findByIdAndUpdate(testRepo._id, {
                status: "pending",
            });
            const res = await request(app).get("/api/judges");
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(0);
        });
    });

    describe("GET /api/judges/:repositoryId", () => {
        it("should return judge details with project brief", async () => {
            const res = await request(app).get(`/api/judges/${testRepo._id}`);
            expect(res.status).toBe(200);
            expect(res.body.data.projectBrief).toBeDefined();
            expect(res.body.data.projectBrief.name).toBe("test-repo");
        });

        it("should return judge details with progress tree", async () => {
            const res = await request(app).get(`/api/judges/${testRepo._id}`);
            expect(res.status).toBe(200);
            expect(res.body.data.progressTree).toBeDefined();
            expect(res.body.data.progressTree).toHaveLength(1);
            expect(res.body.data.progressTree[0].name).toBe(
                "Initial Milestone"
            );
        });

        it("should return 404 for non-existent repository", async () => {
            const res = await request(app).get(
                `/api/judges/${new mongoose.Types.ObjectId()}`
            );
            expect(res.status).toBe(404);
        });
    });

    describe("GET /api/judges/:repositoryId/appeals", () => {
        it("should return a list of appeals", async () => {
            const res = await request(app).get(
                `/api/judges/${testRepo._id}/appeals`
            );
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].title).toBe("Test Appeal");
        });

        it("should include vote count information", async () => {
            await Appeal.findByIdAndUpdate(testAppeal._id, {
                $push: { proVotes: { contributorId: testContributor._id } },
            });

            const res = await request(app).get(
                `/api/judges/${testRepo._id}/appeals`
            );
            expect(res.status).toBe(200);
            expect(res.body.data[0].pro.percentage).toBe(100);
            expect(res.body.data[0].con.percentage).toBe(0);
        });
    });

    describe("GET /api/judges/:repositoryId/appeals/:appealId/messages", () => {
        it("should return a list of appeal messages", async () => {
            const res = await request(app).get(
                `/api/judges/${testRepo._id}/appeals/${testAppeal._id}/messages`
            );
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].content).toBe("Test message content");
        });

        it("should include user information", async () => {
            const res = await request(app).get(
                `/api/judges/${testRepo._id}/appeals/${testAppeal._id}/messages`
            );
            expect(res.status).toBe(200);
            expect(res.body.data[0].user).toBeDefined();
            expect(res.body.data[0].user.name).toBe("Test User");
        });
    });

    describe("POST /api/judges/:repositoryId/appeals/:appealId/messages", () => {
        it("should create a new appeal message", async () => {
            const res = await request(app)
                .post(
                    `/api/judges/${testRepo._id}/appeals/${testAppeal._id}/messages`
                )
                .send({
                    content: "New test message",
                });
            expect(res.status).toBe(201);
            expect(res.body.data.content).toBe("New test message");
        });

        it("should associate with correct user information", async () => {
            const res = await request(app)
                .post(
                    `/api/judges/${testRepo._id}/appeals/${testAppeal._id}/messages`
                )
                .send({
                    content: "New test message",
                });
            expect(res.status).toBe(201);
            expect(res.body.data.user.name).toBe("Test User");
        });
    });

    describe("POST /api/judges/:repositoryId/decisions", () => {
        it("should create a new decision", async () => {
            const res = await request(app)
                .post(`/api/judges/${testRepo._id}/decisions`)
                .send({
                    decision: "approve",
                    reason: "Looks good",
                    milestoneId: testMilestone._id,
                });
            expect(res.status).toBe(201);
            expect(res.body.data.decision).toBe("approve");
        });

        it("should not allow duplicate decisions", async () => {
            await Decision.create({
                repositoryId: testRepo._id,
                contributorId: testContributor._id,
                milestoneId: testMilestone._id,
                decision: "approve",
                reason: "First decision",
            });

            const res = await request(app)
                .post(`/api/judges/${testRepo._id}/decisions`)
                .send({
                    decision: "approve",
                    reason: "Second decision",
                    milestoneId: testMilestone._id,
                });
            expect(res.status).toBe(409);
        });
    });

    describe("POST /api/judges/:repositoryId/appeals/:appealId/vote", () => {
        it("should record a pro vote", async () => {
            const res = await request(app)
                .post(
                    `/api/judges/${testRepo._id}/appeals/${testAppeal._id}/vote`
                )
                .send({ vote: "pro" });
            expect(res.status).toBe(200);
            const appeal = await Appeal.findById(testAppeal._id);
            expect(appeal.proVotes).toHaveLength(1);
            expect(appeal.conVotes).toHaveLength(0);
        });

        it("should record a con vote", async () => {
            const res = await request(app)
                .post(
                    `/api/judges/${testRepo._id}/appeals/${testAppeal._id}/vote`
                )
                .send({ vote: "con" });
            expect(res.status).toBe(200);
            const appeal = await Appeal.findById(testAppeal._id);
            expect(appeal.proVotes).toHaveLength(0);
            expect(appeal.conVotes).toHaveLength(1);
        });

        it("should not allow duplicate votes", async () => {
            await request(app)
                .post(
                    `/api/judges/${testRepo._id}/appeals/${testAppeal._id}/vote`
                )
                .send({ vote: "pro" });

            const res = await request(app)
                .post(
                    `/api/judges/${testRepo._id}/appeals/${testAppeal._id}/vote`
                )
                .send({ vote: "con" });
            expect(res.status).toBe(409);
        });
    });

    describe("POST /api/judges/:repositoryId/appeals/:appealId/messages/:messageId/vote", () => {
        it("should add a vote to the message", async () => {
            const res = await request(app).post(
                `/api/judges/${testRepo._id}/appeals/${testAppeal._id}/messages/${testMessage._id}/vote`
            );
            expect(res.status).toBe(200);
            expect(res.body.data.votes).toBe(1);
        });

        it("should not allow duplicate votes", async () => {
            await AppealMessage.findByIdAndUpdate(testMessage._id, {
                $push: { votes: { contributorId: testContributor._id } },
            });

            const res = await request(app).post(
                `/api/judges/${testRepo._id}/appeals/${testAppeal._id}/messages/${testMessage._id}/vote`
            );
            expect(res.status).toBe(409);
        });
    });

    describe("POST /api/judges/:repositoryId/appeals/:appealId/messages/:messageId/veto", () => {
        it("should add a veto to the message", async () => {
            const res = await request(app).post(
                `/api/judges/${testRepo._id}/appeals/${testAppeal._id}/messages/${testMessage._id}/veto`
            );
            expect(res.status).toBe(200);
            expect(res.body.data.vetoes).toBe(1);
        });

        it("should not allow duplicate vetoes", async () => {
            await AppealMessage.findByIdAndUpdate(testMessage._id, {
                $push: { vetoes: { contributorId: testContributor._id } },
            });

            const res = await request(app).post(
                `/api/judges/${testRepo._id}/appeals/${testAppeal._id}/messages/${testMessage._id}/veto`
            );
            expect(res.status).toBe(409);
        });
    });
});
