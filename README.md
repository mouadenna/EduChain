# EduChain - Decentralized Learning Platform

EduChain is a decentralized e-learning platform built on the Ethereum blockchain. It allows teachers to create and publish courses, while students can purchase courses using ETH and earn verifiable certificates stored on the blockchain.

## Features

- **For Teachers:**
  - Create and publish courses
  - Set course prices in ETH
  - Track student enrollments and progress
  - Receive direct payments without intermediaries

- **For Students:**
  - Browse available courses
  - Pay with ETH to enroll in courses
  - Track progress through course modules
  - Earn blockchain-verified certificates

- **Blockchain Benefits:**
  - Transparent payment system
  - Immutable certificates
  - Verified course completion
  - Secure and decentralized

## Technology Stack

- **Smart Contracts:** Solidity
- **Frontend:** React.js
- **Blockchain Interaction:** ethers.js, web3.js
- **Wallet Integration:** MetaMask
- **Development Tools:** Truffle, Ganache

## Getting Started

### Prerequisites

- Node.js and npm
- Truffle
- Ganache (for local blockchain)
- MetaMask browser extension

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/educhain.git
   cd educhain
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Install client dependencies:
   ```
   cd client
   npm install
   cd ..
   ```

4. Start Ganache to run a local blockchain.

5. Compile and deploy smart contracts:
   ```
   truffle compile
   truffle migrate --reset
   ```

6. Update the contract address in `client/src/contexts/Web3Context.js` with the deployed contract address.

   **IMPORTANT:** The application will not work without this step! The contract address is displayed in the console after running `truffle migrate --reset`. Look for a line like:
   ```
   Contract deployed at: 0x1234...
   ```
   
   Then update the CONTRACT_ADDRESS in Web3Context.js:
   ```javascript
   const CONTRACT_ADDRESS = '0x1234...'; // Replace with your actual contract address
   ```

7. Run the client application:
   ```
   cd client
   npm start
   ```

8. Open your browser and navigate to `http://localhost:3000`.

## Smart Contract Structure

The EduChain platform is centered around the EduChain.sol contract, which manages:

- Course creation and enrollment
- Student progress tracking
- Certificate issuance and verification

## Frontend Structure

- **Components:** Reusable UI components
- **Pages:** Main application views
- **Contexts:** Web3 and blockchain state management
- **Utils:** Helper functions for contract interactions

## Usage

1. Connect your MetaMask wallet and choose your role (teacher or student).
2. Teachers can create courses, defining title, description, price, and content.
3. Students can browse available courses and enroll by paying the required ETH.
4. Students complete course modules and earn certificates upon completion.
5. Certificates are stored on the blockchain and can be verified by anyone.

## Troubleshooting

### Common Issues

1. **"Failed to create course" error:**
   - Make sure you've updated the CONTRACT_ADDRESS in `client/src/contexts/Web3Context.js`
   - Ensure you're connected to the same network where the contract is deployed
   - Check that your MetaMask wallet has sufficient ETH for gas fees
   - Verify you're logged in as a teacher, not a student
   - Check browser console for more detailed error messages

2. **MetaMask connection issues:**
   - Make sure MetaMask is installed and unlocked
   - Connect to the correct network (local Ganache, testnet, or mainnet)
   - Try refreshing the page or reconnecting your wallet

3. **Contract interaction failures:**
   - Verify the contract ABI matches your deployed contract
   - Ensure the contract is properly deployed and initialized
   - Check that you have the correct permissions for the operation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenZeppelin for secure contract libraries
- Ethereum community for blockchain resources
- React community for frontend tools and resources