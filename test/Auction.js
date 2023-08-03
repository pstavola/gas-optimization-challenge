const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("Auction", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deploySimpleAuction() {
      const biddingTime = 24 * 60 * 60;//ONE_DAY_IN_SECS
      const endTime = (await time.latest()) + biddingTime;
      const signers = await ethers.getSigners();
      const beneficiary = signers[1].address;
      // Contracts are deployed using the first signer/account by default
      const Auction = await ethers.getContractFactory("SimpleAuction");
      const auction = await Auction.deploy(biddingTime, beneficiary);
  
      return { auction, biddingTime, beneficiary, signers, endTime };
    }
  
    async function submitBid() {
      const { auction, biddingTime, beneficiary, signers, endTime } = await loadFixture(deploySimpleAuction);

      const amount = ethers.utils.parseEther("0.5");
      await auction.connect(signers[2]).bid({value: amount});
      //await wallet.connect(signers[1]).submitTxn(receiver, data, amount);
  
      return { auction, biddingTime, beneficiary, signers, amount, endTime };
    }
  
    describe("Deployment", function () {
  
      it("Should set the right beneficiary", async function () {
        const { auction, beneficiary } = await loadFixture(deploySimpleAuction);
  
        expect(await auction.beneficiary()).to.deep.equal(beneficiary);
      });
  
    });
  
    describe("Bid", function () {
      describe("bid", function () {
        it("Should add txn as highest bid", async function () {
          const { auction, signers, amount } = await loadFixture(submitBid);

          const highestBidder = await auction.highestBidder();
          const highestBid = await auction.highestBid();
  
          expect(highestBidder).to.equal(signers[2].address);
          expect(highestBid).to.equal(amount);
        });
      });

      /* describe("Validations", function () {
        it("Should revert if bid is not high enough", async function () {
          const { auction, signers, amount } = await loadFixture(submitBid);
        
          const lowerAmount = ethers.utils.parseEther("0.3");
          //await auction.connect(signers[3]).bid({value: lowerAmount});
        
          await expect(auction.connect(signers[3]).bid({value: lowerAmount})).to.be.revertedWith("Bid not high enough");
        });
      }); */ 
      
      /* describe("Event", function () {
        //emit HighestBidIncreased(msg.sender, msg.value);
        it("Should emit an event when highest bid is increased", async function () {
          const { auction, signers } = await loadFixture(deploySimpleAuction);

          const amount = ethers.utils.parseEther("0.5");

          console.log("1");
          
          await expect(auction.connect(signers[2]).bid({value: amount}))
            .to.emit(auction, "HighestBidIncreased")
            .withArgs(signers[2].address, amount);
        });
      }); */
    });

    describe("Withdraw", function () {
        describe("withdraw", function () {
          it("Should Withdraw a bid that was overbid", async function () {
            const { auction, signers } = await loadFixture(submitBid);

            const higherAmount = ethers.utils.parseEther("1");
            await auction.connect(signers[3]).bid({value: higherAmount});

            const balanceBeforeWithdraw = await ethers.provider.getBalance(signers[2].address);
            const balanceBeforeWithdrawAsNum = Number(ethers.utils.formatEther(balanceBeforeWithdraw));

            await auction.connect(signers[2]).withdraw();

            const balanceAfterWithdraw = await ethers.provider.getBalance(signers[2].address);
            const balanceAfterWithdrawAsNum = Number(ethers.utils.formatEther(balanceAfterWithdraw));
  
            const highestBidder = await auction.highestBidder();
            const highestBid = await auction.highestBid();
    
            expect(highestBidder).to.equal(signers[3].address);
            expect(highestBid).to.equal(higherAmount);
            expect(balanceAfterWithdrawAsNum).to.be.gt(balanceBeforeWithdrawAsNum);
          });
        });
  
        describe("Validations", function () {
          it("Should not withdraw anything", async function () {
            const { auction, signers } = await loadFixture(submitBid);

            const balanceBeforeWithdraw = await ethers.provider.getBalance(signers[2].address);
            const balanceBeforeWithdrawAsNum = Number(ethers.utils.formatEther(balanceBeforeWithdraw));

            await auction.connect(signers[2]).withdraw();

            const balanceAfterWithdraw = await ethers.provider.getBalance(signers[2].address);
            const balanceAfterWithdrawAsNum = Number(ethers.utils.formatEther(balanceAfterWithdraw));
    
            expect(balanceAfterWithdrawAsNum).to.be.lt(balanceBeforeWithdrawAsNum);
          });
        }); 
    });

    describe("AuctionEnd", function () {
        describe("auctionEnd", function () {
          it("Should end the auction", async function () {
            const { auction, beneficiary, endTime } = await loadFixture(submitBid);

            const balanceBeforeEnd = await ethers.provider.getBalance(beneficiary);
            const balanceBeforeEndAsNum = Number(ethers.utils.formatEther(balanceBeforeEnd));

            await time.increaseTo(endTime);
            await auction.auctionEnd();

            const balanceAfterEnd = await ethers.provider.getBalance(beneficiary);
            const balanceAfterEndAsNum = Number(ethers.utils.formatEther(balanceAfterEnd));

            expect(balanceAfterEndAsNum).to.be.gt(balanceBeforeEndAsNum);
          });
        });
  
        /* describe("Validations", function () {
          it("Should revert if end time not reached yet", async function () {
            const { auction } = await loadFixture(submitBid);

            await auction.auctionEnd();

            await expect(auction.auctionEnd()).to.be.revertedWith("Auction Not Yet Ended");
          }); 

          it("Should revert if auction already ended", async function () {
            const { auction, endTime } = await loadFixture(submitBid);

            await time.increaseTo(endTime);
            await auction.auctionEnd();

            await expect(auction.auctionEnd()).to.be.revertedWith("Auction End Already Called");
          });
        });  */
      
        /* describe("Event", function () {
            //emit AuctionEnded(highestBidder, highestBid);
          it("Should emit an event when auction ends", async function () {
            const { auction, signers, endTime, amount } = await loadFixture(submitBid);

            await time.increaseTo(endTime);
                
            await expect(auction.auctionEnd())
              .to.emit(auction, "AuctionEnded")
              .withArgs(signers[2].address, amount);
          });
        }); */
    });
  });