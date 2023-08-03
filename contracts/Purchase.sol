// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

contract Purchase {
    // @optimization use immutable keyword
    uint public immutable value;
    address payable public immutable seller;
    address payable public buyer;

    enum State {
        Created,
        Locked,
        Release,
        Inactive
    }
    // The state variable has a default value of the first member, `State.created`
    State public state;

    modifier condition(bool condition_) {
        require(condition_);
        _;
    }

    modifier onlyBuyer() {
        if(msg.sender != buyer) revert OnlyBuyer();
        _;
    }

    modifier onlySeller() {
        // @optimization calling local function
        _onlySeller();
        _;
    }

    modifier inState(State state_) {
        // @optimization calling local function
        _inState(state_);
        _;
    }

    event Aborted();
    event PurchaseConfirmed();
    event ItemReceived();
    event SellerRefunded();

    // @optimization using custom errors
    /// Only the buyer can call this function.
    /// Zero address
    error ZeroAddress();
    /// The provided value has to be even.
    error OddNumber(uint value);
    /// Only the seller can call this function.
    error OnlySeller();
    /// Only the buyer can call this function.
    error OnlyBuyer();
    /// The function cannot be called at the current state.
    error InvalidState();

    // Ensure that `msg.value` is an even number.
    // Division will truncate if it is an odd number.
    // Check via multiplication that it wasn't an odd number.
    constructor(address _seller) payable {
        if(_seller == address(0)) revert ZeroAddress();
        seller = payable(_seller);
        // @optimization using bitwise operators
        if (msg.value & 1 != 0) revert OddNumber(msg.value);
        value = msg.value >> 1;
    }

    /// Abort the purchase and reclaim the ether.
    /// Can only be called by the seller before
    /// the contract is locked.
    function abort() external onlySeller inState(State.Created) {
        emit Aborted();
        state = State.Inactive;
        // We use transfer here directly. It is
        // reentrancy-safe, because it is the
        // last call in this function and we
        // already changed the state.
        seller.transfer(address(this).balance);
    }

    /// Confirm the purchase as buyer.
    /// Transaction has to include `2 * value` ether.
    /// The ether will be locked until confirmReceived
    /// is called.
    // @optimization using bitwise operators
    function confirmPurchase()
        external
        payable
        inState(State.Created)
        condition(msg.value == (value << 1))
    {
        emit PurchaseConfirmed();
        buyer = payable(msg.sender);
        state = State.Locked;
    }

    /// Confirm that you (the buyer) received the item.
    /// This will release the locked ether.
    function confirmReceived() external onlyBuyer inState(State.Locked) {
        emit ItemReceived();
        // It is important to change the state first because
        // otherwise, the contracts called using `send` below
        // can call in again here.
        state = State.Release;

        buyer.transfer(value);
    }

    /// This function refunds the seller, i.e.
    /// pays back the locked funds of the seller.
    function refundSeller() external onlySeller inState(State.Release) {
        emit SellerRefunded();
        // It is important to change the state first because
        // otherwise, the contracts called using `send` below
        // can call in again here.
        state = State.Inactive;

        seller.transfer(3 * value);
    }

    // @optimization modifier calls this local function
    function _onlySeller() internal view virtual {
        if(msg.sender != seller) revert OnlySeller();
    }
    // @optimization modifier calls this local function
    function _inState(State state_) internal view virtual {
        if(state != state_) revert InvalidState();
    }
}
