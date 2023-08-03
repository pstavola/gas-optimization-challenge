const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("Purchase", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deploySimplePurchase() {
      const signers = await ethers.getSigners();
      const seller = signers[1].address;
      const amount = ethers.utils.parseEther("4");
      // Contracts are deployed using the first signer/account by default
      const Purchase = await ethers.getContractFactory("Purchase");
      const purchase = await Purchase.deploy(seller, {value: amount});
  
      return { purchase, seller, amount, signers };
    }
  
    describe("Deployment", function () {
  
      it("Should set the right seller", async function () {
        const { purchase, amount, seller } = await loadFixture(deploySimplePurchase);

        const contractSeller = await purchase.seller();
        const contractValue = await purchase.value();
        const contractValueAsNum = Number(ethers.utils.formatEther(contractValue));
        const amountAsNum = Number(ethers.utils.formatEther(amount));
  
        expect(contractSeller).to.deep.equal(seller);
        expect(contractValueAsNum).to.equal(amountAsNum/2);
      });

      /* it("should revert if address(0)", async function () {
        const seller = ethers.constants.AddressZero;
        const amount = ethers.utils.parseEther("4");
        // Contracts are deployed using the first signer/account by default
        const Purchase = await ethers.getContractFactory("Purchase");
  
        await expect(Purchase.deploy(seller, {value: amount})).to.be.revertedWith("Zero address");
      });

      it("should revert if value is not even", async function () {
        const signers = await ethers.getSigners();
        const seller = signers[1].address;
        const amount = ethers.utils.parseEther("3");
        // Contracts are deployed using the first signer/account by default
        const Purchase = await ethers.getContractFactory("Purchase");
  
        await expect(Purchase.deploy(seller, {value: amount})).to.be.revertedWith("Value not even");
      }); */
    });

    describe("Abort", function () {
        describe("abort", function () {
          it("Should abort the purchase and reclaim the ether", async function () {
            const { purchase, signers } = await loadFixture(deploySimplePurchase);

            const balanceBeforeAbort = await ethers.provider.getBalance(signers[1].address);
            const balanceBeforeAbortAsNum = Number(ethers.utils.formatEther(balanceBeforeAbort));
            
            await purchase.connect(signers[1]).abort();

            const balanceAfterAbort = await ethers.provider.getBalance(signers[1].address);
            const balanceAfterAbortAsNum = Number(ethers.utils.formatEther(balanceAfterAbort));
            const contractState = await purchase.state();

            expect(balanceAfterAbortAsNum).to.be.gt(balanceBeforeAbortAsNum);
            expect(contractState).to.equal(3);
          });
        });
    });
  
    describe("ConfirmPurchase", function () {
      describe("confirmPurchase", function () {
        it("Confirm the purchase as buyer", async function () {
          const { purchase, signers } = await loadFixture(deploySimplePurchase);

          const amount = ethers.utils.parseEther("4");

          await purchase.confirmPurchase({value: amount})

          const contractBuyer = await purchase.buyer();
          const contractState = await purchase.state();

          expect(contractBuyer).to.equal(signers[0].address);
          expect(contractState).to.equal(1);
        });
      });
    });

    describe("ConfirmReceived", function () {
        describe("confirmReceived", function () {
          it("Should release the locked ether", async function () {
            const { purchase, signers } = await loadFixture(deploySimplePurchase);

            const amount = ethers.utils.parseEther("4");

            await purchase.confirmPurchase({value: amount});

            const balanceBeforeWithdraw = await ethers.provider.getBalance(signers[0].address);
            const balanceBeforeWithdrawAsNum = Number(ethers.utils.formatEther(balanceBeforeWithdraw));

            await purchase.confirmReceived();

            const balanceAfterWithdraw = await ethers.provider.getBalance(signers[0].address);
            const balanceAfterWithdrawAsNum = Number(ethers.utils.formatEther(balanceAfterWithdraw));

            const contractState = await purchase.state();

            expect(balanceAfterWithdrawAsNum).to.be.gt(balanceBeforeWithdrawAsNum);
            expect(contractState).to.equal(2);
          });
        });
    });

    describe("RefundSeller", function () {
        describe("refundSeller", function () {
          it("Should pay back the locked funds of the seller", async function () {
            const { purchase, signers } = await loadFixture(deploySimplePurchase);

            const amount = ethers.utils.parseEther("4");

            await purchase.confirmPurchase({value: amount});
            await purchase.confirmReceived();

            const balanceBeforeRefund = await ethers.provider.getBalance(signers[1].address);
            const balanceBeforeRefundAsNum = Number(ethers.utils.formatEther(balanceBeforeRefund));
            
            await purchase.connect(signers[1]).refundSeller();

            const balanceAfterRefund = await ethers.provider.getBalance(signers[1].address);
            const balanceAfterRefundAsNum = Number(ethers.utils.formatEther(balanceAfterRefund));
            const contractState = await purchase.state();

            expect(balanceAfterRefundAsNum).to.be.gt(balanceBeforeRefundAsNum);
            expect(contractState).to.equal(3);
          });
        });
    });
  });