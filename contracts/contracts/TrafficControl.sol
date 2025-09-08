// contracts/TrafficControl.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TrafficControl is Ownable {
    // How long a vehicle is granted access to the intersection (in seconds)
    uint256 public constant ACCESS_DURATION = 10;

    struct Intersection {
        uint256 occupiedByTokenId; // The ID of the vehicle currently in the intersection
        uint256 accessExpires;     // The timestamp when their access expires
    }

    // A mapping from an intersection ID (we'll just use ID 0 for our demo)
    // to its current state.
    mapping(uint256 => Intersection) public intersections;
    mapping(address => bool) public authorizedCallers;

    constructor(address initialOwner) Ownable(initialOwner) {}

    function setAuthorizedCaller(address _caller, bool _isAuthorized) public onlyOwner {
        authorizedCallers[_caller] = _isAuthorized;
    }

    function requestIntersectionAccess(uint256 _intersectionId, uint256 _tokenId) public returns (bool success) {
        require(authorizedCallers[msg.sender], "TrafficControl: Caller is not authorized");
        Intersection storage intersection = intersections[_intersectionId];

        // Check if the intersection is free. It's free if nobody is in it,
        // OR if the previous vehicle's access has expired.
        if (intersection.occupiedByTokenId == 0 || block.timestamp >= intersection.accessExpires) {
            // Grant access
            intersection.occupiedByTokenId = _tokenId;
            intersection.accessExpires = block.timestamp + ACCESS_DURATION;
            return true;
        }

        // If it's occupied by another vehicle, deny access.
        if(intersection.occupiedByTokenId != _tokenId) {
            return false;
        }

        // If it's occupied by the same vehicle, re-grant access (extend the timer)
        intersection.accessExpires = block.timestamp + ACCESS_DURATION;
        return true;
    }
}