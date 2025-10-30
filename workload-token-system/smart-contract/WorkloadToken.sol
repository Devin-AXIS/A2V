// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title WorkloadToken
 * @dev 基于工作量证明的代币合约
 * 用户通过完成AI任务获得代币奖励
 */
contract WorkloadToken is ERC20, Ownable, ReentrancyGuard {
    // 工作量证明结构
    struct WorkProof {
        string taskId;
        string toolName;
        uint256 inputSize;
        uint256 outputSize;
        uint256 executionTime;
        uint256 timestamp;
        bytes32 proofHash;
        bool verified;
    }

    // 用户工作量统计
    struct UserWorkload {
        uint256 totalTasks;
        uint256 totalTokensEarned;
        uint256 lastActivity;
        mapping(string => bool) completedTasks;
    }

    // 任务奖励配置
    struct TaskReward {
        string toolName;
        uint256 baseReward;
        uint256 timeMultiplier;
        uint256 sizeMultiplier;
        bool active;
    }

    // 状态变量
    mapping(address => UserWorkload) public userWorkloads;
    mapping(string => WorkProof) public workProofs;
    mapping(string => TaskReward) public taskRewards;
    mapping(address => bool) public authorizedVerifiers;

    uint256 public constant MIN_EXECUTION_TIME = 1000; // 最小执行时间(ms)
    uint256 public constant MAX_EXECUTION_TIME = 300000; // 最大执行时间(ms)
    uint256 public constant MIN_INPUT_SIZE = 1; // 最小输入大小
    uint256 public constant MAX_INPUT_SIZE = 10000000; // 最大输入大小

    // 事件
    event WorkProofSubmitted(
        address indexed user,
        string taskId,
        uint256 reward
    );
    event WorkProofVerified(string taskId, bool verified);
    event TaskRewardUpdated(string toolName, uint256 baseReward);
    event VerifierAuthorized(address indexed verifier, bool authorized);

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply * 10 ** decimals());
        _setupTaskRewards();
    }

    /**
     * @dev 设置任务奖励配置
     */
    function _setupTaskRewards() internal {
        // 文本处理任务
        taskRewards["text-processing"] = TaskReward({
            toolName: "text-processing",
            baseReward: 10 * 10 ** decimals(), // 10 WLT
            timeMultiplier: 1000, // 每毫秒额外奖励
            sizeMultiplier: 100, // 每字符额外奖励
            active: true
        });

        // 图像分析任务
        taskRewards["image-analysis"] = TaskReward({
            toolName: "image-analysis",
            baseReward: 50 * 10 ** decimals(), // 50 WLT
            timeMultiplier: 2000,
            sizeMultiplier: 1000,
            active: true
        });

        // 数据计算任务
        taskRewards["data-calculation"] = TaskReward({
            toolName: "data-calculation",
            baseReward: 5 * 10 ** decimals(), // 5 WLT
            timeMultiplier: 500,
            sizeMultiplier: 50,
            active: true
        });

        // 文件转换任务
        taskRewards["file-conversion"] = TaskReward({
            toolName: "file-conversion",
            baseReward: 30 * 10 ** decimals(), // 30 WLT
            timeMultiplier: 1500,
            sizeMultiplier: 500,
            active: true
        });
    }

    /**
     * @dev 提交工作量证明
     * @param taskId 任务ID
     * @param toolName 工具名称
     * @param inputSize 输入大小
     * @param outputSize 输出大小
     * @param executionTime 执行时间(ms)
     * @param proofHash 工作量证明哈希
     */
    function submitWorkProof(
        string memory taskId,
        string memory toolName,
        uint256 inputSize,
        uint256 outputSize,
        uint256 executionTime,
        uint256 timestamp,
        bytes32 proofHash
    ) external nonReentrant {
        require(bytes(taskId).length > 0, unicode"任务ID不能为空");
        require(bytes(toolName).length > 0, unicode"工具名称不能为空");
        require(
            inputSize >= MIN_INPUT_SIZE && inputSize <= MAX_INPUT_SIZE,
            unicode"输入大小超出范围"
        );
        require(
            executionTime >= MIN_EXECUTION_TIME &&
                executionTime <= MAX_EXECUTION_TIME,
            "执行时间超出范围"
        );
        require(workProofs[taskId].timestamp == 0, "任务已存在");

        // 创建工作量证明
        WorkProof memory proof = WorkProof({
            taskId: taskId,
            toolName: toolName,
            inputSize: inputSize,
            outputSize: outputSize,
            executionTime: executionTime,
            timestamp: timestamp,
            proofHash: proofHash,
            verified: false
        });

        workProofs[taskId] = proof;

        // 验证工作量证明
        bool isValid = _verifyWorkProof(proof);
        if (isValid) {
            workProofs[taskId].verified = true;

            // 计算奖励
            uint256 reward = _calculateReward(
                toolName,
                inputSize,
                outputSize,
                executionTime
            );

            // 更新用户工作量统计
            UserWorkload storage userWorkload = userWorkloads[msg.sender];
            userWorkload.totalTasks++;
            userWorkload.totalTokensEarned += reward;
            userWorkload.lastActivity = block.timestamp;
            userWorkload.completedTasks[taskId] = true;

            // 发放代币奖励
            _mint(msg.sender, reward);

            emit WorkProofSubmitted(msg.sender, taskId, reward);
        }

        emit WorkProofVerified(taskId, isValid);
    }

    /**
     * @dev 验证工作量证明
     */
    function _verifyWorkProof(
        WorkProof memory proof
    ) internal view returns (bool) {
        // 检查任务奖励配置是否存在且激活
        TaskReward memory reward = taskRewards[proof.toolName];
        if (!reward.active) {
            return false;
        }

        // 验证工作量证明哈希
        bytes32 expectedHash = keccak256(
            abi.encodePacked(
                proof.taskId,
                proof.toolName,
                proof.inputSize,
                proof.outputSize,
                proof.executionTime,
                proof.timestamp
            )
        );

        return expectedHash == proof.proofHash;
    }

    /**
     * @dev 计算任务奖励
     */
    function _calculateReward(
        string memory toolName,
        uint256 inputSize,
        uint256 outputSize,
        uint256 executionTime
    ) internal view returns (uint256) {
        TaskReward memory reward = taskRewards[toolName];
        require(reward.active, "任务类型未激活");

        // 基础奖励
        uint256 totalReward = reward.baseReward;

        // 时间奖励 (每毫秒额外奖励)
        totalReward += (executionTime * reward.timeMultiplier) / 1000;

        // 输入大小奖励
        totalReward += (inputSize * reward.sizeMultiplier) / 1000;

        // 输出大小奖励 (通常输出质量更重要)
        totalReward += (outputSize * reward.sizeMultiplier * 2) / 1000;

        return totalReward;
    }

    /**
     * @dev 获取用户工作量统计
     */
    function getUserWorkload(
        address user
    )
        external
        view
        returns (
            uint256 totalTasks,
            uint256 totalTokensEarned,
            uint256 lastActivity
        )
    {
        UserWorkload storage userWorkload = userWorkloads[user];
        return (
            userWorkload.totalTasks,
            userWorkload.totalTokensEarned,
            userWorkload.lastActivity
        );
    }

    /**
     * @dev 检查任务是否已完成
     */
    function isTaskCompleted(
        address user,
        string memory taskId
    ) external view returns (bool) {
        return userWorkloads[user].completedTasks[taskId];
    }

    /**
     * @dev 获取工作量证明详情
     */
    function getWorkProof(
        string memory taskId
    )
        external
        view
        returns (
            string memory,
            string memory,
            uint256,
            uint256,
            uint256,
            uint256,
            bytes32,
            bool
        )
    {
        WorkProof memory proof = workProofs[taskId];
        return (
            proof.taskId,
            proof.toolName,
            proof.inputSize,
            proof.outputSize,
            proof.executionTime,
            proof.timestamp,
            proof.proofHash,
            proof.verified
        );
    }

    /**
     * @dev 更新任务奖励配置 (仅合约所有者)
     */
    function updateTaskReward(
        string memory toolName,
        uint256 baseReward,
        uint256 timeMultiplier,
        uint256 sizeMultiplier,
        bool active
    ) external onlyOwner {
        taskRewards[toolName] = TaskReward({
            toolName: toolName,
            baseReward: baseReward,
            timeMultiplier: timeMultiplier,
            sizeMultiplier: sizeMultiplier,
            active: active
        });

        emit TaskRewardUpdated(toolName, baseReward);
    }

    /**
     * @dev 授权验证者 (仅合约所有者)
     */
    function setVerifier(address verifier, bool authorized) external onlyOwner {
        authorizedVerifiers[verifier] = authorized;
        emit VerifierAuthorized(verifier, authorized);
    }

    /**
     * @dev 批量发放代币 (仅合约所有者)
     */
    function batchMint(
        address[] memory recipients,
        uint256[] memory amounts
    ) external onlyOwner {
        require(recipients.length == amounts.length, "数组长度不匹配");

        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
        }
    }

    /**
     * @dev 销毁代币
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
