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

// 设置更长的超时时间
jest.setTimeout(30000);

let mongoServer;

// 在所有测试开始前连接到内存数据库
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

// 在所有测试结束后断开连接
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// 在每个测试前清理数据
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

describe("Judge API 测试", () => {
    let testRepo, testContributor, testMilestone, testAppeal, testMessage;

    // 在每个测试前创建基础测试数据
    beforeEach(async () => {
        // 创建测试仓库
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

        // 创建测试贡献者
        testContributor = await Contributor.create({
            githubUsername: "test-user",
            name: "Test User",
            email: "test@example.com",
            avatarUrl: "https://example.com/avatar.png",
            totalSquares: 1000,
            repositories: [testRepo._id],
        });

        // 创建测试里程碑
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

        // 创建测试贡献记录
        await Contribution.create({
            milestoneId: testMilestone._id,
            repositoryId: testRepo._id,
            contributorId: testContributor._id,
            squareCount: 1000,
            commits: [],
        });

        // 创建测试申诉
        testAppeal = await Appeal.create({
            repositoryId: testRepo._id,
            milestoneId: testMilestone._id,
            title: "Test Appeal",
            status: "open",
            createdBy: testContributor._id,
            proVotes: [],
            conVotes: [],
        });

        // 创建测试消息
        testMessage = await AppealMessage.create({
            appealId: testAppeal._id,
            contributorId: testContributor._id,
            content: "Test message content",
        });

        // 添加 express 中间件
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        // 模拟认证中间件
        app.use((req, res, next) => {
            req.user = { _id: testContributor._id };
            next();
        });

        // 加载路由
        const judgeRoutes = require("../routes/judge.routes");
        app.use("/api/judges", judgeRoutes);
    });

    describe("GET /api/judges", () => {
        it("应该返回处于 handshaking 状态的仓库列表", async () => {
            const res = await request(app).get("/api/judges");
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].name).toBe("test-repo");
            expect(res.body.data[0].status).toBe("handshaking");
        });

        it("不应该返回其他状态的仓库", async () => {
            await Repository.findByIdAndUpdate(testRepo._id, {
                status: "pending",
            });
            const res = await request(app).get("/api/judges");
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(0);
        });
    });

    describe("GET /api/judges/:repositoryId", () => {
        it("应该返回包含项目简介的 judge 详情", async () => {
            const res = await request(app).get(`/api/judges/${testRepo._id}`);
            expect(res.status).toBe(200);
            expect(res.body.data.projectBrief).toBeDefined();
            expect(res.body.data.projectBrief.name).toBe("test-repo");
        });

        it("应该返回包含进度树的 judge 详情", async () => {
            const res = await request(app).get(`/api/judges/${testRepo._id}`);
            expect(res.status).toBe(200);
            expect(res.body.data.progressTree).toBeDefined();
            expect(res.body.data.progressTree).toHaveLength(1);
            expect(res.body.data.progressTree[0].name).toBe(
                "Initial Milestone"
            );
        });

        it("对于不存在的仓库应该返回 404", async () => {
            const res = await request(app).get(
                `/api/judges/${new mongoose.Types.ObjectId()}`
            );
            expect(res.status).toBe(404);
        });
    });

    describe("GET /api/judges/:repositoryId/appeals", () => {
        it("应该返回申诉列表", async () => {
            const res = await request(app).get(
                `/api/judges/${testRepo._id}/appeals`
            );
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].title).toBe("Test Appeal");
        });

        it("应该包含投票统计信息", async () => {
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
        it("应该返回申诉消息列表", async () => {
            const res = await request(app).get(
                `/api/judges/${testRepo._id}/appeals/${testAppeal._id}/messages`
            );
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].content).toBe("Test message content");
        });

        it("应该包含用户信息", async () => {
            const res = await request(app).get(
                `/api/judges/${testRepo._id}/appeals/${testAppeal._id}/messages`
            );
            expect(res.status).toBe(200);
            expect(res.body.data[0].user).toBeDefined();
            expect(res.body.data[0].user.name).toBe("Test User");
        });
    });

    describe("POST /api/judges/:repositoryId/appeals/:appealId/messages", () => {
        it("应该创建新的申诉消息", async () => {
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

        it("应该关联正确的用户信息", async () => {
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
        it("应该创建新的决策", async () => {
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

        it("不应该允许重复决策", async () => {
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
        it("应该记录支持票", async () => {
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

        it("应该记录反对票", async () => {
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

        it("不应该允许重复投票", async () => {
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
        it("应该为消息添加投票", async () => {
            const res = await request(app).post(
                `/api/judges/${testRepo._id}/appeals/${testAppeal._id}/messages/${testMessage._id}/vote`
            );
            expect(res.status).toBe(200);
            expect(res.body.data.votes).toBe(1);
        });

        it("不应该允许重复投票", async () => {
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
        it("应该为消息添加否决票", async () => {
            const res = await request(app).post(
                `/api/judges/${testRepo._id}/appeals/${testAppeal._id}/messages/${testMessage._id}/veto`
            );
            expect(res.status).toBe(200);
            expect(res.body.data.vetoes).toBe(1);
        });

        it("不应该允许重复否决", async () => {
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
