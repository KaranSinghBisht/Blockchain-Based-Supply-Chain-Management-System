// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SupplyChain {
  struct Product {
    uint256 id;
    string name;
    uint256 batch;
    uint256 manufacturedDate;
    address currentOwner;
    address[] ownershipHistory;
  }

  mapping(uint256 => Product) public products;
  uint256[] public productIds; // Track all registered product IDs

  event ProductRegistered(
    uint256 indexed id,
    string name,
    uint256 batch,
    uint256 manufacturedDate,
    address indexed owner
  );

  event OwnershipTransferred(uint256 indexed id, address indexed previousOwner, address indexed newOwner);

  // Register a product with block timestamp for manufacturing date
  function registerProduct(uint256 id, string memory name, uint256 batch) public {
    require(products[id].id == 0, "Product ID already exists");

    Product storage newProduct = products[id];
    newProduct.id = id;
    newProduct.name = name;
    newProduct.batch = batch;
    newProduct.manufacturedDate = block.timestamp;
    newProduct.currentOwner = msg.sender;
    newProduct.ownershipHistory.push(msg.sender);

    productIds.push(id); // Track all registered product IDs

    emit ProductRegistered(id, name, batch, block.timestamp, msg.sender);
  }

  function getAllProducts() public view returns (Product[] memory) {
    Product[] memory allProducts = new Product[](productIds.length);
    for (uint256 i = 0; i < productIds.length; i++) {
      allProducts[i] = products[productIds[i]];
    }
    return allProducts;
  }

  // Transfer product ownership
  function transferOwnership(uint256 id, address newOwner) public {
    require(products[id].id != 0, "Product does not exist");
    require(products[id].currentOwner == msg.sender, "Only current owner can transfer ownership");
    require(newOwner != address(0), "Invalid new owner address");

    address previousOwner = products[id].currentOwner;
    products[id].currentOwner = newOwner;
    products[id].ownershipHistory.push(newOwner);

    emit OwnershipTransferred(id, previousOwner, newOwner);
  }

  // Get ownership history
  function getOwnershipHistory(uint256 id) public view returns (address[] memory) {
    require(products[id].id != 0, "Product does not exist");
    return products[id].ownershipHistory;
  }
}
