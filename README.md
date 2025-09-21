# FloodPredictor dApp

A decentralized application that leverages real-time NOAA weather data and blockchain technology to provide flood prediction and community-driven disaster relief funding.

## Live Demo
- https://flood-prediction-model-seven-vercel.app

## Overview

FloodPredictor combines meteorological data with smart contract automation to create a transparent, trustless system for flood risk assessment and emergency fund distribution. The system automatically monitors water levels, tide predictions, and current speeds to determine flood threat levels and manage community funds accordingly.

## Core Features

### 1. Real-Time Flood Monitoring
- **NOAA Data Integration**: Fetches live water level, tide predictions, and current speed data
- **Automated Risk Assessment**: Calculates flood risk based on configurable thresholds
- **Threat Level Classification**: Categorizes risk as Low, Medium, or High
- **Decentralized Updates**: Anyone can update metrics on-chain (no ownership restrictions)

### 2. Community Funding System
- **Sponsor Deposits**: Non-refundable contributions for disaster relief
- **Investor Deposits**: Refundable investments with 5% annual interest
- **Direct Deposit Support**: Automatic handling of direct ETH transfers as sponsor funds
- **Transparent Fund Tracking**: Real-time visibility of all fund allocations

### 3. Automated Fund Distribution
- **Beneficiary Management**: Owner-controlled list of relief recipients
- **Automatic Disbursement**: Funds automatically distributed during high threat events
- **Safety Mechanisms**: Requires at least one beneficiary before disbursement
- **Manual Override**: Owner can trigger emergency disbursements

### 4. Investor Protection
- **Time-Locked Returns**: Investments mature after 365 days
- **Interest Payments**: 5% annual return on successful withdrawals
- **Risk-Based Restrictions**: No withdrawals during high threat periods
- **Automatic Processing**: System handles withdrawals when conditions are met

## Smart Contract Architecture

### Core Components

#### State Variables
- Water level measurements (scaled by 100 for precision)
- Tide predictions and current speeds
- Threat level classifications
- Fund tracking (sponsors vs investors)
- Beneficiary registry

#### Key Functions

**Public Functions:**
- `updateAllMetrics()` - Update flood data (callable by anyone)
- `depositAsSponsor()` - Make non-refundable deposits
- `depositAsInvestor()` - Make interest-bearing investments
- `triggerInvestorWithdrawals()` - Process matured investments

**Owner Functions:**
- `addBeneficiary()` - Add disaster relief recipients
- `manualDisbursement()` - Emergency fund distribution

**View Functions:**
- `getContractBalance()` - Check total contract funds
- `getInvestorDeposit()` - Check individual investment details
- `getBeneficiaryCount()` - Get number of registered beneficiaries
- `canDisburseOnHighThreat()` - Check if automatic disbursement is possible

### Security Features

#### Fund Protection
- Funds cannot be disbursed without registered beneficiaries
- Time locks prevent premature investor withdrawals
- Automatic processing reduces manual intervention risks
- Event logging for complete transaction transparency

#### Access Controls
- Owner-only beneficiary management
- Public metric updates (democratized data input)
- Investor self-service withdrawals when eligible
- Emergency manual disbursement by owner only

## Technical Implementation

### Frontend Stack
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **ethers.js v6** - Ethereum interaction

### Smart Contract
- **Solidity ^0.8.0** - Smart contract language
- **OpenZeppelin** - Security-audited contract libraries
- **BlockDAG Network** - Deployment network
- **Gas Optimized** - Efficient transaction processing

### Data Sources
- **NOAA API** - Real-time weather and water data
- **Tide Stations** - Coastal water level monitoring
- **Current Speed Sensors** - Water flow measurements

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- MetaMask wallet browser extension
- BlockDAG network configuration in MetaMask

### Installation

1. Clone the repository:
```bash
git clone https://github.com/El-dorado01/floodpredictor-dapp
cd floodpredictor-dapp
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your configuration:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # Deployed contract address
NEXT_PUBLIC_CHAIN_ID=1043         # BlockDAG testnet
NEXT_PUBLIC_RPC_URL=https://rpc.primordial.bdagscan.com   # BlockDAG RPC endpoint
```

5. Start the development server:
```bash
npm run dev
```

### Deployment

1. Deploy the smart contract

2. Update the contract address in `.env.local`

3. Build and deploy the frontend:
```bash
npm run build
npm run start
```

## Usage Guide

### For Sponsors (Donors)
1. Connect your MetaMask wallet
2. Click "Sponsor Deposit" 
3. Enter deposit amount in ETH
4. Confirm transaction
5. Funds are permanently committed to disaster relief

### For Investors
1. Connect your MetaMask wallet
2. Click "Investor Deposit"
3. Enter investment amount in ETH
4. Wait 365 days for maturity
5. Claim 5% interest if no high-threat disbursements occur

### For Data Contributors
1. Connect any wallet to the dApp
2. Click "Fetch NOAA Data" to retrieve current metrics
3. Review the flood risk assessment
4. Click "Send to Contract" to update on-chain data
5. System automatically processes threat level changes

### For Contract Owners
1. Add beneficiary addresses using "Add Beneficiary"
2. Monitor threat levels and fund distributions
3. Use "Manual Disbursement" for emergency situations
4. Manage beneficiary list as needed

## Flood Risk Thresholds

The system uses the following default thresholds for threat assessment:

- **Water Level**: 2.00m (High Threat Threshold)
- **Tide Prediction**: 1.50m (High Threat Threshold)  
- **Current Speed**: 2.00 cm/s (High Threat Threshold)

**Threat Levels:**
- **Low**: All metrics below 50% of thresholds
- **Medium**: Any metric between 50-100% of threshold
- **High**: All metrics exceed thresholds (triggers disbursement)

## API Endpoints

### NOAA Data Fetching
```
GET /api/noaa?type=all
```
Returns current water levels, tide predictions, and current speeds from configured NOAA stations.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Security Considerations

### Smart Contract Security
- Uses OpenZeppelin's audited libraries
- Implements checks-effects-interactions pattern
- Protected against reentrancy attacks
- Comprehensive input validation

### Frontend Security
- No private key storage in browser
- All transactions signed via MetaMask
- HTTPS-only communication
- Input sanitization and validation

### Data Integrity
- Multiple data source validation
- On-chain data immutability
- Event logging for audit trails
- Threshold-based automated responses

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For technical support or questions:
- Open an issue on GitHub
- Contact the development team
- Check the documentation wiki

## Disclaimer

This system is designed for disaster relief coordination and should not be the sole method for flood monitoring. Always follow official emergency services guidance during actual flood events. Smart contract interactions involve financial risk - only deposit funds you can afford to lose.