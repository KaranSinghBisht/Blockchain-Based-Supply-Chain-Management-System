// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SupplyChain {
  /// ------------------------
  ///         STRUCTS
  /// ------------------------
  struct Product {
    uint256 id;
    string name;
    uint256 batch;
    uint256 manufacturedDate;
    address manufacturer;
    address distributor;
    address consumer;
    address currentOwner;
    uint256 paymentAmount;
    uint256 bonusAmount;
    uint256 bonusDeadline; // Unix timestamp
    uint256 finalDeadline; // Unix timestamp
    string ipfsHash;
    bool isPaymentReleased;
    address[] ownershipHistory;
  }

  struct ProductInput {
    uint256 id;
    string name;
    uint256 batch;
    address distributor;
    address consumer;
    uint256 paymentAmount;
    uint256 bonusAmount;
    uint256 bonusDeadline;
    uint256 finalDeadline;
    string ipfsHash;
  }

  /// ------------------------
  ///         STORAGE
  /// ------------------------
  mapping(uint256 => Product) public products;
  uint256[] public productIds; // Tracks the IDs of all registered products

  /// ------------------------
  ///         EVENTS
  /// ------------------------
  event ProductRegistered(
    uint256 indexed id,
    string name,
    uint256 batch,
    uint256 manufacturedDate,
    address indexed manufacturer,
    address indexed distributor,
    address consumer,
    address currentOwner
  );

  event OwnershipTransferred(uint256 indexed id, address indexed previousOwner, address indexed newOwner);

  event OwnershipConfirmed(uint256 indexed id, address indexed consumer);
  event OwnershipRejected(uint256 indexed id, address indexed rejectedBy);

  event BonusReleased(uint256 indexed id, uint256 totalPayment);
  event LatePenaltyApplied(uint256 indexed id, uint256 penaltyAmount);
  event PaymentReleased(uint256 indexed id, uint256 paymentAmount);
  event PenaltyApplied(uint256 indexed id, uint256 penaltyAmount);

  /// ------------------------
  ///     REGISTER PRODUCT
  /// ------------------------
  function registerProduct(ProductInput calldata input) external payable {
    // 1) Ensure the product does not exist
    require(products[input.id].id == 0, "Product ID already exists");

    // 2) Check correct stake
    uint256 requiredStake = input.paymentAmount + input.bonusAmount;
    require(msg.value >= requiredStake, "Stake full payment + bonus");

    // 3) Return any excess
    uint256 excessAmount = msg.value - requiredStake;
    if (excessAmount > 0) {
      payable(msg.sender).transfer(excessAmount);
    }

    // 4) Create a new product in storage
    Product storage newProduct = products[input.id];
    newProduct.id = input.id;
    newProduct.name = input.name;
    newProduct.batch = input.batch;
    newProduct.manufacturedDate = block.timestamp;
    newProduct.manufacturer = msg.sender;
    newProduct.distributor = input.distributor;
    newProduct.consumer = input.consumer;
    newProduct.currentOwner = msg.sender; // Manufacturer starts as owner
    newProduct.paymentAmount = input.paymentAmount;
    newProduct.bonusAmount = input.bonusAmount;
    newProduct.bonusDeadline = input.bonusDeadline;
    newProduct.finalDeadline = input.finalDeadline;
    newProduct.ipfsHash = input.ipfsHash;
    newProduct.isPaymentReleased = false;
    newProduct.ownershipHistory.push(msg.sender);

    // 5) Track the product ID
    productIds.push(input.id);

    // 6) Emit event
    emit ProductRegistered(
      input.id,
      input.name,
      input.batch,
      newProduct.manufacturedDate,
      msg.sender,
      input.distributor,
      input.consumer,
      msg.sender
    );
  }

  /// ------------------------
  ///    TRANSFER OWNERSHIP
  /// ------------------------
  function transferOwnership(uint256 id, address newOwner) external {
    Product storage product = products[id];
    require(product.id != 0, "Product does not exist");
    require(msg.sender == product.currentOwner, "Only current owner can transfer");
    require(newOwner != address(0), "Invalid new owner address");

    address previousOwner = product.currentOwner;

    // If the new owner is the consumer, we handle the payment + bonus/punishment logic
    if (newOwner == product.consumer && !product.isPaymentReleased) {
      _handlePayments(product);
      product.isPaymentReleased = true; // Mark payment as released
    }

    // Update the product state
    product.currentOwner = newOwner;
    product.ownershipHistory.push(newOwner);

    emit OwnershipTransferred(id, previousOwner, newOwner);
  }

  /// ------------------------
  ///  INTERNAL PAYMENT LOGIC
  /// ------------------------
  function _handlePayments(Product storage product) internal {
    address distributor = product.distributor;
    address manufacturer = product.manufacturer;

    uint256 payment = product.paymentAmount;
    uint256 bonus = product.bonusAmount;

    // 1. Transfer happens before or on bonusDeadline => Payment + Bonus => distributor
    if (block.timestamp <= product.bonusDeadline) {
      uint256 totalPayment = payment + bonus;
      payable(distributor).transfer(totalPayment);
      emit BonusReleased(product.id, totalPayment);
      emit PaymentReleased(product.id, payment);

      // 2. Transfer after bonusDeadline, before finalDeadline =>
      //    100% payment => distributor, bonus => manufacturer
    } else if (block.timestamp <= product.finalDeadline) {
      payable(distributor).transfer(payment);
      payable(manufacturer).transfer(bonus);
      emit PaymentReleased(product.id, payment);

      // 3. Transfer after finalDeadline => 75% => distributor, 25% + bonus => manufacturer
    } else {
      uint256 reducedPayment = (payment * 75) / 100;
      uint256 refundToManufacturer = bonus + (payment - reducedPayment);

      payable(distributor).transfer(reducedPayment);
      payable(manufacturer).transfer(refundToManufacturer);

      emit PaymentReleased(product.id, reducedPayment);
      emit PenaltyApplied(product.id, (payment - reducedPayment));
    }
  }

  /// ------------------------
  ///   CONFIRM / REJECT
  /// ------------------------
  function confirmOwnership(uint256 id) external {
    Product storage product = products[id];
    require(product.id != 0, "Product does not exist");
    require(msg.sender == product.currentOwner, "Only current owner can confirm");
    require(msg.sender == product.consumer, "Only the consumer can confirm");

    // Mark payment as released if not already
    if (!product.isPaymentReleased) {
      _handlePayments(product);
      product.isPaymentReleased = true;
    }

    emit OwnershipConfirmed(id, msg.sender);
  }

  function rejectOwnership(uint256 id) external {
    Product storage product = products[id];
    require(product.id != 0, "Product does not exist");
    require(msg.sender == product.currentOwner, "Only the current owner can reject");
    require(!product.isPaymentReleased, "Payment already released");

    // Pop the consumer out of the ownership history
    product.ownershipHistory.pop();

    // Revert currentOwner back to the previous owner
    // (previous owner is product.ownershipHistory[product.ownershipHistory.length - 1])
    // But we should only pop if we truly are rejecting the "new" consumer
    address newOwner = product.ownershipHistory[product.ownershipHistory.length - 1];
    product.currentOwner = newOwner;

    emit OwnershipRejected(id, msg.sender);
  }

  /// ------------------------
  ///   INCENTIVE FUNCTIONS
  /// ------------------------
  function releaseBonus(uint256 id) external {
    Product storage product = products[id];
    require(product.id != 0, "Product does not exist");
    require(block.timestamp <= product.bonusDeadline, "Bonus deadline passed");
    require(!product.isPaymentReleased, "Payment already released");

    address distributor = product.distributor;
    uint256 totalPayment = product.paymentAmount + product.bonusAmount;

    payable(distributor).transfer(totalPayment);
    product.isPaymentReleased = true;

    emit BonusReleased(id, totalPayment);
  }

  function applyLatePenalty(uint256 id) external {
    Product storage product = products[id];
    require(product.id != 0, "Product does not exist");
    require(block.timestamp > product.finalDeadline, "Deadline not passed");
    require(!product.isPaymentReleased, "Payment already released");

    address distributor = product.distributor;
    uint256 reducedPayment = (product.paymentAmount * 75) / 100;

    payable(distributor).transfer(reducedPayment);
    product.isPaymentReleased = true;

    emit LatePenaltyApplied(id, reducedPayment);
  }

  /// ------------------------
  ///       READ-ONLY
  /// ------------------------
  function getOwnershipHistory(uint256 id) external view returns (address[] memory) {
    Product storage product = products[id];
    require(product.id != 0, "Product does not exist");
    return product.ownershipHistory;
  }

  function getAllProducts()
    external
    view
    returns (
      uint256[] memory ids,
      string[] memory names,
      uint256[] memory batches,
      uint256[] memory manufacturedDates,
      address[] memory currentOwners,
      uint256[] memory paymentAmounts,
      uint256[] memory bonusAmounts,
      uint256[] memory bonusDeadlines,
      uint256[] memory finalDeadlines,
      bool[] memory isPaymentReleasedFlags,
      address[][] memory ownershipHistories,
      string[] memory ipfsHashes
    )
  {
    uint256 total = productIds.length;

    ids = new uint256[](total);
    names = new string[](total);
    batches = new uint256[](total);
    manufacturedDates = new uint256[](total);
    currentOwners = new address[](total);
    paymentAmounts = new uint256[](total);
    bonusAmounts = new uint256[](total);
    bonusDeadlines = new uint256[](total);
    finalDeadlines = new uint256[](total);
    isPaymentReleasedFlags = new bool[](total);
    ownershipHistories = new address[][](total);
    ipfsHashes = new string[](total);

    for (uint256 i = 0; i < total; i++) {
      uint256 productId = productIds[i];
      Product storage product = products[productId];

      ids[i] = product.id;
      names[i] = product.name;
      batches[i] = product.batch;
      manufacturedDates[i] = product.manufacturedDate;
      currentOwners[i] = product.currentOwner;
      paymentAmounts[i] = product.paymentAmount;
      bonusAmounts[i] = product.bonusAmount;
      bonusDeadlines[i] = product.bonusDeadline;
      finalDeadlines[i] = product.finalDeadline;
      isPaymentReleasedFlags[i] = product.isPaymentReleased;
      ownershipHistories[i] = product.ownershipHistory;
      ipfsHashes[i] = product.ipfsHash;
    }
  }
}
