// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract VehicleRegistry is ERC721, Ownable {
    uint256 private _nextTokenId;
    struct Vehicle {
        uint256 tokenId; string location; uint256 speed; uint256 lastUpdateTime;
    }
    mapping(uint256 => Vehicle) public vehicleStates;
    constructor(address initialOwner) ERC721("SonicPulse Vehicle", "SPV") Ownable(initialOwner) {
        _nextTokenId = 1;
    }
    function registerVehicle(address _owner, string memory _initialLocation) public onlyOwner returns (uint256) {
        uint256 newItemId = _nextTokenId; _nextTokenId++; _safeMint(_owner, newItemId);
        vehicleStates[newItemId] = Vehicle({
            tokenId: newItemId, location: _initialLocation, speed: 0, lastUpdateTime: block.timestamp
        });
        return newItemId;
    }
}