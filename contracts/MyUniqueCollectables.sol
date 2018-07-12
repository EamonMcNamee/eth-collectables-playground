pragma solidity ^0.4.24;

import "./OpenZeppellinERC721/ERC721Token.sol";


contract MyUniqueCollectables is ERC721Token {

    uint256 constant MAX_COLLECTABLES = 3;
    address owner;

    constructor (string _name, string _symbol) public
        ERC721Token(_name, _symbol)
    {
     owner = msg.sender;
    }

    function myExMint (address _myAddr, uint256 _id) public {
        require(totalSupply() < MAX_COLLECTABLES);
        require(msg.sender == owner);
        _mint(_myAddr, _id);
    }
}
