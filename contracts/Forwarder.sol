// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IToken {
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

contract Forwarder {
    struct Input {
        address payer;
        uint256 amount;
        uint256 deadline;
        address token;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    /// Batch signature and transfer
    function payViaSignature(Input[] calldata _inputs) external {
        for (uint i = 0; i < _inputs.length; ) {
            Input memory input = _inputs[i];
            IToken token = IToken(input.token);
            token.permit(
                input.payer,
                address(this),
                input.amount,
                input.deadline,
                input.v,
                input.r,
                input.s
            );
            token.transferFrom(input.payer, msg.sender, input.amount);

            unchecked {
                ++i;
            }
        }
    }
}
