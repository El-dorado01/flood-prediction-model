// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract FloodPredictor is Ownable {
    // Enums and Structs
    enum ThreatLevel { Low, Medium, High }
    
    struct InvestorDeposit {
        uint256 amount;
        uint256 depositTime;
        bool withdrawn;
    }

    // State variables
    uint256 public waterLevel; // e.g., 123 = 1.23 meters
    uint256 public tidePrediction; // e.g., high tide height
    uint256 public currentSpeed; // e.g., current speed in cm/s * 100
    ThreatLevel public currentThreatLevel;
    
    // Thresholds for flood risk
    uint256 public constant WATER_LEVEL_THRESHOLD = 200; // 2.00 meters
    uint256 public constant TIDE_THRESHOLD = 150; // 1.50 meters
    uint256 public constant CURRENT_THRESHOLD = 200; // 2.00 cm/s
    
    // Funding parameters
    uint256 public constant INVESTMENT_DURATION = 365 days;
    uint256 public constant INTEREST_RATE = 500; // 5% (in basis points, 100 = 1%)
    uint256 public totalSponsorFunds;
    uint256 public totalInvestorFunds;
    
    // Mappings
    mapping(address => InvestorDeposit) public investorDeposits;
    mapping(address => bool) public isBeneficiary;
    address[] public beneficiaries;
    address[] public investors; // Track investors for automatic withdrawals

    // Events
    event DataUpdated(uint256 waterLevel, uint256 tidePrediction, uint256 currentSpeed);
    event ThreatLevelUpdated(ThreatLevel level);
    event SponsorDeposited(address indexed sponsor, uint256 amount);
    event InvestorDeposited(address indexed investor, uint256 amount);
    event BeneficiaryAdded(address indexed beneficiary);
    event FundsDisbursedToBeneficiaries(uint256 totalAmount);
    event InvestorWithdrawn(address indexed investor, uint256 amount, bool withInterest);
    
    constructor() Ownable(msg.sender) {}

    // Sponsor deposits (no return expected, non-withdrawable)
    function depositAsSponsor() external payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        totalSponsorFunds += msg.value;
        emit SponsorDeposited(msg.sender, msg.value);
    }

    // Investor deposits (allow multiple deposits, add to balance)
    function depositAsInvestor() external payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        
        InvestorDeposit storage deposit = investorDeposits[msg.sender];
        if (deposit.amount == 0) {
            // New investor
            investors.push(msg.sender);
            deposit.depositTime = block.timestamp;
        } else {
            // Existing investor: update deposit time (reset to latest for simplicity)
            deposit.depositTime = block.timestamp;
        }
        
        deposit.amount += msg.value;
        deposit.withdrawn = false;
        totalInvestorFunds += msg.value;
        emit InvestorDeposited(msg.sender, msg.value);
    }

    // Add beneficiary (only owner)
    function addBeneficiary(address _beneficiary) external onlyOwner {
        require(!isBeneficiary[_beneficiary], "Already a beneficiary");
        isBeneficiary[_beneficiary] = true;
        beneficiaries.push(_beneficiary);
        emit BeneficiaryAdded(_beneficiary);
    }

    // Update metrics (only owner)
    function updateAllMetrics(
        uint256 _waterLevel,
        uint256 _tidePrediction,
        uint256 _currentSpeed
    ) external onlyOwner {
        waterLevel = _waterLevel;
        tidePrediction = _tidePrediction;
        currentSpeed = _currentSpeed;
        emit DataUpdated(_waterLevel, _tidePrediction, _currentSpeed);
        
        // Update threat level and process withdrawals or disbursements
        updateThreatLevel();
    }

    // Internal function to assess threat level and trigger actions
    function updateThreatLevel() internal {
        ThreatLevel previousThreatLevel = currentThreatLevel;
        
        if (waterLevel > WATER_LEVEL_THRESHOLD &&
            tidePrediction > TIDE_THRESHOLD &&
            currentSpeed > CURRENT_THRESHOLD) {
            currentThreatLevel = ThreatLevel.High;
            // Disburse funds to beneficiaries if high threat
            disburseFundsToBeneficiaries();
        } else if (waterLevel > WATER_LEVEL_THRESHOLD / 2 ||
                   tidePrediction > TIDE_THRESHOLD / 2 ||
                   currentSpeed > CURRENT_THRESHOLD / 2) {
            currentThreatLevel = ThreatLevel.Medium;
            // Process investor withdrawals if duration elapsed
            if (previousThreatLevel != ThreatLevel.High) {
                processInvestorWithdrawals();
            }
        } else {
            currentThreatLevel = ThreatLevel.Low;
            // Process investor withdrawals if duration elapsed
            if (previousThreatLevel != ThreatLevel.High) {
                processInvestorWithdrawals();
            }
        }
        emit ThreatLevelUpdated(currentThreatLevel);
    }

    // Disburse funds to beneficiaries (called automatically on high threat)
    function disburseFundsToBeneficiaries() internal {
        if (beneficiaries.length == 0) return;
        
        uint256 totalFunds = totalSponsorFunds + totalInvestorFunds;
        if (totalFunds == 0) return;
        
        uint256 amountPerBeneficiary = totalFunds / beneficiaries.length;
        
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            address beneficiary = beneficiaries[i];
            if (isBeneficiary[beneficiary]) {
                (bool success, ) = beneficiary.call{value: amountPerBeneficiary}("");
                require(success, "Transfer to beneficiary failed");
            }
        }
        
        // Clear funds and investor deposits
        totalSponsorFunds = 0;
        totalInvestorFunds = 0;
        for (uint256 i = 0; i < investors.length; i++) {
            investorDeposits[investors[i]].withdrawn = true;
        }
        investors = new address[](0); // Reset investors array
        emit FundsDisbursedToBeneficiaries(totalFunds);
    }

    // Automatic withdrawal for investors (called internally or externally)
    function processInvestorWithdrawals() internal {
        for (uint256 i = 0; i < investors.length; ) {
            address investor = investors[i];
            InvestorDeposit storage deposit = investorDeposits[investor];
            
            if (deposit.amount > 0 &&
                !deposit.withdrawn &&
                block.timestamp >= deposit.depositTime + INVESTMENT_DURATION &&
                currentThreatLevel != ThreatLevel.High) {
                
                deposit.withdrawn = true;
                uint256 amount = deposit.amount;
                uint256 interest = (amount * INTEREST_RATE) / 10000; // 5% interest
                uint256 totalPayout = amount + interest;
                
                totalInvestorFunds -= amount;
                
                (bool success, ) = investor.call{value: totalPayout}("");
                require(success, "Withdrawal to investor failed");
                emit InvestorWithdrawn(investor, totalPayout, true);
                
                // Remove from investors array
                investors[i] = investors[investors.length - 1];
                investors.pop();
            } else {
                i++; // Only increment if not removed
            }
        }
    }

    // External function to trigger withdrawals (for redundancy)
    function triggerInvestorWithdrawals() external {
        require(currentThreatLevel != ThreatLevel.High, "Cannot withdraw during high threat");
        processInvestorWithdrawals();
    }

    // View function to check contract balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // View function to check investor deposit details
    function getInvestorDeposit(address _investor) external view returns (uint256 amount, uint256 depositTime, bool withdrawn) {
        InvestorDeposit memory deposit = investorDeposits[_investor];
        return (deposit.amount, deposit.depositTime, deposit.withdrawn);
    }
}