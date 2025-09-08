// contracts/VehicleRegistry.sol (COMPLETE AND CORRECT VERSION)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./TrafficControl.sol"; 
import "@openzeppelin/contracts/utils/Strings.sol"; 

contract VehicleRegistry is ERC721, Ownable {
    uint256 private _nextTokenId;
    TrafficControl private _trafficControl; 

    enum VehicleStatus { Moving, Waiting, Crossing }

    struct Vehicle {
        uint256 tokenId;
        string location;
        uint256 speed;
        uint256 lastUpdateTime;
        VehicleStatus status;
    }

    mapping(uint256 => Vehicle) public vehicleStates;

    constructor(address initialOwner, address trafficControlAddress) ERC721("SonicPulse Vehicle", "SPV") Ownable(initialOwner) {
        _nextTokenId = 1;
        _trafficControl = TrafficControl(trafficControlAddress);
    }

    function registerVehicle(address _owner, string memory _initialLocation) public onlyOwner returns (uint256) {
        uint256 newItemId = _nextTokenId;
        _nextTokenId++;
        _safeMint(_owner, newItemId);
        vehicleStates[newItemId] = Vehicle({
            tokenId: newItemId,
            location: _initialLocation,
            speed: 0,
            lastUpdateTime: block.timestamp,
            status: VehicleStatus.Moving 
        });
        return newItemId;
    }

    function updateVehicleState(uint256 _tokenId, string memory _newLocation, uint256 _newSpeed) public {
        require(ownerOf(_tokenId) != address(0), "Vehicle does not exist.");
        Vehicle storage vehicle = vehicleStates[_tokenId];
        vehicle.location = _newLocation;
        vehicle.speed = _newSpeed;
        vehicle.lastUpdateTime = block.timestamp;

        // Automatically set status back to "Moving" after an update
        vehicle.status = VehicleStatus.Moving;
    }

    function requestToCross(uint256 _tokenId, uint256 _intersectionId) public {
        // The security check now correctly verifies the owner of the specific token making the request.
        require(ownerOf(_tokenId) == msg.sender, "Caller is not the owner of this vehicle");

        bool granted = _trafficControl.requestIntersectionAccess(_intersectionId, _tokenId);
        
        if (granted) {
            vehicleStates[_tokenId].status = VehicleStatus.Crossing;
        } else {
            vehicleStates[_tokenId].status = VehicleStatus.Waiting;
        }
    }

    function getVehicleState(uint256 _tokenId) public view returns (Vehicle memory) {
        return vehicleStates[_tokenId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "ERC721Metadata: URI query for nonexistent token");
    
    // IMPORTANT: Make sure this is your correct Vercel deployment URL!
    string memory baseURI = "https://sonicpulse-metadata.vercel.app/api/metadata/"; // Use your own URL
    
    return bytes(baseURI).length > 0
        ? string(abi.encodePacked(baseURI, Strings.toString(tokenId)))
        : "";
    }
}