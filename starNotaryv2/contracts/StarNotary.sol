//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
// complete project solved here
// https://github.com/littbarskiadeh/starNotary

//Importing openzeppelin-solidity ERC-721 implemented Standard
import "../app/node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

// import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";

// StarNotary Contract declaration inheritance the ERC721 openzeppelin implementation
contract StarNotary is ERC721("Bigheadphones", "BHP") {
    struct Star {
        string name;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;

    // create star
    function createStar(string memory _name, uint256 _tokenId) public {
        Star memory newStar = Star(_name);
        tokenIdToStarInfo[_tokenId] = newStar;
        _mint(msg.sender, _tokenId);
    }

    // put star for sale
    function putStarForSale(uint256 _tokenId, uint256 _price) public {
        require(
            ownerOf(_tokenId) == msg.sender,
            "You can't sell the star you don't own"
        );
        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable {
        address ownerAddress = ownerOf(_tokenId);
        uint256 starCost = starsForSale[_tokenId];
        require(starCost > 0, "The Star is not up for sale");
        require(msg.value > starCost, "You don't have enough ether");
        _transfer(ownerAddress, msg.sender, _tokenId);

        address payable ownerAddressPayable = payable(ownerAddress);
        ownerAddressPayable.transfer(starCost);
        // return unused ethers back to caller/ buyer
        if (starCost < msg.value) {
            address payable callerAddressPayble = payable(msg.sender);
            callerAddressPayble.transfer(msg.value - starCost);
        }
    }

    function lookUptokenIdToStarInfo(uint256 _tokenId)
        public
        view
        returns (string memory)
    {
        Star memory starInfo = tokenIdToStarInfo[_tokenId];
        return starInfo.name;
    }

    // event LogMsg(address msg);

    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        address owner1 = ownerOf(_tokenId1);
        address owner2 = ownerOf(_tokenId2);
        // emit LogMsg(owner1);
        //  emit LogMsg(owner2);
        require(
            msg.sender == owner1 || msg.sender == owner2,
            "Sender must own one of the stars"
        );

        _transfer(owner1, owner2, _tokenId1);
        _transfer(owner2, owner1, _tokenId2);
    }

    function transferStar(address _to, uint256 _tokenId) public {
        address owner = ownerOf(_tokenId);
        require(owner== msg.sender, "You have to own the star");
        _transfer(msg.sender, _to, _tokenId);
    }
}
