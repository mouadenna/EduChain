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

1. **Prerequisites**
   - Node.js & npm ≥ 14
   - Truffle CLI
   - Ganache (CLI or GUI)
   - MetaMask browser extension

2. **Install dependencies**
   ```bash
git clone https://github.com/your-username/educhain.git
cd educhain
npm install
cd client
npm install
cd ..
``` 

3. **Run local blockchain**
   ```bash
ganache-cli
``` 

4. **Compile & deploy contracts**
   ```bash
truffle compile
truffle migrate --reset --network development
``` 

5. **Verify on Etherscan (optional)**
   ```bash
node verify-contract.js --network <rinkeby|ropsten> --address <DEPLOYED_ADDRESS>
``` 

6. **Update frontend contract address**
   In `client/src/contexts/Web3Context.js`:
   ```js
const CONTRACT_ADDRESS = '0xYourDeployedAddress';
``` 

7. **Start the React app**
   ```bash
cd client
npm start
``` 

8. **Visit** `http://localhost:3000` in your browser.

---

## 🔒 Security & Best Practices

- Used OpenZeppelin's audited libraries (`Ownable`, `Counters`).
- Input validation & `require` checks on critical operations.
- Payments forwarded directly to teacher's address.
- Immutable certificate records on-chain.

---

## 📝 License & Acknowledgments

- MIT License — see [`LICENSE`](LICENSE)
- Thanks to:
  - OpenZeppelin for smart contract standards
  - Ethereum & Truffle communities for tooling
  - React ecosystem for UI libraries

---

**Ready to build, learn & teach—fully on-chain!**
