// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title WorkloadToken
 * @dev 基于加密价值哈希的代币发放合约
 * 部署时设置密钥，通过解密价值哈希来发放代币
 */
contract WorkloadToken is ERC20, Ownable, ReentrancyGuard {
    // 部署时的密钥，用于解密价值哈希
    bytes32 private immutable decryptionKey;

    // 显式重写 decimals 函数，返回 18 位小数（标准 ERC20 代币精度）
    // 这确保钱包和浏览器能正确显示代币数量
    // 注意：OpenZeppelin ERC20 默认 decimals 为 18，但显式声明可以避免某些钱包的兼容性问题
    function decimals() public pure override returns (uint8) {
        return 18;
    }

    // 记录已使用的价值哈希，防止重复使用
    mapping(bytes32 => bool) public usedValueHashes;

    // 记录授权调用者（可选的权限控制）
    mapping(address => bool) public authorizedCallers;

    // 记录价值哈希对应的授权代币数量
    mapping(bytes32 => uint256) public authorizedAmounts;

    event TokensDistributed(
        address indexed recipient,
        bytes32 indexed valueHash,
        uint256 amount
    );
    event ValueHashUsed(bytes32 indexed valueHash);
    event CallerAuthorized(address indexed caller, bool authorized);
    event AmountAuthorized(bytes32 indexed valueHash, uint256 amount);

    // 最小和最大代币数量限制
    uint256 public constant MIN_AMOUNT = 1; // 最小1个代币单位
    uint256 public constant MAX_AMOUNT = 1000000 * 10 ** 18; // 最大100万代币（带18位小数）

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply,
        bytes32 key
    ) ERC20(name_, symbol_) {
        // 铸造初始供应量给部署者
        _mint(msg.sender, initialSupply * 10 ** decimals());
        // 设置解密密钥（immutable，部署后不可更改）
        decryptionKey = key;
        // 默认授权部署者为调用者
        authorizedCallers[msg.sender] = true;
    }

    /**
     * @dev 分发代币：接收加密的价值哈希和钱包地址，解密后发放代币
     * @param valueHash 加密的价值哈希（通过 keccak256(abi.encodePacked(amount, decryptionKey)) 生成）
     * @param recipient 接收代币的钱包地址
     */
    function distributeTokens(
        bytes32 valueHash,
        address recipient
    ) external nonReentrant {
        require(recipient != address(0), unicode"无效的钱包地址");
        require(!usedValueHashes[valueHash], unicode"价值哈希已使用");

        // 尝试解密价值哈希
        // 由于Solidity无法直接"解密"，我们需要验证哈希是否匹配
        // 实际上，我们需要通过枚举或存储授权金额的方式
        // 这里使用更实用的方法：存储授权金额的映射
        uint256 amount = authorizedAmounts[valueHash];
        require(amount > 0, unicode"无效的价值哈希");
        require(
            amount >= MIN_AMOUNT && amount <= MAX_AMOUNT,
            unicode"代币数量超出范围"
        );

        // 标记价值哈希已使用
        usedValueHashes[valueHash] = true;

        // 发放代币
        _mint(recipient, amount);

        emit TokensDistributed(recipient, valueHash, amount);
        emit ValueHashUsed(valueHash);
    }

    /**
     * @dev 授权价值哈希对应的代币数量（由合约所有者调用）
     * 后端在调用合约前，先调用此函数授权对应的金额
     * @param valueHash 价值哈希
     * @param amount 对应的代币数量
     */
    function authorizeAmount(
        bytes32 valueHash,
        uint256 amount
    ) external onlyOwner {
        require(
            amount >= MIN_AMOUNT && amount <= MAX_AMOUNT,
            unicode"代币数量超出范围"
        );
        authorizedAmounts[valueHash] = amount;
        emit AmountAuthorized(valueHash, amount);
    }

    /**
     * @dev 批量授权价值哈希对应的代币数量
     */
    function batchAuthorizeAmounts(
        bytes32[] memory valueHashes,
        uint256[] memory amounts
    ) external onlyOwner {
        require(valueHashes.length == amounts.length, unicode"数组长度不匹配");
        for (uint256 i = 0; i < valueHashes.length; i++) {
            require(
                amounts[i] >= MIN_AMOUNT && amounts[i] <= MAX_AMOUNT,
                unicode"代币数量超出范围"
            );
            authorizedAmounts[valueHashes[i]] = amounts[i];
            emit AmountAuthorized(valueHashes[i], amounts[i]);
        }
    }

    /**
     * @dev 设置授权调用者（可选：限制谁可以调用distributeTokens）
     */
    function setAuthorizedCaller(
        address caller,
        bool authorized
    ) external onlyOwner {
        authorizedCallers[caller] = authorized;
        emit CallerAuthorized(caller, authorized);
    }

    /**
     * @dev 检查价值哈希是否已使用
     */
    function isValueHashUsed(bytes32 valueHash) external view returns (bool) {
        return usedValueHashes[valueHash];
    }

    /**
     * @dev 获取授权的代币数量（通过价值哈希）
     */
    function getAuthorizedAmount(
        bytes32 valueHash
    ) external view returns (uint256) {
        return authorizedAmounts[valueHash];
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
