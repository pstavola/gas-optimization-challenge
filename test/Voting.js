const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { expect } = require("chai");
  
  describe("Ballot", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deploySimpleBallot() {
      const signers = await ethers.getSigners();
      const proposals = ["Proposal X", "Proposal Y", "Proposal Z"];
      // Contracts are deployed using the first signer/account by default
      const Ballot = await ethers.getContractFactory("Ballot");
      const ballot = await Ballot.deploy(proposals);
  
      return { ballot, proposals, signers };
    }
  
    describe("Deployment", function () {
  
      it("Should create a new ballot to choose one of proposals", async function () {
        const { ballot, proposals, signers } = await loadFixture(deploySimpleBallot);

        const prop0 = await ballot.proposals(0);
        const prop1 = await ballot.proposals(1);
        const prop2 = await ballot.proposals(2);
  
        expect(await ballot.chairperson()).to.deep.equal(signers[0].address);
        expect(prop0.name).to.deep.equal(proposals[0]);
        expect(prop1.name).to.deep.equal(proposals[1]);
        expect(prop2.name).to.deep.equal(proposals[2]);
      });
  
    });
  
    describe("GiveRightToVote", function () {
      describe("giveRightToVote", function () {
        it("Should give voter the right to vote on this ballot", async function () {
          const { ballot, signers } = await loadFixture(deploySimpleBallot);

          await ballot.giveRightToVote(signers[1].address);

          const voter = await ballot.voters(signers[1].address);
  
          expect(voter.weight).to.deep.equal(1);
        });
      });
    });

    describe("Delegate", function () {
        describe("delegate", function () {
          it("Should delegate vote", async function () {
            const { ballot, signers } = await loadFixture(deploySimpleBallot);

            await ballot.giveRightToVote(signers[1].address);
            await ballot.giveRightToVote(signers[2].address);
            await ballot.connect(signers[1]).delegate(signers[2].address);

            const voter = await ballot.voters(signers[1].address);
            const delegate = await ballot.voters(signers[2].address);
  
            expect(voter.voted).to.be.true;
            expect(voter.delegate).to.equal(signers[2].address);
            expect(delegate.weight).to.equal(2);
          });
        });
    });

    describe("Vote", function () {
      describe("vote", function () {
        it("Should vote", async function () {
          const { ballot, signers } = await loadFixture(deploySimpleBallot);

          await ballot.giveRightToVote(signers[1].address);
          await ballot.connect(signers[1]).vote(0);

          const voter = await ballot.voters(signers[1].address);
          const proposal = await ballot.proposals(0);

          expect(voter.voted).to.be.true;
          expect(voter.vote).to.equal(0);
          expect(proposal.voteCount).to.equal(1);
        });
      });
    });

    describe("WinningProposal", function () {
      describe("winningProposal", function () {
        it("Should return the winning proposal", async function () {
          const { ballot, signers } = await loadFixture(deploySimpleBallot);

          await ballot.giveRightToVote(signers[1].address);
          await ballot.connect(signers[1]).vote(0);

          const winningProp = await ballot.winningProposal();

          expect(winningProp).to.equal(0);
        });
      });
    });

    describe("WinnerName", function () {
      describe("winnerName", function () {
        it("Should return the winning proposal name", async function () {
          const { ballot, signers, proposals } = await loadFixture(deploySimpleBallot);

          await ballot.giveRightToVote(signers[1].address);
          await ballot.connect(signers[1]).vote(0);

          const winningPropName = await ballot.winnerName();
          
          expect(winningPropName).to.equal(proposals[0]);
        });
      });
    });
  });