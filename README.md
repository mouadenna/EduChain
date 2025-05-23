# EduChain – Decentralized Learning Platform

## 🚀 Overview

EduChain is a decentralized e-learning platform built on the Ethereum blockchain. It empowers:

- **Teachers** to create, publish and monetize courses directly—no intermediaries.
- **Students** to browse, purchase and complete courses using ETH, earning immutable, verifiable certificates on-chain.

By leveraging smart contracts, EduChain ensures transparent payments, tamper-proof certificates and complete ownership of educational assets.

---

## 🏗️ Architecture

```text
┌───────────────┐             ┌───────────────┐                ┌───────────────────┐
│   Frontend    │ ↔ Web3.js   │ Smart Contract│  ↔ Ganache/    │   Ethereum        │
│  (React +     │ /ethers.js  │ EduChain.sol  │  Etherscan     │   Mainnet/Testnet │
│   MetaMask)   │             │ (Solidity)    │                │                   │
└───────────────┘             └───────────────┘                └───────────────────┘
```

1. **Frontend (React)**
   - UI components & pages interact with the blockchain via a Web3 Context.
   - Users connect via MetaMask; requests go through `ethers.js` / `@metamask/detect-provider`.

2. **Smart Contracts (Solidity)**
   - `contracts/EduChain.sol` manages courses, enrollment, progress tracking, certificate issuance & verification.
   - Built with OpenZeppelin's `Ownable` + `Counters` for access control and unique IDs.

3. **Local Blockchain & Deployment**
   - Ganache: local Ethereum network for development/testing.
   - Truffle: compile, migrate and test contracts.
   - `verify-contract.js`: script to verify contracts on Etherscan.

---

## 🛠️ Technology Stack

| Layer               | Technology / Library                | Role                                                         |
|---------------------|-------------------------------------|--------------------------------------------------------------|
| Smart Contracts     | Solidity, OpenZeppelin              | Business logic, ownership, counters, security primitives     |
| Development & Deploy| Truffle, Ganache, `truffle-config.js`| Compile, migrate, local chain, network configuration        |
| Contract Verification | `verify-contract.js`, Etherscan API| Publish & verify source on Etherscan                         |
| Frontend Framework  | React.js                            | Component-based UI                                          |
| State Management    | React Context (`Web3Context.js`)    | Provider, signer, contract instance, account state           |
| Blockchain Interaction | ethers.js, @metamask/detect-provider | RPC calls, transactions, event decoding                     |
| Wallet Integration  | MetaMask                            | User authentication, account & network management            |
| Utility Helpers     | `client/src/utils/contractHelpers.js`| CRUD helpers for courses, enrollment, modules, certificates|
| Bundling & Build    | Webpack (`webpack.config.js`)       | Transpile, bundle assets for production                     |
| Runtime             | Node.js, npm                        | Package management, scripts, CLI tooling                     |

---

## 📁 Project Structure

```text
├── contracts/              # Solidity smart contracts
│   └── EduChain.sol
├── migrations/             # Truffle migrations
├── test/                   # Truffle tests (JavaScript)
├── build/                  # Compiled contracts & ABIs
├── client/                 # React frontend
│   ├── public/             # Static assets, index.html
│   ├── src/
│   │   ├── contexts/       # Web3Context.js
│   │   ├── components/     # Navbar, CourseCard, CertificateCard, Footer
│   │   ├── pages/          # Home, Login, CreateCourse, Dashboards, etc.
│   │   ├── utils/          # contractHelpers.js (course CRUD, enrollment, modules, certificates)
│   │   └── index.js, App.js
│   └── webpack.config.js
├── truffle-config.js       # Network, compiler settings
├── verify-contract.js      # Etherscan verification script
├── package.json            # Root dependencies & scripts
└── README.md               # This documentation
```

---

## 🔍 Smart Contract Details (`contracts/EduChain.sol`)

### Data Structures

- **Course** – id, teacher, title, description, price (wei), content URL, module count.
- **StudentProgress** – enrollment flag, completed modules mapping, count, pass status.
- **Certificate** – id, student address, courseId, timestamp, issued flag.

### Core Functions

1. **`createCourse(...) → uint256`**
   - _Only payable by teacher._
   - Registers a new course; emits `CourseCreated(courseId, teacher, title, price)`.

2. **`enrollInCourse(uint256 courseId) payable`**
   - Students pay `msg.value` ≥ course.price; auto-transfers ETH to teacher.
   - Initializes `StudentProgress`; emits `CourseEnrollment(courseId, student)`.

3. **`completeModule(courseId, moduleIndex)`**
   - Marks a module as completed; emits `ModuleCompleted`.
   - If all modules done → `coursePassed=true`, emit `CourseCompleted`.

4. **`issueCertificate(courseId)`**
   - Only if `coursePassed==true` & no prior certificate.
   - Mints new `Certificate`, emits `CertificateIssued(certificateId, student, courseId, timestamp)`.

5. **View/Getter Functions**
   - `getCourseCount()`, `getTeacherCourses(address)`, `getStudentCourses(address)`, `getStudentProgress(...)`, `verifyCertificate(certificateId, student, courseId)`.

---

## 🧪 Testing & Migrations

- **Migrations** – `/migrations/1_deploy_contracts.js` deploys `EduChain.sol` to configured network.
- **Tests** – `/test/` contains JS tests (Mocha/Chai) to validate:
  - Course creation
  - Enrollment & payments
  - Module completion logic
  - Certificate issuance & verification

Run:
```bash
truffle test
```

---

## 💻 Frontend & Web3 Integration

### Web3 Context (`client/src/contexts/Web3Context.js`)

- Detects Ethereum provider (MetaMask).
- Initializes `ethers.BrowserProvider`, network checks (Ganache vs Mainnet/Testnet).
- Manages `account`, `signer`, `contract` instance.
- Exposes:
  - `connectWallet(userType)`, `switchAccount()`, `disconnectWallet()`.
  - `loading` & `error` state for UX feedback.

### Contract Helpers (`client/src/utils/contractHelpers.js`)

- **CRUD** helpers wrapping contract calls:
  - `getAllCourses()`, `getCourse(id)`
  - `getTeacherCourses(addr)`, `getStudentCourses(addr)`
  - `createCourse(...)` with price conversion & event parsing
  - `enrollInCourse(...)`, `completeModule(...)`
  - `getStudentProgress(...)`, `issueCertificate(...)`, `getStudentCertificates(addr)`

### Pages & Components

- **Pages**:
  - `Home.js` – landing & course listing
  - `Login.js` – choose Teacher/Student role
  - `CreateCourse.js` – teacher form
  - `CourseDetails.js` – course overview, enroll & modules
  - `TeacherDashboard.js`, `StudentDashboard.js` – personalized views
  - `Certificates.js` – view & verify certificates

- **Components**:
  - `CourseCard.js` – course preview
  - `CertificateCard.js` – shows issued certificates
  - `Navbar.js` & `Footer.js` – navigation & layout

---

## ⚙️ Setup & Deployment

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