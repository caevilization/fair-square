import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

export interface Repository {
    id: string;
    name: string;
    owner: string;
    status: string;
    lastAnalyzed: string;
    totalSquares: number;
    totalCommits: number;
    consensusProgress: number;
    contributors: {
        id: string;
        name: string;
        avatar: string;
        squares: number;
    }[];
}

export interface JudgeDetail {
    projectBrief: {
        name: string;
        stars: number;
        status: string;
        commits: number;
        repoLink: string;
        language: string;
        lastUpdate: string;
    };
    progressTree: {
        id: string;
        name: string;
        squares: number;
        percentage: number;
        description: string;
        allocations: {
            id: string;
            avatar: string;
            name: string;
            email: string;
            percentage: number;
            contribution: string;
            squares: number;
        }[];
    }[];
    consensus: {
        progress: number;
        threshold: number;
        members: {
            id: string;
            name: string;
            avatar: string;
            percentage: number;
            confirmed: boolean;
        }[];
    };
}

export interface Appeal {
    id: string;
    title: string;
    type: "long" | "short";
    contributor: {
        id: string;
        name: string;
        avatar: string;
    };
    reason: string;
    pro: {
        percentage: number;
        users: { id: string; avatarUrl: string }[];
    };
    con: {
        percentage: number;
        users: { id: string; avatarUrl: string }[];
    };
}

export interface AppealMessage {
    id: string;
    user: {
        name: string;
        avatar: string;
    };
    content: string;
    votes: number;
    vetoes: number;
    timestamp: string;
}

export interface Decision {
    id: string;
    decision: "approve" | "object";
    reason: string;
    milestoneId: string;
    createdAt: string;
    createdBy: {
        id: string;
        name: string;
        avatar: string;
    };
}

export const judgeApi = {
    // Get all repositories in handshaking status
    listJudges: async (): Promise<Repository[]> => {
        const response = await api.get("/judges");
        return response.data.data;
    },

    // Get judge details for a specific repository
    getJudgeDetail: async (repositoryId: string): Promise<JudgeDetail> => {
        const response = await api.get(`/judges/${repositoryId}`);
        return response.data.data;
    },

    // Get appeal list
    getAppeals: async (repositoryId: string): Promise<Appeal[]> => {
        const response = await api.get(`/judges/${repositoryId}/appeals`);
        return response.data.data;
    },

    // Get appeal message list
    getAppealMessages: async (
        repositoryId: string,
        appealId: string
    ): Promise<AppealMessage[]> => {
        const response = await api.get(
            `/judges/${repositoryId}/appeals/${appealId}/messages`
        );
        return response.data.data;
    },

    // Create new appeal message
    createAppealMessage: async (
        repositoryId: string,
        appealId: string,
        content: string
    ): Promise<AppealMessage> => {
        const response = await api.post(
            `/judges/${repositoryId}/appeals/${appealId}/messages`,
            { content }
        );
        return response.data.data;
    },

    // Get decision list
    getDecisions: async (repositoryId: string): Promise<Decision[]> => {
        const response = await api.get(`/judges/${repositoryId}/decisions`);
        return response.data.data;
    },

    // Create decision
    createDecision: async (
        repositoryId: string,
        data: {
            decision: "approve" | "object";
            reason: string;
            milestoneId: string;
            contributorId: string;
        }
    ): Promise<Decision> => {
        const response = await api.post(
            `/judges/${repositoryId}/decisions`,
            data
        );
        return response.data.data;
    },

    // Vote on appeal
    voteAppeal: async (
        repositoryId: string,
        appealId: string,
        vote: "pro" | "con"
    ): Promise<{ proVotes: number; conVotes: number }> => {
        const response = await api.post(
            `/judges/${repositoryId}/appeals/${appealId}/vote`,
            { vote }
        );
        return response.data.data;
    },

    // Vote on message
    voteMessage: async (
        repositoryId: string,
        appealId: string,
        messageId: string
    ): Promise<{ votes: number; vetoes: number }> => {
        const response = await api.post(
            `/judges/${repositoryId}/appeals/${appealId}/messages/${messageId}/vote`
        );
        return response.data.data;
    },

    // Vote against message
    vetoMessage: async (
        repositoryId: string,
        appealId: string,
        messageId: string
    ): Promise<{ votes: number; vetoes: number }> => {
        const response = await api.post(
            `/judges/${repositoryId}/appeals/${appealId}/messages/${messageId}/veto`
        );
        return response.data.data;
    },

    // Create a new appeal
    createAppeal: async (
        repositoryId: string,
        data: {
            type: "long" | "short";
            contributorId: string;
            reason: string;
        }
    ): Promise<Appeal> => {
        const response = await api.post(
            `/judges/${repositoryId}/appeals`,
            data
        );
        return response.data.data;
    },
};
