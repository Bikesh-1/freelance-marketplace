// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FreelanceEscrow is ReentrancyGuard, Ownable {

    enum Status {
        CREATED,
        FUNDED,
        RELEASED,
        REFUNDED
    }

    struct Escrow {
        address client;
        address freelancer;
        uint256 amount;
        Status status;
    }

    uint256 private escrowCounter;

    mapping(uint256 => Escrow) public escrows;

    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed client,
        address indexed freelancer
    );

    event EscrowFunded(
        uint256 indexed escrowId,
        uint256 amount
    );

    event PaymentReleased(
        uint256 indexed escrowId,
        address indexed freelancer,
        uint256 amount
    );

    event PaymentRefunded(
        uint256 indexed escrowId,
        address indexed client,
        uint256 amount
    );

    constructor(address initialOwner)
        Ownable(initialOwner)
    {}

    modifier onlyClient(uint256 escrowId) {
        require(
            msg.sender == escrows[escrowId].client,
            "Only client can perform this action"
        );
        _;
    }

    modifier escrowExists(uint256 escrowId) {
        require(
            escrowId < escrowCounter,
            "Escrow does not exist"
        );
        _;
    }

    function createEscrow(
        address freelancer
    )
        external
        returns (uint256)
    {
        require(
            freelancer != address(0),
            "Invalid freelancer"
        );

        require(
            freelancer != msg.sender,
            "Client and freelancer must differ"
        );

        uint256 escrowId = escrowCounter;

        escrows[escrowId] = Escrow({
            client: msg.sender,
            freelancer: freelancer,
            amount: 0,
            status: Status.CREATED
        });

        escrowCounter++;

        emit EscrowCreated(
            escrowId,
            msg.sender,
            freelancer
        );

        return escrowId;
    }

    function fundEscrow(
        uint256 escrowId
    )
        external
        payable
        nonReentrant
        escrowExists(escrowId)
        onlyClient(escrowId)
    {
        Escrow storage escrow = escrows[escrowId];

        require(
            escrow.status == Status.CREATED,
            "Escrow cannot be funded"
        );

        require(
            msg.value > 0,
            "Amount must be greater than zero"
        );

        escrow.amount = msg.value;
        escrow.status = Status.FUNDED;

        emit EscrowFunded(
            escrowId,
            msg.value
        );
    }

    function releasePayment(
        uint256 escrowId
    )
        external
        nonReentrant
        escrowExists(escrowId)
        onlyClient(escrowId)
    {
        Escrow storage escrow = escrows[escrowId];

        require(
            escrow.status == Status.FUNDED,
            "Escrow is not funded"
        );

        uint256 amount = escrow.amount;

        escrow.amount = 0;
        escrow.status = Status.RELEASED;

        (bool success, ) = payable(
            escrow.freelancer
        ).call{value: amount}("");

        require(
            success,
            "Payment transfer failed"
        );

        emit PaymentReleased(
            escrowId,
            escrow.freelancer,
            amount
        );
    }

    function refundClient(
        uint256 escrowId
    )
        external
        nonReentrant
        escrowExists(escrowId)
        onlyClient(escrowId)
    {
        Escrow storage escrow = escrows[escrowId];

        require(
            escrow.status == Status.FUNDED,
            "Escrow is not funded"
        );

        uint256 amount = escrow.amount;

        escrow.amount = 0;
        escrow.status = Status.REFUNDED;

        (bool success, ) = payable(
            escrow.client
        ).call{value: amount}("");

        require(
            success,
            "Refund failed"
        );

        emit PaymentRefunded(
            escrowId,
            escrow.client,
            amount
        );
    }

    function getEscrow(
        uint256 escrowId
    )
        external
        view
        escrowExists(escrowId)
        returns (
            address client,
            address freelancer,
            uint256 amount,
            Status status
        )
    {
        Escrow memory escrow = escrows[escrowId];

        return (
            escrow.client,
            escrow.freelancer,
            escrow.amount,
            escrow.status
        );
    }

    function getEscrowCount()
        external
        view
        returns (uint256)
    {
        return escrowCounter;
    }
}