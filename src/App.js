import React, { useState, useEffect } from 'react';
import { Web3Provider } from "@ethersproject/providers";
import { ethers } from "ethers";

import './App.css';
import Voting from './artifacts/contracts/Voting.sol/Voting.json';



import VotingContract from './artifacts/contracts/Voting.sol/Voting.json';

const VotingContractAddress = "0xDd345af4fE633029FE35254e9C8e0aA3E59A5059";

function App() {
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [votingContract, setVotingContract] = useState();
  const [proposalDescription, setProposalDescription] = useState('');
  const [selectedProposal, setSelectedProposal] = useState(0);
  const [vote, setVote] = useState(true);
  const [voteReason, setVoteReason] = useState('');
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    const init = async () => {
      // Set up provider and signer
      const provider = new Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      setProvider(provider);
      setSigner(signer);

      // Set up contract instance
      const votingContract = new ethers.Contract(VotingContractAddress, VotingContract.abi, signer);
      setVotingContract(votingContract);
    };

    if (window.ethereum) {
      init();
    } else {
      window.alert('Please install MetaMask!');
    }
  }, []);

  useEffect(() => {
    if (votingContract) {
      const fetchProposals = async () => {
        const numProposals = await votingContract.proposalCount();
        const proposals = [];
        for (let i = 0; i < numProposals; i++) {
          const proposal = await votingContract.proposals(i);
          proposals.push(proposal);
        }
        setProposals(proposals);
      };
      fetchProposals();
    }
  }, [votingContract]);

  const createProposal = async () => {
    if (proposalDescription === '') {
      alert('Please enter a proposal description.');
      return;
    }

    try {
      const result = await votingContract.createProposal(proposalDescription);
      await result.wait();
      alert('Proposal created successfully.');
    } catch (error) {
      console.error('Error creating proposal:', error);
    }
  };

  const castVote = async () => {
    if (voteReason === '') {
      alert('Please enter a reason for your vote.');
      return;
    }

    try {
      const result = await votingContract.vote(selectedProposal, vote, voteReason);
      await result.wait();
      alert('Vote cast successfully.');
    } catch (error) {
      console.error('Error casting vote:', error);
    }
  };

  return (
    <div className="App">
      <h1>Joshcoin Voting</h1>

      <h2>Create a proposal</h2>
      <input
        type="text"
        placeholder="Proposal description"
        value={proposalDescription}
        onChange={(e) => setProposalDescription(e.target.value)}
      />
      <button onClick={createProposal}>Create Proposal</button>

      <h2>Proposals</h2>
      {proposals.map((proposal, index) => (
        <div key={index}>
          <h3>Proposal {index + 1}: {proposal.description}</h3>
          <p>Yes votes: {proposal.yesVotes.toString()}</p>
          <p>No votes: {proposal.noVotes.toString()}</p>
        </div>
      ))}

      <h2>Vote on a proposal</h2>
      <label>
        Select proposal:
        <select value={selectedProposal} onChange={(e) => setSelectedProposal(e.target.value)}>
          {proposals.map((_, index) => (
            <option key={index} value={index}>
              {index + 1}
            </option>
          ))}
        </select>
      </label>
      <br />
      <label>
        Vote:
        <select value={vote} onChange={(e) => setVote(e.target.value === 'true')}>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </label>
      <br />
      <input
        type="text"
        placeholder="Reason for vote"
        value={voteReason}
        onChange={(e) => setVoteReason(e.target.value)}
      />
      <button onClick={castVote}>Cast Vote</button>
    </div>
  );
}

export default App;

