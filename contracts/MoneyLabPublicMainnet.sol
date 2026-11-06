// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.30;

/// @notice Educational mainnet pilot points only. No ERC20 transfers, approvals, purchases or withdrawals.
/// Results are attested by the Money Lab server; this is NOT trustless game execution.
contract MoneyLabPublicMainnet {
    uint256 public constant CHAIN_ID = 196;
    string public constant name = "Money Lab Public Mainnet HUB";
    string public constant symbol = "HUB";
    uint8 public constant decimals = 0;
    address public attestor;
    address public deployer;
    bytes32 constant DOMAIN_TYPE = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 constant RESULT_TYPE = keccak256("Result(address player,bytes32 runId,uint8 level,uint8 score,bool survived,bytes32 resultHash,uint256 deadline)");
    uint256 constant HALF_N = 0x7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0;
    struct Active { bytes32 runId; uint8 level; uint256 bond; }
    struct Result { address player; bytes32 runId; uint8 level; uint8 score; bool survived; bytes32 resultHash; uint256 deadline; }
    struct Outcome { address player; uint8 level; uint8 score; bool survived; bool won; uint256 reward; bytes32 resultHash; }
    mapping(address => bool) public registered;
    mapping(address => uint256) public balanceOf;
    mapping(address => uint256) public nonce;
    mapping(address => uint8) public unlocked;
    mapping(address => Active) public active;
    mapping(bytes32 => Outcome) public results;
    event Registered(address indexed player, uint256 grant);
    event RunStarted(address indexed player, bytes32 indexed runId, uint8 level, uint256 bond);
    event RunSettled(address indexed player, bytes32 indexed runId, uint8 level, uint8 score, bool won, uint256 reward, bytes32 resultHash);
    event RunAbandoned(address indexed player, bytes32 indexed runId, uint256 lostBond);
    constructor(address resultAttestor) {
        require(block.chainid == CHAIN_ID, "MAINNET_ONLY");
        require(msg.sender == address(bytes20(hex"1839231f7fc0d55a3ec58736574aca13f711326d")), "PILOT_OWNER_ONLY");
        require(resultAttestor != address(0), "ZERO_ATTESTOR");
        attestor = resultAttestor; deployer = msg.sender;
    }
    function register() external {
        require(!registered[msg.sender], "ALREADY_REGISTERED");
        registered[msg.sender] = true; balanceOf[msg.sender] = 80;
        emit Registered(msg.sender, 80);
    }
    function startRun(uint8 level) external {
        require(registered[msg.sender] && level <= 2 && level <= unlocked[msg.sender], "LEVEL_LOCKED");
        require(active[msg.sender].runId == bytes32(0), "ACTIVE_RUN");
        uint256 bond = level == 0 ? 0 : level == 1 ? 40 : 80;
        require(balanceOf[msg.sender] >= bond, "INSUFFICIENT_HUB");
        balanceOf[msg.sender] -= bond;
        bytes32 runId = keccak256(abi.encode(address(this), block.chainid, msg.sender, ++nonce[msg.sender]));
        active[msg.sender] = Active(runId, level, bond);
        emit RunStarted(msg.sender, runId, level, bond);
    }
    function domainSeparator() public view returns (bytes32) {
        return keccak256(abi.encode(DOMAIN_TYPE, keccak256(bytes("Money Lab Mainnet Pilot")), keccak256(bytes("1")), block.chainid, address(this)));
    }
    function settle(Result calldata r, bytes calldata signature) external {
        require(r.player == msg.sender && r.deadline >= block.timestamp && r.score <= 100, "INVALID_RESULT");
        Active memory a = active[msg.sender];
        require(a.runId != bytes32(0) && a.runId == r.runId && a.level == r.level, "WRONG_RUN");
        require(signature.length == 65, "INVALID_SIGNATURE");
        bytes32 rs; bytes32 ss; uint8 v;
        assembly { rs := calldataload(signature.offset) ss := calldataload(add(signature.offset,32)) v := byte(0,calldataload(add(signature.offset,64))) }
        require(uint256(ss) <= HALF_N && (v == 27 || v == 28), "INVALID_SIGNATURE");
        bytes32 body = keccak256(abi.encode(RESULT_TYPE,r.player,r.runId,r.level,r.score,r.survived,r.resultHash,r.deadline));
        require(ecrecover(keccak256(abi.encodePacked(hex"1901",domainSeparator(),body)),v,rs,ss) == attestor, "UNTRUSTED_RESULT");
        uint8 target = a.level == 0 ? 60 : a.level == 1 ? 70 : 75;
        bool won = r.survived && r.score >= target;
        uint256 reward;
        if (won) {
            reward = (a.level == 0 ? 12 : a.level == 1 ? 28 : 60) + uint256((r.score-target)/5)*(a.level == 0 ? 2 : a.level == 1 ? 3 : 4);
            balanceOf[msg.sender] += a.bond + reward;
            if (a.level < 2 && unlocked[msg.sender] <= a.level) unlocked[msg.sender] = a.level + 1;
        }
        delete active[msg.sender];
        results[r.runId] = Outcome(msg.sender,r.level,r.score,r.survived,won,reward,r.resultHash);
        emit RunSettled(msg.sender,r.runId,r.level,r.score,won,reward,r.resultHash);
    }
    function abandon() external {
        Active memory a = active[msg.sender]; require(a.runId != bytes32(0), "NO_ACTIVE_RUN");
        delete active[msg.sender]; emit RunAbandoned(msg.sender,a.runId,a.bond);
    }
}
