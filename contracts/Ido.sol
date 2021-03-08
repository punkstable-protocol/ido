pragma solidity ^0.6.12;

library MerkleProof {
    /**
     * @dev Returns true if a `leaf` can be proved to be a part of a Merkle tree
     * defined by `root`. For this, a `proof` must be provided, containing
     * sibling hashes on the branch from the leaf to the root of the tree. Each
     * pair of leaves and each pair of pre-images are assumed to be sorted.
     */
    function verify(bytes32[] memory proof, bytes32 root, bytes32 leaf) internal pure returns (bool) {
        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];

            if (computedHash <= proofElement) {
                // Hash(current computed hash + current element of the proof)
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                // Hash(current element of the proof + current computed hash)
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }

        // Check if the computed hash (root) is equal to the provided root
        return computedHash == root;
    }
}

interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract Ido {
    address private creator;
    
    address public riceToken;
    uint256 public startBlock;
    uint256 public exchangeRate = 2;
    uint256 public maxAllocation = 100 * 1e18;  // 18 decimals
    uint256 public maxFundsRaised;
    uint256 public totalRaise;
    uint256 public heldTotal;
    address payable public ETHWallet;
    bool public transferStats = true;
    bool public isFunding = true;
    
    bytes32 public merkleRoot;

    mapping(address => uint256) public heldTokens;
    mapping(address => uint256) public heldTimeline;

    event Contribution(address from, uint256 amount);
    event ReleaseTokens(address from, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == creator, "Ownable: caller is not the owner");
        _;
    }

    modifier checkStart(){
        require(block.number >= startBlock, "The project has not yet started");
        _;
    }

    constructor(
        address payable _wallet,
        address _riceToken,
        uint256 _maxFundsRaised,
        uint256 _startBlock
    ) public {
        startBlock = _startBlock;   // One block in 3 seconds, 24h hours later ( current block + 28800  )
        maxFundsRaised = _maxFundsRaised;   // 18 decimals
        ETHWallet = _wallet;
        creator = msg.sender;
        riceToken = _riceToken;
    }

    function closeSale() external onlyOwner {
        isFunding = false;
    }

    function setMerkleRoot(bytes32 _merkleRoot) public onlyOwner{
        merkleRoot = _merkleRoot;
    }

    // CONTRIBUTE FUNCTION
    // converts ETH to TOKEN and sends new TOKEN to the sender
    // receive() external payable checkStart {
    //     require(msg.value > 0 && msg.value <= maxAllocation, "The subscription quantity exceeds the limit");
    //     require(heldTokens[msg.sender] == 0, "Number of times exceeded");
    //     require(isFunding, "ido is closed");
    //     require(totalRaise + msg.value <= maxFundsRaised);

    //     // Verify the merkle proof.
    //     // bytes32 node = keccak256(abi.encodePacked(index, account, amount));
    //     // require(MerkleProof.verify(merkleProof, merkleRoot, node), 'Whitelist: Invalid proof.');

    //     uint256 heldAmount = exchangeRate * msg.value;
    //     totalRaise += msg.value;
    //     if (totalRaise == maxFundsRaised){
    //         isFunding = false;
    //     }
    //     ETHWallet.transfer(msg.value);
    //     createHoldToken(msg.sender, heldAmount);
    //     emit Contribution(msg.sender, heldAmount);
    // }

    // CONTRIBUTE FUNCTION
    // converts ETH to TOKEN and sends new TOKEN to the sender
    function contribute(uint256 index, address account, uint256 amount, bytes32[] calldata merkleProof) external payable checkStart {
        require(msg.value > 0 && msg.value <= maxAllocation, "The subscription quantity exceeds the limit");
        require(heldTokens[msg.sender] == 0, "Number of times exceeded");
        require(isFunding, "ido is closed");
        require(totalRaise + msg.value <= maxFundsRaised);

        // Verify the merkle proof.
        bytes32 node = keccak256(abi.encodePacked(index, account, amount));
        require(MerkleProof.verify(merkleProof, merkleRoot, node), 'Whitelist: Invalid proof.');

        uint256 heldAmount = exchangeRate * msg.value;
        totalRaise += msg.value;
        if (totalRaise == maxFundsRaised){
            isFunding = false;
        }
        ETHWallet.transfer(msg.value);
        createHoldToken(msg.sender, heldAmount);
        emit Contribution(msg.sender, heldAmount);
    }

    // update the ETH/COIN rate
    function updateRate(uint256 rate) external onlyOwner {
        require(isFunding, "ido is closed");
        exchangeRate = rate;
    }

    // change creator address
    function changeCreator(address _creator) external onlyOwner {
        creator = _creator;
    }

    // change transfer status for ERC20 token
    function changeTransferStats(bool _allowed) external onlyOwner {
        transferStats = _allowed;
    }

    // public function to get the amount of tokens held for an address
    function getHeldCoin(address _address) public view returns (uint256) {
        return heldTokens[_address];
    }

    // function to create held tokens for developer
    function createHoldToken(address _to, uint256 amount) internal {
        heldTokens[_to] = amount;
        heldTimeline[_to] = block.number;
        heldTotal += amount;
    }

    // function to release held tokens for developers
    function releaseHeldCoins() external checkStart {
        require(!isFunding, "Haven't reached the claim goal");
        require(heldTokens[msg.sender] >= 0, "Number of holdings is 0");
        require(block.number >= heldTimeline[msg.sender], "Abnormal transaction");
        require(transferStats, "Transaction stopped");
        uint256 held = heldTokens[msg.sender];
        heldTokens[msg.sender] = 0;
        heldTimeline[msg.sender] = 0;
        IERC20(riceToken).transfer(msg.sender, held);
        emit ReleaseTokens(msg.sender, held);
    }
}
