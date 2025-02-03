const { Repository, AnalysisTask } = require("../models");
const repositoryController = require("../controllers/repository.controller");
const axios = require("axios");
const simpleGit = require("simple-git");
const fs = require("fs").promises;

// Mock 依赖
jest.mock("axios");
jest.mock("simple-git");
jest.mock("fs").promises;
jest.mock("../models", () => ({
    Repository: {
        create: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
        findById: jest.fn(),
    },
    AnalysisTask: {
        create: jest.fn(),
    },
}));

describe("Repository Controller", () => {
    let req;
    let res;

    beforeEach(() => {
        // 重置所有 mock
        jest.clearAllMocks();

        // Mock response 对象
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // 设置环境变量
        process.env.REPO_STORAGE_PATH = "./repos";
    });

    describe("addRepository", () => {
        beforeEach(() => {
            req = {
                body: {
                    url: "https://github.com/owner/repo",
                },
            };
        });

        it("应该成功添加小于1MB的仓库", async () => {
            // Mock GitHub API 响应
            axios.get.mockResolvedValueOnce({
                data: {
                    size: 500, // 500KB
                },
            });

            // Mock 数据库操作
            Repository.findOne.mockResolvedValueOnce(null);
            Repository.create.mockResolvedValueOnce({
                _id: "repo123",
                url: "https://github.com/owner/repo",
                name: "repo",
                owner: "owner",
            });
            AnalysisTask.create.mockResolvedValueOnce({});

            // Mock Git 操作
            simpleGit.mockReturnValueOnce({
                clone: jest.fn().mockResolvedValueOnce(),
            });

            // Mock 文件系统操作
            fs.mkdir.mockResolvedValueOnce();

            await repositoryController.addRepository(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "仓库添加成功",
                    data: expect.any(Object),
                })
            );
        });

        it("应该拒绝添加大于1MB的仓库", async () => {
            // Mock GitHub API 响应
            axios.get.mockResolvedValueOnce({
                data: {
                    size: 2048, // 2MB
                },
            });

            await repositoryController.addRepository(req, res);

            expect(res.status).toHaveBeenCalledWith(413);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "添加仓库失败",
                    error: expect.stringContaining("超过限制"),
                })
            );
        });

        it("应该拒绝添加已存在的仓库", async () => {
            Repository.findOne.mockResolvedValueOnce({
                url: "https://github.com/owner/repo",
            });

            await repositoryController.addRepository(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "该仓库已经存在",
                })
            );
        });

        it("应该处理无效的 GitHub URL", async () => {
            req.body.url = "invalid-url";

            await repositoryController.addRepository(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "添加仓库失败",
                    error: expect.stringContaining("无效的 GitHub 仓库 URL"),
                })
            );
        });
    });

    describe("listRepositories", () => {
        it("应该返回仓库列表", async () => {
            const mockRepositories = [
                { id: "1", name: "repo1" },
                { id: "2", name: "repo2" },
            ];

            Repository.find.mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValueOnce(mockRepositories),
            });

            await repositoryController.listRepositories(req, res);

            expect(res.json).toHaveBeenCalledWith({
                message: "获取仓库列表成功",
                data: mockRepositories,
            });
        });
    });

    describe("getRepository", () => {
        beforeEach(() => {
            req = {
                params: {
                    id: "repo123",
                },
            };
        });

        it("应该返回单个仓库信息", async () => {
            const mockRepository = {
                id: "repo123",
                name: "test-repo",
            };

            Repository.findById.mockReturnValueOnce({
                select: jest.fn().mockResolvedValueOnce(mockRepository),
            });

            await repositoryController.getRepository(req, res);

            expect(res.json).toHaveBeenCalledWith({
                message: "获取仓库信息成功",
                data: mockRepository,
            });
        });

        it("应该处理不存在的仓库", async () => {
            Repository.findById.mockReturnValueOnce({
                select: jest.fn().mockResolvedValueOnce(null),
            });

            await repositoryController.getRepository(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "仓库不存在",
            });
        });
    });
});
