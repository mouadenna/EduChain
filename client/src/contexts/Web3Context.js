import React, { createContext, useState, useEffect, useCallback } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';
import EduChainABI from '../contracts/EduChain.json';

// Contract address will be updated after deployment
const CONTRACT_ADDRESS = '0x60414180bf80dCF65B391f9e6e59a01b11A02376'; // Updated with the newly deployed contract address on port 7545

// Check if the contract address has been set
const isContractAddressSet = CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Initialize the provider and contract
  const initializeEthereum = useCallback(async () => {
    try {
      const detectedProvider = await detectEthereumProvider();

      if (detectedProvider) {
        console.log("MetaMask detected, initializing provider");
        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(ethersProvider);

        // Check if connected to the correct network (development/Ganache)
        const network = await ethersProvider.getNetwork();
        console.log("Connected to network:", {
          chainId: network.chainId.toString(),
          name: network.name
        });
        
        // Check if Ganache network
        if (network.chainId.toString() === '1337' || network.chainId.toString().startsWith('1747')) {
          console.log("Connected to local Ganache network");
        } else {
          console.warn("Not connected to local Ganache network. Current chainId:", network.chainId.toString());
        }

        // Get all accounts from MetaMask
        const allAccounts = await window.ethereum.request({
          method: 'eth_accounts',
        });
        console.log("Available accounts:", allAccounts);
        setAccounts(allAccounts);
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', (newAccounts) => {
          setAccounts(newAccounts);
          setAccount(newAccounts[0] || '');
          // Reset signer when accounts change
          if (provider && newAccounts[0]) {
            provider.getSigner(newAccounts[0]).then(newSigner => {
              setSigner(newSigner);
            });
          }
        });

        // Get the contract instance
        try {
          if (!isContractAddressSet) {
            console.error("Contract address not set in Web3Context.js");
            setError('Contract address not configured. Please update the CONTRACT_ADDRESS in Web3Context.js');
            setContract(null);
          } else {
            console.log("Initializing contract at address:", CONTRACT_ADDRESS);
            
            // Check if address is valid
            if (!ethers.isAddress(CONTRACT_ADDRESS)) {
              console.error("Invalid contract address format:", CONTRACT_ADDRESS);
              setError('Invalid contract address format. Please check the address in Web3Context.js');
              setContract(null);
              return;
            }
            
            const eduContract = new ethers.Contract(
              CONTRACT_ADDRESS,
              EduChainABI.abi,
              ethersProvider
            );
            
            // Check if contract is deployed by calling a simple view function
            try {
              const courseCount = await eduContract.getCourseCount();
              console.log("Contract initialization successful. Course count:", courseCount.toString());
              setContract(eduContract);
            } catch (contractCallError) {
              console.error("Error calling contract method:", contractCallError);
              setError('Contract not responding. Make sure the contract is deployed at the specified address.');
              setContract(null);
            }
          }
        } catch (err) {
          console.error("Contract initialization error:", err);
          setError('Failed to initialize contract. Please make sure you are on the correct network.');
        }
      } else {
        setError('Please install MetaMask to use this application.');
      }

      setLoading(false);
    } catch (err) {
      console.error("Ethereum initialization error:", err);
      setError('Failed to connect to Ethereum network.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeEthereum();
  }, [initializeEthereum]);

  // Connect to MetaMask with selected account
  const connectWallet = async (userType, selectedAccount = null) => {
    try {
      if (!provider) {
        await initializeEthereum();
      }

      // Request accounts if not provided or get all accounts
      let accountsResult;
      if (!selectedAccount) {
        accountsResult = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
      } else {
        // If user selected a specific account, use that one
        accountsResult = await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: { accounts: [selectedAccount] } }]
        });
        
        // Get the accounts again after permission request
        accountsResult = await window.ethereum.request({
          method: 'eth_accounts',
        });
      }

      // Update accounts list
      setAccounts(accountsResult);
      
      // Set the active account (either selected or first in list)
      const connectedAccount = selectedAccount || accountsResult[0];
      setAccount(connectedAccount);

      // Get signer for the connected account
      const ethSigner = await provider.getSigner(connectedAccount);
      setSigner(ethSigner);

      // Set user type
      setIsTeacher(userType === 'teacher');

      return connectedAccount;
    } catch (err) {
      console.error("Wallet connection error:", err);
      setError('Failed to connect wallet. Please try again.');
      return null;
    }
  };

  // Switch to a different account
  const switchAccount = async (newAccount) => {
    try {
      if (!provider) {
        throw new Error("Provider not initialized");
      }
      
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: { accounts: [newAccount] } }]
      });
      
      // Update the current account
      setAccount(newAccount);
      
      // Get a new signer with the selected account
      const newSigner = await provider.getSigner(newAccount);
      setSigner(newSigner);
      
      return true;
    } catch (err) {
      console.error("Account switch error:", err);
      setError('Failed to switch account. Please try again.');
      return false;
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount('');
    setSigner(null);
    setIsTeacher(false);
  };

  // Value object to be provided by the context
  const value = {
    account,
    accounts,
    provider,
    signer,
    contract,
    isTeacher,
    loading,
    error,
    connectWallet,
    switchAccount,
    disconnectWallet,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}; 
