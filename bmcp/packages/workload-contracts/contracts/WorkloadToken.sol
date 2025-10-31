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

    struct UserWorkload {
        uint256 totalTasks;
        uint256 totalTokensEarned;
        uint256 lastActivity;
        mapping(string => bool) completedTasks;
    }

    struct TaskReward {
        string toolName;
        uint256 baseReward;
        uint256 timeMultiplier;
        uint256 sizeMultiplier;
        bool active;
    }

    mapping(address => UserWorkload) public userWorkloads;
    mapping(string => WorkProof) public workProofs;
    mapping(string => TaskReward) public taskRewards;
    mapping(address => bool) public authorizedVerifiers;

    uint256 public constant MIN_EXECUTION_TIME = 1000; // ms
    uint256 public constant MAX_EXECUTION_TIME = 300000; // ms
    uint256 public constant MIN_INPUT_SIZE = 1;
    uint256 public constant MAX_INPUT_SIZE = 10000000;

    event WorkProofSubmitted(
        address indexed user,
        string taskId,
        uint256 reward
    );
    event WorkProofVerified(string taskId, bool verified);
    event TaskRewardUpdated(string toolName, uint256 baseReward);
    event VerifierAuthorized(address indexed verifier, bool authorized);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply
    ) ERC20(name_, symbol_) {
        _mint(msg.sender, initialSupply * 10 ** decimals());
        _setupTaskRewards();
    }

    function _setupTaskRewards() internal {
        taskRewards["text-processing"] = TaskReward({
            toolName: "text-processing",
            baseReward: 10 * 10 ** decimals(),
            timeMultiplier: 1000,
            sizeMultiplier: 100,
            active: true
        });

        taskRewards["image-analysis"] = TaskReward({
            toolName: "image-analysis",
            baseReward: 50 * 10 ** decimals(),
            timeMultiplier: 2000,
            sizeMultiplier: 1000,
            active: true
        });

        taskRewards["data-calculation"] = TaskReward({
            toolName: "data-calculation",
            baseReward: 5 * 10 ** decimals(),
            timeMultiplier: 500,
            sizeMultiplier: 50,
            active: true
        });

        taskRewards["file-conversion"] = TaskReward({
            toolName: "file-conversion",
            baseReward: 30 * 10 ** decimals(),
            timeMultiplier: 1500,
            sizeMultiplier: 500,
            active: true
        });
    }

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
            unicode"执行时间超出范围"
        );
        require(workProofs[taskId].timestamp == 0, unicode"任务已存在");

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

        bool isValid = _verifyWorkProof(proof);
        if (isValid) {
            workProofs[taskId].verified = true;

            uint256 reward = _calculateReward(
                toolName,
                inputSize,
                outputSize,
                executionTime
            );

            UserWorkload storage userWorkload = userWorkloads[msg.sender];
            userWorkload.totalTasks++;
            userWorkload.totalTokensEarned += reward;
            userWorkload.lastActivity = block.timestamp;
            userWorkload.completedTasks[taskId] = true;

            _mint(msg.sender, reward);

            emit WorkProofSubmitted(msg.sender, taskId, reward);
        }

        emit WorkProofVerified(taskId, isValid);
    }

    function _verifyWorkProof(
        WorkProof memory proof
    ) internal view returns (bool) {
        TaskReward memory reward = taskRewards[proof.toolName];
        if (!reward.active) return false;

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

    function _calculateReward(
        string memory toolName,
        uint256 inputSize,
        uint256 outputSize,
        uint256 executionTime
    ) internal view returns (uint256) {
        TaskReward memory reward = taskRewards[toolName];
        require(reward.active, unicode"任务类型未激活");

        uint256 totalReward = reward.baseReward;
        totalReward += (executionTime * reward.timeMultiplier) / 1000;
        totalReward += (inputSize * reward.sizeMultiplier) / 1000;
        totalReward += (outputSize * reward.sizeMultiplier * 2) / 1000;
        return totalReward;
    }

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
        UserWorkload storage uw = userWorkloads[user];
        return (uw.totalTasks, uw.totalTokensEarned, uw.lastActivity);
    }

    function isTaskCompleted(
        address user,
        string memory taskId
    ) external view returns (bool) {
        return userWorkloads[user].completedTasks[taskId];
    }

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
        WorkProof memory p = workProofs[taskId];
        return (
            p.taskId,
            p.toolName,
            p.inputSize,
            p.outputSize,
            p.executionTime,
            p.timestamp,
            p.proofHash,
            p.verified
        );
    }

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

    function setVerifier(address verifier, bool authorized) external onlyOwner {
        authorizedVerifiers[verifier] = authorized;
        emit VerifierAuthorized(verifier, authorized);
    }

    function batchMint(
        address[] memory recipients,
        uint256[] memory amounts
    ) external onlyOwner {
        require(recipients.length == amounts.length, unicode"数组长度不匹配");
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
        }
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
